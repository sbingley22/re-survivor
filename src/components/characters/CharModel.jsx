/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useRef } from "react"
import glb from "../../assets/reCharacters.glb?url"
import { useSkinnedMeshClone } from "./SkinnedMeshClone"
import { useAnimations } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"

const CharModel = ({ anim, visibleNodes, transition, speedMultiplier={current:1}, }) => {
  const { scene, nodes, animations } = useSkinnedMeshClone(glb)
  const { mixer, actions } = useAnimations(animations, scene)
  const lastAnim = useRef(anim.current)

  // Initial Setup
  useEffect(()=>{
    // console.log(nodes, actions)

    Object.keys(nodes).forEach(nodeName => {
      const node = nodes[nodeName]
      if (node.type === "Mesh" || node.type === "SkinnedMesh") { 
        node.visible = false
        node.castShadow = true
      }
    })

    if (actions[anim.current]){
      actions[anim.current].play()
    }

  },[nodes, actions])

  // Set visible nodes
  useEffect(()=>{
    if (!visibleNodes) return

    Object.keys(nodes).forEach(nodeName => {
      const node = nodes[nodeName]
      if (node.type === "Mesh" || node.type === "SkinnedMesh") node.visible = false
    })

    visibleNodes.forEach(vn => {
      const node = nodes[vn]
      if (!node) return

      node.visible = true
      if (node.type === "Group") {
        node.children.forEach(child => {
          child.visible = true
        })
      }
    })
  }, [visibleNodes, nodes])

  // Mixer Settings
  useEffect(()=>{
    if (!mixer) return

    const oneShotAnims = ["Fight Jab", "Fight Roundhouse", "Fight Straight", "Jump", "Land", "Pistol Fire", "Pistol Fire2", "Take Damage", "Dying", "Stunned", "Spawning"]
    oneShotAnims.forEach(osa => {
      actions[osa].clampWhenFinished = true
      actions[osa].repetitions = 1
    })

    mixer.addEventListener("finished", (e) => {
      const action = e.action.getClip().name
      // console.log(action)

      if (action === "Pistol Fire") {
        if (anim.current === "Fight Roundhouse") return
        anim.current = "Pistol Aim"
        return
      }
      if (action === "Pistol Fire2") {
        if (anim.current === "Fight Roundhouse") return
        anim.current = "Pistol Aim2"
        return
      }
      if (action === "Fight Roundhouse") {
        anim.current = "Pistol Aim2"
        return
      }
      if (action === "Jump") {
        anim.current = "Fall"
        return
      }
      if (action === "Land") {
        anim.current = transition.current 
        return
      }
      if (action === "Take Damage") {
        if (transition.current) anim.current = transition.current
      }
      if (action === "Dying") {
        return
      }

      anim.current = "Idle"
    })

    return mixer.removeEventListener("finished")
  }, [mixer, actions, anim, transition])


  // Update Animations
  const updateAnimations = () => {
    if (anim.current === lastAnim.current) return

    const fadeTime = 0.1
    actions[lastAnim.current].fadeOut(fadeTime)

    const action = actions[anim.current].reset().fadeIn(fadeTime).play()
    action.setEffectiveTimeScale(speedMultiplier.current);

    lastAnim.current = anim.current
  }

  // Game Loop
  // eslint-disable-next-line no-unused-vars
  useFrame((state, delta) => {
    updateAnimations()
  })
  
  return (
    <>
      <primitive object={scene} />
    </>
  )
}

export default CharModel