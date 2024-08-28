/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState } from "react"
import CharModel from "./CharModel"
import { useGameStore } from "../useGameStore"
import { playAudio } from "../gameHelper"
import { useFrame } from "@react-three/fiber"

const Enemy = ({ id, position, type, health=100, splatterFlag }) => {
  const group = useRef()
  const { player, enemiesRemove } = useGameStore()
  const anim = useRef("Idle")
  const transition = useRef("Idle")
  const [visibleNodes, setVisibleNodes] = useState([])
  const speedMultiplier = useRef(1)

  // Initialize
  useEffect(()=>{
    // console.log("Enemy: ", type)
    setVisibleNodes(["ZFemGen"])
  }, [])

  // Remove Enemy
  const enemyDead = () => {
    enemiesRemove(id)
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
    group.current.health -= flag.dmg

    splatterFlag.current = {
      pos: group.current.position,
      color: 0x556611,
    }

    playAudio("./audio/blood-splat.wav")

    const chance = Math.random()
    if (chance > 0.8) anim.current = "Stunned"
    else {
      if (anim.current !== "Stunned") anim.current = "Take Damage"
    }

    if (group.current.health <= 0) {
      // zombie dead 
      anim.current = "Dying"
      setTimeout(enemyDead, 1000)
    }
  }

  // Game Loop
  // eslint-disable-next-line no-unused-vars
  useFrame((state, delta) => {
    if (!group.current) return
    if (!player || !player.current) return

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
    </group>
  )
}

export default Enemy