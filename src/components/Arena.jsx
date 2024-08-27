/* eslint-disable react/no-unknown-property */
import { v4 as uuidv4 } from 'uuid'
import { Environment, useGLTF } from "@react-three/drei"
import levels from "../assets/levels"
import { useEffect, useRef, useState } from "react"
import { useGameStore } from "./useGameStore"
import Player from "./characters/Player"
import Jetski from "../items/Jetski"
import Net from '../items/Net'

const Arena = () => {
  const { level, setGround } = useGameStore()
  const { scene, nodes } = useGLTF(levels["test"].glb)
  const arenaRef = useRef()
  const [jetski, setJetski] = useState(null)
  const [nets, setNets] = useState([])

  // load level
  useEffect(()=>{
    console.log("level: ", nodes)

    if (nodes["ground"]) {
      setGround(nodes["ground"])
      nodes["ground"].receiveShadow = true
      if (nodes["ground"]?.material?.color) {
        nodes["ground"].material.color.setScalar(0.1)
      }
    }

    if (nodes["jetski"]) {
      setJetski({
        position: nodes["jetski"].position
      })
    }

    if (nodes["nets"]) {
      console.log(nodes["nets"])
      const temp = []
      nodes["nets"].children.forEach(net => {
        temp.push({
          id: uuidv4(),
          position: [net.position.x, net.position.y, net.position.z],
          scale: [net.scale.x, net.scale.y, net.scale.z],
        })
      })
      setNets(temp)
    }

  }, [level, nodes, setGround])

  return (
    <>
      <Environment
        preset="night"
        environmentIntensity={3}
        background={false}
        backgroundIntensity={1}
      />
      <directionalLight
        castShadow
        position={[0,10,0]}
        intensity={.5}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      <group ref={arenaRef} name="arena">
        <primitive object={scene} />
      </group>

      <Player />

      {jetski && <Jetski
        position={jetski.position}
      />}

      {nets.map((net) => (
        <Net
          key={net.id}
          id={net.id}
          pos={net.position}
          scale={net.scale}
          nets={nets}
          setNets={setNets}
        />
      ))}
    </>
  )
}

export default Arena