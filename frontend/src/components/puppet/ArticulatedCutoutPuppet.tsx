import React, { useState, useEffect, useRef } from 'react'
import { usePuppetStore } from '../../stores/usePuppetStore'

export type PuppetCharacterType = 'chinese' | 'japanese' | 'wayang' | 'dancer'

interface ArticulatedCutoutPuppetProps {
  type: PuppetCharacterType
  className?: string
}

// Exact 2D forward-kinematics rotation around a pivot point (100% mathematically matches CSS rotation)
function rotatePoint(
  x: number,
  y: number,
  pivotX: number,
  pivotY: number,
  deg: number
): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = x - pivotX
  const dy = y - pivotY
  return {
    x: pivotX + dx * cos - dy * sin,
    y: pivotY + dx * sin + dy * cos,
  }
}

export const ArticulatedCutoutPuppet: React.FC<ArticulatedCutoutPuppetProps> = ({
  type,
  className = '',
}) => {
  const {
    chineseGestureCounter,
    japaneseGestureCounter,
  } = usePuppetStore()

  const containerRef = useRef<HTMLDivElement>(null)

  // Independent articulation angles for body parts
  const [angles, setAngles] = useState({
    head: 0,
    leftArm: 0,
    rightArm: 0,
    torsoTilt: 0,
    torsoY: 0,
    skirt: 0,
    sway: 0,
  })

  const [isGesturing, setIsGesturing] = useState(false)

  // Listen to gesture triggers from store
  useEffect(() => {
    if (type === 'chinese' && chineseGestureCounter > 0) {
      performGesture()
    }
  }, [chineseGestureCounter, type])

  useEffect(() => {
    if (type === 'japanese' && japaneseGestureCounter > 0) {
      performGesture()
    }
  }, [japaneseGestureCounter, type])

  const performGesture = () => {
    setIsGesturing(true)
    setTimeout(() => setIsGesturing(false), 1600)
  }

  // Smooth continuous animation loop: Each body part moves independently!
  useEffect(() => {
    let animId: number
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000 // seconds
      const gestureBoost = isGesturing ? 2.2 : 1.0

      // Dynamic motion variations per character type
      const isDancer = type === 'dancer'
      const speedMult = isDancer ? 1.4 : 1.0

      // 1. Head: independent gentle nod and tilt
      const head = (Math.sin(elapsed * 0.9 * speedMult) * 1.8 + Math.cos(elapsed * 1.4 * speedMult) * 0.7) * gestureBoost

      // 2. Left Arm / Ribbon: independent articulation
      const leftArm = (Math.sin(elapsed * 1.1 * speedMult + 0.5) * (isDancer ? 3.5 : 2.5) + Math.cos(elapsed * 0.6) * 0.8) * gestureBoost

      // 3. Right Arm / Ribbon: independent articulation
      const rightArm = (Math.sin(elapsed * 1.0 * speedMult + 1.8) * (isDancer ? 3.8 : 2.6) - Math.cos(elapsed * 0.7) * 0.7) * gestureBoost

      // 4. Torso: subtle core breathing rise/fall and gentle tilt
      const torsoTilt = (Math.sin(elapsed * 0.75 * speedMult) * 0.8) * gestureBoost
      const torsoY = Math.sin(elapsed * 0.8 * speedMult) * (isDancer ? 2.2 : 1.2)

      // 5. Skirt / Robe: pendular inertia lagging behind torso
      const skirt = (Math.sin(elapsed * 0.7 * speedMult + 2.1) * (isDancer ? 2.4 : 1.6)) * gestureBoost

      // 6. Overall gentle marionette string suspension sway
      const sway = Math.sin(elapsed * 0.55 * speedMult) * (isDancer ? 1.2 : 0.6)

      setAngles({
        head,
        leftArm,
        rightArm,
        torsoTilt,
        torsoY,
        skirt,
        sway,
      })

      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [isGesturing, type])

  // Multi-character configurations:
  const isMultiLayer = type === 'chinese' || type === 'japanese'

  const getPuppetConfig = () => {
    switch (type) {
      case 'chinese':
        return {
          aspectRatio: '657 / 992',
          torsoSrc: '/assets/shadow/part_torso.png',
          skirtSrc: '/assets/shadow/part_skirt.png',
          leftArmSrc: '/assets/shadow/part_left_arm.png',
          rightArmSrc: '/assets/shadow/part_right_arm.png',
          headSrc: '/assets/shadow/part_head.png',
          pivots: {
            head: { x: 54.8, y: 23.7 },
            leftArm: { x: 47.2, y: 25.7 },
            rightArm: { x: 66.2, y: 25.7 },
            torso: { x: 56.3, y: 35.3 },
            skirt: { x: 56.3, y: 47.4 },
          },
          threads: [
            { id: 'head', barX: 55.0, barY: 3.5, attachX: 54.8, attachY: 4.0, pivot: { x: 54.8, y: 23.7 }, angleKey: 'head' as const },
            { id: 'rightArm', barX: 75.0, barY: 3.5, attachX: 77.0, attachY: 17.5, pivot: { x: 66.2, y: 25.7 }, angleKey: 'rightArm' as const },
            { id: 'leftArm', barX: 27.0, barY: 3.5, attachX: 24.5, attachY: 42.0, pivot: { x: 47.2, y: 25.7 }, angleKey: 'leftArm' as const },
            { id: 'waist', barX: 46.0, barY: 3.5, attachX: 56.3, attachY: 40.0, pivot: { x: 56.3, y: 35.3 }, angleKey: 'torsoTilt' as const },
          ],
        }

      case 'japanese':
        return {
          aspectRatio: '620 / 1085',
          torsoSrc: '/assets/shadow/shadow_torso_flawless.png',
          skirtSrc: '/assets/shadow/shadow_skirt_flawless.png',
          leftArmSrc: '/assets/shadow/shadow_left_arm_flawless.png',
          rightArmSrc: '/assets/shadow/shadow_right_arm_flawless.png',
          headSrc: '/assets/shadow/shadow_head_flawless.png',
          pivots: {
            head: { x: 54.2, y: 20.5 },
            leftArm: { x: 38.7, y: 24.0 },
            rightArm: { x: 66.1, y: 24.0 },
            torso: { x: 54.2, y: 33.2 },
            skirt: { x: 54.2, y: 42.4 },
          },
          threads: [
            { id: 'head', barX: 54.2, barY: 3.5, attachX: 54.2, attachY: 1.8, pivot: { x: 54.2, y: 20.5 }, angleKey: 'head' as const },
            { id: 'rightArm', barX: 84.0, barY: 3.5, attachX: 84.0, attachY: 18.0, pivot: { x: 66.1, y: 24.0 }, angleKey: 'rightArm' as const },
            { id: 'leftArm', barX: 26.0, barY: 3.5, attachX: 26.0, attachY: 46.0, pivot: { x: 38.7, y: 24.0 }, angleKey: 'leftArm' as const },
            { id: 'waist', barX: 54.2, barY: 3.5, attachX: 54.2, attachY: 39.0, pivot: { x: 54.2, y: 33.2 }, angleKey: 'torsoTilt' as const },
          ],
        }

      case 'wayang':
        return {
          aspectRatio: '896 / 1200',
          singleSrc: '/assets/shadow/wayang_kulit_clean.png',
          pivots: {
            head: { x: 62.0, y: 22.0 },
            leftArm: { x: 42.0, y: 32.0 },
            rightArm: { x: 64.0, y: 32.0 },
            torso: { x: 50.0, y: 45.0 },
            skirt: { x: 50.0, y: 55.0 },
          },
          threads: [
            { id: 'head', barX: 62.0, barY: 3.5, attachX: 62.0, attachY: 8.0, pivot: { x: 62.0, y: 22.0 }, angleKey: 'head' as const },
            { id: 'rightArm', barX: 78.0, barY: 3.5, attachX: 82.0, attachY: 65.0, pivot: { x: 64.0, y: 32.0 }, angleKey: 'rightArm' as const },
            { id: 'leftArm', barX: 25.0, barY: 3.5, attachX: 28.0, attachY: 65.0, pivot: { x: 42.0, y: 32.0 }, angleKey: 'leftArm' as const },
          ],
        }

      case 'dancer':
        return {
          aspectRatio: '896 / 1200',
          singleSrc: '/assets/shadow/silk_dancer_clean.png',
          pivots: {
            head: { x: 51.0, y: 24.0 },
            leftArm: { x: 30.0, y: 35.0 },
            rightArm: { x: 70.0, y: 35.0 },
            torso: { x: 51.0, y: 44.0 },
            skirt: { x: 51.0, y: 60.0 },
          },
          threads: [
            { id: 'head', barX: 51.0, barY: 3.5, attachX: 51.0, attachY: 10.0, pivot: { x: 51.0, y: 24.0 }, angleKey: 'head' as const },
            { id: 'leftArm', barX: 24.0, barY: 3.5, attachX: 26.0, attachY: 12.0, pivot: { x: 30.0, y: 35.0 }, angleKey: 'leftArm' as const },
            { id: 'rightArm', barX: 76.0, barY: 3.5, attachX: 74.0, attachY: 14.0, pivot: { x: 70.0, y: 35.0 }, angleKey: 'rightArm' as const },
          ],
        }
    }
  }

  const config = getPuppetConfig()

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[300px] md:h-[350px] select-none pointer-events-none flex flex-col items-center justify-center filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.5)] ${className}`}
      style={{
        transform: `rotate(${angles.sway}deg) translateY(${angles.torsoY}px)`,
        transformOrigin: '50% 3.5%',
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* 1. Overhead Marionette Crossbar & Synchronized Silk Threads */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <filter id={`threadGlow-${type}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="0.3" floodColor="#e6ca75" floodOpacity="0.75" />
            </filter>
            <linearGradient id={`woodBar-${type}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2c1a0c" />
              <stop offset="15%" stopColor="#5e4120" />
              <stop offset="50%" stopColor="#805629" />
              <stop offset="85%" stopColor="#5e4120" />
              <stop offset="100%" stopColor="#2c1a0c" />
            </linearGradient>
          </defs>

          {/* Overhead Crossbar */}
          <g id="overhead-control-bar">
            <circle cx="50" cy="1.2" r="1.2" fill="none" stroke="#d4af37" strokeWidth="0.4" />
            <rect
              x="16"
              y="2.4"
              width="68"
              height="2.0"
              rx="1.0"
              fill={`url(#woodBar-${type})`}
              stroke="#1f1207"
              strokeWidth="0.3"
            />
            <circle cx="16" cy="3.4" r="1.3" fill="#d4af37" stroke="#684e16" strokeWidth="0.35" />
            <circle cx="84" cy="3.4" r="1.3" fill="#d4af37" stroke="#684e16" strokeWidth="0.35" />
          </g>

          {/* Synchronized Threads */}
          {config.threads.map((t) => {
            const currentAngle = angles[t.angleKey]
            const rotated = rotatePoint(
              t.attachX,
              t.attachY,
              t.pivot.x,
              t.pivot.y,
              currentAngle
            )

            const midX = (t.barX + rotated.x) / 2
            const midY = (t.barY + rotated.y) / 2

            return (
              <g key={t.id}>
                <path
                  d={`M ${t.barX} ${t.barY} Q ${midX} ${midY} ${rotated.x} ${rotated.y}`}
                  fill="none"
                  stroke="#fae596"
                  strokeWidth="0.3"
                  strokeOpacity="0.9"
                  filter={`url(#threadGlow-${type})`}
                />
                <path
                  d={`M ${t.barX + 0.2} ${t.barY} Q ${midX + 0.2} ${midY} ${rotated.x + 0.2} ${rotated.y}`}
                  fill="none"
                  stroke="#38250f"
                  strokeWidth="0.15"
                  strokeOpacity="0.4"
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* 2. Character Body Parts */}
      <div
        className="relative h-full overflow-visible mx-auto"
        style={{ aspectRatio: config.aspectRatio }}
      >
        {isMultiLayer && 'torsoSrc' in config ? (
          <>
            {/* Layer 1: Skirt */}
            <img
              src={config.skirtSrc}
              alt="Puppet Skirt"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
              style={{
                transform: `rotate(${angles.skirt}deg)`,
                transformOrigin: `${config.pivots.skirt.x}% ${config.pivots.skirt.y}%`,
                willChange: 'transform',
              }}
            />

            {/* Layer 2: Left Arm */}
            <img
              src={config.leftArmSrc}
              alt="Puppet Left Arm"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
              style={{
                transform: `rotate(${angles.leftArm}deg)`,
                transformOrigin: `${config.pivots.leftArm.x}% ${config.pivots.leftArm.y}%`,
                willChange: 'transform',
              }}
            />

            {/* Layer 3: Torso */}
            <img
              src={config.torsoSrc}
              alt="Puppet Torso"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
              style={{
                transform: `rotate(${angles.torsoTilt}deg)`,
                transformOrigin: `${config.pivots.torso.x}% ${config.pivots.torso.y}%`,
                willChange: 'transform',
              }}
            />

            {/* Layer 4: Right Arm */}
            <img
              src={config.rightArmSrc}
              alt="Puppet Right Arm"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
              style={{
                transform: `rotate(${angles.rightArm}deg)`,
                transformOrigin: `${config.pivots.rightArm.x}% ${config.pivots.rightArm.y}%`,
                willChange: 'transform',
              }}
            />

            {/* Layer 5: Head */}
            <img
              src={config.headSrc}
              alt="Puppet Head"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
              style={{
                transform: `rotate(${angles.head}deg)`,
                transformOrigin: `${config.pivots.head.x}% ${config.pivots.head.y}%`,
                willChange: 'transform',
              }}
            />
          </>
        ) : (
          /* Articulated Single-Asset Character with Dynamic Sway & Tilt */
          <img
            src={'singleSrc' in config ? config.singleSrc : ''}
            alt="Puppet Character"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
            style={{
              transform: `rotate(${angles.torsoTilt * 1.5}deg)`,
              transformOrigin: '50% 50%',
              willChange: 'transform',
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ArticulatedCutoutPuppet
