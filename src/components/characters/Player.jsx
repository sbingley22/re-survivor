/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react"
import CharModel from './CharModel'
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useGameStore } from "../useGameStore"
import { lockOnEnemy, lockOnEnemyAngle, cameraFollow, getGroundYfromXZ, isUnskippableAnimation, rotateToVec, playAudio, cameraControls, isFemale, xpLevels } from "../gameHelper"

const vec3 = new THREE.Vector3()

const Player = ({ splatterFlag }) => {
  const { setMode, options, getVolume, getMute, getGamepad, level, setScore, getScore, player, setPlayer, ground, enemyGroup, abilities, setAbilities, inventory, inventorySlot, setInventorySlot, inventoryRemoveItem, setHudInfoParameter } = useGameStore()
  const group = useRef()
  const [visibleNodes, setVisibleNodes] = useState(["Ana", "Pistol", "Shoes-HighTops", "Jacket", "Hair-Parted"])
  const [skin, setSkin] = useState(null)
  const [weapon, setWeapon] = useState("Pistol")
  const anim = useRef("Pistol Ready")
  const transition = useRef("Pistol Ready")
  const forceAnimation = useRef(null)
  const [, getKeys] = useKeyboardControls()
  const { camera } = useThree()
  const gameTime = useRef(0)

  const isMouseDown = useRef(false)
  const mouseStartPos = useRef({ x: 0, y: 0 })
  const mouseCurrentPos = useRef({ x: 0, y: 0 })

  const baseSpeed = 4.0
  const speedMultiplier = useRef(1.0)
  const aimTimer = useRef(0)
  const baseShotRate = 0.5
  const shotRateMultiplier = useRef(1.0)
  const baseDamage = 20
  const damageMultiplier = useRef(1.0)
  const damageResistanceMultiplier = useRef(1.0)

  const inventoryHeld = useRef(false)
  const inventoryUseHeld = useRef(false)
  const targetedEnemy = useRef(null)
  const prevScore = useRef(0)

  // Mouse Events
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!options.useMouse) return
      isMouseDown.current = true
      mouseStartPos.current = { x: e.clientX, y: e.clientY }
      mouseCurrentPos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e) => {
      if (!options.useMouse) return
      if (isMouseDown.current) {
        mouseCurrentPos.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseUp = () => {
      isMouseDown.current = false
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [options.useMouse])
  // Touch Events
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (!options.useMouse) return
      isMouseDown.current = true
      const touch = e.touches[0]
      mouseStartPos.current = { x: touch.clientX, y: touch.clientY }
      mouseCurrentPos.current = { x: touch.clientX, y: touch.clientY }
    }
  
    const handleTouchMove = (e) => {
      if (!options.useMouse) return
      if (isMouseDown.current) {
        const touch = e.touches[0]
        mouseCurrentPos.current = { x: touch.clientX, y: touch.clientY }
      }
    }
  
    const handleTouchEnd = () => {
      isMouseDown.current = false
    }
  
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)
  
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [options.useMouse])
  
  // Character
  useEffect(()=>{
    // console.log(options.character)
    if (options.character === "jill") {
      speedMultiplier.current = 1.2
      damageMultiplier.current = 1.2
      shotRateMultiplier.current = 1.2
      damageResistanceMultiplier.current = 0.2
    }
    else if (options.character === "jill jacketless") {
      setVisibleNodes(["Ana", "Pistol", "Shoes-HighTops", "Hair-Parted"])
      speedMultiplier.current = 1.3
      damageMultiplier.current = 1.2
      shotRateMultiplier.current = 1.2
      damageResistanceMultiplier.current = 0.4
    }
    else if (options.character === "jill jacketless alt") {
      setVisibleNodes(["AnaGen", "Pistol", "Shoes-HighTops", "Hair-Parted"])
    }
    else if (options.character === "leon") {
      setVisibleNodes(["Leon", "Pistol"])
      setSkin({node: "Leon", index: 0})
      speedMultiplier.current = 0.9
      damageMultiplier.current = 1.9
      damageResistanceMultiplier.current = 0.4
      shotRateMultiplier.current = 0.7
    }
    else if (options.character === "leon shirtless") {
      setVisibleNodes(["Leon", "Pistol"])
      setSkin({node: "Leon", index: 1})
      speedMultiplier.current = 1.0
      damageMultiplier.current = 1.9
      shotRateMultiplier.current = 0.7
      damageResistanceMultiplier.current = 0.5
    }
    else if (options.character === "goth") {
      setVisibleNodes(["SurvivorFGen", "Pistol", "Shoes-HighTops", "Hair-Parted", "Hair-TiedBack", "Hair-WavyPunk"])
      speedMultiplier.current = 1.4
      damageMultiplier.current = 2.9
      shotRateMultiplier.current = 0.5
      damageResistanceMultiplier.current = 1.0
    }
    else if (options.character === "survivor f") {
      setVisibleNodes(["SurvivorF", "Pistol", "Shoes-HighTops",  "Hair-WavyPunk", "GownTop"])
      speedMultiplier.current = 0.9
      damageMultiplier.current = 5.5
      shotRateMultiplier.current = 0.9
      damageResistanceMultiplier.current = 2.5
    }
  }, [options])
  
  const updateScores = (extraScore=0) => {
    const finalScore = getScore() - Math.floor(gameTime.current) + extraScore

    // Retrieve existing scores from localStorage
    const scoresData = JSON.parse(localStorage.getItem("scores")) || {};
    
    // If the level doesn't exist, initialize it as an empty object
    if (!scoresData[level]) {
        scoresData[level] = {};
    }
    
    // If the character doesn't exist under this level, initialize the score
    if (!scoresData[level][options.character]) {
        scoresData[level][options.character] = finalScore
    } else {
        // Compare the current score with the last saved score
        const lastScore = scoresData[level][options.character];
        const currentScore = finalScore
        if (lastScore < currentScore) {
            scoresData[level][options.character] = currentScore;
        }
    }
    
    // Save updated scores back to localStorage
    localStorage.setItem('scores', JSON.stringify(scoresData));
    
    // Reset the score
    setScore(0);
  }

  const xpIncrease = () => {
    const xp = getScore()
    const prev = prevScore.current

    if (xp >= xpLevels[1] && prev < xpLevels[1]) {
      setAbilities({"Run and Gun": {unlocked:true, enabled:true}})
      setHudInfoParameter({msg: "Unlocked Run n Gun!"})
    }
    if (xp >= xpLevels[2] && prev < xpLevels[2]) {
      speedMultiplier.current *= 1.1
      setHudInfoParameter({msg: "Speed Increased!"})
    }
    if (xp >= xpLevels[3] && prev < xpLevels[3]) {
      shotRateMultiplier.current *= 1.2
      setHudInfoParameter({msg: "Fire Rate Increased!"})
    }
    if (xp >= xpLevels[4] && prev < xpLevels[4]) {
      damageMultiplier.current *= 1.2
      setHudInfoParameter({msg: "Damage Increased!"})
    }
    if (xp >= xpLevels[5] && prev < xpLevels[5]) {
      setWeapon("Uzi")
      setHudInfoParameter({msg: "Unlocked Uzi!"})
    }
    if (xp >= xpLevels[6] && prev < xpLevels[6]) {
      speedMultiplier.current *= 1.1
      setHudInfoParameter({msg: "Speed Increased!"})
    }
    if (xp >= xpLevels[7] && prev < xpLevels[7]) {
      shotRateMultiplier.current *= 1.2
      setHudInfoParameter({msg: "Fire Rate Increased!"})
    }
    if (xp >= xpLevels[8] && prev < xpLevels[8]) {
      damageMultiplier.current *= 1.2
      setHudInfoParameter({msg: "Damage Increased!"})
    }
    if (xp >= xpLevels[9] && prev < xpLevels[9]) {
      group.current.armour = 1
      setHudInfoParameter({msg: "Armour Aquired!"})
      setHudInfoParameter({armour: 1}) 
    }

    prevScore.current = xp
  }

  const playerDead = () => {
    updateScores()
    setMode(6)
  }

  const levelComplete = () => {
    updateScores(1000)
    setMode(7)
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

    let armourHit = false
    if (group.current.armour > 0) {
      group.current.armour -= 1
      armourHit = true
    }
    else group.current.health -= flag.dmg * damageResistanceMultiplier.current

    if (!armourHit) splatterFlag.current = {
      pos: group.current.position,
      color: 0x556611,
    }

    if (armourHit) playAudio("./audio/metalHit.wav")
    else if (isFemale(options.character)) playAudio("./audio/f-hurt.ogg", 0.2 * getVolume(), getMute())
    else playAudio("./audio/male-grunt-uh.mp3", 0.2 * getVolume(), getMute())

    const chance = Math.random()
    if (chance > 0.8) anim.current = "Stunned"
    else {
      if (anim.current !== "Stunned") anim.current = "Take Damage"
    }

    if (group.current.health <= 0) {
      // player dead 
      anim.current = "Dying"
      setTimeout(playerDead, 1000)
    }

    setHudInfoParameter({health: group.current.health})
    setHudInfoParameter({armour: group.current.armour})
  }

  // Use inventory Item
  const inventoryItemUse = (slot) => {
    const item = inventory[slot]

    if (item && item.name!=="") {
      if (item.name === "Stun Grenade") {
        if (enemyGroup.current) {
          enemyGroup.current.children.forEach(child => {
            child.actionFlag = "Stunned"
          })
        }
        inventoryRemoveItem(inventorySlot, 1)
        playAudio("./audio/gun-cocking.wav", 0.9 * getVolume(), getMute())
      }
      else if (item.name === "Medkit") {
        group.current.health += 50
        if (group.current.health > 100) group.current.health = 100
        setHudInfoParameter({health: group.current.health})
        inventoryRemoveItem(inventorySlot, 1)
      }
      else if (item.name === "Grenade") {
        // throw nade at target
        if (targetedEnemy.current) {
          inventoryRemoveItem(inventorySlot, 1)
          anim.current = "ThrowObject"
          playAudio("./audio/explosion.mp3", 0.5 * getVolume(), getMute())

          const enemy = enemyGroup.current.children.find(e => e.id === targetedEnemy.current)

          enemyGroup.current.children.forEach(e => {
            const distance = e.position.distanceTo(enemy.position)
            if (distance < 5) {
              e.dmgFlag = {
                dmg: 100,
                position: null,
                range: null,
              }
            }
          })
        }
      }
    }
  }

  // Game loop
  useFrame((state, delta) => {
    if (!group.current) return
    if (!player) setPlayer(group)
    if (group.current.health <= 0) return

    gameTime.current += delta

    // eslint-disable-next-line no-unused-vars
    const { forward, backward, left, right, jump, interact, inventoryLeft, inventoryRight, inventoryUse, shift, zoomIn, zoomOut } = getKeys()
    const gamepad = getGamepad()

    // Check Flags
    let groundSurface = "normal"
    if (group.current.actionFlag) {
      group.current.actionFlag = null
    }
    if (group.current.dmgFlag) {
      takeDamage(group.current.dmgFlag)
      group.current.dmgFlag = null
    }
    if (group.current.groundFlag) {
      if (group.current.groundFlag === "net") {
        groundSurface = "net"
      }
      group.current.groundFlag = null
    }
    if (group.current.scoreFlag) {
      xpIncrease()
      group.current.scoreFlag = null
    }
    if (group.current.inventoryFlag || group.current.inventoryFlag === 0) {
      inventoryItemUse(group.current.inventoryFlag)
      group.current.inventoryFlag = null
    }
    if (group.current.completeFlag) {
      levelComplete()
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
        inventoryItemUse(inventorySlot)
      } else inventoryUseHeld.current = false
    }
    updateInventory()

    const shoot = (runNGun = false) => {
      aimTimer.current += delta
      let alreadyShooting = false
      if (["Pistol Fire", "Pistol Fire2"].includes(anim.current)) { 
        alreadyShooting = true
      }
      if (isUnskippableAnimation(anim)) return

      let gunRate = 1.0
      let gunDamage = 1.0
      if (weapon === "Uzi") {
        gunRate = 3.0
        gunDamage = 0.5
      }

      if (aimTimer.current < baseShotRate / shotRateMultiplier.current / gunRate) {
        // cooldown
        // eslint-disable-next-line no-empty
        if (runNGun) {}
        else if (isFemale(options.character)) anim.current = "Pistol Aim2"
        else anim.current = "Pistol Aim"
        return
      }

      // shoot at target
      aimTimer.current = 0
      if (runNGun) anim.current = "Pistol Fire Jogging"
      else if (isFemale(options.character)) anim.current = "Pistol Fire2"
      else anim.current = "Pistol Fire"

      if (alreadyShooting) forceAnimation.current = anim.current

      if (targetedEnemy.current) {
        let dmg = baseDamage * damageMultiplier.current * gunDamage
        if (inventory[inventorySlot].name === "Power Ammo") {
          dmg *= 4
          inventoryRemoveItem(inventorySlot, 1)
          playAudio("./audio/pistol-gunshot.wav", 0.2 * getVolume(), getMute())
          anim.current = "Pistol Fire"
        }
        else {
          playAudio("./audio/pistol-gunshot.wav", 0.1 * getVolume(), getMute())
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
      transition.current = "Pistol Ready"

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

      // Handle mouse/touch input
      if (isMouseDown.current && options.useMouse) {
        const dxMouse = mouseCurrentPos.current.x - mouseStartPos.current.x
        const dyMouse = mouseCurrentPos.current.y - mouseStartPos.current.y
    
        const distance = Math.sqrt(dxMouse**2 + dyMouse**2)
        let tempSpeed = distance> 50 ? 1 : distance / 50
        if (distance > 10) {
          dx = dxMouse / distance // Normalize
          dy = dyMouse / distance // Normalize
          dx *= tempSpeed
          dy *= tempSpeed
        }
      }

      // gamepad
      const gpmx = gamepad.moveX
      const gpmy = gamepad.moveY
      const moveDeadZone = 0.3
      if (options.useController) {
        if (Math.abs(gpmx) > moveDeadZone) dx = gpmx
        if (Math.abs(gpmy) > moveDeadZone) dy = gpmy * -1
      }

      // get move action
      let speed = baseSpeed * speedMultiplier.current * delta
      let moveAction = "Jogging"
      if (["Pistol Fire", "Pistol Fire2", "Pistol Fire Jogging", "ThrowObject"].includes(anim.current)) moveAction = "Shooting"
      if (groundSurface==="net") moveAction = "WalkingWade"
      if (group.current.position.y < -0.25) moveAction = "WalkingWade"
      if (group.current.health < 33) moveAction = "WalkingHurt"

      // modify speed
      if (moveAction === "Shooting") speed *= 0.75
      if (moveAction === "WalkingWade") speed *= 0.35
      if (moveAction === "WalkingHurt") speed *= 0.35
      if (moveAction === "Walking") speed *= 0.4
      if (anim.current === "ThrowObject") speed *= 0.01

      // move
      const targetPosition = vec3.set(group.current.position.x + dx * speed, group.current.position.y, group.current.position.z + dy * speed)
      const groundY = getGroundYfromXZ(ground, targetPosition.x, targetPosition.z)
      if (groundY === null) {
        targetPosition.set(group.current.position.x,group.current.position.y,group.current.position.z)
      }

      // Run and Gun on
      // console.log("Moving ", dx || dy)
      if ((dx || dy) && abilities["Run and Gun"].unlocked && abilities["Run and Gun"].enabled && moveAction!=="WalkingWade") {
        const lockOn = enemyGroup ? lockOnEnemyAngle(group.current.position, dx, dy, enemyGroup.current.children, targetedEnemy) : null

        if (lockOn) {
          // enemies in range
          rotateToVec(group.current, lockOn.x, lockOn.y)
          shoot(true)
          setHudInfoParameter({status: "Shooting"})
        }
        else {
          if (moveAction !== "Shooting") {
            rotateToVec(group.current, dx, dy)
            transition.current = "Jogging"
            if (!isUnskippableAnimation(anim)) {
              // anim.current = "Jogging"
              anim.current = moveAction
            }
          }
          setHudInfoParameter({status: "Pistol Ready"})
        }
      }
      // Running
      else if (dx || dy) {
        if (moveAction !== "Shooting") {
          rotateToVec(group.current, dx, dy)
          transition.current = moveAction

          if (!isUnskippableAnimation(anim)) {
            anim.current = moveAction
          }
        }
        setHudInfoParameter({status: "Pistol Ready"})
      }
      // Not Moving
      else {
        const lockOn = enemyGroup ? lockOnEnemy(group.current.position, dx, dy, enemyGroup.current.children, targetedEnemy) : null

        if (lockOn) {
          // enemies in range
          rotateToVec(group.current, lockOn.x, lockOn.y)
          shoot()
          setHudInfoParameter({status: "Shooting"})
        }
        else {
          if (!isUnskippableAnimation(anim) || ["Pistol Fire Jogging"].includes(anim.current)) {
            anim.current = "Pistol Ready"
            setHudInfoParameter({status: "Pistol Ready"})
          }
        }
      }

      group.current.position.x = targetPosition.x
      group.current.position.y = groundY
      group.current.position.z = targetPosition.z
    }
    movement()

    cameraControls(zoomIn, zoomOut, delta)
    cameraFollow(camera, group.current)
    // console.log(anim.current)
  })

  return (
    <group
      ref={group}
      name='Player'
      health={100}
      armour={0}
      inventoryFlag={null}
      actionFlag={null}
      dmgFlag={null}
      scoreFlag={null}
      keyFlag={null}
      completeFlag={false}
    >
      <CharModel 
        anim={anim}
        visibleNodes={visibleNodes}
        skin={skin}
        transition={transition} 
        forceAnimation={forceAnimation}
        speedMultiplier={speedMultiplier}
        weapon={weapon}
      />
    </group>
  )
}

export default Player