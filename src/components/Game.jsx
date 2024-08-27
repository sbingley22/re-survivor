import { Canvas } from "@react-three/fiber"
import { Suspense, useRef } from "react"
import Arena from "./Arena"

const Game = () => {
  const containerRef = useRef()

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    >
      <Canvas
        camera={{
          position: [0, 8, 8],
          fov: 50,
        }}
        shadows
      >
        <Suspense>

          <Arena />

        </Suspense>
      </Canvas>
    </div>
  )
}

export default Game