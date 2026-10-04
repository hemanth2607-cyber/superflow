import React from 'react'

interface CurtainProps {
  isOpen: boolean
  onAnimationEnd?: () => void
}

export const Curtain: React.FC<CurtainProps> = ({ isOpen }) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 transition-opacity duration-1000 ${
        isOpen ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* Left Curtain Wing */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#7a141a] dark:bg-[#4a0d11] transition-transform duration-1200 ease-[cubic-bezier(0.77,0,0.175,1)] shadow-2xl border-r-4 border-gold/60"
        style={{
          transform: isOpen ? 'translateX(-102%)' : 'translateX(0%)',
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 36px, rgba(0,0,0,0.2) 36px, rgba(0,0,0,0.2) 72px)',
        }}
      >
        {/* Gold curtain hem cord */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-32 rounded-full bg-gold shadow-lg" />
      </div>

      {/* Right Curtain Wing */}
      <div
        className="absolute top-0 bottom-0 right-0 w-1/2 bg-[#7a141a] dark:bg-[#4a0d11] transition-transform duration-1200 ease-[cubic-bezier(0.77,0,0.175,1)] shadow-2xl border-l-4 border-gold/60"
        style={{
          transform: isOpen ? 'translateX(102%)' : 'translateX(0%)',
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 36px, rgba(0,0,0,0.2) 36px, rgba(0,0,0,0.2) 72px)',
        }}
      >
        {/* Gold curtain hem cord */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-32 rounded-full bg-gold shadow-lg" />
      </div>

      {/* Overhead Stage Pelmet / Valance with gold embroidery */}
      <div
        className="absolute top-0 inset-x-0 h-16 bg-[#5e0f14] dark:bg-[#380a0d] border-b-2 border-gold/70 shadow-md flex items-center justify-center transition-transform duration-700"
        style={{
          transform: isOpen ? 'translateY(-100%)' : 'translateY(0%)',
        }}
      >
        <div className="text-gold/80 font-display text-sm tracking-widest uppercase">
          ✦ SuperFlow Project Starter ✦
        </div>
      </div>
    </div>
  )
}
