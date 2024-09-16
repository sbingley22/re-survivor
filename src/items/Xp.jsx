/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { Box } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useGameStore } from '../components/useGameStore'

const Xp = ({ id, pos, scale=1, xpPickups, setXpPickups }) => {
  const group = useRef()
  const { player, addScore } = useGameStore()

  // eslint-disable-next-line no-unused-vars
  useFrame((state, delta)=>{
    if (!player || !player.current) return
    if (!group || !group.current) return

    const distance = group.current.position.distanceTo(player.current.position)
    if (distance < 0.9) {
      addScore(10)

      // Remove self
      const temp = xpPickups.filter(item => item.id !== id)
      setXpPickups(temp)
    }
  })

  return (
    <group
      ref={group}
      position={pos}
      scale={scale}
    >
      <Box 
        position-y={0.2}
        scale={0.2}
      >
        <meshStandardMaterial color="yellow" />
      </Box>
    </group>
  )
}

export default Xp