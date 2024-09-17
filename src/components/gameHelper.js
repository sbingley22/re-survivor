import * as THREE from 'three'

const vec3b = new THREE.Vector3()
const vec3c = new THREE.Vector3()
const quat = new THREE.Quaternion()

const raycaster = new THREE.Raycaster()
const direction = new THREE.Vector3(0, -1, 0)
const origin = new THREE.Vector3(0, 10, 0)

const camSettings = {
  x: 0,
  y: 8,
  z: 8,
}

export const cameraControls = (zoomIn, zoomOut, delta=0.01) => {
  if (zoomIn) {
    camSettings.y -= delta * 2
    camSettings.z -= delta * 2
  } else if (zoomOut) {
    camSettings.y += delta * 2
    camSettings.z += delta * 2
  }
}

export const cameraFollow = (cam, player) => {
  if (!cam || !player) return
  // console.log(cam)
  let x = 0
  let y = 8
  let z = 8

  if (camSettings) {
    x = camSettings.x
    y = camSettings.y
    z = camSettings.z
  }

  cam.position.x = player.position.x + x
  cam.position.y = y
  cam.position.z = player.position.z + z
}

export const getGroundYfromXZ = (ground, x, z) => {
  // console.log(ground)
  if (!ground) return null

  origin.x = x
  origin.z = z
  raycaster.set(origin, direction)

  const intersects = raycaster.intersectObject(ground)

  if (intersects.length > 0) {
    // console.log(intersects[0].point.y)
    return intersects[0].point.y
  }

  return null
}  

export const isUnskippableAnimation = (anim) => {
  if (!anim || !anim.current) return

  const a = anim.current
  if (a === "Fall") return true
  if (a === "Fight Jab") return true
  if (a === "Fight Roundhouse") return true
  if (a === "Fight Straight") return true
  if (a === "Jump") return true
  if (a === "Land") return true
  if (a === "Pistol Fire") return true
  if (a === "Pistol Fire2") return true
  if (a === "Pistol Fire Upper") return true
  if (a === "Upper Pistol Fire") return true
  if (a === "ThrowObject") return true
  if (a === "Take Damage") return true
  if (a === "Spawning") return true
  if (a === "Dying") return true
  if (a === "Stunned") return true

  return false
}

export const lockOnEnemy = (position, dx, dy, enemies, targetedEnemy) => {
  if (enemies.length < 1) return null
  const range = 6

  let closestEnemy = null;
  let closestDistance = Infinity;
  targetedEnemy.current = null

  enemies.forEach(enemy => {
    if (!enemy) return

    if (enemy.health <= 0) return
    
    // Get enemy position
    const ex = enemy.position.x;
    const ez = enemy.position.z;

    // Calculate vector from player to enemy
    const vx = ex - position.x;
    const vz = ez - position.z;

    const distance = Math.sqrt(vx * vx + vz * vz)

    if (distance > range) return
    
    if (distance < closestDistance) {
      closestEnemy = { x: vx, y: vz };
      closestDistance = distance;
      targetedEnemy.current = enemy.id
    }
  })

  if (!closestEnemy) {
    return null
  }

  return closestEnemy
}

export const lockOnEnemyAngle = (position, dx, dy, enemies, targetedEnemy) => {
  if (enemies.length < 1) return null
  const range = 6

  let closestEnemy = null
  let closestDistance = Infinity
  let closestAngle = Infinity
  targetedEnemy.current = null

  enemies.forEach(enemy => {
    if (!enemy) return

    if (enemy.health <= 0) return
    
    const ex = enemy.position.x
    const ez = enemy.position.z

    const vx = ex - position.x
    const vz = ez - position.z

    const distance = Math.sqrt(vx * vx + vz * vz)

    const len = Math.sqrt(dx * dx + dy * dy)
    const ndx = dx / len
    const ndy = dy / len

    const lenEnemy = Math.sqrt(vx * vx + vz * vz)
    const evx = vx / lenEnemy
    const evz = vz / lenEnemy

    const dotProduct = ndx * evx + ndy * evz
    const angle = Math.acos(dotProduct)

    if (distance > range) return
    
    if (distance < closestDistance) {
      if (angle < Math.PI / 2 && angle < closestAngle)
      closestEnemy = { x: vx, y: vz }
      closestDistance = distance
      closestAngle
      targetedEnemy.current = enemy.id
    }
  })

  if (!closestEnemy) {
    return null
  }

  return closestEnemy
}

export const rotateToVec = (group, dx, dy, rotSpeed=0.1) => {
  if (!group) return

  // Calculate target rotation
  const direction = vec3b.set(dx, 0, dy).normalize()
  const angle = Math.atan2(direction.x, direction.z)

  // Create quaternions for current and target rotations
  const currentQuaternion = group.quaternion.clone()
  const targetQuaternion = quat.setFromAxisAngle(vec3c.set(0, 1, 0), angle)

  // Interpolate rotation using slerp
  currentQuaternion.slerp(targetQuaternion, rotSpeed)
  group.quaternion.copy(currentQuaternion)
}

export const playAudio = (src, volume=1, mute=false) => {
  if (mute) return
  const audio = new Audio(src)
  audio.volume = volume
  audio.play()
}

export const moveToPlayer = (player, group, range, speed) => {
  const distance = player.position.distanceTo(group.position)
  if (distance < range) return "in range"

  const vx =  player.position.x - group.position.x
  const vz =  player.position.z - group.position.z
  const ndx = vx / distance
  const ndz = vz / distance

  rotateToVec(group, ndx, ndz)
  
  group.position.x += ndx * speed
  group.position.z += ndz * speed

  return "progress"
}

export const isFemale = (char) => {
  let female = true

  if (char === "leon") female = false
  else if (char === "leon shirtless") female = false

  return female
}

// export const xpLevels = [0, 100, 300, 500, 750, 1000, 1400, 1700, 2000, 2400, 2800, 3000, 4000]
export const xpLevels = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
export const getXpLevel = (xp) => {
  if (xp <= 0) return 0
  for (let index = 0; index < xpLevels.length; index++) {
    if (xp < xpLevels[index]) return index-1
  }
  return xpLevels.length - 1
}