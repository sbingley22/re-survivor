import { useGameStore } from "../components/useGameStore"

const MainMenu = () => {
  const { mode, getGamepad } = useGameStore()

  return (
    <div 
      className="w-screen h-screen bg-black p-12 bg-cover bg-center bg-[url('./stills/mainMenu.png')]"
    >

    </div>
  )
}

export default MainMenu