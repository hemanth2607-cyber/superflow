import React, { useState, useEffect } from 'react'

interface DancingWomanLoadingScreenProps {
  onComplete: () => void
}

export const DancingWomanLoadingScreen: React.FC<DancingWomanLoadingScreenProps> = ({
  onComplete,
}) => {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Lighting the stage...')
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Real-time animation time
  const [time, setTime] = useState(0)

  // Continuous animation loop for the dancing woman
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

  // Progress timer (runs for ~3.2 seconds total)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.2
        if (next >= 100) {
          clearInterval(interval)
          setStatusText('The stage is set. Welcome to SuperFlow!')
          setTimeout(() => {
            setIsFadingOut(true)
            setTimeout(onComplete, 600)
          }, 300)
          return 100
        }

        if (next > 75) {
          setStatusText('Warming up the SuperFlow Agent Engine...')
        } else if (next > 50) {
          setStatusText('Tuning the marionette silk threads...')
        } else if (next > 25) {
          setStatusText('The dancer takes the stage...')
        }
        return next
      })
    }, 35)

    return () => clearInterval(interval)
  }, [onComplete])

  // Dance physics calculations:
  // 1. Turn in both directions: rotateY turns left (-45deg) and right (+45deg), periodically doing a full twirl
  const turnAngle = Math.sin(time * 2.4) * 45 + Math.sin(time * 1.2) * 20

  // 2. Shake and dance: rapid shimmy and joyful hip sway
  const shakeAngle = Math.sin(time * 9.5) * 4.5 + Math.cos(time * 4.8) * 6.0

  // 3. Dance bounce / vertical step cadence
  const danceBounceY = Math.abs(Math.sin(time * 4.8)) * -18 + Math.cos(time * 2.4) * 6

  // 4. Subtle scale squash-and-stretch
  const scaleSquash = 1.0 + Math.sin(time * 4.8) * 0.04

  // 5. Overhead silk thread attachment points (moving dynamically with her dance turn)
  const threadLeftX = 50 + Math.sin(time * 2.4) * 14 - 8
  const threadRightX = 50 + Math.sin(time * 2.4) * 14 + 8
  const threadHeadX = 50 + Math.sin(time * 2.4) * 6
  const threadHeadY = 32 + danceBounceY * 0.2

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-radial from-[#1e130b] via-[#100b07] to-[#080503] select-none transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 1. Dramatic Stage Spotlight on the Dancing Woman */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Overhead circular golden cone spotlight */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] md:w-[600px] h-[700px] bg-gradient-to-b from-gold/30 via-gold/10 to-transparent blur-3xl opacity-80"
          style={{
            transform: `translateX(-50%) rotate(${Math.sin(time * 0.8) * 4}deg)`,
            transformOrigin: 'top center',
          }}
        />
        {/* Stage floor glow pool */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80 md:w-96 h-20 rounded-full bg-gold/20 blur-2xl" />
      </div>

      {/* 2. Marionette Control Crossbar & Silk Threads */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <filter id="loadingThreadGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor="#f4d375" floodOpacity="0.8" />
            </filter>
            <linearGradient id="loadingWoodBar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2c1a0c" />
              <stop offset="50%" stopColor="#805629" />
              <stop offset="100%" stopColor="#2c1a0c" />
            </linearGradient>
          </defs>

          {/* Overhead Marionette Crossbar */}
          <g>
            <circle cx="50" cy="5" r="1.3" fill="none" stroke="#d4af37" strokeWidth="0.4" />
            <rect x="22" y="6" width="56" height="2.0" rx="1.0" fill="url(#loadingWoodBar)" stroke="#1a0f07" strokeWidth="0.3" />
            <circle cx="22" cy="7" r="1.3" fill="#d4af37" />
            <circle cx="78" cy="7" r="1.3" fill="#d4af37" />
          </g>

          {/* Head Suspension Silk Thread */}
          <path
            d={`M 50 7 Q ${50 + Math.sin(time * 2.4) * 3} ${(7 + threadHeadY) / 2} ${threadHeadX} ${threadHeadY}`}
            fill="none"
            stroke="#fae596"
            strokeWidth="0.35"
            filter="url(#loadingThreadGlow)"
          />
          {/* Left Ribbon / Arm Thread */}
          <path
            d={`M 30 7 Q ${(30 + threadLeftX) / 2} ${(7 + threadHeadY + 12) / 2} ${threadLeftX} ${threadHeadY + 14}`}
            fill="none"
            stroke="#f5d179"
            strokeWidth="0.3"
            filter="url(#loadingThreadGlow)"
          />
          {/* Right Ribbon / Arm Thread */}
          <path
            d={`M 70 7 Q ${(70 + threadRightX) / 2} ${(7 + threadHeadY + 12) / 2} ${threadRightX} ${threadHeadY + 14}`}
            fill="none"
            stroke="#f5d179"
            strokeWidth="0.3"
            filter="url(#loadingThreadGlow)"
          />
        </svg>
      </div>

      {/* 3. The Dancing Woman Character */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto">
        <div
          className="relative w-56 sm:w-64 md:w-72 h-80 sm:h-96 flex items-center justify-center filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]"
          style={{
            transform: `perspective(700px) translateY(${danceBounceY}px) rotateY(${turnAngle}deg) rotateZ(${shakeAngle}deg) scale(${scaleSquash})`,
            transformOrigin: '50% 85%',
            transition: 'transform 0.05s linear',
          }}
        >
          {/* The Dancing Woman Character (Silk Ribbon Celestial Dancer) */}
          <img
            src="/assets/shadow/silk_dancer_clean.png"
            alt="Dancing Woman"
            className="w-full h-full object-contain pointer-events-none select-none"
          />

          {/* Dancing Ribbon Trail Glow Effect */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-gold/15 via-transparent to-transparent opacity-60 rounded-full blur-xl pointer-events-none"
            style={{
              transform: `scale(${1 + Math.abs(Math.sin(time * 3)) * 0.2})`,
            }}
          />
        </div>

        {/* Dancing Character Caption */}
        <div className="text-center mt-2">
          <span className="text-xs uppercase tracking-widest text-gold/80 font-sans font-medium flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
            <span>The Celestial Dancer • SuperFlow Overture</span>
          </span>
        </div>
      </div>

      {/* 4. Theatrical Loading Progress Bar & Status */}
      <div className="relative z-30 w-full max-w-md px-6 pb-12 flex flex-col items-center">
        {/* Status text */}
        <div className="text-sm font-sans text-cream-light/90 mb-3 tracking-wide text-center h-6 transition-all duration-300">
          {statusText}
        </div>

        {/* Golden Progress Bar Container */}
        <div className="w-full h-2.5 rounded-full bg-black/60 border border-gold/30 p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-yellow-200 transition-all duration-100 shadow-[0_0_12px_rgba(212,175,55,0.7)]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Progress percent & Skip button */}
        <div className="w-full flex items-center justify-between text-[11px] text-muted font-sans mt-2">
          <span className="tabular-nums font-mono text-gold/90">{Math.round(progress)}%</span>
          <button
            onClick={() => {
              setIsFadingOut(true)
              setTimeout(onComplete, 400)
            }}
            className="text-muted/70 hover:text-gold transition-colors underline cursor-pointer"
          >
            Enter Stage →
          </button>
        </div>
      </div>
    </div>
  )
}

export default DancingWomanLoadingScreen
