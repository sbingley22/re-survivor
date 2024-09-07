/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useRef } from "react"
import glb from "../../assets/reCharacters.glb?url"
import { useSkinnedMeshClone } from "./SkinnedMeshClone"
import { useAnimations } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"

const CharModel = ({ anim, visibleNodes, skin=null, transition, forceAnimation={current:null}, speedMultiplier={current:1}, weapon=null }) => {
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Update weapon
  useEffect(()=>{
    if (!weapon) return
    // debugger
    const weapons = ["Pistol", "Uzi", "Sword"]
    weapons.forEach((w)=>{
      if (!nodes[w]) return
      nodes[w].visible = false
      if (w === weapon) {
        nodes[w].visible = true
        if (nodes[w].type === "Group") nodes[w].children.forEach(child => {
          child.visible = true
        })
      }
    })
  }, [nodes, weapon])

  // Skin change
  useEffect(()=>{
    if (skin === null) return

    const charNode = skin.node
    if (!charNode) return
    const node = nodes[charNode]
    if (!node || node.type !== "Group") return

    if (node.children.length <= skin.index) return
    node.children.forEach(child=>{
      child.material = node.children[skin.index].material
    })
  }, [skin, nodes])
  
  // Mixer Settings
  useEffect(()=>{
    if (!mixer) return

    const oneShotAnims = ["Fight Jab", "Fight Roundhouse", "Fight Straight", "Jump", "Land", "Pistol Fire", "Pistol Fire2", "Pistol Fire Jogging", "Take Damage", "Dying", "Stunned", "Spawning", "Upper Pistol Fire"]
    oneShotAnims.forEach(osa => {
      actions[osa].clampWhenFinished = true
      actions[osa].repetitions = 1
    })

    mixer.addEventListener("finished", (e) => {
      const action = e.action.getClip().name
      // console.log(action)
      if (anim.current === "Dying") return

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
      if (action === "Pistol Fire Jogging") {
        if (transition.current) anim.current = transition.current
        anim.current = "Jogging"
        return
      }
      if (action === "Upper Pistol Fire") {
        // actions["Jogging"].fadeOut(0.1)
        anim.current = transition.current
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
        return
      }
      if (action === "Dying") {
        return
      }

      anim.current = "Idle"
    })

    return mixer.removeEventListener("finished")
  }, [mixer, actions, anim, transition])

  // Animation Speed
  const getTimeScale = () => {
    let timescale = 1

    if (["Walking", "Jogging", "WalkingHurt", "WalkingStagger"].includes(anim.current)) timescale *= speedMultiplier.current

    if (anim.current === "Pistol Fire2") timescale *= 2

    return timescale
  }

  // Update Animations
  const updateAnimations = () => {
    if (forceAnimation.current && anim.current === forceAnimation.current) {
      actions[anim.current].reset()
      return
    }
    if (anim.current === lastAnim.current) return
    if (!actions[anim.current]) console.log("Couldnt find animation", anim.current, lastAnim.current)

    // Check for special multipart animations
    if (anim.current.includes("Upper ")) {
      bodyAnimation()
      return
    }

    const fadeTime = 0.1
    actions[lastAnim.current].fadeOut(fadeTime)

    const action = actions[anim.current].reset().fadeIn(fadeTime).play()

    const timescale = getTimeScale()
    action.setEffectiveTimeScale(timescale)

    lastAnim.current = anim.current
  }

  // Special multi body part animations
  const bodyAnimation = () => {
    let upper = null
    let lower = null
    if (anim.current === "Upper Pistol Fire") {
      upper = "Upper Pistol Fire"
      lower = "Lower Jogging"
    }

    if (!upper || !lower) {
      console.log("Couldn't apply body animation")
      return
    }

    // Apply upper and lower animations
    actions[lastAnim.current].fadeOut(0.1)
    actions[upper].reset().fadeIn(0.1).play()
    actions[lower].reset().fadeIn(0.1).play()

    lastAnim.current = anim.current
  }

  // Game Loop
  // eslint-disable-next-line no-unused-vars
  useFrame((state, delta) => {
    updateAnimations()
    forceAnimation.current = null
  })
  
  return (
    <>
      <primitive object={scene} />
    </>
  )
}

export default CharModel