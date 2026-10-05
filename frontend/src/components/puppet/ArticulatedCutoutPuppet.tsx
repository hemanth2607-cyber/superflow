import React, { useState, useEffect, useRef } from 'react'
import { usePuppetStore } from '../../stores/usePuppetStore'

interface ArticulatedCutoutPuppetProps {
  type: 'chinese' | 'japanese'
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

  const isChinese = type === 'chinese'
  const containerRef = useRef<HTMLDivElement>(null)

  // Independent articulation angles for EVERY body part
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
    if (isChinese && chineseGestureCounter > 0) {
      performGesture()
    }
  }, [chineseGestureCounter])

  useEffect(() => {
    if (!isChinese && japaneseGestureCounter > 0) {
      performGesture()
    }
  }, [japaneseGestureCounter])

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

      // 1. Head: independent gentle nod and tilt
      const head = (Math.sin(elapsed * 0.9) * 1.8 + Math.cos(elapsed * 1.4) * 0.7) * gestureBoost

      // 2. Left Arm: independent shoulder articulation & hand motion
      const leftArm = (Math.sin(elapsed * 1.1 + 0.5) * 2.5 + Math.cos(elapsed * 0.6) * 0.8) * gestureBoost

      // 3. Right Arm: independent shoulder articulation & hand motion
      const rightArm = (Math.sin(elapsed * 1.0 + 1.8) * 2.6 - Math.cos(elapsed * 0.7) * 0.7) * gestureBoost

      // 4. Torso: subtle core breathing rise/fall and gentle tilt
      const torsoTilt = (Math.sin(elapsed * 0.75) * 0.8) * gestureBoost
      const torsoY = Math.sin(elapsed * 0.8) * 1.2

      // 5. Skirt / Robe: pendular inertia lagging behind torso
      const skirt = (Math.sin(elapsed * 0.7 + 2.1) * 1.6) * gestureBoost

      // 6. Overall gentle marionette string suspension sway
      const sway = Math.sin(elapsed * 0.55) * 0.6

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
  }, [isGesturing])

  // Configuration for each art-styled puppet with authentic pivots & synchronized threads
  const config = isChinese
    ? {
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
        // Overhead suspension threads: Attached above crown and to arms, NEVER crossing face
        threads: [
          // Head thread attaches to top of crown (y=4.0%), well above face
          {
            id: 'head',
            barX: 55.0,
            barY: 3.5,
            attachX: 54.8,
            attachY: 4.0,
            pivot: { x: 54.8, y: 23.7 },
            angleKey: 'head' as const,
          },
          // Right arm thread attaches to right hand
          {
            id: 'rightArm',
            barX: 75.0,
            barY: 3.5,
            attachX: 77.0,
            attachY: 17.5,
            pivot: { x: 66.2, y: 25.7 },
            angleKey: 'rightArm' as const,
          },
          // Left arm thread attaches to left hand
          {
            id: 'leftArm',
            barX: 27.0,
            barY: 3.5,
            attachX: 24.5,
            attachY: 42.0,
            pivot: { x: 47.2, y: 25.7 },
            angleKey: 'leftArm' as const,
          },
          // Torso thread attaches to waist anchor
          {
            id: 'waist',
            barX: 46.0,
            barY: 3.5,
            attachX: 56.3,
            attachY: 40.0,
            pivot: { x: 56.3, y: 35.3 },
            angleKey: 'torsoTilt' as const,
          },
        ],
      }
    : {
        aspectRatio: '620 / 1085',
        torsoSrc: '/assets/shadow/jp_part_torso.png',
        skirtSrc: '/assets/shadow/jp_part_skirt.png',
        leftArmSrc: '/assets/shadow/jp_part_left_arm.png',
        rightArmSrc: '/assets/shadow/jp_part_right_arm.png',
        headSrc: '/assets/shadow/jp_part_head.png',
        pivots: {
          head: { x: 52.0, y: 18.0 },
          leftArm: { x: 32.0, y: 28.0 },
          rightArm: { x: 68.0, y: 25.0 },
          torso: { x: 52.0, y: 35.0 },
          skirt: { x: 52.0, y: 48.0 },
        },
        threads: [
          // Head thread attaches to top hair ornament (y=5.0%), well above face
          {
            id: 'head',
            barX: 52.0,
            barY: 3.5,
            attachX: 52.0,
            attachY: 5.0,
            pivot: { x: 52.0, y: 18.0 },
            angleKey: 'head' as const,
          },
          // Right arm thread attaches to right hand
          {
            id: 'rightArm',
            barX: 76.0,
            barY: 3.5,
            attachX: 78.0,
            attachY: 22.0,
            pivot: { x: 68.0, y: 25.0 },
            angleKey: 'rightArm' as const,
          },
          // Left arm thread attaches to left hand
          {
            id: 'leftArm',
            barX: 25.0,
            barY: 3.5,
            attachX: 24.0,
            attachY: 34.0,
            pivot: { x: 32.0, y: 28.0 },
            angleKey: 'leftArm' as const,
          },
          // Torso thread attaches to waist anchor
          {
            id: 'waist',
            barX: 44.0,
            barY: 3.5,
            attachX: 52.0,
            attachY: 40.0,
            pivot: { x: 52.0, y: 35.0 },
            angleKey: 'torsoTilt' as const,
          },
        ],
      }

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
      {/* ==============================================================
          1. OVERHEAD MARIONETTE WOODEN CROSSBAR & PURE SILK THREADS
             (NO DOTS/RIVETS COVERING THE FACE OR HANDS)
          ============================================================== */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Silk Thread Golden Glow Filter */}
            <filter id={`threadGlow-${type}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="0.3" floodColor="#e6ca75" floodOpacity="0.75" />
            </filter>
            {/* Marionette Hardwood Control Bar Gradient */}
            <linearGradient id={`woodBar-${type}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2c1a0c" />
              <stop offset="15%" stopColor="#5e4120" />
              <stop offset="50%" stopColor="#805629" />
              <stop offset="85%" stopColor="#5e4120" />
              <stop offset="100%" stopColor="#2c1a0c" />
            </linearGradient>
          </defs>

          {/* Overhead Marionette Control Crossbar */}
          <g id="overhead-control-bar">
            {/* Center Suspension Ring */}
            <circle cx="50" cy="1.2" r="1.2" fill="none" stroke="#d4af37" strokeWidth="0.4" />
            {/* Main Hardwood Bar */}
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
            {/* Brass Finial Tips */}
            <circle cx="16" cy="3.4" r="1.3" fill="#d4af37" stroke="#684e16" strokeWidth="0.35" />
            <circle cx="84" cy="3.4" r="1.3" fill="#d4af37" stroke="#684e16" strokeWidth="0.35" />
          </g>

          {/* Pure Silk Suspension Threads (Exact 100% Kinematic Synchronization, NO DOTS) */}
          {config.threads.map((t) => {
            // Apply exact 2D trigonometry so thread endpoint stays LOCKED to the moving body part
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
                {/* Luminous Golden Silk Thread */}
                <path
                  d={`M ${t.barX} ${t.barY} Q ${midX} ${midY} ${rotated.x} ${rotated.y}`}
                  fill="none"
                  stroke="#fae596"
                  strokeWidth="0.3"
                  strokeOpacity="0.9"
                  filter={`url(#threadGlow-${type})`}
                />
                {/* Subtle Realistic Shadow Strand */}
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

      {/* ==============================================================
          2. ARTICULATED SEPARATE BODY PARTS (ALL PARTS MOVE SEPARATELY)
          ============================================================== */}
      <div
        className="relative h-full overflow-visible mx-auto"
        style={{ aspectRatio: config.aspectRatio }}
      >
        {/* Layer 1: Skirt & Lower Body (Independent pendular inertia & sway) */}
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

        {/* Layer 2: Left Arm & Sleeve (Independent shoulder swing) */}
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

        {/* Layer 3: Central Torso / Robe (Anchor Center with subtle breathing tilt) */}
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

        {/* Layer 4: Right Arm & Fan/Sword (Independent shoulder swing) */}
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

        {/* Layer 5: Head, Crown & Headdress (Independent nod and tilt) */}
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
      </div>
    </div>
  )
}

export default ArticulatedCutoutPuppet
