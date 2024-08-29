import { useEffect } from "react"
import { useGameStore } from "./components/useGameStore"

const Hud = () => {
  const { options, score, hudInfo, inventory, inventorySlot } = useGameStore()
  const getHudImg = () => {
    let hudImg = "./status/jillHealthy.png"
    let status = "Healthy"
    let char = "jill"

    if (hudInfo.health < 50) status = "Hurt"

    if (hudInfo.status === "Shooting") status = "Shooting"
    
    const character = options.character
    if (character === "jill alt") char = "jillAlt"
    if (character === "goth") char = "goth"
    if (character === "survivor f") char = "jillAlt"

    hudImg = `./status/${char}${status}.png`
    return hudImg
  }
  const hudImg = getHudImg()

  let healthMultiplier = (hudInfo.health * 2.5)
  let bgCol = `rgba(${255-healthMultiplier}, ${healthMultiplier}, 0, 0.2)`

  useEffect(()=>{
    const item = inventory[inventorySlot]
    if (item.name === "") return

    let msg = "Q/O "
    if (item.name === "stun grenade") msg += "to use stun grenade"
    else if (item.name === "health kit") msg += "to use health kit"
    else if (item.name === "net spray") msg = "use net spray by walking on slime and recieve no damage"
    else if (item.name === "power ammo") msg = "shoot with power ammo to deal high dmg"

    useGameStore.setState((state) => ({
      hudInfo: {
        ...state.hudInfo,
        msg: msg
      }
    }))

  }, [inventory, inventorySlot])

  return (
    <>
      <img 
        className="absolute bottom-0 right-0 border-black border-4"
        style={{width: 160, backgroundColor: bgCol, borderColor: bgCol}}
        src={hudImg} 
      />

      <p className="absolute bottom-0 left-0 m-2 text-green-500">{hudInfo.msg}</p>

      <p className="absolute bottom-8 left-0 m-2 text-green-500">SCORE: {score}</p>

      <div className="absolute top-0 left-0 m-0 text-yellow-50 flex w-full box-border justify-center items-center text-center">
        {inventory.map((inv, index) => (
          <p
            key={"inventory"+index}
            className={`${index===inventorySlot? "border-slate-500" : "border-slate-800"} p-1 m-1 bg-slate-950 border-2 inline-block flex-grow`}
          >{`${inv.name !== "" ? inv.name + " x" + inv.amount : ""}`}</p>
        ))}
      </div>
    </>
  )
}

export default Hud
