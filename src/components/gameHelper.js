import * as THREE from 'three'

const vec3b = new THREE.Vector3()
const vec3c = new THREE.Vector3()
const quat = new THREE.Quaternion()

const raycaster = new THREE.Raycaster()
const direction = new THREE.Vector3(0, -1, 0)
const origin = new THREE.Vector3(0, 10, 0)

export const cameraFollow = (cam, player, camSettings=null) => {
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
  if (a === "Take Damage") return true
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

export const rotateToVec = (group, dx, dy, rotSpeed=0.1) => {
  if (!group || !group.current) return

  // Calculate target rotation
  const direction = vec3b.set(dx, 0, dy).normalize()
  const angle = Math.atan2(direction.x, direction.z)

  // Create quaternions for current and target rotations
  const currentQuaternion = group.current.quaternion.clone()
  const targetQuaternion = quat.setFromAxisAngle(vec3c.set(0, 1, 0), angle)

  // Interpolate rotation using slerp
  currentQuaternion.slerp(targetQuaternion, rotSpeed)
  group.current.quaternion.copy(currentQuaternion)
}

export const playAudio = (src, volume=1) => {
  const audio = new Audio(src)
  audio.volume = volume
  audio.play()
}