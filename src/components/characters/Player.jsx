/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState } from "react"
import CharModel from './CharModel'
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useGameStore } from "../useGameStore"
import { lockOnEnemy, cameraFollow, getGroundYfromXZ, isUnskippableAnimation, rotateToVec, playAudio } from "../gameHelper"

const vec3 = new THREE.Vector3()

const Player = () => {
  const { options, getGamepad, player, setPlayer, ground, enemyGroup, inventory, inventorySlot, setInventorySlot, inventoryRemoveItem } = useGameStore()
  const group = useRef()
  const [visibleNodes, setVisibleNodes] = useState(["Ana", "Pistol", "Shoes-HighTops", "Jacket", "Hair-Parted"])
  const anim = useRef("Idle")
  const transition = useRef("Idle")
  const [, getKeys] = useKeyboardControls()
  const { camera } = useThree()

  const baseSpeed = 4.0
  const speedMultiplier = useRef(1.0)
  const inventoryHeld = useRef(false)
  const inventoryUseHeld = useRef(false)
  const targetedEnemy = useRef(null)
  const aimTimer = useRef(0)
  const camSettings = useRef({
    x: 0,
    y: 8,
    z: 8,
  })

  // Character
  useEffect(()=>{
    // console.log(options.character)
    if (options.character === "jill jacketless") {
      setVisibleNodes(["Ana", "Pistol", "Shoes-HighTops", "Hair-Parted"])
    }
    else if (options.character === "jill jacketless alt") {
      setVisibleNodes(["AnaGen", "Pistol", "Shoes-HighTops", "Hair-Parted"])
    }
    else if (options.character === "goth") {
      setVisibleNodes(["SurvivorFGen", "Pistol", "Shoes-HighTops", "Hair-Parted", "Hair-TiedBack", "Hair-WavyPunk"])
    }
    else if (options.character === "survivor f") {
      setVisibleNodes(["SurvivorF", "Pistol", "Shoes-HighTops",  "Hair-WavyPunk", "GownTop"])
    }
    else {
      setVisibleNodes(["Ana", "Pistol", "Shoes-HighTops", "JacketShort", "Hair-Parted"])
    }
  }, [options])
  
  // Game loop
  useFrame((state, delta) => {
    if (!group.current) return
    if (!player) setPlayer(group)
    if (group.current.health <= 0) return

    // eslint-disable-next-line no-unused-vars
    const { forward, backward, left, right, jump, interact, inventoryLeft, inventoryRight, inventoryUse, shift, zoomIn, zoomOut } = getKeys()
    const gamepad = getGamepad()

    // Check Flags
    let groundSurface = "normal"
    if (group.current.actionFlag) {
      group.current.actionFlag = null
    }
    if (group.current.dmgFlag) {
      // takeDamage(group.current.dmgFlag)
      group.current.dmgFlag = null
    }
    if (group.current.groundFlag) {
      if (group.current.groundFlag === "net") {
        groundSurface = "net"
      }
      group.current.groundFlag = null
    }

    // Inventory
    const updateInventory = () => {
      if (inventoryLeft || inventoryRight || gamepad.inventoryLeft || gamepad.inventoryRight) {
        if (inventoryHeld.current === false) {
          let dir = 0
          if (inventoryLeft || gamepad.inventoryLeft) dir = -1
          if (inventoryRight || gamepad.inventoryRight) dir = 1

          let tempSlot = inventorySlot + dir
          if (tempSlot < 0) tempSlot = inventory.length-1
          else if (tempSlot >= inventory.length) tempSlot = 0
          setInventorySlot(tempSlot)
        }
        inventoryHeld.current = true
      } else inventoryHeld.current = false

      if ((inventoryUse || gamepad.inventoryUse) && !inventoryUseHeld.current) {
        inventoryUseHeld.current = true
        const item = inventory[inventorySlot]

        if (item && item.name!=="") {
          if (item.name === "stun grenade") {
            if (enemyGroup.current) {
              console.log(enemyGroup.current)
              enemyGroup.current.children.forEach(child => {
                child.actionFlag = "Stunned"
              })
            }
            inventoryRemoveItem(inventorySlot, 1)
            playAudio("./audio/gun-cocking.wav", 0.9)
          }
          else if (item.name === "health kit") {
            group.current.health += 50
            if (group.current.health > 100) group.current.health = 100
            useGameStore.setState((state) => ({
              hudInfo: {
                ...state.hudInfo,
                health: group.current.health,
              }
            }))
            inventoryRemoveItem()
          }
        }
      } else inventoryUseHeld.current = false
    }
    updateInventory()

    const shoot = () => {
      aimTimer.current += delta
      if (isUnskippableAnimation(anim)) return

      if (aimTimer.current < 0.75) {
        // cooldown
        anim.current = "Pistol Aim2"
        return
      }

      // shoot at target
      aimTimer.current = 0
      anim.current = "Pistol Fire2"

      if (targetedEnemy.current) {
        let dmg = 20
        if (inventory[inventorySlot].name === "power ammo") {
          dmg *= 4
          inventoryRemoveItem(inventorySlot, 1)
          playAudio("./audio/pistol-gunshot.wav", 0.25)
          anim.current = "Pistol Fire"
        }
        else {
          playAudio("./audio/pistol-gunshot.wav", 0.14)
        }

        const enemy = enemyGroup.current.children.find(e => e.id === targetedEnemy.current)
        enemy.dmgFlag = {
          dmg: dmg,
          position: group.current.position,
          range: null,
        }
      }
    }
    const movement = () => {
      if (!group.current) return
      transition.current = "Idle"

      let dx = 0
      let dy = 0

      // keyboard
      if (forward) dy = -1
      else if (backward) dy = 1
      if (left) dx = -1
      else if (right) dx = 1

      // Normalise horizontal movement
      if (dx && dy) {
        dx *= 0.7
        dy *= 0.7
      }
      // gamepad
      const gpmx = gamepad.moveX
      const gpmy = gamepad.moveY
      const moveDeadZone = 0.3
      if (Math.abs(gpmx) > moveDeadZone) dx = gpmx
      if (Math.abs(gpmy) > moveDeadZone) dy = gpmy * -1

      // get move action
      let speed = baseSpeed * speedMultiplier.current * delta
      let moveAction = "Jogging"
      if (["Pistol Fire", "Pistol Fire2"].includes(anim.current)) moveAction = "Shooting"
      if (groundSurface==="net") moveAction = "WalkingWade"
      if (group.current.position.y < -0.25) moveAction = "WalkingWade"

      // modify speed
      if (moveAction === "Shooting") speed *= 0.75
      if (moveAction === "WalkingWade") speed *= 0.35
      if (moveAction === "Walking") speed *= 0.4

      // move
      const targetPosition = vec3.set(group.current.position.x + dx * speed, group.current.position.y, group.current.position.z + dy * speed)
      const groundY = getGroundYfromXZ(ground, targetPosition.x, targetPosition.z)
      if (groundY === null) {
        targetPosition.set(group.current.position.x,group.current.position.y,group.current.position.z)
      }

      if (dx || dy) {
        if (moveAction !== "Shooting") {
          rotateToVec(group, dx, dy)
          transition.current = moveAction

          if (!isUnskippableAnimation(anim)) {
            anim.current = moveAction
          }
        }
      }
      else {
        // not moving
        const lockOn = enemyGroup ? lockOnEnemy(group.current.position, dx, dy, enemyGroup.current.children, targetedEnemy) : null

        if (lockOn) {
          // enemies in range
          rotateToVec(group, lockOn.x, lockOn.y)
          shoot()
        }
        else {
          if (!isUnskippableAnimation(anim)) {
            anim.current = "Idle"
          }
        }
      }

      group.current.position.x = targetPosition.x
      group.current.position.y = groundY
      group.current.position.z = targetPosition.z
    }
    movement()

    if (zoomIn) {
      camSettings.current.y -= delta * 2
      camSettings.current.z -= delta * 2
    } else if (zoomOut) {
      camSettings.current.y += delta * 2
      camSettings.current.z += delta * 2
    }
    cameraFollow(camera, group.current, camSettings.current)
  })

  return (
    <group
      ref={group}
      name='Player'
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

export default Player