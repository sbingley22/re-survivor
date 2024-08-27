import * as THREE from 'three'

const vec3b = new THREE.Vector3()
const vec3c = new THREE.Vector3()
const quat = new THREE.Quaternion()

const raycaster = new THREE.Raycaster()
const direction = new THREE.Vector3(0, -1, 0)
const origin = new THREE.Vector3(0, 10, 0)

export const cameraFollow = (cam, player) => {
  if (!cam || !player) return
  // console.log(cam)

  cam.position.x = player.position.x
  cam.position.y = 8
  cam.position.z = player.position.z + 8
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