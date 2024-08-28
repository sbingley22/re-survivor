/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useRef } from "react"
import ItemModels from "./ItemModels"
import { useGameStore } from "../components/useGameStore"
import { useFrame } from "@react-three/fiber"

const Item = ({ id, name, amount, pos, scale=1, items, setItems }) => {
  const group = useRef()
  const { player, inventoryAddItem } = useGameStore()

  // Game loop
  useFrame(() => {
    if (!group.current) return
    if (!player.current) return

    const distance = group.current.position.distanceTo(player.current.position)
    if (distance < 0.5) {
      inventoryAddItem(name, amount)

      // Remove self
      const tempItems = items.filter(item => item.id !== id)
      setItems(tempItems)
    }
  })

  return (
    <group
      ref={group}
      position={pos}
      scale={scale}
    >
      <ItemModels node={name} />
    </group>
  )
}

export default Item