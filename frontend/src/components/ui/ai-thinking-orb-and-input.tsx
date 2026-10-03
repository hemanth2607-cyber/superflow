import React, { useEffect, useState } from 'react'
import { useBuildStore, BuildPhase } from '../../stores/useBuildStore'

interface ThinkingOrbProps {
  className?: string
}

export const AIThinkingOrbAndInput: React.FC<ThinkingOrbProps> = ({ className = '' }) => {
  const { phase, label, progress } = useBuildStore()
  const isDone = phase === 'done'

  const [dots, setDots] = useState<Array<{ x: number; y: number; size: number; delay: number }>>([])

  // Generate constellation dots on the sphere
  useEffect(() => {
    const generated = Array.from({ length: 36 }).map((_, i) => {
      const angle = (i / 36) * Math.PI * 2
      const radius = 28 + (i % 3) * 6
      return {
        x: 48 + Math.cos(angle) * radius,
        y: 48 + Math.sin(angle) * radius,
        size: 1.5 + (i % 3) * 1,
        delay: (i % 6) * 0.3,
      }
    })
    setDots(generated)
  }, [])

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      {/* Blooming Dotted Sphere */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Glow halo */}
        <div
          className={`absolute inset-0 rounded-full blur-xl transition-all duration-1000 ${
            isDone ? 'bg-bamboo/30 scale-90' : 'bg-sakura/35 scale-110 animate-pulse'
          }`}
        />

        {/* Outer Rotating Dotted Constellation Ring */}
        <svg
          viewBox="0 0 96 96"
          className={`w-full h-full transition-transform duration-1000 ${
            isDone ? 'rotate-0 scale-90' : 'animate-[spin_16s_linear_infinite]'
          }`}
        >
          {dots.map((dot, idx) => (
            <circle
              key={idx}
              cx={dot.x}
              cy={dot.y}
              r={dot.size}
              fill={isDone ? 'var(--bamboo, #3d8050)' : 'var(--sakura, #ea7a99)'}
              opacity={0.7}
              className={!isDone ? 'animate-pulse' : ''}
              style={{ animationDelay: `${dot.delay}s` }}
            />
          ))}
        </svg>

        {/* Central Core Sphere with Light Sweep */}
        <div
          className={`absolute w-16 h-16 rounded-full transition-all duration-700 flex items-center justify-center overflow-hidden border shadow-lg ${
            isDone
              ? 'bg-gradient-to-tr from-bamboo to-[#74c489] border-bamboo/60 scale-95'
              : 'bg-gradient-to-tr from-sakura to-[#fca5be] border-sakura/60 scale-100'
          }`}
        >
          {/* Light Sweep Sheen */}
          <div
            className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform ${
              !isDone ? 'animate-[translate_2s_ease-in-out_infinite]' : 'opacity-0'
            }`}
            style={{
              transform: 'skewX(-25deg)',
            }}
          />

          {/* Progress Percent or Check */}
          <span className="relative z-10 text-white font-mono text-xs font-bold drop-shadow-xs">
            {isDone ? '✓' : `${progress}%`}
          </span>
        </div>
      </div>

      {/* Cycling Label */}
      <div className="mt-4 text-center">
        <div
          className={`font-display font-bold text-base transition-colors duration-500 ${
            isDone ? 'text-bamboo' : 'text-ink'
          }`}
        >
          {label}
        </div>
        <div className="text-xs text-muted font-sans mt-0.5">
          {phase === 'thinking' && 'Contemplating architecture & seasonal motifs...'}
          {phase === 'gathering' && 'Collecting hand-selected files & dependencies...'}
          {phase === 'weaving' && 'Binding silk threads and assembling layout components...'}
          {phase === 'pruning' && 'Refining aesthetic balance and perfecting typography...'}
          {phase === 'done' && 'The production is fully built and ready for the stage.'}
        </div>
      </div>
    </div>
  )
}
