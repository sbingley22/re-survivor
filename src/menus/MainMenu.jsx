import { useGameStore } from "../components/useGameStore"

const MainMenu = () => {
  const { setMode, options, setOptions, level, setLevel, resetGame } = useGameStore()

  const maps = ["Marshes", "Bog Lands", "Dead Isle"]
  const characters = ["jill", "jill jacketless", "leon", "leon shirtless", "goth", "survivor f"]

  const playGame = () => {
    resetGame()
    setMode(0)
  }

  const scoreScreen = () => {
    setMode(7)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setOptions({volume: newVolume})
  }

  const handleMuteChange = (e) => {
    const newMuteStatus = e.target.checked
    setOptions({ mute: newMuteStatus })
  }

  const handleMouseChange = (e) => {
    const newStatus = e.target.checked
    setOptions({ useMouse: newStatus })
  }

  const handleControllerChange = (e) => {
    const newStatus = e.target.checked
    setOptions({ useController: newStatus })
  }

  return (
    <div className="w-full h-full bg-black bg-cover bg-center bg-[url('./stills/mainMenu.png')] text-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <h1 className="text-3xl">RE Survivor</h1>
        <div>
          <button 
            className="mr-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={scoreScreen}
          >
            Scores
          </button>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={playGame}
          >
            Play
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Map Selection */}
        <div className="flex-1 p-4">
          <h2 className="text-2xl mb-4">Map Selection</h2>
          {maps.map((map) => (
            <div key={map} className="mb-2 text-xl">
              <label>
                <input
                  type="radio"
                  value={map}
                  checked={level === map}
                  onChange={() => setLevel(map)}
                  className="mr-2"
                />
                {map.replace(/\b\w/g, (char) => char.toUpperCase())}
              </label>
            </div>
          ))}
        </div>

        {/* Character Selection */}
        <div className="flex-1 p-4">
          <h2 className="text-2xl mb-4">Character Selection</h2>
          {characters.map((character) => (
            <div key={character} className="mb-2 text-xl">
              <label>
                <input
                  type="radio"
                  value={character}
                  checked={options.character === character}
                  onChange={() => setOptions({character: character})}
                  className="mr-2"
                />
                {character.replace(/\b\w/g, (char) => char.toUpperCase())}
              </label>
            </div>
          ))}
        </div>

        {/* Options */}
        <div className="flex-1 p-4">
          <h2 className="text-2xl mb-4">Options</h2>

          {/* Volume Control */}
          <div className="mb-4 text-xl">
            <label className="block mb-2">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={options.volume}
              onChange={handleVolumeChange}
              className="w-full"
            />
          </div>

          {/* Mute Option */}
          <div className="mb-4">
            <label className="block mb-2">Mute</label>
            <input
              type="checkbox"
              checked={options.mute}
              onChange={handleMuteChange}
            />
          </div>

          {/* Controller */}
          <div className="mb-4">
            <label className="block mb-2">Use Controller</label>
            <input
              type="checkbox"
              checked={options.useController}
              onChange={handleControllerChange}
            />
          </div>

          {/* Mouse */}
          <div className="mb-4">
            <label className="block mb-2">Use Mouse</label>
            <input
              type="checkbox"
              checked={options.useMouse}
              onChange={handleMouseChange}
            />
          </div>

        </div>
      </div>
    </div>
  )
}

export default MainMenu
