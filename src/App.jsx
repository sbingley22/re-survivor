import { KeyboardControls } from "@react-three/drei"
import Game from "./components/Game"
import { useGameStore } from "./components/useGameStore"
import Gamepad from "react-gamepad"

function App() {
  const { mode, gamepad } = useGameStore()

  // Gamepad setup
  const handleGamepadButtonDown = (buttonName) => {
    if (!buttonName) return
    // console.log(`Button ${buttonName} pressed`)
    // Handle button press
    if (buttonName === "A") gamepad.jump = true
    else if (buttonName === "X") gamepad.interact = true
    else if (buttonName === "DPadLeft") gamepad.inventoryLeft = true
    else if (buttonName === "DPadRight") gamepad.inventoryRight = true
    else if (buttonName === "DPadUp") gamepad.inventoryUse = true
  }
  const handleGamepadButtonUp = (buttonName) => {
    if (!buttonName) return
    // console.log(`Button ${buttonName} released`)
    // Handle button release
    if (buttonName === "A") gamepad.jump = false
    else if (buttonName === "X") gamepad.interact = false
    else if (buttonName === "DPadLeft") gamepad.inventoryLeft = false
    else if (buttonName === "DPadRight") gamepad.inventoryRight = false
    else if (buttonName === "DPadUp") gamepad.inventoryUse = false
  }
  const handleGamepadAxisChange = (axisName, value) => {
    // console.log(`${axisName} : ${value}`)
    // Handle axis movement
    if (axisName === "LeftStickX") gamepad.moveX = value
    else if (axisName === "LeftStickY") gamepad.moveY = value
    else if (axisName === "RightStickX") gamepad.aimX = value
    else if (axisName === "RightStickY") gamepad.aimY = value
    else if (axisName === "LeftTrigger") {
      if (value > 0.4) gamepad.jump = true
      else gamepad.jump = false
    }else if (axisName === "RightTrigger") {
      if (value > 0.4) gamepad.jump = true
      else gamepad.jump = false
    }
  }  
  const handleConnect = (gamepadIndex) => {
    console.log(`Gamepad ${gamepadIndex} connected!`)
  }
  const handleDisconnect = (gamepadIndex) => {
    console.log(`Gamepad ${gamepadIndex} disconnected!`)
  }

  return (
    <div className="w-screen h-screen bg-black">
      <KeyboardControls 
        map={[
        { name: "forward", keys: ["ArrowUp", "w", "W", "i", "I"] },
        { name: "backward", keys: ["ArrowDown", "s", "S", "k", "K"] },
        { name: "left", keys: ["ArrowLeft", "a", "A", "j", "J"] },
        { name: "right", keys: ["ArrowRight", "d", "D", "l", "L"] },
        { name: "jump", keys: ["Space"] },
        { name: "interact", keys: ["f", "F", "h", "H"] },
        { name: "inventoryLeft", keys: ["[", "1"] },
        { name: "inventoryRight", keys: ["]", "2"] },
        { name: "inventoryUse", keys: ["p", "o", "P", "O", "q", "Q"] },
        { name: "shift", keys: ["Shift"] },
        ]}
      >
        <Gamepad
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onButtonDown={handleGamepadButtonDown}
          onButtonUp={handleGamepadButtonUp}
          onAxisChange={handleGamepadAxisChange}
        >

          {mode===0 && <Game
          />}

        </Gamepad>
      </KeyboardControls>
    </div>
  )
}

export default App
