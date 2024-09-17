/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useGLTF } from "@react-three/drei"
import glb from "../assets/items/Jetski.glb?url"
import { useGameStore } from "../components/useGameStore"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

const Jetski = ({ position }) => {
  const { scene } = useGLTF(glb)
  const { player } = useGameStore()
  const group = useRef()

  useFrame(()=>{
    if (!group || !group.current) return
    if (!player || !player.current) return

    const distance = group.current.position.distanceTo(player.current.position)
    if (distance < 1) {
      // console.log(player.current.completeFlag, player.current.keyFlag)
      // Check if player has key
      if (player.current.keyFlag === "jetski") {
        // Level complete
        // console.log("Level Complete")
        player.current.completeFlag = true
      }
    }
  })

  return (
    <group
      ref={group}
      position={position}
    >
      <primitive object={scene} />
    </group>
  )
}

export default Jetski

useGLTF.preload(glb)