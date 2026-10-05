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

  // Progress timer (~3.0 seconds total)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.25
        if (next >= 100) {
          clearInterval(interval)
          setStatusText('Welcome to SuperFlow')
          setTimeout(() => {
            setIsFadingOut(true)
            setTimeout(onComplete, 500)
          }, 250)
          return 100
        }

        if (next > 75) {
          setStatusText('Starting SuperFlow Engine...')
        } else if (next > 50) {
          setStatusText('Tuning marionette strings...')
        } else if (next > 25) {
          setStatusText('The dancer takes the stage...')
        }
        return next
      })
    }, 35)

    return () => clearInterval(interval)
  }, [onComplete])

  // Dance physics:
  // 1. Turns in both directions: turns left, turns right (-50deg to +50deg)
  const turnAngle = Math.sin(time * 2.8) * 45 + Math.sin(time * 1.4) * 15

  // 2. Shake and dance: rapid hip shimmy & ribbon shake
  const shakeAngle = Math.sin(time * 11.0) * 5.0 + Math.cos(time * 5.5) * 6.0

  // 3. Cadenced dancing bounce
  const danceBounceY = Math.abs(Math.sin(time * 5.5)) * -22 + Math.cos(time * 2.8) * 6

  // 4. Squash and stretch
  const scaleSquash = 1.0 + Math.sin(time * 5.5) * 0.04

  // 5. Dynamic thread tracking
  const threadLeftX = 50 + Math.sin(time * 2.8) * 16 - 10
  const threadRightX = 50 + Math.sin(time * 2.8) * 16 + 10
  const threadHeadX = 50 + Math.sin(time * 2.8) * 8
  const threadHeadY = 28 + danceBounceY * 0.22

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-black select-none transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 1. Subtle Dramatic Spotlight on Black Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Overhead warm golden cone of light */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[380px] md:w-[520px] h-[650px] bg-gradient-to-b from-amber-500/25 via-gold/10 to-transparent blur-3xl opacity-75"
          style={{
            transform: `translateX(-50%) rotate(${Math.sin(time * 0.7) * 3}deg)`,
            transformOrigin: 'top center',
          }}
        />
        {/* Stage floor pool of light */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-72 md:w-88 h-16 rounded-full bg-gold/15 blur-2xl" />
      </div>

      {/* 2. Marionette Control Bar & Golden Silk Threads */}
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
            d={`M 50 7 Q ${50 + Math.sin(time * 2.8) * 4} ${(7 + threadHeadY) / 2} ${threadHeadX} ${threadHeadY}`}
            fill="none"
            stroke="#fae596"
            strokeWidth="0.35"
            filter="url(#loadingThreadGlow)"
          />
          {/* Left Ribbon / Arm Thread */}
          <path
            d={`M 30 7 Q ${(30 + threadLeftX) / 2} ${(7 + threadHeadY + 14) / 2} ${threadLeftX} ${threadHeadY + 16}`}
            fill="none"
            stroke="#f5d179"
            strokeWidth="0.3"
            filter="url(#loadingThreadGlow)"
          />
          {/* Right Ribbon / Arm Thread */}
          <path
            d={`M 70 7 Q ${(70 + threadRightX) / 2} ${(7 + threadHeadY + 14) / 2} ${threadRightX} ${threadHeadY + 16}`}
            fill="none"
            stroke="#f5d179"
            strokeWidth="0.3"
            filter="url(#loadingThreadGlow)"
          />
        </svg>
      </div>

      {/* Top Spacer / Brand */}
      <div className="relative z-20 pt-8 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-gold/80 font-mono font-medium">
          SuperFlow • Opening Ceremony
        </span>
      </div>

      {/* 3. The Dancing Woman Character (Turns both sides, shakes & dances) */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto">
        <div
          className="relative w-64 sm:w-72 md:w-80 h-88 sm:h-96 flex items-center justify-center filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)]"
          style={{
            transform: `perspective(750px) translateY(${danceBounceY}px) rotateY(${turnAngle}deg) rotateZ(${shakeAngle}deg) scale(${scaleSquash})`,
            transformOrigin: '50% 85%',
            transition: 'transform 0.04s linear',
          }}
        >
          {/* The Dancing Woman Character - Clean Transparent (All white spaces removed) */}
          <img
            src="/assets/shadow/silk_dancer_clean.png"
            alt="Dancing Woman Character"
            className="w-full h-full object-contain pointer-events-none select-none"
          />

          {/* Golden Ribbon Glow Halo */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-gold/20 via-transparent to-transparent opacity-70 rounded-full blur-2xl pointer-events-none"
            style={{
              transform: `scale(${1 + Math.abs(Math.sin(time * 3.5)) * 0.25})`,
            }}
          />
        </div>

        {/* Dancing Character Caption */}
        <div className="text-center mt-3">
          <span className="text-xs tracking-widest text-gold/90 font-sans font-medium flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
            <span>The Celestial Dancer</span>
          </span>
        </div>
      </div>

      {/* 4. Theatrical Loading Progress Bar */}
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
