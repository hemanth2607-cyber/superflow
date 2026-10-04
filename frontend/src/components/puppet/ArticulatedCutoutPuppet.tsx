import React, { useState, useEffect, useRef } from 'react'
import { usePuppetStore } from '../../stores/usePuppetStore'
import { useAudioStore } from '../../stores/useAudioStore'

interface ArticulatedCutoutPuppetProps {
  type: 'chinese' | 'japanese'
  className?: string
}

export const ArticulatedCutoutPuppet: React.FC<ArticulatedCutoutPuppetProps> = ({
  type,
  className = '',
}) => {
  const {
    hoveredType,
    mode,
    chineseGestureCounter,
    japaneseGestureCounter,
    triggerChineseGesture,
    triggerJapaneseGesture,
  } = usePuppetStore()
  const { playPluck, playClick } = useAudioStore()

  const isChinese = type === 'chinese'
  const containerRef = useRef<HTMLDivElement>(null)

  // Subtle natural movement angles (degrees / px)
  const [angles, setAngles] = useState({
    head: 0,
    rightArm: 0,
    leftArm: 0,
    skirt: 0,
    torsoY: 0,
    sway: 0,
  })

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
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
    setTimeout(() => setIsGesturing(false), 1400)
  }

  // Smooth continuous requestAnimationFrame for subtle "very little movement"
  useEffect(() => {
    let animId: number
    let startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000 // seconds

      // Very subtle organic idle breathing and gentle swaying
      // Kept between 1.0 and 2.5 degrees as requested ("very little movement")
      const gestureBoost = isGesturing ? 2.0 : 1.0

      const head = Math.sin(elapsed * 0.9) * 1.5 * gestureBoost
      const rightArm = Math.sin(elapsed * 1.1 + 0.4) * 2.2 * gestureBoost
      const leftArm = Math.sin(elapsed * 0.85 + 1.2) * 2.0 * gestureBoost
      const skirt = Math.sin(elapsed * 0.7 + 2.0) * 1.2 * gestureBoost
      const torsoY = Math.sin(elapsed * 0.8) * 1.4

      // Gentle overall marionette tilt influenced slightly by mouse position
      const sway = Math.sin(elapsed * 0.6) * 1.2 + mouseOffset.x * 2.0

      setAngles({
        head,
        rightArm,
        leftArm,
        skirt,
        torsoY,
        sway,
      })

      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [isGesturing, mouseOffset])

  // Mouse hover subtle tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    setMouseOffset({
      x: Math.max(-1, Math.min(1, relX)),
      y: Math.max(-1, Math.min(1, relY)),
    })
  }

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 })
  }

  const handleClick = () => {
    playClick()
    playPluck(isChinese ? 'F4' : 'G4')
    if (isChinese) {
      triggerChineseGesture()
    } else {
      triggerJapaneseGesture()
    }
  }

  // Configuration for each puppet type
  // Coordinates are defined in SVG coordinate space (0..100)
  const config = isChinese
    ? {
        aspectRatio: '657 / 992',
        torsoSrc: '/assets/shadow/part_torso.png',
        skirtSrc: '/assets/shadow/part_skirt.png',
        leftArmSrc: '/assets/shadow/part_left_arm.png',
        rightArmSrc: '/assets/shadow/part_right_arm.png',
        headSrc: '/assets/shadow/part_head.png',
        // Pivot points for rotation
        pivots: {
          head: '54.8% 23.7%',
          leftArm: '47.2% 25.7%',
          rightArm: '66.2% 25.7%',
          skirt: '56.3% 47.4%',
          torso: '56.3% 35.3%',
        },
        // Thread endpoints on puppet (% in 100x100 space)
        threads: [
          { id: 'head', barX: 55, barY: 4, targetX: 54.8, targetY: 4.0 },
          { id: 'rightArm', barX: 74, barY: 4, targetX: 77.0, targetY: 17.5 },
          { id: 'leftArm', barX: 28, barY: 4, targetX: 24.5, targetY: 42.0 },
          { id: 'waist', barX: 46, barY: 4, targetX: 56.3, targetY: 47.4 },
          { id: 'ribbon', barX: 82, barY: 4, targetX: 86.0, targetY: 24.0 },
        ],
        // Brass rivets at joints (% in 100x100 space)
        rivets: [
          { x: 54.8, y: 23.7, label: 'Neck Joint' },
          { x: 47.2, y: 25.7, label: 'Left Shoulder' },
          { x: 66.2, y: 25.7, label: 'Right Shoulder' },
          { x: 56.3, y: 47.4, label: 'Waist Joint' },
        ],
      }
    : {
        aspectRatio: '796 / 1138',
        torsoSrc: '/assets/shadow/jp_part_torso.png',
        skirtSrc: '/assets/shadow/jp_part_skirt.png',
        leftArmSrc: '/assets/shadow/jp_part_left_arm.png',
        rightArmSrc: '/assets/shadow/jp_part_right_arm.png',
        headSrc: '/assets/shadow/jp_part_head.png',
        pivots: {
          head: '58.0% 20.0%',
          leftArm: '44.0% 26.0%',
          rightArm: '70.0% 24.0%',
          skirt: '58.0% 48.0%',
          torso: '58.0% 36.0%',
        },
        threads: [
          { id: 'head', barX: 58, barY: 4, targetX: 58.0, targetY: 6.0 },
          { id: 'rightArm', barX: 76, barY: 4, targetX: 78.0, targetY: 26.0 },
          { id: 'leftArm', barX: 34, barY: 4, targetX: 36.0, targetY: 38.0 },
          { id: 'waist', barX: 50, barY: 4, targetX: 58.0, targetY: 48.0 },
          { id: 'hem', barX: 28, barY: 4, targetX: 32.0, targetY: 72.0 },
        ],
        rivets: [
          { x: 58.0, y: 20.0, label: 'Neck Joint' },
          { x: 44.0, y: 26.0, label: 'Left Shoulder' },
          { x: 70.0, y: 24.0, label: 'Right Shoulder' },
          { x: 58.0, y: 48.0, label: 'Waist Joint' },
        ],
      }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-[290px] md:h-[340px] select-none cursor-pointer group flex flex-col items-center justify-center filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-[1.02] ${className}`}
      title={`Click to animate ${isChinese ? 'Chinese Opera' : 'Japanese Bunraku'} shadow puppet`}
      style={{
        transform: `rotate(${angles.sway}deg) translateY(${angles.torsoY}px)`,
        transformOrigin: '50% 4%',
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* ==============================================================
          1. OVERHEAD SILK THREADS & WOODEN CONTROL CROSSBAR
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
              <feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor="#d4af37" floodOpacity="0.7" />
            </filter>
            {/* Wooden Bar Gradient */}
            <linearGradient id={`woodBar-${type}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4a3219" />
              <stop offset="10%" stopColor="#7a552c" />
              <stop offset="50%" stopColor="#966a38" />
              <stop offset="90%" stopColor="#7a552c" />
              <stop offset="100%" stopColor="#4a3219" />
            </linearGradient>
          </defs>

          {/* Overhead Marionette Control Crossbar */}
          <g id="overhead-control-bar">
            {/* Suspension ring at top center */}
            <circle cx="50" cy="1.5" r="1.4" fill="none" stroke="#d4af37" strokeWidth="0.5" />
            {/* Main horizontal wooden bar */}
            <rect
              x="18"
              y="3.2"
              width="64"
              height="2.2"
              rx="1.1"
              fill={`url(#woodBar-${type})`}
              stroke="#2e1d0d"
              strokeWidth="0.3"
            />
            {/* Brass End Caps / Finials */}
            <circle cx="18" cy="4.3" r="1.4" fill="#d4af37" stroke="#8a6d1b" strokeWidth="0.4" />
            <circle cx="82" cy="4.3" r="1.4" fill="#d4af37" stroke="#8a6d1b" strokeWidth="0.4" />
          </g>

          {/* 5 Dynamic Silk Marionette Threads */}
          {config.threads.map((t) => {
            // Apply slight dynamic sway to target position based on animated angle
            let dynamicTargetX = t.targetX
            let dynamicTargetY = t.targetY

            if (t.id === 'head') {
              dynamicTargetX += angles.head * 0.15
            } else if (t.id === 'rightArm') {
              dynamicTargetX += angles.rightArm * 0.25
              dynamicTargetY -= Math.abs(angles.rightArm) * 0.1
            } else if (t.id === 'leftArm') {
              dynamicTargetX -= angles.leftArm * 0.2
            } else if (t.id === 'skirt' || t.id === 'waist') {
              dynamicTargetX += angles.skirt * 0.2
            }

            // Curve control point with natural catenary flex
            const midX = (t.barX + dynamicTargetX) / 2 + Math.sin(angles.sway * 0.05) * 1.5
            const midY = (t.barY + dynamicTargetY) / 2

            return (
              <g key={t.id}>
                {/* Real silk thread line */}
                <path
                  d={`M ${t.barX} ${t.barY} Q ${midX} ${midY} ${dynamicTargetX} ${dynamicTargetY}`}
                  fill="none"
                  stroke="#e8c872"
                  strokeWidth="0.35"
                  strokeOpacity="0.85"
                  filter={`url(#threadGlow-${type})`}
                />
                {/* Secondary subtle shadow strand for 3D depth */}
                <path
                  d={`M ${t.barX + 0.3} ${t.barY} Q ${midX + 0.3} ${midY} ${dynamicTargetX + 0.3} ${dynamicTargetY}`}
                  fill="none"
                  stroke="#573e1c"
                  strokeWidth="0.2"
                  strokeOpacity="0.4"
                />
                {/* Brass Eyelet Knot on Puppet Joint */}
                <circle
                  cx={dynamicTargetX}
                  cy={dynamicTargetY}
                  r="0.85"
                  fill="#d4af37"
                  stroke="#6d4c1b"
                  strokeWidth="0.25"
                />
                <circle cx={dynamicTargetX} cy={dynamicTargetY} r="0.35" fill="#2d1c08" />
              </g>
            )
          })}

          {/* Authentic Shadow Puppet Brass Rivet Pins at Joints */}
          {config.rivets.map((r, idx) => (
            <g key={idx}>
              <circle
                cx={r.x}
                cy={r.y}
                r="1.0"
                fill="#d4af37"
                stroke="#684a1a"
                strokeWidth="0.3"
              />
              <circle cx={r.x} cy={r.y} r="0.4" fill="#3c280b" />
            </g>
          ))}
        </svg>
      </div>

      {/* ==============================================================
          2. ARTICULATED SHADOW PUPPET CUTOUT BODY PARTS
          All parts share identical bounds and overlap seamlessly!
          ============================================================== */}
      <div
        className="relative h-full overflow-visible mx-auto"
        style={{ aspectRatio: config.aspectRatio }}
      >
        {/* Layer 1: Skirt & Lower Body (Hinged at Waist) */}
        <img
          src={config.skirtSrc}
          alt="Puppet Skirt"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
          style={{
            transform: `rotate(${angles.skirt}deg)`,
            transformOrigin: config.pivots.skirt,
            willChange: 'transform',
          }}
        />

        {/* Layer 2: Left Arm & Sleeve (Hinged at Left Shoulder) */}
        <img
          src={config.leftArmSrc}
          alt="Puppet Left Arm"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
          style={{
            transform: `rotate(${angles.leftArm}deg)`,
            transformOrigin: config.pivots.leftArm,
            willChange: 'transform',
          }}
        />

        {/* Layer 3: Central Torso / Robe (Anchor Center) */}
        <img
          src={config.torsoSrc}
          alt="Puppet Torso"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{
            transformOrigin: config.pivots.torso,
          }}
        />

        {/* Layer 4: Right Arm, Sword & Ribbon (Hinged at Right Shoulder) */}
        <img
          src={config.rightArmSrc}
          alt="Puppet Right Arm"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
          style={{
            transform: `rotate(${angles.rightArm}deg)`,
            transformOrigin: config.pivots.rightArm,
            willChange: 'transform',
          }}
        />

        {/* Layer 5: Head, Crown & Tassels (Hinged at Neck Collar) */}
        <img
          src={config.headSrc}
          alt="Puppet Head"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
          style={{
            transform: `rotate(${angles.head}deg)`,
            transformOrigin: config.pivots.head,
            willChange: 'transform',
          }}
        />
      </div>
    </div>
  )
}

export default ArticulatedCutoutPuppet
