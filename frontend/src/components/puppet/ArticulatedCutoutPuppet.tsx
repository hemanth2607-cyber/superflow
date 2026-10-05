import React, { useState, useEffect, useRef } from 'react'
import { usePuppetStore } from '../../stores/usePuppetStore'

interface ArticulatedCutoutPuppetProps {
  type: 'chinese' | 'japanese'
  className?: string
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
    legs: 0,
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

      // 1. Head: independent nod and tilt rhythm
      const head = (Math.sin(elapsed * 0.95) * 1.8 + Math.cos(elapsed * 1.45) * 0.8) * gestureBoost

      // 2. Left Arm: independent shoulder rotation and limb swing
      const leftArm = (Math.sin(elapsed * 1.15 + 0.5) * 2.4 + Math.cos(elapsed * 0.6) * 1.0) * gestureBoost

      // 3. Right Arm: independent shoulder articulation & weapon/fan swing
      const rightArm = (Math.sin(elapsed * 1.05 + 1.8) * 2.6 - Math.cos(elapsed * 0.7) * 0.8) * gestureBoost

      // 4. Torso: subtle core breathing rise/fall and organic spinal posture
      const torsoTilt = (Math.sin(elapsed * 0.75) * 0.9) * gestureBoost
      const torsoY = Math.sin(elapsed * 0.8) * 1.4

      // 5. Skirt / Robe: pendular inertia lagging slightly behind torso
      const skirt = (Math.sin(elapsed * 0.7 + 2.1) * 1.7) * gestureBoost

      // 6. Legs / Feet: subtle independent counter-balance articulation
      const legs = (Math.sin(elapsed * 0.85 + 3.2) * 1.4) * gestureBoost

      // 7. Overall gentle marionette string suspension sway
      const sway = Math.sin(elapsed * 0.55) * 0.7

