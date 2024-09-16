/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react'
import glb from "../assets/items/turret.glb?url"
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../components/useGameStore'
import { Sphere, useGLTF } from '@react-three/drei'
import { Vector3 } from 'three'

const vec3 = new Vector3()

const Turret = ({ pos, scale=1 }) => {
  const group = useRef()
  const bulletRef = useRef()
  const { nodes } = useGLTF(glb)
  const { player } = useGameStore()
  const shotTimer = useRef(0)
  const shotRate = 2
  const bulletLife = useRef(0)
  const bulletDirection = useRef({x:1, z:1})
  const bulletSpeed = 6

  // Initialize
  useEffect(()=>{
    //console.log(nodes)
    if (nodes["TurretPlant"]) {
      nodes["TurretPlant"].castShadow = true
    }
  }, [nodes])

  useFrame((state, delta)=>{
    if (!player || !player.current) return
    if (!group || !group.current) return
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
        bx += (Math.random() - 0.5) * 0.5
        bz += (Math.random() - 0.5) * 0.5

        bulletDirection.current.x = bx
        bulletDirection.current.z = bz
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
      }
    }
  })

  return (
    <group
      ref={group}
      position={pos}
      scale={scale}
    >
      {nodes["TurretPlant"].children.map(child => (
        <mesh key={child.id + "turret"} geometry={child.geometry} material={child.material}></mesh>
      ))}

      <Sphere
        ref={bulletRef}
        position={[0,1,0]}
        scale={0.1}
      />
    </group>
  )
}

export default Turret