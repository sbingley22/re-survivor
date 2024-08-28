/* eslint-disable react/no-unknown-property */
import { v4 as uuidv4 } from 'uuid'
import { Environment, useGLTF } from "@react-three/drei"
import levels from "../assets/levels"
import { useEffect, useRef, useState } from "react"
import { useGameStore } from "./useGameStore"
import Player from "./characters/Player"
import Jetski from "../items/Jetski"
import Net from '../items/Net'
import Item from '../items/Item'
import Enemy from './characters/Enemy'
import BloodManager from './BloodManager'

const Arena = () => {
  const { level, setGround, enemies, setEnemies, enemiesAdd, setEnemyGroup } = useGameStore()
  const { scene, nodes } = useGLTF(levels["test"].glb)
  const arenaRef = useRef()
  const enemiesGroup = useRef()
  const [jetski, setJetski] = useState(null)
  const [nets, setNets] = useState([])
  const [items, setItems] = useState([])  
  const splatterFlag = useRef(null)

  // load level
  useEffect(()=>{
    console.log("level: ", nodes)

    if (enemiesGroup.current) setEnemyGroup(enemiesGroup)
    else console.log("Couldn't set enemy group!")

    if (nodes["ground"]) {
      setGround(nodes["ground"])
      nodes["ground"].receiveShadow = true
      if (nodes["ground"]?.material?.color) {
        nodes["ground"].material.color.setScalar(0.2)
      }
    }

    // Enemies
    enemiesAdd(uuidv4(), "ZFemGen", [-7,0,-4])

    // Jetski
    if (nodes["jetski"]) {
      setJetski({
        position: nodes["jetski"].position
      })
    }

    // Nets
    if (nodes["nets"]) {
      // console.log(nodes["nets"])
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

    // Add all items
    const tempItems = []
    if (nodes["medkits"]) {
      nodes["medkits"].children.forEach(child => {
        tempItems.push({
          id: uuidv4(),
          name: "HealthKit",
          amount: 1,
          position: [child.position.x, child.position.y, child.position.z],
          scale: [child.scale.x, child.scale.y, child.scale.z],
        })
      })
    }
    if (nodes["netsprays"]) {
      nodes["netsprays"].children.forEach(child => {
        tempItems.push({
          id: uuidv4(),
          name: "Spray",
          amount: 3,
          position: [child.position.x, child.position.y, child.position.z],
          scale: [child.scale.x, child.scale.y, child.scale.z],
        })
      })
    }
    setItems(tempItems)

  }, [enemiesAdd, level, nodes, setEnemies, setEnemyGroup, setGround])

  return (
    <>
      <Environment
        preset="night"
        environmentIntensity={4}
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

      <group ref={enemiesGroup} >
        {enemies.map(en => (
          <Enemy 
            key={en.id} 
            id={en.id}
            position={en.position}
            type={en.type}
            splatterFlag={splatterFlag}
          />
        ))}
      </group>

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

      {items.map((item) => (
        <Item
          key={item.id}
          id={item.id}
          name={item.name}
          amount={item.amount}
          pos={item.position}
          scale={item.scale}
          items={items}
          setItems={setItems}
        />
      ))}

      <BloodManager splatterFlag={splatterFlag} />

    </>
  )
}

export default Arena