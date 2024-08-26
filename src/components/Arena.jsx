/* eslint-disable react/no-unknown-property */
import { Environment, useGLTF } from "@react-three/drei"
import levels from "../assets/levels"
import { useEffect } from "react"
import { useGameStore } from "./useGameStore"

const Arena = () => {
  const { level } = useGameStore()
  const { scene, nodes } = useGLTF(levels["test"].glb)

  // load level
  useEffect(()=>{
    console.log("level: ", nodes)
  }, [level, nodes])

  return (
    <>
      <Environment
        preset="night"
        environmentIntensity={1}
        background={true}
        backgroundIntensity={1}
      />

      <primitive object={scene} />
    </>
  )
}

export default Arena