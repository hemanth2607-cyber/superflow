import React from 'react'
import { Canvas } from '@react-three/fiber'
import { ProceduralPuppet3D } from './ProceduralPuppet3D'

export const R3FStage: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 4.2], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      className="w-full h-full pointer-events-auto"
    >
      {/* Ambient Lantern Lighting */}
      <ambientLight intensity={0.8} />

      {/* Warm Stage Key Light */}
      <directionalLight position={[2, 4, 3]} intensity={1.4} color="#fff6e8" />

      {/* Golden Rim Light from behind for cel-shaded silhouettes */}
      <directionalLight position={[-3, 2, -3]} intensity={1.2} color="#f5d491" />

      {/* Chinese Opera Puppet on Left */}
      <ProceduralPuppet3D type="chinese" position={[-1.6, -0.6, 0]} />

      {/* Japanese Furisode Puppet on Right */}
      <ProceduralPuppet3D type="japanese" position={[1.6, -0.6, 0]} />
    </Canvas>
  )
}

export default R3FStage
