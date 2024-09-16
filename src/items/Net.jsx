/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react'
import glb from "../assets/items/net.glb?url"
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../components/useGameStore'
import { useGLTF } from '@react-three/drei'

const Net = ({ id, pos, scale=1, nets, setNets }) => {
  const group = useRef()
  const { nodes } = useGLTF(glb)
  const { player, inventory, inventoryRemoveItem, inventorySlot } = useGameStore()
  const yRot = Math.floor((pos[0] + pos[1] + pos[2]) % 4) * (Math.PI/2)

  // Initialize
  useEffect(()=>{
    if (nodes["Net"]) {
      nodes["Net"].castShadow = true
      nodes["Net"].material.color.set(0.08,0.18,0.04)
    }
  }, [nodes])

  // eslint-disable-next-line no-unused-vars
  useFrame((state,delta)=>{
    if (!player || !player.current) return
    if (!group || !group.current) return

    const distance = group.current.position.distanceTo(player.current.position)
    if (distance < scale[0] * 0.9) {
      const item = inventory[inventorySlot]
      if (item.name === "Net Spray") {
        // Remove net and reduce item count
        const tempNets = nets.filter((net) => net.id !== id)
        setNets(tempNets)

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
      <mesh geometry={nodes["Net"].geometry} material={nodes["Net"].material}>
      </mesh>
    </group>
  )
}

export default Net