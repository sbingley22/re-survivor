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
import { useFrame } from '@react-three/fiber'
import Bush from '../items/Bush'
import Turret from '../items/Turret'
import Xp from '../items/Xp'

const Arena = () => {
  const { addScore, player, level, setGround, enemies, setEnemies, enemiesAdd, setEnemyGroup, setHudInfoParameter } = useGameStore()
  const { scene, nodes } = useGLTF(levels[level].glb)
  const arenaRef = useRef()
  const enemiesGroup = useRef()
  const [jetski, setJetski] = useState(null)
  const [turrets, setTurrets] = useState([])
  const [nets, setNets] = useState([])
  const [bushes, setBushes] = useState([])
  const [items, setItems] = useState([])
  const [xpPickups, setXpPickups] = useState([])
  const splatterFlag = useRef(null)

  const wave = useRef({
    amount: null,
    index: 0,
    timer: 0
  })

  // load level
  useEffect(()=>{
    console.log("level: ", nodes)

    if (levels[level]?.waves) {
      const waves = levels[level].waves[0]
      wave.current.amount = waves.amount
      wave.current.index = 0
      wave.current.timer = 10
    }

    if (enemiesGroup.current) setEnemyGroup(enemiesGroup)
    else console.log("Couldn't set enemy group!")

    if (nodes["ground"]) {
      setGround(nodes["ground"])
      nodes["ground"].receiveShadow = true
      if (nodes["ground"]?.material?.color) {
        nodes["ground"].material.color.setScalar(0.3)
      }
    }

    // Jetski
    if (nodes["jetski"]) {
      setJetski({
        position: nodes["jetski"].position
      })
    }

    // Turrets
    if (nodes["turretPlants"]) {
      const temp = []
      nodes["turretPlants"].children.forEach(child => {
        temp.push({
          id: uuidv4(),
          position: [child.position.x, child.position.y, child.position.z],
          scale: [child.scale.x, child.scale.y, child.scale.z],
        })
      })
      setTurrets(temp)
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

    // Bushes
    if (nodes["bushes"]) {
      const temp = []
      nodes["bushes"].children.forEach(child => {
        temp.push({
          id: uuidv4(),
          position: [child.position.x, child.position.y, child.position.z],
          scale: [child.scale.x, child.scale.y, child.scale.z],
        })
      })
      setBushes(temp)
    }

    // Add all items
    const tempItems = []
    if (nodes["medkits"]) {
      nodes["medkits"].children.forEach(child => {
        tempItems.push({
          id: uuidv4(),
          name: "Medkit",
          node: "HealthKit",
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
          name: "Net Spray",
          node: "Spray",
          amount: 3,
          position: [child.position.x, child.position.y, child.position.z],
          scale: [child.scale.x, child.scale.y, child.scale.z],
        })
      })
    }
    if (nodes["grenades"]) {
      nodes["grenades"].children.forEach(child => {
        tempItems.push({
          id: uuidv4(),
          name: "Grenade",
          node: "Grenade",
          amount: 1,
          position: [child.position.x, child.position.y, child.position.z],
          scale: [child.scale.x, child.scale.y, child.scale.z],
        })
      })
    }
    if (nodes["ammos"]) {
      nodes["ammos"].children.forEach(child => {
        tempItems.push({
          id: uuidv4(),
          name: "Power Ammo",
          node: "Ammo",
          amount: 20,
          position: [child.position.x, child.position.y, child.position.z],
          scale: [child.scale.x, child.scale.y, child.scale.z],
        })
      })
    }
    setItems(tempItems)

  }, [enemiesAdd, level, nodes, setEnemies, setEnemyGroup, setGround])

  const spawnEnemies = (waveData) => {
    const newEnemies = []
    for (let index = 0; index < waveData.batch; index++) {
      if (wave.current.amount < 1) {
        enemiesAdd(newEnemies)
        return false
      }

      // chose enemies to spawn
      for (let y = 0; y < waveData.types.length; y++) {
        const type = waveData.types[y]
        const odds = waveData.odds[y]
        const chance = Math.random()

        if (chance < odds) {
          // spawn enemy type
          newEnemies.push(spawnEnemy(type))
          wave.current.amount -= 1
        }
      }
    }

    enemiesAdd(newEnemies)
  }

  const spawnEnemy = (type) => {
    let name = type
    if (name === "Zombies") {
      const chance = Math.random()
      if (chance < 0.5) name = "ZFem"
      else name = "ZMale"
    }

    // Random spawn location
    const radius = 50
    let rx = (Math.random() - 0.5) * radius
    let rz = (Math.random() - 0.5) * radius

    // Dont spawn too close to player
    const space = 5
    if (Math.abs(rx) < space) {
      if (rx < 0) rx -= space
      else rx += space
    }
    if (Math.abs(rz) < space) {
      if (rz < 0) rz -= space
      else rz += space
    }

    if (player && player.current) {
      rx += player.current.position.x
      rz += player.current.position.z
    }

    return {id: uuidv4(), type: name, position: [rx,0,rz]}
  }

  // Game Loop
  useFrame((state,delta)=>{
    const lvl = levels[level]
    if (!lvl) return
    if (wave.amount === null) return
    const waveData = levels[level].waves[wave.current.index]
    if (!waveData) return

    wave.current.timer += delta
    if (wave.current.timer > waveData.rate && enemies.length < 10) {
      wave.current.timer = 0
      const result = spawnEnemies(waveData)

      // check if all enemies are spawned
      if (result === false) {
        wave.current.index += 1
        wave.current.timer = -20
        const nextWave = levels[level].waves[wave.current.index]
        if (nextWave) wave.current.amount = nextWave.amount

        addScore(100)
        if (player.current) player.current.scoreFlag = 100

        if (wave.current.index >= 3) {
          player.current.keyFlag = "jetski"
          setHudInfoParameter({msg: "JetSki Key Obtained. Find the jetski!"})
          setTimeout(()=>{
            setHudInfoParameter({msg: "JetSki Key Obtained. Find the jetski!"})
          }, 10000)
        }
      }
    }

  })

  return (
    <>
      <Environment
        preset="night"
        environmentIntensity={6}
        background={false}
        backgroundIntensity={1}
      />
      <directionalLight
        castShadow
        position={[0,10,0]}
        intensity={1.0}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      <group ref={arenaRef} name="arena">
        <primitive object={scene} />
      </group>

      <Player 
        splatterFlag={splatterFlag}
      />

      <group ref={enemiesGroup} >
        {enemies.map(en => (
          <Enemy 
            key={en.id} 
            id={en.id}
            position={en.position}
            type={en.type}
            splatterFlag={splatterFlag}
            setXpPickups={setXpPickups}
          />
        ))}
      </group>

      {jetski && <Jetski
        position={jetski.position}
      />}

      {xpPickups.map((child) => (
        <Xp
          key={child.id}
          id={child.id}
          pos={child.position}
          scale={child.scale}
          scoreAmount={child.score}
          xpPickups={xpPickups}
          setXpPickups={setXpPickups}
        />
      ))}

      {turrets.map((child) => (
        <Turret
          key={child.id}
          id={child.id}
          pos={child.position}
          scale={child.scale}
          turrets={turrets}
          setTurrets={setTurrets}
        />
      ))}

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

      {bushes.map((child) => (
        <Bush
          key={child.id}
          id={child.id}
          pos={child.position}
          scale={child.scale}
          bushes={bushes}
          setBushes={setBushes}
        />
      ))}

      {items.map((item) => (
        <Item
          key={item.id}
          id={item.id}
          name={item.name}
          node={item.node}
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