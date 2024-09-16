/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react'
import glb from "../assets/items/bush.glb?url"
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../components/useGameStore'
import { useGLTF } from '@react-three/drei'

const Bush = ({ id, pos, scale=1, bushes, setBushes }) => {
  const group = useRef()
  const { nodes } = useGLTF(glb)
  const { player, inventory, inventoryRemoveItem, inventorySlot } = useGameStore()
  const yRot = Math.floor((pos[0] + pos[1] + pos[2]) % 4) * (Math.PI/2)

  // Initialize
  useEffect(()=>{
    if (nodes["Bush"]) {
      nodes["Bush"].castShadow = true
      // nodes["Bush"].material.color.set(0.04,0.08,0.02)
    }
  }, [nodes])

  // eslint-disable-next-line no-unused-vars
  useFrame((state,delta)=>{
    if (!player || !player.current) return
    if (!group || !group.current) return

    const distance = group.current.position.distanceTo(player.current.position)
    if (distance < scale[0] * 0.9) {
      const item = inventory[inventorySlot]
      if (item.name === "Bush Spray") {
        // Remove net and reduce item count
        const tempNets = bushes.filter((net) => net.id !== id)
        setBushes(tempNets)

        inventoryRemoveItem(inventorySlot, 1)
      }
      else {
        player.current.groundFlag = "net"
      }
    }
  })

  return (
    <group
      ref={group}
      position={pos}
      scale={scale}
      rotation={[0, yRot, 0]}
    >
      <mesh geometry={nodes["Bush"].geometry} material={nodes["Bush"].material}>
      </mesh>
    </group>
  )
}

export default Bush