      setAngles({
        head,
        leftArm,
        rightArm,
        torsoTilt,
        torsoY,
        skirt,
        legs,
        sway,
      })

      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [isGesturing])

  // Configuration for each puppet with 6 distinct body parts, pivots, and threads
  const config = isChinese
    ? {
        aspectRatio: '896 / 1200',
        headSrc: '/assets/shadow/part_head.png',
        leftArmSrc: '/assets/shadow/part_left_arm.png',
        rightArmSrc: '/assets/shadow/part_right_arm.png',
        torsoSrc: '/assets/shadow/part_torso.png',
        skirtSrc: '/assets/shadow/part_skirt.png',
        legsSrc: '/assets/shadow/part_legs.png',
        pivots: {
          head: '51.3% 28.8%',
          leftArm: '43.0% 32.9%',
          rightArm: '59.7% 32.9%',
          torso: '51.3% 38.3%',
          skirt: '51.3% 45.4%',
          legs: '51.3% 64.2%',
        },
        // Overhead suspension threads attached to moving limb endpoints
        threads: [
          { id: 'head', barX: 51, barY: 3.5, targetX: 51.3, targetY: 3.0, part: 'head' },
          { id: 'leftArm', barX: 25, barY: 3.5, targetX: 23.5, targetY: 38.0, part: 'leftArm' },
          { id: 'rightArm', barX: 75, barY: 3.5, targetX: 75.0, targetY: 38.0, part: 'rightArm' },
          { id: 'waist', barX: 45, barY: 3.5, targetX: 47.0, targetY: 46.0, part: 'torso' },
          { id: 'skirt', barX: 58, barY: 3.5, targetX: 57.0, targetY: 65.0, part: 'skirt' },
        ],
        // Brass rivets and sewn joint hinges
        rivets: [
          { x: 51.3, y: 28.8, label: 'Neck Pivot' },
          { x: 43.0, y: 32.9, label: 'Left Shoulder' },
          { x: 59.7, y: 32.9, label: 'Right Shoulder' },
          { x: 51.3, y: 45.4, label: 'Waist Hinge' },
          { x: 51.3, y: 64.2, label: 'Knee Joint' },
        ],
        // Stitches connecting the puppet body parts
        stitches: [
          { x1: 49.5, y1: 28.8, x2: 53.1, y2: 28.8 },
          { x1: 41.5, y1: 32.9, x2: 44.5, y2: 32.9 },
          { x1: 58.2, y1: 32.9, x2: 61.2, y2: 32.9 },
          { x1: 48.0, y1: 45.4, x2: 54.6, y2: 45.4 },
          { x1: 48.0, y1: 64.2, x2: 54.6, y2: 64.2 },
        ],
      }
    : {
        aspectRatio: '896 / 1200',
        headSrc: '/assets/shadow/jp_part_head.png',
        leftArmSrc: '/assets/shadow/jp_part_left_arm.png',
        rightArmSrc: '/assets/shadow/jp_part_right_arm.png',
        torsoSrc: '/assets/shadow/jp_part_torso.png',
        skirtSrc: '/assets/shadow/jp_part_skirt.png',
        legsSrc: '/assets/shadow/jp_part_feet.png',
        pivots: {
          head: '50.0% 21.3%',
          rightArm: '40.2% 22.9%',
          leftArm: '59.2% 22.9%',
          torso: '50.0% 31.7%',
          skirt: '50.0% 43.3%',
          legs: '50.8% 73.3%',
        },
        threads: [
          { id: 'head', barX: 50, barY: 3.5, targetX: 50.0, targetY: 4.5, part: 'head' },
          { id: 'rightArm', barX: 25, barY: 3.5, targetX: 22.5, targetY: 44.0, part: 'rightArm' },
          { id: 'leftArm', barX: 75, barY: 3.5, targetX: 74.5, targetY: 28.0, part: 'leftArm' },
          { id: 'waist', barX: 44, barY: 3.5, targetX: 45.0, targetY: 36.0, part: 'torso' },
          { id: 'skirt', barX: 58, barY: 3.5, targetX: 56.0, targetY: 70.0, part: 'skirt' },
        ],
        rivets: [
          { x: 50.0, y: 21.3, label: 'Neck Pivot' },
          { x: 40.2, y: 22.9, label: 'Right Shoulder' },
          { x: 59.2, y: 22.9, label: 'Left Shoulder' },
          { x: 50.0, y: 43.3, label: 'Waist Hinge' },
          { x: 50.8, y: 73.3, label: 'Hem Joint' },
        ],
        stitches: [
          { x1: 48.0, y1: 21.3, x2: 52.0, y2: 21.3 },
          { x1: 38.5, y1: 22.9, x2: 42.0, y2: 22.9 },
          { x1: 57.5, y1: 22.9, x2: 61.0, y2: 22.9 },
          { x1: 47.0, y1: 43.3, x2: 53.0, y2: 43.3 },
          { x1: 47.5, y1: 73.3, x2: 54.0, y2: 73.3 },
        ],
      }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[320px] md:h-[370px] select-none pointer-events-none flex flex-col items-center justify-center filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.55)] ${className}`}
      style={{
        transform: `rotate(${angles.sway}deg) translateY(${angles.torsoY}px)`,
        transformOrigin: '50% 3.5%',
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* ==============================================================
          1. OVERHEAD SILK THREADS, CONTROL BAR, STITCHES & BRASS RIVETS
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
              <feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor="#d4af37" floodOpacity="0.75" />
            </filter>
            {/* Marionette Wooden Bar Gradient */}
            <linearGradient id={`woodBar-${type}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3c2612" />
              <stop offset="15%" stopColor="#6e4d26" />
              <stop offset="50%" stopColor="#8c6233" />
              <stop offset="85%" stopColor="#6e4d26" />
              <stop offset="100%" stopColor="#3c2612" />
            </linearGradient>
          </defs>

          {/* Overhead Marionette Control Crossbar */}
          <g id="overhead-control-bar">
            {/* Top Suspension Hook */}
            <circle cx="50" cy="1.2" r="1.3" fill="none" stroke="#d4af37" strokeWidth="0.5" />
            {/* Horizontal Hardwood Bar */}
            <rect
              x="16"
              y="2.6"
              width="68"
              height="2.2"
              rx="1.1"
              fill={`url(#woodBar-${type})`}
              stroke="#24170a"
              strokeWidth="0.3"
            />
            {/* Brass End Finials */}
            <circle cx="16" cy="3.7" r="1.4" fill="#d4af37" stroke="#755818" strokeWidth="0.4" />
            <circle cx="84" cy="3.7" r="1.4" fill="#d4af37" stroke="#755818" strokeWidth="0.4" />
          </g>

          {/* Dynamic Overhead Silk Marionette Suspension Threads */}
          {config.threads.map((t) => {
            let dynamicTargetX = t.targetX
            let dynamicTargetY = t.targetY

            // Dynamically track the motion of each specific body part
            if (t.part === 'head') {
              dynamicTargetX += angles.head * 0.16
              dynamicTargetY += Math.abs(angles.head) * 0.05
            } else if (t.part === 'leftArm') {
              dynamicTargetX -= angles.leftArm * 0.22
              dynamicTargetY -= angles.leftArm * 0.1
            } else if (t.part === 'rightArm') {
              dynamicTargetX += angles.rightArm * 0.22
              dynamicTargetY += angles.rightArm * 0.1
            } else if (t.part === 'torso') {
              dynamicTargetX += angles.torsoTilt * 0.14
            } else if (t.part === 'skirt') {
              dynamicTargetX += angles.skirt * 0.18
            }

            const midX = (t.barX + dynamicTargetX) / 2
            const midY = (t.barY + dynamicTargetY) / 2

            return (
              <g key={t.id}>
                {/* Luminous Silk Thread Strand */}
                <path
                  d={`M ${t.barX} ${t.barY} Q ${midX} ${midY} ${dynamicTargetX} ${dynamicTargetY}`}
                  fill="none"
                  stroke="#f3d882"
                  strokeWidth="0.35"
                  strokeOpacity="0.88"
                  filter={`url(#threadGlow-${type})`}
                />
                {/* Secondary Shadow Strand */}
                <path
                  d={`M ${t.barX + 0.25} ${t.barY} Q ${midX + 0.25} ${midY} ${dynamicTargetX + 0.25} ${dynamicTargetY}`}
                  fill="none"
                  stroke="#432f15"
                  strokeWidth="0.18"
                  strokeOpacity="0.45"
                />
                {/* Brass Eyelet Ring on Body Part */}
                <circle
                  cx={dynamicTargetX}
                  cy={dynamicTargetY}
                  r="0.9"
                  fill="#d4af37"
                  stroke="#634517"
                  strokeWidth="0.25"
                />
                <circle cx={dynamicTargetX} cy={dynamicTargetY} r="0.35" fill="#241708" />
              </g>
            )
          })}

          {/* Stitched Joint Fastenings ("Sowed as a Puppet") */}
          {config.stitches.map((s, idx) => (
            <g key={`stitch-${idx}`}>
              <line
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke="#c99738"
                strokeWidth="0.4"
                strokeDasharray="0.6 0.6"
              />
            </g>
          ))}

          {/* Authentic Brass Pivot Rivets at Joint Hinges */}
          {config.rivets.map((r, idx) => (
            <g key={`rivet-${idx}`}>
              {/* Outer Golden Flange */}
              <circle
                cx={r.x}
                cy={r.y}
                r="1.1"
                fill="#d4af37"
                stroke="#5c3f15"
                strokeWidth="0.3"
              />
              {/* Inner Rivet Pin Core */}
              <circle cx={r.x} cy={r.y} r="0.45" fill="#301e08" />
            </g>
          ))}
        </svg>
      </div>

      {/* ==============================================================
          2. ARTICULATED SEPARATE BODY PARTS (ALL 6 PARTS MOVE SEPARATELY)
          ============================================================== */}
      <div
        className="relative h-full overflow-visible mx-auto"
        style={{ aspectRatio: config.aspectRatio }}
      >
        {/* Part 1: Legs & Boots / Geta (Independent balance & stride articulation) */}
        <img
          src={config.legsSrc}
          alt="Puppet Legs"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
          style={{
            transform: `rotate(${angles.legs}deg)`,
            transformOrigin: config.pivots.legs,
            willChange: 'transform',
          }}
        />

        {/* Part 2: Skirt / Lower Robe (Independent pendular inertia & sway) */}
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

        {/* Part 3: Left Arm (Independent shoulder swing & weapon/cloth motion) */}
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

        {/* Part 4: Torso & Chestplate / Obi (Central anchor with subtle respiratory tilt) */}
        <img
          src={config.torsoSrc}
          alt="Puppet Torso"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
          style={{
            transform: `rotate(${angles.torsoTilt}deg)`,
            transformOrigin: config.pivots.torso,
            willChange: 'transform',
          }}
        />

        {/* Part 5: Right Arm (Independent shoulder swing & shield/fan motion) */}
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

        {/* Part 6: Head & Crown / Headdress (Independent nod and tilt articulation) */}
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
