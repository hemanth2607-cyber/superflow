import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePuppetStore } from '../../stores/usePuppetStore'

interface ProceduralPuppetProps {
  type: 'chinese' | 'japanese'
  position: [number, number, number]
}

export const ProceduralPuppet3D: React.FC<ProceduralPuppetProps> = ({ type, position }) => {
  const rootGroupRef = useRef<THREE.Group>(null)
  const controlBarRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const torsoRef = useRef<THREE.Group>(null)
  const skirtRef = useRef<THREE.Group>(null)
  const leftUpperArmRef = useRef<THREE.Group>(null)
  const leftForearmRef = useRef<THREE.Group>(null)
  const rightUpperArmRef = useRef<THREE.Group>(null)
  const rightForearmRef = useRef<THREE.Group>(null)

  const { hoveredType, mode, controlBarTilt } = usePuppetStore()
  const isChinese = type === 'chinese'

  // Authentic mineral colors
  const primaryColor = isChinese ? '#d33828' : '#263c63'
  const goldColor = '#c89532'
  const brassJointColor = '#b8860b'
  const porcelainColor = '#fff9f2'

  // Geometry buffers for the 5 dynamic strings
  const stringGeometries = useMemo(() => {
    return [
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 2.6, 0), new THREE.Vector3(0, 1.2, 0)]),
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.4, 2.6, 0), new THREE.Vector3(-0.4, 0.6, 0)]),
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.4, 2.6, 0), new THREE.Vector3(0.4, 0.6, 0)]),
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.8, 2.6, 0), new THREE.Vector3(-0.7, -0.2, 0)]),
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.8, 2.6, 0), new THREE.Vector3(0.7, -0.2, 0)]),
    ]
  }, [])

  const headString = useMemo(() => new THREE.Line(stringGeometries[0], new THREE.LineBasicMaterial({ color: goldColor, transparent: true, opacity: 0.65 })), [stringGeometries, goldColor])
  const leftShoulderString = useMemo(() => new THREE.Line(stringGeometries[1], new THREE.LineBasicMaterial({ color: goldColor, transparent: true, opacity: 0.55 })), [stringGeometries, goldColor])
  const rightShoulderString = useMemo(() => new THREE.Line(stringGeometries[2], new THREE.LineBasicMaterial({ color: goldColor, transparent: true, opacity: 0.55 })), [stringGeometries, goldColor])
  const leftHandString = useMemo(() => new THREE.Line(stringGeometries[3], new THREE.LineBasicMaterial({ color: goldColor, transparent: true, opacity: 0.75 })), [stringGeometries, goldColor])
  const rightHandString = useMemo(() => new THREE.Line(stringGeometries[4], new THREE.LineBasicMaterial({ color: goldColor, transparent: true, opacity: 0.75 })), [stringGeometries, goldColor])

  useFrame((state) => {
    if (!rootGroupRef.current) return
    const t = state.clock.getElapsedTime()

    // 1. Root breathing idle sway
    const sway = Math.sin(t * 1.6) * 0.04
    rootGroupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.03
    rootGroupRef.current.rotation.z = sway + controlBarTilt.x * 0.15

    // 2. Control bar tilt tracking mouse
    if (controlBarRef.current) {
      controlBarRef.current.rotation.z = controlBarTilt.x * 0.4 + Math.sin(t * 2) * 0.05
      controlBarRef.current.rotation.x = controlBarTilt.y * 0.2
    }

    // 3. Head tracking hovered archetype card
    if (headRef.current) {
      if (hoveredType) {
        headRef.current.rotation.y = isChinese ? 0.35 : -0.35
        headRef.current.rotation.z = isChinese ? 0.08 : -0.08
      } else {
        headRef.current.rotation.y = Math.sin(t * 1.2) * 0.06
        headRef.current.rotation.z = Math.sin(t * 1.6) * 0.02
      }
    }

    // 4. Arm movements pulling threads
    if (leftUpperArmRef.current && rightUpperArmRef.current && leftForearmRef.current && rightForearmRef.current) {
      if (mode === 'building') {
        // Fast pulling threads rhythm
        leftUpperArmRef.current.rotation.x = Math.sin(t * 5) * 0.3 - 0.3
        leftForearmRef.current.rotation.x = Math.sin(t * 5 + 1) * 0.4 - 0.4
        rightUpperArmRef.current.rotation.x = -Math.sin(t * 5) * 0.3 - 0.3
        rightForearmRef.current.rotation.x = -Math.sin(t * 5 + 1) * 0.4 - 0.4
      } else {
        // Gentle relaxed idle breathing motion
        leftUpperArmRef.current.rotation.x = Math.sin(t * 1.8) * 0.1 - 0.15
        leftUpperArmRef.current.rotation.z = Math.sin(t * 1.2) * 0.05 + 0.1
        leftForearmRef.current.rotation.x = Math.sin(t * 1.8 + 0.5) * 0.15 - 0.2

        rightUpperArmRef.current.rotation.x = -Math.sin(t * 1.8) * 0.1 - 0.15
        rightUpperArmRef.current.rotation.z = -Math.sin(t * 1.2) * 0.05 - 0.1
        rightForearmRef.current.rotation.x = -Math.sin(t * 1.8 + 0.5) * 0.15 - 0.2
      }
    }

    // 5. Lower pleated robe / skirt pendulum swing
    if (skirtRef.current) {
      skirtRef.current.rotation.z = -sway * 1.4
    }

    // 6. Update the 5 dynamic 3D thread coordinates
    const vStart = new THREE.Vector3()
    const vEnd = new THREE.Vector3()

    // Thread 1: Head string
    if (headString && controlBarRef.current && headRef.current) {
      vStart.set(0, 2.6, 0)
      headRef.current.getWorldPosition(vEnd)
      rootGroupRef.current.worldToLocal(vEnd)
      vEnd.y += 0.25
      const pos = headString.geometry.attributes.position as THREE.BufferAttribute
      pos.setXYZ(0, vStart.x, vStart.y, vStart.z)
      pos.setXYZ(1, vEnd.x, vEnd.y, vEnd.z)
      pos.needsUpdate = true
    }

    // Thread 2: Left Shoulder string
    if (leftShoulderString && controlBarRef.current && leftUpperArmRef.current) {
      vStart.set(-0.35, 2.6, 0)
      leftUpperArmRef.current.getWorldPosition(vEnd)
      rootGroupRef.current.worldToLocal(vEnd)
      const pos = leftShoulderString.geometry.attributes.position as THREE.BufferAttribute
      pos.setXYZ(0, vStart.x, vStart.y, vStart.z)
      pos.setXYZ(1, vEnd.x, vEnd.y, vEnd.z)
      pos.needsUpdate = true
    }

    // Thread 3: Right Shoulder string
    if (rightShoulderString && controlBarRef.current && rightUpperArmRef.current) {
      vStart.set(0.35, 2.6, 0)
      rightUpperArmRef.current.getWorldPosition(vEnd)
      rootGroupRef.current.worldToLocal(vEnd)
      const pos = rightShoulderString.geometry.attributes.position as THREE.BufferAttribute
      pos.setXYZ(0, vStart.x, vStart.y, vStart.z)
      pos.setXYZ(1, vEnd.x, vEnd.y, vEnd.z)
      pos.needsUpdate = true
    }

    // Thread 4: Left Hand string
    if (leftHandString && controlBarRef.current && leftForearmRef.current) {
      vStart.set(-0.75, 2.6, 0)
      leftForearmRef.current.getWorldPosition(vEnd)
      rootGroupRef.current.worldToLocal(vEnd)
      vEnd.y -= 0.4
      const pos = leftHandString.geometry.attributes.position as THREE.BufferAttribute
      pos.setXYZ(0, vStart.x, vStart.y, vStart.z)
      pos.setXYZ(1, vEnd.x, vEnd.y, vEnd.z)
      pos.needsUpdate = true
    }

    // Thread 5: Right Hand string
    if (rightHandString && controlBarRef.current && rightForearmRef.current) {
      vStart.set(0.75, 2.6, 0)
      rightForearmRef.current.getWorldPosition(vEnd)
      rootGroupRef.current.worldToLocal(vEnd)
      vEnd.y -= 0.4
      const pos = rightHandString.geometry.attributes.position as THREE.BufferAttribute
      pos.setXYZ(0, vStart.x, vStart.y, vStart.z)
      pos.setXYZ(1, vEnd.x, vEnd.y, vEnd.z)
      pos.needsUpdate = true
    }
  })

  return (
    <group ref={rootGroupRef} position={position}>
      {/* ==============================================================
          1. OVERHEAD WOODEN CONTROL BAR WITH GOLD FINIALS & TASSELS
          ============================================================== */}
      <group ref={controlBarRef} position={[0, 2.6, 0]}>
        {/* Main crossbar */}
        <mesh>
          <boxGeometry args={[1.7, 0.07, 0.07]} />
          <meshStandardMaterial color="#5c3d21" roughness={0.7} />
        </mesh>
        {/* Center pivot cross */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.07, 0.07, 0.5]} />
          <meshStandardMaterial color="#422b16" roughness={0.8} />
        </mesh>
        {/* Gold finials on ends */}
        <mesh position={[-0.85, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={goldColor} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.85, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={goldColor} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Silk chrysanthemum tassel on right */}
        <mesh position={[0.85, -0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.05, 0.35, 12]} />
          <meshStandardMaterial color={goldColor} />
        </mesh>
      </group>

      {/* ==============================================================
          2. FIVE REAL SUSPENDED SILK THREADS (TIED TO SEPARATE BODY PARTS)
          ============================================================== */}
      <primitive object={headString} />
      <primitive object={leftShoulderString} />
      <primitive object={rightShoulderString} />
      <primitive object={leftHandString} />
      <primitive object={rightHandString} />

      {/* ==============================================================
          3. ARTICULATED BODY: SEPARATE JOINTS TIED WITH THREADS
          ============================================================== */}

      {/* === PART A: HEAD & NECK (Pivoting with Crown / Hairpin) === */}
      <group ref={headRef} position={[0, 0.95, 0]}>
        {/* Porcelain Face */}
        <mesh>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshToonMaterial color={porcelainColor} />
        </mesh>

        {/* Rouge Blush */}
        <mesh position={[-0.13, -0.04, 0.25]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#ea7a99" transparent opacity={0.55} />
        </mesh>
        <mesh position={[0.13, -0.04, 0.25]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#ea7a99" transparent opacity={0.55} />
        </mesh>

        {/* Headpiece */}
        {isChinese ? (
          /* Chinese Phoenix Crown with gold finials and pearls */
          <group position={[0, 0.26, 0]}>
            <mesh>
              <coneGeometry args={[0.26, 0.32, 16]} />
              <meshStandardMaterial color={goldColor} metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#d33828" />
            </mesh>
            {/* Dangling Pearl Strings */}
            <mesh position={[-0.2, -0.15, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
              <meshStandardMaterial color={goldColor} />
            </mesh>
            <mesh position={[0.2, -0.15, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
              <meshStandardMaterial color={goldColor} />
            </mesh>
          </group>
        ) : (
          /* Japanese Hair Bun with Sakura Kanzashi Pin */
          <group position={[0, 0.2, 0]}>
            <mesh>
              <sphereGeometry args={[0.19, 16, 16]} />
              <meshStandardMaterial color="#1a1512" roughness={0.9} />
            </mesh>
            {/* Sakura Blossom Pin */}
            <mesh position={[0.22, 0.04, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#ea7a99" />
            </mesh>
          </group>
        )}

        {/* Neck Brass Joint Rivet */}
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
          <meshStandardMaterial color={brassJointColor} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* === PART B: TORSO / CHEST === */}
      <group ref={torsoRef} position={[0, 0.35, 0]}>
        {/* Chest Plate / Robe Core */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.28, 0.34, 0.45, 32]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>

        {/* Cloud Collar (Chinese) or Kimono Collar (Japanese) */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.29, 0.31, 0.12, 32]} />
          <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Waist Obi / Belt */}
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.34, 0.35, 0.18, 32]} />
          <meshStandardMaterial color={isChinese ? goldColor : '#d33828'} />
        </mesh>

        {/* Waist Brass Joint Rivet (connecting to skirt) */}
        <mesh position={[0, -0.24, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 16]} />
          <meshStandardMaterial color={brassJointColor} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* === PART C: SEPARATE PLEATED ROBE / SKIRT (Swinging independently) === */}
      <group ref={skirtRef} position={[0, 0.12, 0]}>
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.34, 0.65, 0.85, 32]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Gold embroidered hem border */}
        <mesh position={[0, -0.84, 0]}>
          <torusGeometry args={[0.65, 0.03, 16, 32]} />
          <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* === PART D: LEFT ARM (Shoulder Joint -> Upper Arm -> Elbow Joint -> Forearm) === */}
      <group position={[-0.38, 0.5, 0]}>
        {/* Shoulder Brass Joint Pin */}
        <mesh>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color={brassJointColor} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Left Upper Arm */}
        <group ref={leftUpperArmRef}>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.38, 16]} />
            <meshToonMaterial color={primaryColor} />
          </mesh>

          {/* Elbow Brass Joint Pin */}
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color={brassJointColor} metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Left Forearm & Hand with Water Sleeve / Fan */}
          <group ref={leftForearmRef} position={[0, -0.4, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.09, 0.13, 0.42, 16]} />
              <meshToonMaterial color={isChinese ? '#fdfbf7' : primaryColor} />
            </mesh>

            {/* Porcelain Hand */}
            <mesh position={[0, -0.44, 0]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshToonMaterial color={porcelainColor} />
            </mesh>

            {/* Extra Flowing Silk Water Sleeve (*Shui Xiu*) for Chinese Opera */}
            {isChinese && (
              <mesh position={[-0.05, -0.68, 0]}>
                <boxGeometry args={[0.18, 0.5, 0.02]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.88} />
              </mesh>
            )}
          </group>
        </group>
      </group>

      {/* === PART E: RIGHT ARM (Shoulder Joint -> Upper Arm -> Elbow Joint -> Forearm) === */}
      <group position={[0.38, 0.5, 0]}>
        {/* Shoulder Brass Joint Pin */}
        <mesh>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color={brassJointColor} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Right Upper Arm */}
        <group ref={rightUpperArmRef}>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.38, 16]} />
            <meshToonMaterial color={primaryColor} />
          </mesh>

          {/* Elbow Brass Joint Pin */}
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color={brassJointColor} metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Right Forearm & Hand */}
          <group ref={rightForearmRef} position={[0, -0.4, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.09, 0.13, 0.42, 16]} />
              <meshToonMaterial color={isChinese ? '#fdfbf7' : primaryColor} />
            </mesh>

            {/* Porcelain Hand */}
            <mesh position={[0, -0.44, 0]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshToonMaterial color={porcelainColor} />
            </mesh>

            {/* Japanese Marionette holds Gold Folding Fan (*Sensu*) */}
            {!isChinese && (
              <mesh position={[0.15, -0.44, 0]} rotation={[0, 0, -0.3]}>
                <coneGeometry args={[0.26, 0.35, 16]} />
                <meshStandardMaterial color={goldColor} metalness={0.85} roughness={0.2} />
              </mesh>
            )}

            {/* Extra Flowing Silk Water Sleeve for Chinese Opera */}
            {isChinese && (
              <mesh position={[0.05, -0.68, 0]}>
                <boxGeometry args={[0.18, 0.5, 0.02]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.88} />
              </mesh>
            )}
          </group>
        </group>
      </group>
    </group>
  )
}
