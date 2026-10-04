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
    triggerChineseGesture,
    triggerJapaneseGesture,
  } = usePuppetStore()
  const { playPluck, playClick } = useAudioStore()

  const [swayAngle, setSwayAngle] = useState(0)
  const [armAngle, setArmAngle] = useState(0)
  const [isGesturing, setIsGesturing] = useState(false)

  const isChinese = type === 'chinese'

  // Natural idle breathing sway
  useEffect(() => {
    let frame = 0
    const interval = setInterval(() => {
      frame += 0.05
      setSwayAngle(Math.sin(frame) * 2.8)
      if (mode === 'building') {
        setArmAngle(Math.sin(frame * 4) * 16)
      } else {
        setArmAngle(Math.sin(frame * 2.5) * 5)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [mode])

  // Lean toward hovered archetype
  useEffect(() => {
    if (hoveredType) {
      setSwayAngle(isChinese ? 7 : -7)
    }
  }, [hoveredType, isChinese])

  // Gesture trigger on click
  const triggerGesture = () => {
    playClick()
    playPluck(isChinese ? 'F4' : 'G4')
    setIsGesturing(true)
    if (isChinese) {
      triggerChineseGesture()
    } else {
      triggerJapaneseGesture()
    }
    setTimeout(() => setIsGesturing(false), 1200)
  }

  return (
    <div
      onClick={triggerGesture}
      className={`relative cursor-pointer select-none group flex flex-col items-center filter drop-shadow-xl ${className}`}
      title={`Click ${isChinese ? 'Chinese Opera' : 'Japanese Bunraku'} to trigger gesture`}
    >
      <svg
        viewBox="0 0 260 420"
        className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
        style={{
          transform: `rotate(${swayAngle}deg)`,
          transformOrigin: '130px 24px',
        }}
      >
        {/* ==============================================================
            1. WOODEN CONTROL BAR WITH GOLD FINIALS & SILK TASSEL
            ============================================================== */}
        <g id="control-bar">
          <line x1="50" y1="24" x2="210" y2="24" stroke="#6d4c28" strokeWidth="6.5" strokeLinecap="round" />
          <line x1="130" y1="12" x2="130" y2="36" stroke="#4a3219" strokeWidth="5.5" strokeLinecap="round" />
          {/* Gold Finials */}
          <circle cx="50" cy="24" r="5" fill="var(--gold, #c89532)" />
          <circle cx="210" cy="24" r="5" fill="var(--gold, #c89532)" />
          {/* Silk Tassel on right */}
          <path d="M210 28 v16" stroke="var(--gold, #c89532)" strokeWidth="2.2" />
        </g>

        {/* ==============================================================
            2. FIVE REAL SUSPENSION SILK THREADS
            ============================================================== */}
        <g id="silk-strings" stroke="var(--gold, #c89532)" strokeWidth="1.2" opacity="0.75" strokeDasharray="3 1.5">
          {/* Thread 1: Head */}
          <line x1="130" y1="24" x2="130" y2="105" />
          {/* Thread 2: Left Shoulder */}
          <line x1="95" y1="24" x2="98" y2="175" />
          {/* Thread 3: Right Shoulder */}
          <line x1="165" y1="24" x2="162" y2="175" />
          {/* Thread 4: Left Hand */}
          <line x1="65" y1="24" x2="68" y2={240 + (isGesturing ? (isChinese ? -25 : 20) : armAngle)} />
          {/* Thread 5: Right Hand */}
          <line x1="195" y1="24" x2="192" y2={240 + (isGesturing ? (isChinese ? 25 : -25) : -armAngle)} />
        </g>

        {/* ==============================================================
            3. SEPARATED ARTICULATED BODY PARTS WITHOUT BACKGROUND
            ============================================================== */}

        {isChinese ? (
          /* ============================================================
             CHINESE OPERA MARIONETTE (SEPARATE ARTICULATED PIECES)
             ============================================================ */
          <g id="chinese-marionette">
            {/* PART 1: LOWER PLEATED ROBE / SKIRT (Swinging at waist) */}
            <g id="skirt" style={{ transform: `rotate(${-swayAngle * 0.8}deg)`, transformOrigin: '130px 225px' }}>
              <path
                d="M98 220 L76 345 Q130 365 184 345 L162 220 Z"
                fill="var(--vermilion, #d33828)"
                stroke="#8a1c12"
                strokeWidth="1.8"
              />
              {/* Gold Embroidered Dragon Hem */}
              <path d="M80 332 Q130 350 180 332" fill="none" stroke="var(--gold, #c89532)" strokeWidth="3" />
              {/* Pleats */}
              <line x1="110" y1="225" x2="100" y2="340" stroke="#8a1c12" strokeWidth="1" opacity="0.6" />
              <line x1="130" y1="225" x2="130" y2="350" stroke="#8a1c12" strokeWidth="1" opacity="0.6" />
              <line x1="150" y1="225" x2="160" y2="340" stroke="#8a1c12" strokeWidth="1" opacity="0.6" />
            </g>

            {/* PART 2: TORSO & CHEST */}
            <g id="torso">
              <path d="M102 165 L158 165 L152 225 L108 225 Z" fill="#9e1c12" stroke="#681008" strokeWidth="1.5" />
              {/* Gold Cloud Collar */}
              <path
                d="M100 166 Q130 190 160 166 Q145 205 115 205 Z"
                fill="var(--gold, #c89532)"
                stroke="#8c6218"
                strokeWidth="1.2"
              />
              {/* Waist Brass Joint Pin */}
              <circle cx="130" cy="225" r="3.5" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />
            </g>

            {/* PART 3: HEAD & PHOENIX CROWN (Pivoting at neck) */}
            <g id="head" style={{ transformOrigin: '130px 145px' }}>
              {/* Neck Brass Joint Pin */}
              <circle cx="130" cy="148" r="3.2" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />

              {/* Porcelain Face */}
              <ellipse cx="130" cy="120" rx="20" ry="24" fill="#fff9f2" stroke="#ebd6c5" strokeWidth="1.5" />
              {/* Rouge Blush */}
              <ellipse cx="121" cy="123" rx="4.5" ry="2.5" fill="#f79bb3" opacity="0.65" />
              <ellipse cx="139" cy="123" rx="4.5" ry="2.5" fill="#f79bb3" opacity="0.65" />
              {/* Ink-brush Eyes & Red Lips */}
              <path d="M120 117 Q124 115 126 118" stroke="#231815" strokeWidth="1.8" fill="none" />
              <path d="M134 118 Q136 115 140 117" stroke="#231815" strokeWidth="1.8" fill="none" />
              <ellipse cx="130" cy="131" rx="2.5" ry="1.5" fill="var(--vermilion, #d33828)" />

              {/* Phoenix Crown with Pearls */}
              <path
                d="M105 102 C115 82 145 82 155 102 C145 92 115 92 105 102 Z"
                fill="var(--gold, #c89532)"
                stroke="#8c6218"
                strokeWidth="1.5"
              />
              <circle cx="130" cy="85" r="4.5" fill="var(--gold, #c89532)" />
              <circle cx="116" cy="92" r="3.2" fill="var(--vermilion, #d33828)" />
              <circle cx="144" cy="92" r="3.2" fill="var(--vermilion, #d33828)" />
              {/* Dangling Pearl Strings */}
              <line x1="112" y1="102" x2="110" y2="124" stroke="var(--gold, #c89532)" strokeWidth="1.3" strokeDasharray="2 2" />
              <line x1="148" y1="102" x2="150" y2="124" stroke="var(--gold, #c89532)" strokeWidth="1.3" strokeDasharray="2 2" />
            </g>

            {/* PART 4: LEFT ARM & WATER SLEEVE (Jointed at shoulder and elbow) */}
            <g id="left-arm">
              {/* Left Shoulder Brass Joint Pin */}
              <circle cx="98" cy="172" r="3.5" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />
              {/* Upper Arm */}
              <line x1="98" y1="172" x2="82" y2="210" stroke="var(--vermilion, #d33828)" strokeWidth="10" strokeLinecap="round" />
              {/* Elbow Brass Joint Pin */}
              <circle cx="82" cy="210" r="3.2" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />
              {/* Forearm & Flowing White Silk Water Sleeve */}
              <g style={{ transform: `rotate(${isGesturing ? -30 : -armAngle}deg)`, transformOrigin: '82px 210px' }}>
                <line x1="82" y1="210" x2="68" y2="242" stroke="var(--vermilion, #d33828)" strokeWidth="8" strokeLinecap="round" />
                {/* Porcelain Hand */}
                <circle cx="68" cy="244" r="3.5" fill="#fff9f2" />
                {/* Long White Water Sleeve (*Shui Xiu*) */}
                <path
                  d="M68 244 Q45 285 52 335 Q68 310 74 250 Z"
                  fill="#ffffff"
                  stroke="#dcd0c0"
                  strokeWidth="1.4"
                  opacity="0.92"
                />
              </g>
            </g>

            {/* PART 5: RIGHT ARM & WATER SLEEVE (Jointed at shoulder and elbow) */}
            <g id="right-arm">
              {/* Right Shoulder Brass Joint Pin */}
              <circle cx="162" cy="172" r="3.5" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />
              {/* Upper Arm */}
              <line x1="162" y1="172" x2="178" y2="210" stroke="var(--vermilion, #d33828)" strokeWidth="10" strokeLinecap="round" />
              {/* Elbow Brass Joint Pin */}
              <circle cx="178" cy="210" r="3.2" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />
              {/* Forearm & Flowing White Silk Water Sleeve */}
              <g style={{ transform: `rotate(${isGesturing ? 35 : armAngle}deg)`, transformOrigin: '178px 210px' }}>
                <line x1="178" y1="210" x2="192" y2="242" stroke="var(--vermilion, #d33828)" strokeWidth="8" strokeLinecap="round" />
                {/* Porcelain Hand */}
                <circle cx="192" cy="244" r="3.5" fill="#fff9f2" />
                {/* Long White Water Sleeve */}
                <path
                  d="M192 244 Q215 285 208 335 Q192 310 186 250 Z"
                  fill="#ffffff"
                  stroke="#dcd0c0"
                  strokeWidth="1.4"
                  opacity="0.92"
                />
              </g>
            </g>
          </g>
        ) : (
          /* ============================================================
             JAPANESE BUNRAKU MARIONETTE (SEPARATE ARTICULATED PIECES)
             ============================================================ */
          <g id="japanese-marionette">
            {/* PART 1: LOWER FURISODE KIMONO SKIRT (Swinging at waist) */}
            <g id="skirt" style={{ transform: `rotate(${-swayAngle * 0.8}deg)`, transformOrigin: '130px 225px' }}>
              <path
                d="M98 220 L76 345 Q130 360 184 345 L162 220 Z"
                fill="var(--indigo, #263c63)"
                stroke="#182742"
                strokeWidth="1.8"
              />
              {/* Embroidered Cherry Blossom Pattern */}
              <circle cx="115" cy="290" r="4.5" fill="var(--sakura, #ea7a99)" opacity="0.85" />
              <circle cx="145" cy="315" r="4.5" fill="var(--sakura, #ea7a99)" opacity="0.85" />
              <circle cx="132" cy="265" r="3.5" fill="var(--sakura, #ea7a99)" opacity="0.7" />
            </g>

            {/* PART 2: TORSO & OBI SASH */}
            <g id="torso">
              <path d="M102 165 L158 165 L152 225 L108 225 Z" fill="#1d2e4d" stroke="#121e33" strokeWidth="1.5" />
              {/* Crimson Obi Sash */}
              <rect x="104" y="195" width="52" height="26" fill="var(--vermilion, #d33828)" rx="2" />
              <line x1="104" y1="208" x2="156" y2="208" stroke="var(--gold, #c89532)" strokeWidth="2.5" />
              {/* Obi knot */}
              <ellipse cx="130" cy="208" rx="6" ry="4" fill="var(--gold, #c89532)" />
              {/* Waist Brass Joint Pin */}
              <circle cx="130" cy="225" r="3.5" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />
            </g>

            {/* PART 3: HEAD & KANZASHI (Pivoting at neck) */}
            <g id="head" style={{ transformOrigin: '130px 145px' }}>
              {/* Neck Brass Joint Pin */}
              <circle cx="130" cy="148" r="3.2" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />

              {/* Porcelain Face */}
              <ellipse cx="130" cy="120" rx="19" ry="23" fill="#fff9f2" stroke="#ebd6c5" strokeWidth="1.5" />
              {/* Blush */}
              <ellipse cx="122" cy="123" rx="4" ry="2" fill="#f79bb3" opacity="0.6" />
              <ellipse cx="138" cy="123" rx="4" ry="2" fill="#f79bb3" opacity="0.6" />
              {/* Ink-brush Eyes & Sweet Rose Lips */}
              <path d="M122 117 Q125 116 127 118" stroke="#231815" strokeWidth="1.8" fill="none" />
              <path d="M133 118 Q135 116 138 117" stroke="#231815" strokeWidth="1.8" fill="none" />
              <ellipse cx="130" cy="130" rx="2.2" ry="1.4" fill="var(--vermilion, #d33828)" />

              {/* Traditional Hair Bun & Sakura Kanzashi Hairpin */}
              <path d="M108 112 C106 88 154 88 152 112 C145 98 115 98 108 112 Z" fill="#1a1512" />
              <circle cx="130" cy="88" r="10" fill="#1a1512" />
              {/* Sakura Blossom Pin */}
              <circle cx="142" cy="87" r="4.5" fill="var(--sakura, #ea7a99)" stroke="var(--gold, #c89532)" strokeWidth="1" />
              <line x1="142" y1="91" x2="146" y2="108" stroke="var(--gold, #c89532)" strokeWidth="1.5" />
            </g>

            {/* PART 4: LEFT ARM & KIMONO SLEEVE */}
            <g id="left-arm">
              {/* Left Shoulder Brass Joint Pin */}
              <circle cx="98" cy="172" r="3.5" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />
              {/* Upper Arm */}
              <line x1="98" y1="172" x2="82" y2="210" stroke="var(--indigo, #263c63)" strokeWidth="10" strokeLinecap="round" />
              {/* Elbow Brass Joint Pin */}
              <circle cx="82" cy="210" r="3.2" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />
              {/* Forearm & Furisode Sleeve */}
              <g style={{ transform: `rotate(${isGesturing ? 30 : armAngle}deg)`, transformOrigin: '82px 210px' }}>
                <path
                  d="M82 210 L68 255 L62 300 L88 290 L92 245 Z"
                  fill="var(--indigo, #263c63)"
                  stroke="#182742"
                  strokeWidth="1.4"
                />
                <circle cx="75" cy="265" r="3.2" fill="var(--sakura, #ea7a99)" opacity="0.85" />
                <circle cx="70" cy="250" r="3.5" fill="#fff9f2" />
              </g>
            </g>

            {/* PART 5: RIGHT ARM & GOLD FOLDING FAN */}
            <g id="right-arm">
              {/* Right Shoulder Brass Joint Pin */}
              <circle cx="162" cy="172" r="3.5" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />
              {/* Upper Arm */}
              <line x1="162" y1="172" x2="178" y2="210" stroke="var(--indigo, #263c63)" strokeWidth="10" strokeLinecap="round" />
              {/* Elbow Brass Joint Pin */}
              <circle cx="178" cy="210" r="3.2" fill="#b8860b" stroke="#5c4305" strokeWidth="1" />
              {/* Forearm holding Gold Fan */}
              <g style={{ transform: `rotate(${isGesturing ? -35 : -armAngle}deg)`, transformOrigin: '178px 210px' }}>
                <path
                  d="M178 210 L192 255 L198 300 L172 290 L168 245 Z"
                  fill="var(--indigo, #263c63)"
                  stroke="#182742"
                  strokeWidth="1.4"
                />
                <circle cx="190" cy="250" r="3.5" fill="#fff9f2" />
                {/* Gold Folding Fan (*Sensu*) */}
                <path
                  d="M190 250 C205 230 225 240 225 258 Z"
                  fill="var(--gold, #c89532)"
                  stroke="#8a651f"
                  strokeWidth="1.3"
                />
              </g>
            </g>
          </g>
        )}
      </svg>
    </div>
  )
}
