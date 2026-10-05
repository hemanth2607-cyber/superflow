import React, { useState, useEffect } from 'react'

interface DancingWomanLoadingScreenProps {
  onComplete: () => void
}

// Exact 2D forward-kinematics rotation around a pivot point
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

export const DancingWomanLoadingScreen: React.FC<DancingWomanLoadingScreenProps> = ({
  onComplete,
}) => {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Lighting the stage...')
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Real-time animation clock
  const [time, setTime] = useState(0)

  // Smooth continuous 60fps loop for dance physics
  useEffect(() => {
    let animId: number
    const startTime = performance.now()

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000 // seconds
      setTime(elapsed)
      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Progress timer (~3.2 seconds total)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.2
        if (next >= 100) {
          clearInterval(interval)
          setStatusText('Welcome to SuperFlow')
          setTimeout(() => {
            setIsFadingOut(true)
            setTimeout(onComplete, 500)
          }, 300)
          return 100
        }

        if (next > 75) {
          setStatusText('Starting Polyglot Studio & AI Hub...')
        } else if (next > 50) {
          setStatusText('Tuning marionette silk threads...')
        } else if (next > 25) {
          setStatusText('The maiden dances on the shadow stage...')
        }
        return next
      })
    }, 38)

    return () => clearInterval(interval)
  }, [onComplete])

  // ==============================================================
  // DANCE CHOREOGRAPHY (NO 3D CARD TURNING, ALL BODY PARTS DANCE SEPARATELY)
  // ==============================================================
  const danceBeat = time * 4.2

  // 1. Cadenced vertical dance bounce (knees bending and lifting to the beat)
  const danceBounceY = Math.abs(Math.sin(danceBeat)) * -16 + Math.cos(time * 2.1) * 3

  // 2. Skirt & Legs: Sways from side to side in counter-motion to stepping
  const skirtAngle = Math.sin(danceBeat * 0.7) * 16 + Math.sin(time * 2.5) * 4

  // 3. Left Arm: Waves rhythmically with the kimono sleeve
  const leftArmAngle = Math.sin(danceBeat + 0.8) * 26 + Math.cos(time * 2.2) * 12

  // 4. Right Arm: Waves and flutters the golden fan in counter-rhythm
  const rightArmAngle = Math.cos(danceBeat + 1.9) * 30 - Math.sin(time * 2.8) * 10

  // 5. Torso: Subtle core breathing rise and tilt as body shifts weight
  const torsoTilt = Math.sin(danceBeat * 0.7) * 6
  const torsoY = Math.sin(danceBeat * 0.5) * 3

  // 6. Head: Elegant nods and sways following the musical phrasing
  const headAngle = Math.sin(danceBeat * 0.7) * 10 + Math.cos(time * 3.1) * 4

  // 7. Whole Marionette Sway: Gentle pendulum inertia suspended from threads
  const marionetteSway = Math.sin(time * 1.8) * 2.5

  // ==============================================================
  // REALISTIC FLEXIBLE SILK THREAD PHYSICS
  // Flexible catenary curves with gravity droop & harmonic ripple (NO STICKS!)
  // ==============================================================
  const pivots = {
    head: { x: 52.0, y: 18.0 },
    leftArm: { x: 32.0, y: 28.0 },
    rightArm: { x: 68.0, y: 25.0 },
    torso: { x: 52.0, y: 35.0 },
  }

  // Calculate dynamic bottom endpoints based on real body part rotation
  const headAttach = rotatePoint(52.0, 5.0, pivots.head.x, pivots.head.y, headAngle)
  const leftArmAttach = rotatePoint(23.0, 35.0, pivots.leftArm.x, pivots.leftArm.y, leftArmAngle)
  const rightArmAttach = rotatePoint(79.0, 21.0, pivots.rightArm.x, pivots.rightArm.y, rightArmAngle)
  const waistAttach = rotatePoint(52.0, 42.0, pivots.torso.x, pivots.torso.y, torsoTilt)

  const threadDefinitions = [
    {
      id: 'head',
      barX: 50.0,
      barY: 5.0,
      endX: headAttach.x,
      endY: headAttach.y,
      phase: 0.0,
      slackFactor: 0.8,
    },
    {
      id: 'leftArm',
      barX: 24.0,
      barY: 5.0,
      endX: leftArmAttach.x,
      endY: leftArmAttach.y,
      phase: 1.5,
      slackFactor: 1.4,
    },
    {
      id: 'rightArm',
      barX: 76.0,
      barY: 5.0,
      endX: rightArmAttach.x,
      endY: rightArmAttach.y,
      phase: 3.0,
      slackFactor: 1.5,
    },
    {
      id: 'waist',
      barX: 42.0,
      barY: 5.0,
      endX: waistAttach.x,
      endY: waistAttach.y,
      phase: 4.5,
      slackFactor: 0.6,
    },
  ]

  // Generate smooth, sagging, wave-rippling Bézier curves for each thread
  const threadPaths = threadDefinitions.map((t) => {
    const dx = t.endX - t.barX
    const dy = t.endY - t.barY
    
    // As the arm/body lifts higher, the thread slackens and droops more!
    const heightRatio = Math.max(0.1, dy / 40)
    const slack = (1.1 - Math.min(1.0, heightRatio)) * t.slackFactor
    const gravitySag = 2.0 + slack * 4.5

    // Harmonic wave ripple that travels along the silk thread
    const wave1 = Math.sin(time * 6.5 + t.phase) * (1.2 + slack * 2.0)
    const wave2 = Math.cos(time * 8.0 + t.phase * 1.3) * (0.8 + slack * 1.5)

    const cp1x = t.barX + dx * 0.28 + wave1
    const cp1y = t.barY + dy * 0.35 + gravitySag
    const cp2x = t.barX + dx * 0.72 + wave2 * 0.8
    const cp2y = t.barY + dy * 0.72 + gravitySag * 0.85

    return {
      id: t.id,
      path: `M ${t.barX} ${t.barY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${t.endX} ${t.endY}`,
    }
  })

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black select-none transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 1. Subtle Golden Stage Spotlight on Pure Black Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Overhead soft golden spotlight cone */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] md:w-[480px] h-[650px] bg-gradient-to-b from-amber-500/20 via-gold/10 to-transparent blur-3xl opacity-80"
          style={{
            transform: `translateX(-50%) rotate(${Math.sin(time * 0.8) * 2}deg)`,
            transformOrigin: 'top center',
          }}
        />
        {/* Stage floor pool of light */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 md:w-80 h-16 rounded-full bg-gold/15 blur-2xl" />
      </div>

      {/* Top Brand Banner */}
      <div className="relative z-20 pt-8 text-center">
        <span className="text-xs uppercase tracking-[0.35em] text-gold/80 font-mono font-medium">
          SuperFlow • Opening Ceremony
        </span>
      </div>

      {/* 2. THE ARTICULATED DANCING PUPPET (HANDS, LEGS, HEAD, TORSO DANCE SEPARATELY) */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto w-full max-w-lg">
        {/* Marionette Stage Container */}
        <div
          className="relative w-72 sm:w-80 md:w-96 h-[400px] sm:h-[450px] flex items-center justify-center filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.95)]"
          style={{
            transform: `rotate(${marionetteSway}deg) translateY(${danceBounceY}px)`,
            transformOrigin: '50% 5%',
            transition: 'transform 0.05s linear',
          }}
        >
          {/* ==============================================================
              LAYER 1: REALISTIC FLOWING SILK THREADS & OVERHEAD WOODEN BAR
             ============================================================== */}
          <div className="absolute inset-0 pointer-events-none z-30">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <filter id="silkThreadGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor="#f4d375" floodOpacity="0.85" />
                </filter>
                <linearGradient id="marionetteWoodBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1e1005" />
                  <stop offset="20%" stopColor="#4a2e12" />
                  <stop offset="50%" stopColor="#7a4e20" />
                  <stop offset="80%" stopColor="#4a2e12" />
                  <stop offset="100%" stopColor="#1e1005" />
                </linearGradient>
              </defs>

              {/* Overhead Wooden Marionette Crossbar */}
              <g>
                <circle cx="50" cy="3.5" r="1.4" fill="none" stroke="#d4af37" strokeWidth="0.4" />
                <rect
                  x="18"
                  y="4.2"
                  width="64"
                  height="1.8"
                  rx="0.9"
                  fill="url(#marionetteWoodBar)"
                  stroke="#1a0f07"
                  strokeWidth="0.3"
                />
                {/* Brass eyelet rings on bar */}
                <circle cx="24" cy="5.1" r="0.9" fill="#d4af37" />
                <circle cx="42" cy="5.1" r="0.8" fill="#d4af37" />
                <circle cx="50" cy="5.1" r="0.9" fill="#d4af37" />
                <circle cx="76" cy="5.1" r="0.9" fill="#d4af37" />
              </g>

              {/* Realistic Fluid Silk Threads (Soft curves, gravity sag, wave harmonics) */}
              {threadPaths.map((t) => (
                <g key={t.id}>
                  {/* Subtle soft shadow behind thread */}
                  <path
                    d={t.path}
                    fill="none"
                    stroke="#1a1005"
                    strokeWidth="0.5"
                    strokeOpacity="0.4"
                    transform="translate(0.3, 0.4)"
                  />
                  {/* Glowing Silk Core Thread */}
                  <path
                    d={t.path}
                    fill="none"
                    stroke="#fce99f"
                    strokeWidth="0.32"
                    strokeOpacity="0.95"
                    filter="url(#silkThreadGlow)"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* ==============================================================
              LAYER 2: ASSEMBLED ARTICULATED BODY PARTS DANCING SEPARATELY
             ============================================================== */}
          <div
            className="relative h-full overflow-visible mx-auto"
            style={{ aspectRatio: '620 / 1085' }}
          >
            {/* Part 1: Skirt / Legs (Sways rhythmically to the dance beat) */}
            <img
              src="/assets/shadow/jp_part_skirt.png"
              alt="Puppet Skirt & Legs"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              style={{
                transform: `rotate(${skirtAngle}deg)`,
                transformOrigin: '52% 48%',
                transition: 'transform 0.05s linear',
              }}
            />

            {/* Part 2: Left Arm / Kimono Sleeve (Waves and undulates in dance) */}
            <img
              src="/assets/shadow/jp_part_left_arm.png"
              alt="Puppet Left Arm"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              style={{
                transform: `rotate(${leftArmAngle}deg)`,
                transformOrigin: '32% 28%',
                transition: 'transform 0.05s linear',
              }}
            />

            {/* Part 3: Torso (Rises and tilts with dance breathing) */}
            <img
              src="/assets/shadow/jp_part_torso.png"
              alt="Puppet Torso"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              style={{
                transform: `rotate(${torsoTilt}deg) translateY(${torsoY}px)`,
                transformOrigin: '52% 35%',
                transition: 'transform 0.05s linear',
              }}
            />

            {/* Part 4: Right Arm / Fan (Flutters and lifts the fan with the melody) */}
            <img
              src="/assets/shadow/jp_part_right_arm.png"
              alt="Puppet Right Arm with Fan"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              style={{
                transform: `rotate(${rightArmAngle}deg)`,
                transformOrigin: '68% 25%',
                transition: 'transform 0.05s linear',
              }}
            />

            {/* Part 5: Head (Graceful tilts, bobs, and nods with the music) */}
            <img
              src="/assets/shadow/jp_part_head.png"
              alt="Puppet Head"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              style={{
                transform: `rotate(${headAngle}deg)`,
                transformOrigin: '52% 18%',
                transition: 'transform 0.05s linear',
              }}
            />
          </div>
        </div>

        {/* Dancing Puppet Caption */}
        <div className="text-center mt-3">
          <span className="text-xs tracking-widest text-gold/90 font-sans font-medium flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
            <span>Articulated Marionette Dance</span>
          </span>
        </div>
      </div>

      {/* 3. Theatrical Loading Progress Bar & Skip Button */}
      <div className="relative z-30 w-full max-w-md px-6 pb-12 flex flex-col items-center">
        {/* Status text */}
        <div className="text-sm font-sans text-cream-light/95 mb-3 tracking-wide text-center h-6 font-medium">
          {statusText}
        </div>

        {/* Golden Progress Bar Container */}
        <div className="w-full h-2 rounded-full bg-neutral-900 border border-gold/40 p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-yellow-200 transition-all duration-100 shadow-[0_0_12px_rgba(212,175,55,0.8)]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Progress percent & Skip button */}
        <div className="w-full flex items-center justify-between text-[11px] text-muted font-sans mt-2.5">
          <span className="tabular-nums font-mono text-gold font-medium">{Math.round(progress)}%</span>
          <button
            onClick={() => {
              setIsFadingOut(true)
              setTimeout(onComplete, 350)
            }}
            className="text-muted/80 hover:text-gold transition-colors underline cursor-pointer"
          >
            Enter SuperFlow →
          </button>
        </div>
      </div>
    </div>
  )
}

export default DancingWomanLoadingScreen
