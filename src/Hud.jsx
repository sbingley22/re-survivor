import { useEffect, useState } from "react"
import { useGameStore } from "./components/useGameStore"
import { getXpLevel } from "./components/gameHelper"

const Hud = () => {
  const { options, setPlayerFlag, score, hudInfo, inventory, inventorySlot, setInventorySlot } = useGameStore()
  const [clickMark, setClickMark] = useState({x: -99, y: -99})

  // Mouse Events
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!options.useMouse) return
      setClickMark({x: e.clientX - 3, y: e.clientY - 3})
    }

    const handleMouseUp = () => {
      setClickMark({x:-99,y:-99})
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchstart', handleMouseDown)
    window.addEventListener('touchend', handleMouseUp)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchstart', handleMouseDown)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [options.useMouse])

  const getHudImg = () => {
    let hudImg = "./status/jillHealthy.png"
    let status = "Healthy"
    let char = "jill"

    if (hudInfo.health < 50) status = "Hurt"

    if (hudInfo.status === "Shooting") status = "Shooting"
    
    const character = options.character
    if (character.includes("jill jacketless")) char = "jillAlt"
    else if (character === "leon") char = "leon"
    else if (character === "leon shirtless") char = "leonAlt"
    else if (character === "goth") char = "goth"
    else if (character === "survivor f") char = "survivorF"

    hudImg = `./status/${char}${status}.png`
    return hudImg
  }
  const hudImg = getHudImg()

  let healthMultiplier = (hudInfo.health * 2.5)
  let bgCol = `rgba(${255-healthMultiplier}, ${healthMultiplier}, 0, 0.2)`
  if (hudInfo.armour) bgCol = `rgba(0,0,1,0.2)`

  const xpLevel = getXpLevel(score)

  useEffect(()=>{
    const item = inventory[inventorySlot]
    if (item.name === "") return

    let msg = "Q/O "
    if (item.name === "Stun Grenade") msg += "to use stun grenade"
    else if (item.name === "Grenade") msg += "to use grenade"
    else if (item.name === "Medkit") msg += "to use health kit"
    else if (item.name === "Net Spray") msg = "use net spray by walking on net to destroy it"
    else if (item.name === "Power Ammo") msg = "shoot with power ammo to deal high dmg"

    useGameStore.setState((state) => ({
      hudInfo: {
        ...state.hudInfo,
        msg: msg
      }
    }))

  }, [inventory, inventorySlot])

  const inventoryItemClicked = (index) => {
    // console.log("Clicked inventory item")
    setInventorySlot(index)
    setPlayerFlag("inventoryFlag", index)
  }

  return (
    <>
      {clickMark.x > 0 && (
        <div 
          className="absolute w-4 h-4 rounded-md bg-slate-600 border-2 border-slate-100" 
          style={{ top: `${clickMark.y}px`, left: `${clickMark.x}px` }} 
        />
      )}

      <img 
        className="absolute bottom-0 right-0 border-black border-4"
        style={{width: 160, backgroundColor: bgCol, borderColor: bgCol}}
        src={hudImg} 
      />

      <p className="absolute bottom-16 left-0 m-2 text-green-500 bg-slate-800 p-2">Level: {xpLevel}</p>
      <p className="absolute bottom-8 left-0 m-2 text-green-500 bg-slate-800 p-2">XP: {score}</p>
      <p className="absolute bottom-0 left-0 m-2 text-green-500 bg-slate-800 p-2">{hudInfo.msg}</p>

      <div className="absolute top-0 left-0 m-0 text-yellow-50 flex w-full box-border justify-center items-center text-center">
        {inventory.map((inv, index) => (
          <button
            key={"inventory"+index}
            className={`${index===inventorySlot? "border-slate-200" : "border-slate-800"} p-1 m-1 bg-slate-950 border-2 inline-block flex-grow`}
            onClick={()=>inventoryItemClicked(index)}
          >{`${inv.name !== "" ? inv.name + " x" + inv.amount : ""}`}</button>
        ))}
      </div>
    </>
  )
}

export default Hud
