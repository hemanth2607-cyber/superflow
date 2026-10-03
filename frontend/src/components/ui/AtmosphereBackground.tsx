import React, { useEffect, useState } from 'react'

const BACKGROUND_IMAGES = [
  '/assets/bg/Sunlit Cherry Blossom Canopy.png',
  '/assets/bg/c9aee81b-2c6c-41f1-971e-a3dacb333e79.png',
  '/assets/bg/1ffcf119-74a3-4ebe-898f-87e9b2e9912c.png',
  '/assets/bg/48da6794-10b3-4c52-a989-be26859270ae.png',
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
  const [currentIdx, setCurrentIdx] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [petals, setPetals] = useState<Petal[]>([])

  // 1. Cross-fade between the 4 photos every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % BACKGROUND_IMAGES.length)
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  // 2. Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // 3. Floating blossom petals generator
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
      {/* 1. Cross-fading blurred photo layers */}
      {BACKGROUND_IMAGES.map((src, index) => {
        const isActive = index === currentIdx
        return (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[3000ms] ease-in-out"
            style={{
              backgroundImage: `url("${encodeURI(src)}")`,
              opacity: isActive ? 0.28 : 0,
              filter: 'blur(36px) saturate(135%)',
              transform: `scale(1.15) translate3d(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px, 0)`,
            }}
          />
        )
      })}

      {/* 2. Theme-tinted translucent wash */}
      <div className="absolute inset-0 bg-canvas/85 transition-colors duration-500" />

      {/* 3. Mid-ground bamboo silhouettes */}
      <div
        className="absolute inset-x-0 bottom-0 h-96 opacity-15 dark:opacity-20 pointer-events-none transition-transform duration-700"
        style={{
          transform: `translate3d(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.2}px, 0)`,
        }}
      >
        <svg viewBox="0 0 1440 320" className="w-full h-full fill-current text-bamboo" preserveAspectRatio="none">
          <path d="M0,320 L15,180 L22,320 L120,320 L135,140 L145,320 L280,320 L295,190 L305,320 L510,320 L530,110 L545,320 L760,320 L780,160 L795,320 L1020,320 L1040,130 L1055,320 L1240,320 L1260,170 L1275,320 L1440,320 Z" />
          <path d="M22,230 C45,210 65,195 85,190 C70,210 50,230 22,230 Z" />
          <path d="M145,200 C175,180 195,160 215,150 C190,180 170,205 145,200 Z" />
          <path d="M545,180 C585,150 610,130 635,120 C600,160 575,185 545,180 Z" />
          <path d="M795,220 C830,190 855,175 880,165 C850,200 825,225 795,220 Z" />
          <path d="M1055,190 C1090,160 1120,145 1150,135 C1115,175 1085,200 1055,190 Z" />
        </svg>
      </div>

      {/* 4. Bottom edge of swaying brown grass blades with wind motion */}
      <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none opacity-40 dark:opacity-50 overflow-hidden">
        <svg
          viewBox="0 0 1440 120"
          className="w-full h-full fill-current text-[#a08055] dark:text-[#5c4a32] animate-pulse"
          style={{ animationDuration: '6s' }}
          preserveAspectRatio="none"
        >
          <path d="M0,120 L5,40 L15,120 L30,50 L45,120 L70,30 L85,120 L110,60 L130,120 L160,35 L180,120 L210,55 L230,120 L260,25 L285,120 L320,45 L345,120 L380,30 L405,120 L440,65 L465,120 L500,20 L525,120 L560,40 L585,120 L620,30 L645,120 L680,60 L705,120 L740,25 L765,120 L800,45 L825,120 L860,35 L885,120 L920,55 L945,120 L980,20 L1005,120 L1040,40 L1065,120 L1100,30 L1125,120 L1160,60 L1185,120 L1220,25 L1245,120 L1280,45 L1305,120 L1340,35 L1365,120 L1400,50 L1420,120 L1440,120 Z" />
        </svg>
      </div>

      {/* 5. Floating instanced blossom petals */}
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
