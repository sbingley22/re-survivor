import { useEffect, useState } from "react"
import { useGameStore } from "../components/useGameStore"

const ScoreScreen = () => {
  const { setMode, resetGame } = useGameStore()
  const [scores, setScores] = useState(null)

  // Get Scores
  useEffect(() => {
    const scoreData = localStorage.getItem('scores')
    if (scoreData) {
      setScores(JSON.parse(scoreData))
    }
    // console.log("Score Data: ", JSON.parse(scoreData))
  }, [])

  const playGame = () => {
    resetGame()
    setMode(0)
  }

  const homeScreen = () => {
    setMode(5)
  }

  return (
    <div className="w-full h-full bg-black bg-cover bg-center bg-[url('./stills//gameOver.png')] text-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <h1 className="text-3xl">High Scores</h1>
        <div>
          <button 
            className="mr-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={homeScreen}
          >
            Home
          </button>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={playGame}
          >
            Play
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex h-full">
        {scores ? (
          Object.keys(scores).map((levelName, index) => (
            <div 
              key={levelName + index} 
              className="flex-1 p-4"
              style={{backgroundColor: "rgba(0,0,0,0.8)"}}
            >
              <h2 className="text-3xl mb-6">{levelName.replace(/\b\w/g, (char) => char.toUpperCase())}</h2>

              {Object.keys(scores[levelName]).map(charName => (
                <p key={levelName+charName} className="text-2xl">{charName.replace(/\b\w/g, (char) => char.toUpperCase())} : {scores[levelName][charName]}</p>
              ))}
            </div>
          ))
        ) : (
          <div>
            <p>Play Game First!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScoreScreen