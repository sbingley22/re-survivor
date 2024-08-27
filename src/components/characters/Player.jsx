/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react"
import CharModel from './CharModel'
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useGameStore } from "../useGameStore"
import { cameraFollow, getGroundYfromXZ, isUnskippableAnimation, rotateToVec } from "../gameHelper"

const vec3 = new THREE.Vector3()

const Player = () => {
  const { options, getGamepad, player, setPlayer, ground } = useGameStore()
  const group = useRef()
  const [visibleNodes, setVisibleNodes] = useState(["Ana", "Pistol", "Shoes-HighTops", "Jacket", "Hair-Parted"])
  const anim = useRef("Idle")
  const transition = useRef("Idle")
  const [, getKeys] = useKeyboardControls()
  const { camera } = useThree()

  // Alt Mode
  useEffect(()=>{
    if (options.altCostume === 1) {
      setVisibleNodes(["Ana", "Pistol", "Shoes-HighTops", "Hair-Parted"])
    }
    else if (options.altCostume === 2) {
      setVisibleNodes(["AnaGen", "Pistol", "Shoes-HighTops", "Hair-Parted"])
    }
    else if (options.altCostume === 3) {
      setVisibleNodes(["SurvivorFGen", "Pistol", "Shoes-HighTops", "Hair-Parted", "Hair-TiedBack", "Hair-WavyPunk"])
    }
    else if (options.altCostume === 4) {
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
    const { forward, backward, left, right, jump, interact, inventoryLeft, inventoryRight, inventoryUse, shift } = getKeys()
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
      let speed = 4.0 * delta
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
        if (false) {
          // enemies in range

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

    cameraFollow(camera, group.current)

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
      />
    </group>
  )
}

export default Player