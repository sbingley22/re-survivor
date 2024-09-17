/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { v4 as uuidv4 } from 'uuid'
import { useEffect, useRef, useState } from "react"
import CharModel from "./CharModel"
import { useGameStore } from "../useGameStore"
import { getGroundYfromXZ, isUnskippableAnimation, moveToPlayer, playAudio } from "../gameHelper"
import { useFrame } from "@react-three/fiber"
import { Sphere } from '@react-three/drei'
import { Vector3 } from 'three'

const vec3 = new Vector3()

const Enemy = ({ id, position, type, health=100, splatterFlag, setXpPickups }) => {
  const group = useRef()
  const { addScore, getVolume, getMute, ground, player, enemiesRemove } = useGameStore()
  const anim = useRef("Spawning")
  const transition = useRef("WalkingStagger")
  const [visibleNodes, setVisibleNodes] = useState([])
  const baseSpeed = 2.2
  const speedMultiplier = useRef(1.0)
  const attackRange = useRef(1.0)
  const attackPower = useRef(1.0)
  const attackCooldown = useRef(0)
  const weakness = useRef(2)

  const [bullets, setBullets] = useState(0)
  const bulletRef = useRef()
  const shotTimer = useRef(0)
  const shotRate = 2
  const bulletLife = useRef(0)
  const bulletDirection = useRef({x:1, z:1})
  const bulletSpeed = 4

  // Initialize
  useEffect(()=>{
    // console.log("Enemy: ", type)
    setVisibleNodes(["ZFemGen"])

    if (type === "ZFem") {
      setVisibleNodes(["ZFem"])
      speedMultiplier.current = 1.2
      attackPower.current = 0.8
      weakness.current = 3.0
    }
    else if (type === "ZMale") {
      setVisibleNodes(["ZMale"])
      speedMultiplier.current = 0.9
      attackPower.current = 1.1
      weakness.current = 2.5
    }
    else if (type === "Neutrophil") {
      setVisibleNodes(["Neutrophil", "NeutroRos", "NeutroNet"])
      speedMultiplier.current = 1.2
      attackPower.current = 3.0
      weakness.current = 0.8
    }
    else if (type === "NKCell") {
      setVisibleNodes(["NKCell", "NKCape"])
      speedMultiplier.current = 1.6
      attackPower.current = 2.0
      weakness.current = 1.0
    }
    else if (type === "Macrophage") {
      setVisibleNodes(["Macrophage"])
      speedMultiplier.current = 1.0
      attackPower.current = 8.0
      weakness.current = 0.2
    }

    if (["Neutrophil", "NKCell", "Macrophage"].includes(type)) {
      setBullets(1)
    }

  }, [type])

  // Remove Enemy
  const enemyDead = () => {
    const pos = [group.current.position.x, group.current.position.y, group.current.position.z]
    setXpPickups(prev => {
      const temp = [...prev]
      temp.push({
        id: uuidv4(),
        position: pos,
        scale: 1,
      })
      return temp
    })

    enemiesRemove(id)
    addScore(2)
    if (player.current) player.current.scoreFlag = 10
  }

  // Take Damage
  const takeDamage = (flag) => {
    if (!group.current) return
    if (flag.dmg === null) return

    if (flag.pos) {
      if (flag.range) {
        const distance = group.current.position.distanceTo(flag.pos)
        if (distance > flag.range) return
      }
    }
    group.current.health -= flag.dmg * weakness.current

    splatterFlag.current = {
      pos: group.current.position,
      color: 0x556611,
    }

    playAudio("./audio/blood-splat.wav", 0.5 * getVolume(), getMute())

    const chance = Math.random()
    if (chance > 0.8) anim.current = "Stunned"
    else {
      if (anim.current !== "Stunned") anim.current = "Take Damage"
    }

    if (group.current.health <= 0) {
      // zombie dead 
      anim.current = "Dying"
      transition.current = "Dying"
      setTimeout(enemyDead, 1000)
    }
  }

  // Game Loop
  useFrame((state, delta) => {
    if (!group.current) return
    if (!player || !player.current) return
    if (group.current.health <= 0) return

    // Flags    
    if (group.current.actionFlag) {
      const flag = group.current.actionFlag
      if (flag === "Stunned") {
        anim.current = "Stunned"
      }
      group.current.actionFlag = null
    }
    if (group.current.dmgFlag) {
      takeDamage(group.current.dmgFlag)
      group.current.dmgFlag = null
    }

    // No ai logic if spawning
    if (anim.current === "Spawning") {
      group.current.position.y = getGroundYfromXZ(ground, group.current.position.x, group.current.position.z) ?? 0
      return
    }

    // AI
    const meleeAI = () => {
      let speed = baseSpeed * speedMultiplier.current * delta
      if (["Take Damage", "Stunned"].includes(anim.current)) speed *= 0.25

      const moveResult = moveToPlayer(player.current, group.current, attackRange.current, speed)
      group.current.position.y = getGroundYfromXZ(ground, group.current.position.x, group.current.position.z) ?? 0

      if (moveResult === "in range") {
        attackCooldown.current -= delta
        if (attackCooldown.current <= 0) {
          // Try to Attack
          if (!isUnskippableAnimation(anim) || ["Take Damage"].includes(anim.current)) {
            const chance = Math.random()
            anim.current = "Fight Jab"
            if (chance > 0.5) anim.current = "Fight Straight"

            attackCooldown.current = 1
            setTimeout(()=>{
              player.current.dmgFlag = {
                dmg: 20 * attackPower.current,
                pos: group.current.position,
                range: attackRange.current
              }
            }, 250)
          }
        }
        else {
          // Couldn't attack
          transition.current = "Fight Stance"
          if (!isUnskippableAnimation(anim)) {
            anim.current = "Fight Stance"
          }
        }
      }
      else if (moveResult === "progress") {
        // if attacking don't move forwards
        if (["Fight Jab", "Fight Straight"].includes(anim.current)) return

        transition.current = "WalkingStagger"
        if (!isUnskippableAnimation(anim)) {
          anim.current = "WalkingStagger"
          if (Math.random() < 0.003) anim.current = "Stunned"
        }
      }
    }
    meleeAI()

    if (bullets) {
      const shoot = () => {
        if (!bulletRef || !bulletRef.current) return

        const distance = group.current.position.distanceTo(player.current.position)
        if (distance < 8) {
          shotTimer.current += delta
          if (shotTimer.current > shotRate) {
            // console.log("shot fired")
            shotTimer.current = 0
            bulletLife.current = shotRate

            let bx = (player.current.position.x - group.current.position.x) / distance
            let bz = (player.current.position.z - group.current.position.z) / distance
            const variance = 0.1
            bx += (Math.random() - 0.5) * variance
            bz += (Math.random() - 0.5) * variance

            bulletDirection.current.x = bx
            bulletDirection.current.z = bz

            bulletRef.current.scale.setScalar(0.1)
          }
        }

        if (bulletLife.current > 0) {
          bulletLife.current -= delta
          bulletRef.current.position.x += bulletDirection.current.x * bulletSpeed * delta
          bulletRef.current.position.z += bulletDirection.current.z * bulletSpeed * delta

          vec3.set(
            bulletRef.current.position.x + group.current.position.x, 
            0,
            bulletRef.current.position.z + group.current.position.z, 
          )
          const distToPlayer = vec3.distanceTo(player.current.position)
          if (distToPlayer < 0.5) {
            //Player hit
            bulletLife.current = 0

            player.current.dmgFlag = {
              dmg: 20,
              pos: null,
              range: null,
            }
          }

          if (bulletLife.current <= 0) {
            bulletRef.current.position.x = 0
            bulletRef.current.position.z = 0
            bulletRef.current.scale.setScalar(0.01)
          }
        }
      }
      shoot()
    }

  })
  
  return (
    <group
      ref={group} 
      name={type}
      position={position}
      health={health}
      actionFlag={null}
      dmgFlag={null}
      groundFlag={null}
    >
      <CharModel
        anim={anim}
        visibleNodes={visibleNodes}
        transition={transition} 
        speedMultiplier={speedMultiplier}
      />
      {bullets > 0 && 
        <Sphere
          ref={bulletRef}
          position={[0,1,0]}
          scale={0.01}
        >
          <meshStandardMaterial color="red" />
        </Sphere>
      }
    </group>
  )
}

export default Enemy