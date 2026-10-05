import React, { useState, useEffect } from 'react'

interface DancingWomanLoadingScreenProps {
  onComplete: () => void
}

// 2D forward-kinematics rotation helper
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
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [loadingStage, setLoadingStage] = useState('Loading assets & stage...')

  // Real-time animation clock for 60fps smooth physics
  const [time, setTime] = useState(0)

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

  // ==============================================================
  // REAL BROWSER ASSET & WINDOW LOAD DETECTION
  // (No fake timer, no manual "Enter App" button, automatically fades out
  //  instantly when assets, fonts, and window load events complete)
  // ==============================================================
  useEffect(() => {
    let isMounted = true
    let isDone = false

    const triggerCompletion = () => {
      if (isDone || !isMounted) return
      isDone = true
      setLoadingStage('Welcome to SuperFlow')
      setIsFadingOut(true)
      setTimeout(() => {
        if (isMounted) onComplete()
      }, 550) // Smooth 550ms fade-out transition
    }

    // 1. Critical assets to verify fully loaded in browser cache
    const assetsToPreload = [
      '/assets/shadow/puppet_head_clean.png',
      '/assets/shadow/puppet_torso_clean.png',
      '/assets/shadow/puppet_left_arm_clean.png',
      '/assets/shadow/puppet_right_arm_clean.png',
      '/assets/shadow/puppet_skirt_clean.png',
    ]

    let loadedCount = 0
    const checkAllFinished = () => {
      const isDocReady = document.readyState === 'complete'
      const areAssetsReady = loadedCount >= assetsToPreload.length

      if (isDocReady && areAssetsReady) {
        // Minimum aesthetic flourish of ~1.2s so the dance isn't a jarring flicker
        const elapsed = performance.now() - initTime
        const remaining = Math.max(0, 1200 - elapsed)
        setTimeout(triggerCompletion, remaining)
      }
    }

    const initTime = performance.now()

    // Preload each clean puppet part image
    assetsToPreload.forEach((src) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        loadedCount++
        setLoadingStage('Assembling marionette...')
        checkAllFinished()
      }
      img.onerror = () => {
        loadedCount++
        checkAllFinished()
      }
    })

    // 2. Listen to actual window load & readyState change events
    if (document.readyState === 'complete') {
      checkAllFinished()
    } else {
      const onWindowLoad = () => {
        setLoadingStage('Starting Polyglot Studio & AI Hub...')
        checkAllFinished()
      }
      window.addEventListener('load', onWindowLoad)
      document.addEventListener('readystatechange', checkAllFinished)
    }

    // 3. Document fonts ready promise
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => checkAllFinished()).catch(() => {})
    }

    // 4. Safety maximum watchdog (ensures app opens even on slow network)
    const watchdog = setTimeout(() => {
      triggerCompletion()
    }, 3800)

    return () => {
      isMounted = false
      clearTimeout(watchdog)
      window.removeEventListener('load', checkAllFinished)
      document.removeEventListener('readystatechange', checkAllFinished)
    }
  }, [onComplete])

  // ==============================================================
  // LIVELY, RHYTHMIC CLASSICAL MARIONETTE DANCE
  // (Faster, energetic tempo = 2.5 rad/s, fluid sine wave kinematics)
  // ==============================================================
  const danceTempo = 2.5 // Lively, rhythmic dance tempo

  // 1. Weightless Vertical Float & Bob
  const danceFloatY = Math.sin(time * danceTempo) * 7.5

  // 2. Skirt & Kimono Hem: Lively rhythmic sway with weight transfer
  const skirtAngle = Math.sin(time * danceTempo + 0.6) * 7.5 + Math.cos(time * 1.3) * 3.0

  // 3. Left Arm: Graceful wide sweeping wave of the kimono sleeve
  const leftArmAngle = Math.sin(time * danceTempo + 1.2) * 11.5 + Math.cos(time * 1.4) * 4.5

  // 4. Right Arm with Golden Fan: Lively fluttering fan and expressive lift
  const rightArmAngle = Math.cos(time * danceTempo + 1.8) * 13.5 + Math.sin(time * 1.5) * 5.5

  // 5. Torso: Expressive posture breathing and musical sway
  const torsoTilt = Math.sin(time * danceTempo + 0.3) * 3.2
  const torsoY = Math.sin(time * danceTempo) * 2.2

  // 6. Head: Expressive royal nods and tilts following the fan
  const headAngle = Math.sin(time * danceTempo) * 5.2 + Math.cos(time * 1.3) * 2.5

  // 7. Whole Marionette Sway
  const marionetteSway = Math.sin(time * 1.2) * 1.8

  // ==============================================================
  // GOLDEN SILK STRINGS EXTENDING OUT OF SCREEN (NO STICK, NO CROSSBAR)
  // Strings attach cleanly to hairpins (NOT cutting through face!), wrists & fan
  // Coordinates mapped in 100x100 relative stage space
  // ==============================================================
  // Pivots in stage %
  const headPivot = { x: 50.0, y: 19.0 }
  const leftArmPivot = { x: 42.5, y: 31.0 }
  const rightArmPivot = { x: 60.0, y: 29.5 }
  const torsoPivot = { x: 50.0, y: 38.0 }

  // Dynamic attachment points calculated via rotation
  // 1. Head string attaches to the TOP of the kanzashi hair comb (y = 5.5), NOT the face!
  const headAttach = rotatePoint(50.0, 5.5, headPivot.x, headPivot.y, headAngle)
  // 2. Left arm string attaches to delicate hand / sleeve edge
  const leftArmAttach = rotatePoint(20.0, 36.0, leftArmPivot.x, leftArmPivot.y, leftArmAngle)
  // 3. Right arm string attaches to golden fan
  const rightArmAttach = rotatePoint(78.0, 24.0, rightArmPivot.x, rightArmPivot.y, rightArmAngle)
  // 4. Waist / obi sash string
  const waistAttach = rotatePoint(50.5, 43.0, torsoPivot.x, torsoPivot.y, torsoTilt)

  const threadDefinitions = [
    {
      id: 'head-crown',
      barX: 50.0,
      barY: -85.0, // Extends far out of top screen edge into black space
      endX: headAttach.x,
      endY: headAttach.y,
      phase: 0.0,
      sagAmount: 2.5,
    },
    {
      id: 'left-sleeve',
      barX: 24.0,
      barY: -85.0,
      endX: leftArmAttach.x,
      endY: leftArmAttach.y,
      phase: 1.4,
      sagAmount: 4.5,
    },
    {
      id: 'right-fan',
      barX: 76.0,
      barY: -85.0,
      endX: rightArmAttach.x,
      endY: rightArmAttach.y,
      phase: 2.8,
      sagAmount: 5.0,
    },
    {
      id: 'waist-sash',
      barX: 52.0,
      barY: -85.0,
      endX: waistAttach.x,
      endY: waistAttach.y,
      phase: 4.2,
      sagAmount: 2.8,
    },
  ]

  // Flowing silk curves with harmonic wave resonance
  const threadPaths = threadDefinitions.map((t) => {
    const dx = t.endX - t.barX
    const dy = t.endY - t.barY

    const wave1 = Math.sin(time * 3.2 + t.phase) * 1.5
    const wave2 = Math.cos(time * 4.0 + t.phase * 1.2) * 1.2
    const gravitySag = t.sagAmount + Math.sin(time * danceTempo + t.phase) * 1.5

    const cp1x = t.barX + dx * 0.35 + wave1
    const cp1y = t.barY + dy * 0.35 + gravitySag * 0.5
    const cp2x = t.barX + dx * 0.70 + wave2
    const cp2y = t.barY + dy * 0.70 + gravitySag

    return {
      id: t.id,
      path: `M ${t.barX} ${t.barY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${t.endX} ${t.endY}`,
    }
  })

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black select-none transition-opacity duration-600 overflow-hidden pointer-events-auto ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 1. Golden Atmospheric Spotlight on Black Canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] md:w-[500px] h-[700px] bg-gradient-to-b from-amber-500/20 via-gold/8 to-transparent blur-3xl opacity-80"
          style={{
            transform: `translateX(-50%) rotate(${Math.sin(time * 0.8) * 2.0}deg)`,
            transformOrigin: 'top center',
          }}
        />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-72 md:w-96 h-16 rounded-full bg-gold/15 blur-2xl" />
      </div>

      {/* Top Header Label */}
      <div className="relative z-20 pt-8 text-center">
        <span className="text-xs uppercase tracking-[0.35em] text-gold/80 font-mono font-medium">
          SuperFlow • Autonomous Polyglot Engine
        </span>
      </div>

      {/* 2. THE ARTICULATED MARIONETTE (INDIVIDUALLY GENERATED CONNECTED PARTS) */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto w-full max-w-lg">
        {/* Stage Container */}
        <div
          className="relative w-80 sm:w-96 md:w-[420px] h-[460px] sm:h-[500px] md:h-[540px] flex items-center justify-center filter drop-shadow-[0_30px_50px_rgba(0,0,0,0.95)]"
          style={{
            transform: `rotate(${marionetteSway}deg) translateY(${danceFloatY}px)`,
            transformOrigin: '50% 10%',
          }}
        >
          {/* ==============================================================
              LAYER 1: SILK MARIONETTE THREADS (FLOWING DOWN FROM OUT OF SCREEN)
             ============================================================== */}
          <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <filter id="silkGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor="#fbe389" floodOpacity="0.9" />
                </filter>
              </defs>

              {threadPaths.map((t) => (
                <g key={t.id}>
                  {/* Subtle depth cast */}
                  <path
                    d={t.path}
                    fill="none"
                    stroke="#1a1005"
                    strokeWidth="0.5"
                    strokeOpacity="0.4"
                    transform="translate(0.2, 0.3)"
                  />
                  {/* Glowing Silk Strand */}
                  <path
                    d={t.path}
                    fill="none"
                    stroke="#fff1b8"
                    strokeWidth="0.3"
                    strokeOpacity="0.95"
                    filter="url(#silkGlow)"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* ==============================================================
              LAYER 2: SKELETAL ASSEMBLED PUPPET PARTS
              (Each part generated separately, seamless natural joints)
             ============================================================== */}
          <div
            className="relative w-full h-full overflow-visible"
            style={{ aspectRatio: '900 / 1000' }}
          >
            {/* Part 1: Left Arm & Draped Sleeve (Layered behind shoulder) */}
            <img
              src="/assets/shadow/puppet_left_arm_clean.png"
              alt="Puppet Left Arm"
              className="absolute pointer-events-none select-none z-10"
              style={{
                left: '17.1%',
                top: '26.5%',
                width: '31.2%',
                height: '28.0%',
                objectFit: 'contain',
                transform: `rotate(${leftArmAngle}deg)`,
                transformOrigin: '82% 16%', // Seamless shoulder socket pivot
              }}
            />

            {/* Part 2: Right Arm with Golden Sensu Fan (Layered behind shoulder) */}
            <img
              src="/assets/shadow/puppet_right_arm_clean.png"
              alt="Puppet Right Arm with Fan"
              className="absolute pointer-events-none select-none z-10"
              style={{
                left: '55.0%',
                top: '21.5%',
                width: '26.4%',
                height: '28.0%',
                objectFit: 'contain',
                transform: `rotate(${rightArmAngle}deg)`,
                transformOrigin: '18% 28%', // Seamless shoulder socket pivot
              }}
            />

            {/* Part 3: Skirt & Flowing Kimono Hem (Tucked under obi waist) */}
            <img
              src="/assets/shadow/puppet_skirt_clean.png"
              alt="Puppet Skirt & Hem"
              className="absolute pointer-events-none select-none z-20"
              style={{
                left: '25.4%',
                top: '35.0%',
                width: '49.1%',
                height: '46.0%',
                objectFit: 'contain',
                transform: `rotate(${skirtAngle}deg)`,
                transformOrigin: '50% 12%', // Waist pivot under obi sash
              }}
            />

            {/* Part 4: Torso (Kimono chest, gold brocade, obi sash) */}
            <img
              src="/assets/shadow/puppet_torso_clean.png"
              alt="Puppet Torso"
              className="absolute pointer-events-none select-none z-30"
              style={{
                left: '36.6%',
                top: '25.0%',
                width: '26.7%',
                height: '31.0%',
                objectFit: 'contain',
                transform: `rotate(${torsoTilt}deg) translateY(${torsoY}px)`,
                transformOrigin: '50% 50%',
              }}
            />

            {/* Part 5: Head & Ornate Hairpins (Resting gracefully in V-neckline) */}
            <img
              src="/assets/shadow/puppet_head_clean.png"
              alt="Puppet Head & Kanzashi Hairpins"
              className="absolute pointer-events-none select-none z-40"
              style={{
                left: '37.8%',
                top: '4.0%',
                width: '24.4%',
                height: '28.0%',
                objectFit: 'contain',
                transform: `rotate(${headAngle}deg)`,
                transformOrigin: '50% 90%', // Base of neck pivot
              }}
            />
          </div>
        </div>

        {/* Live Subtitle */}
        <div className="text-center mt-4">
          <span className="text-xs tracking-widest text-gold/90 font-sans font-medium flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
            <span>Classical Court Marionette</span>
          </span>
        </div>
      </div>

      {/* 3. Automatic Ingestion Telemetry Footer (No manual buttons) */}
      <div className="relative z-30 w-full max-w-sm px-6 pb-10 flex flex-col items-center">
        <div className="text-xs font-sans text-cream-light/90 mb-2.5 tracking-wide text-center h-5 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full border border-gold border-t-transparent animate-spin" />
          <span>{loadingStage}</span>
        </div>

        {/* Dynamic Glowing Activity Line */}
        <div className="w-full h-1 rounded-full bg-neutral-900 border border-gold/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

export default DancingWomanLoadingScreen
