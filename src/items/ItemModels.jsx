/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useGLTF } from "@react-three/drei"
import glb from "../assets/items/reItems.glb?url"
import { useEffect, useState } from "react"

const ItemModels = ({ node }) => {
  const { nodes } = useGLTF(glb)
  const [type, setType] = useState(null)

  // initialize
  useEffect(()=>{
    // console.log("items: ", nodes)
    // console.log(nodes[node], node)
    if (!nodes[node]) return

    nodes[node].castShadow = true
    setType(nodes[node].type)
  }, [node, nodes])

  return (
    <>
      {node &&
      <>
        {type=== "Mesh" && 
        <mesh geometry={nodes[node].geometry} material={nodes[node].material} />}

        {type=== "Group" &&
        nodes[node].children.map( (child) => (
          <mesh key={node + child.id} geometry={child.geometry} material={child.material} />
        ))}
      </>}
    </>
  )
}

export default ItemModels

useGLTF.preload(glb)