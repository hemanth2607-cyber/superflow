import React, { useEffect, useState } from 'react'
import { useFlowStore } from '../../stores/useFlowStore'

const STAGE_IMAGES: Record<string, string> = {
  sakura: '/assets/shadow/shadow_cherry_blossom.jpg',
  bamboo: '/assets/shadow/shadow_bamboo_grove.jpg',
  wisteria: '/assets/shadow/shadow_stage_background.jpg',
  camellia: '/assets/shadow/shadow_stage_background.jpg',
}

const ALL_IMAGES = [
  '/assets/shadow/shadow_stage_background.jpg',
  '/assets/shadow/shadow_cherry_blossom.jpg',
  '/assets/shadow/shadow_bamboo_grove.jpg',
]

interface Petal {
  id: number
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  opacity: number
}

export const AtmosphereBackground: React.FC = () => {
  const { projectFeel } = useFlowStore()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [petals, setPetals] = useState<Petal[]>([])

  // The active picture is either locked to the chosen feel or auto-rotates
  const activeImage = STAGE_IMAGES[projectFeel] || ALL_IMAGES[currentIdx]

  // Auto-cycle through the shadow puppet stages every 8 seconds if no specific feel override
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % ALL_IMAGES.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  // Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16
      const y = (e.clientY / window.innerHeight - 0.5) * 16
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Floating blossom petals
  useEffect(() => {
    const initialPetals: Petal[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 10 + Math.random() * 14,
      speedX: 0.04 + Math.random() * 0.08,
      speedY: 0.08 + Math.random() * 0.16,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      opacity: 0.35 + Math.random() * 0.45,
    }))
    setPetals(initialPetals)

    let animationFrameId: number
    const animatePetals = () => {
      setPetals((prev) =>
        prev.map((p) => {
          let ny = p.y + p.speedY
          let nx = p.x + p.speedX + Math.sin(ny * 0.05) * 0.05
          if (ny > 105) ny = -5
          if (nx > 105) nx = -5
          return {
            ...p,
            x: nx,
            y: ny,
            rotation: p.rotation + p.rotationSpeed,
          }
        })
      )
      animationFrameId = requestAnimationFrame(animatePetals)
    }

    animationFrameId = requestAnimationFrame(animatePetals)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* 1. Sharp, high-resolution Japanese & Chinese Shadow Puppet Stage Pictures */}
      {ALL_IMAGES.map((src) => {
        const isCurrent = src === activeImage
        return (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url("${encodeURI(src)}")`,
              opacity: isCurrent ? 0.65 : 0,
              filter: 'saturate(115%) contrast(105%)',
              transform: `scale(1.04) translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.3}px, 0)`,
            }}
          />
        )
      })}

      {/* 2. Soft translucent parchment vignette so the picture is clearly visible while text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-canvas/60 via-canvas/30 to-canvas/75 backdrop-blur-[0.5px] transition-colors duration-500" />

      {/* 3. Floating blossom petals */}
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full transition-transform will-change-transform"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size * 0.65}px`,
            backgroundColor: 'var(--sakura)',
            opacity: p.opacity,
            boxShadow: '0 0 8px var(--sakura-glow)',
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: '60% 40% 70% 30% / 60% 30% 70% 40%',
          }}
        />
      ))}
    </div>
  )
}
