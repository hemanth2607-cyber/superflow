import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePuppetStore } from '../../stores/usePuppetStore'

interface ProceduralPuppetProps {
  type: 'chinese' | 'japanese'
  position: [number, number, number]
}

export const ProceduralPuppet3D: React.FC<ProceduralPuppetProps> = ({ type, position }) => {
  const groupRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)

  const { hoveredType, mode, controlBarTilt } = usePuppetStore()
  const isChinese = type === 'chinese'

  // Cel/Toon shading material setup
  const robeColor = isChinese ? '#d33828' : '#263c63'
  const goldColor = '#c89532'
  const porcelainColor = '#fff9f2'

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    // 1. Idle breathing sway & string pull
    const sway = Math.sin(t * 1.8) * 0.05
    groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.04
    groupRef.current.rotation.z = sway + controlBarTilt.x * 0.2

    // 2. Arms animation
    if (leftArmRef.current && rightArmRef.current) {
      if (mode === 'building') {
        leftArmRef.current.rotation.x = Math.sin(t * 6) * 0.4 - 0.4
        rightArmRef.current.rotation.x = -Math.sin(t * 6) * 0.4 - 0.4
      } else {
        leftArmRef.current.rotation.x = Math.sin(t * 2) * 0.1 - 0.2
        rightArmRef.current.rotation.x = -Math.sin(t * 2) * 0.1 - 0.2
      }
    }

    // 3. Head tracking hovered card
    if (headRef.current) {
      if (hoveredType) {
        headRef.current.rotation.y = isChinese ? 0.35 : -0.35
      } else {
        headRef.current.rotation.y = Math.sin(t * 1.2) * 0.08
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* === Wooden Control Bar Above === */}
      <group position={[0, 2.6, 0]}>
        <mesh>
          <boxGeometry args={[1.6, 0.06, 0.06]} />
          <meshStandardMaterial color="#6d4c28" roughness={0.7} />
        </mesh>
        <mesh position={[-0.8, 0, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.8, 0, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* === Strings (Lines to control bar) === */}
      {/* Center head string */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 1.2, 0, 0, 2.6, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={goldColor} transparent opacity={0.6} />
      </line>

      {/* === Head & Crown === */}
      <group ref={headRef} position={[0, 0.95, 0]}>
        {/* Porcelain Face */}
        <mesh>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshToonMaterial color={porcelainColor} />
        </mesh>

        {/* Blush cheeks */}
        <mesh position={[-0.14, -0.05, 0.26]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#ea7a99" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.14, -0.05, 0.26]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#ea7a99" transparent opacity={0.5} />
        </mesh>

        {/* Headpiece: Phoenix Crown (Chinese) or Kanzashi Bun (Japanese) */}
        {isChinese ? (
          <group position={[0, 0.28, 0]}>
            <mesh>
              <coneGeometry args={[0.26, 0.3, 16]} />
              <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#d33828" />
            </mesh>
          </group>
        ) : (
          <group position={[0, 0.22, 0]}>
            <mesh>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshStandardMaterial color="#1a1512" roughness={0.9} />
            </mesh>
            {/* Sakura Kanzashi pin */}
            <mesh position={[0.2, 0.05, 0]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color="#ea7a99" />
            </mesh>
          </group>
        )}
      </group>

      {/* === Torso & Robes === */}
      <group position={[0, 0.2, 0]}>
        {/* Main Robe / Kimono */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.32, 0.65, 1.2, 32]} />
          <meshToonMaterial color={robeColor} />
        </mesh>

        {/* Sash / Obi (Vermilion with gold tie) */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.34, 0.36, 0.25, 32]} />
          <meshStandardMaterial color={isChinese ? goldColor : '#d33828'} />
        </mesh>
      </group>

      {/* === Left Arm (Sleeves) === */}
      <group ref={leftArmRef} position={[-0.45, 0.45, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshToonMaterial color={isChinese ? '#fdfbf7' : robeColor} />
        </mesh>
      </group>

      {/* === Right Arm (Sleeves) === */}
      <group ref={rightArmRef} position={[0.45, 0.45, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshToonMaterial color={isChinese ? '#fdfbf7' : robeColor} />
        </mesh>
      </group>
    </group>
  )
}
