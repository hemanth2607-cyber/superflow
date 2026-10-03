import React, { useState, useEffect } from 'react'
import { usePuppetStore } from '../../stores/usePuppetStore'
import { useAudioStore } from '../../stores/useAudioStore'

interface PuppetProps {
  type: 'chinese' | 'japanese'
  className?: string
}

export const SvgPuppet: React.FC<PuppetProps> = ({ type, className = '' }) => {
  const {
    hoveredType,
    mode,
    chineseGestureCounter,
    japaneseGestureCounter,
    triggerChineseGesture,
    triggerJapaneseGesture,
  } = usePuppetStore()
  const { playPluck, playClick } = useAudioStore()

  const [swayAngle, setSwayAngle] = useState(0)
  const [armAngle, setArmAngle] = useState(0)
  const [isGesturing, setIsGesturing] = useState(false)

  // 1. Natural idle breathing sway
  useEffect(() => {
    let frame = 0
    const interval = setInterval(() => {
      frame += 0.05
      setSwayAngle(Math.sin(frame) * 3)
      if (mode === 'building') {
        // Hands pulling threads up and down rhythmically
        setArmAngle(Math.sin(frame * 4) * 18)
      } else {
        setArmAngle(Math.sin(frame) * 4)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [mode])

  // 2. React to hovered flower type (lean toward selection)
  useEffect(() => {
    if (hoveredType) {
      setSwayAngle(type === 'chinese' ? 8 : -8)
    }
  }, [hoveredType, type])

  // 3. Gesture trigger
  const triggerGesture = () => {
    playClick()
    playPluck(type === 'chinese' ? 'F4' : 'G4')
    setIsGesturing(true)
    if (type === 'chinese') {
      triggerChineseGesture()
    } else {
      triggerJapaneseGesture()
    }
    setTimeout(() => setIsGesturing(false), 1400)
  }

  const isChinese = type === 'chinese'

  return (
    <div
      onClick={triggerGesture}
      className={`relative cursor-pointer transition-transform duration-500 select-none group ${className}`}
      title={`Click ${isChinese ? 'Chinese Opera Marionette (Sleeve flick)' : 'Japanese Marionette (Fan sweep)'}`}
    >
      <svg
        viewBox="0 0 240 380"
        className="w-full h-auto filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        style={{
          transform: `rotate(${swayAngle}deg)`,
          transformOrigin: '120px 20px',
        }}
      >
        {/* === 1. Wooden Control Cross Bar === */}
        <g id="control-bar">
          <line x1="60" y1="20" x2="180" y2="20" stroke="#7a5530" strokeWidth="6" strokeLinecap="round" />
          <line x1="120" y1="8" x2="120" y2="32" stroke="#5a3d20" strokeWidth="5" strokeLinecap="round" />
          {/* Gold Finials */}
          <circle cx="60" cy="20" r="4.5" fill="var(--gold, #c89532)" />
          <circle cx="180" cy="20" r="4.5" fill="var(--gold, #c89532)" />
          {/* Tassel on right */}
          <path d="M180 24 v14" stroke="var(--gold, #c89532)" strokeWidth="1.8" />
        </g>

        {/* === 2. Five Silk Threads (Verlet Ropes) === */}
        <g id="silk-strings" opacity="0.65" stroke="var(--gold, #c89532)" strokeWidth="1.1" strokeDasharray="2 1">
          {/* Head string */}
          <line x1="120" y1="20" x2="120" y2="100" />
          {/* Left shoulder */}
          <line x1="85" y1="20" x2="90" y2="160" />
          {/* Right shoulder */}
          <line x1="155" y1="20" x2="150" y2="160" />
          {/* Left hand string */}
          <line x1="70" y1="20" x2="65" y2={210 + armAngle} />
          {/* Right hand string */}
          <line x1="170" y1="20" x2="175" y2={210 - armAngle} />
        </g>

        {/* === 3. Puppet Body === */}
        {isChinese ? (
          /* ==============================================================
             CHINESE OPERA PUPPET (Vermilion Robe, Phoenix Crown, Water Sleeves)
             ============================================================== */
          <g id="chinese-puppet">
            {/* Long Crimson Robe / Hem */}
            <path
              d="M90 170 L70 310 Q120 330 170 310 L150 170 Z"
              fill="var(--vermilion, #d33828)"
              stroke="#8a1c12"
              strokeWidth="2"
            />
            {/* Gold Embroidered Dragon/Cloud Hem */}
            <path
              d="M75 295 Q120 315 165 295"
              fill="none"
              stroke="var(--gold, #c89532)"
              strokeWidth="3.5"
            />
            {/* Water Sleeves (Left & Right - Long white flowing silk) */}
            <g style={{ transform: `rotate(${isGesturing ? -25 : -armAngle * 0.8}deg)`, transformOrigin: '90px 165px' }}>
              <path
                d="M90 165 L60 220 Q50 270 55 300 L75 290 L85 220 Z"
                fill="#fdfbf7"
                stroke="#d6cbbe"
                strokeWidth="1.5"
              />
            </g>
            <g style={{ transform: `rotate(${isGesturing ? 35 : armAngle * 0.8}deg)`, transformOrigin: '150px 165px' }}>
              <path
                d="M150 165 L180 220 Q190 270 185 300 L165 290 L155 220 Z"
                fill="#fdfbf7"
                stroke="#d6cbbe"
                strokeWidth="1.5"
              />
            </g>

            {/* Torso & Cloud Collar */}
            <path d="M92 145 L148 145 L140 200 L100 200 Z" fill="#9e1c12" />
            <path
              d="M90 148 Q120 170 150 148 Q135 185 105 185 Z"
              fill="var(--gold, #c89532)"
              stroke="#8c6218"
              strokeWidth="1"
            />

            {/* Porcelain Head & Blush */}
            <ellipse cx="120" cy="115" rx="20" ry="24" fill="#fff9f2" stroke="#ebd6c5" strokeWidth="1.5" />
            <ellipse cx="111" cy="118" rx="4.5" ry="2.5" fill="#f79bb3" opacity="0.6" />
            <ellipse cx="129" cy="118" rx="4.5" ry="2.5" fill="#f79bb3" opacity="0.6" />

            {/* Ink-brush Eyes & Red Lips */}
            <path d="M110 112 Q114 110 116 113" stroke="#231815" strokeWidth="1.8" fill="none" />
            <path d="M124 113 Q126 110 130 112" stroke="#231815" strokeWidth="1.8" fill="none" />
            <ellipse cx="120" cy="126" rx="2.5" ry="1.5" fill="var(--vermilion, #d33828)" />

            {/* Phoenix Crown with pearls and gold ornaments */}
            <path
              d="M96 98 C105 80 135 80 144 98 C135 88 105 88 96 98 Z"
              fill="var(--gold, #c89532)"
              stroke="#8c6218"
              strokeWidth="1.5"
            />
            <circle cx="120" cy="82" r="4.5" fill="var(--gold, #c89532)" />
            <circle cx="106" cy="88" r="3.2" fill="var(--vermilion, #d33828)" />
            <circle cx="134" cy="88" r="3.2" fill="var(--vermilion, #d33828)" />
            {/* Dangling Crown Beads */}
            <line x1="102" y1="96" x2="100" y2="114" stroke="var(--gold, #c89532)" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
            <line x1="138" y1="96" x2="140" y2="114" stroke="var(--gold, #c89532)" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
          </g>
        ) : (
          /* ==============================================================
             JAPANESE MARIONETTE (Indigo Furisode Kimono, Red Obi, Kanzashi)
             ============================================================== */
          <g id="japanese-puppet">
            {/* Indigo Furisode Kimono */}
            <path
              d="M92 170 L72 310 Q120 325 168 310 L148 170 Z"
              fill="var(--indigo, #263c63)"
              stroke="#182742"
              strokeWidth="2"
            />
            {/* Kimono Long Sleeves */}
            <g style={{ transform: `rotate(${isGesturing ? 30 : armAngle * 0.7}deg)`, transformOrigin: '92px 165px' }}>
              <path
                d="M92 165 L68 220 L62 280 L88 270 L98 215 Z"
                fill="var(--indigo, #263c63)"
                stroke="#182742"
                strokeWidth="1.5"
              />
              {/* Sakura blossom print on sleeve */}
              <circle cx="75" cy="245" r="3" fill="var(--sakura, #ea7a99)" opacity="0.8" />
            </g>
            <g style={{ transform: `rotate(${isGesturing ? -35 : -armAngle * 0.7}deg)`, transformOrigin: '148px 165px' }}>
              <path
                d="M148 165 L172 220 L178 280 L152 270 L142 215 Z"
                fill="var(--indigo, #263c63)"
                stroke="#182742"
                strokeWidth="1.5"
              />
              {/* Gold Folding Fan in hand */}
              <path
                d="M172 220 C185 200 205 210 205 228 Z"
                fill="var(--gold, #c89532)"
                stroke="#8a651f"
                strokeWidth="1.2"
              />
            </g>

            {/* Crimson Obi & Obi-dome Bow */}
            <rect x="94" y="190" width="52" height="28" fill="var(--vermilion, #d33828)" rx="2" />
            <line x1="94" y1="204" x2="146" y2="204" stroke="var(--gold, #c89532)" strokeWidth="2.5" />
            {/* Obi Bow knot */}
            <ellipse cx="120" cy="204" rx="6" ry="4" fill="var(--gold, #c89532)" />

            {/* Porcelain Head & Blush */}
            <ellipse cx="120" cy="115" rx="19" ry="23" fill="#fff9f2" stroke="#ebd6c5" strokeWidth="1.5" />
            <ellipse cx="112" cy="118" rx="4" ry="2" fill="#f79bb3" opacity="0.55" />
            <ellipse cx="128" cy="118" rx="4" ry="2" fill="#f79bb3" opacity="0.55" />

            {/* Ink-brush Eyes & Sweet Rose Lips */}
            <path d="M112 112 Q115 111 117 113" stroke="#231815" strokeWidth="1.8" fill="none" />
            <path d="M123 113 Q125 111 128 112" stroke="#231815" strokeWidth="1.8" fill="none" />
            <ellipse cx="120" cy="125" rx="2.2" ry="1.4" fill="var(--vermilion, #d33828)" />

            {/* Japanese Hair & Sakura Kanzashi Hairpin */}
            <path
              d="M98 108 C96 85 144 85 142 108 C135 95 105 95 98 108 Z"
              fill="#1a1512"
            />
            {/* High Bun */}
            <circle cx="120" cy="85" r="10" fill="#1a1512" />
            {/* Sakura Kanzashi pin */}
            <circle cx="132" cy="84" r="4.5" fill="var(--sakura, #ea7a99)" stroke="var(--gold, #c89532)" strokeWidth="1" />
            <line x1="132" y1="88" x2="136" y2="105" stroke="var(--gold, #c89532)" strokeWidth="1.5" />
            <circle cx="136" cy="106" r="1.5" fill="var(--gold, #c89532)" />
          </g>
        )}

        {/* Small puppet hint on hover */}
        <text
          x="120"
          y="360"
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize="11"
          fontFamily="Bricolage Grotesque"
          className="opacity-0 group-hover:opacity-85 transition-opacity duration-300"
        >
          {isChinese ? 'Click to flick sleeves' : 'Click to sweep fan'}
        </text>
      </svg>
    </div>
  )
}
