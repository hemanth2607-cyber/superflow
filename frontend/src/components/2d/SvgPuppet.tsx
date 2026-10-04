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
  const [isGesturing, setIsGesturing] = useState(false)

  const isChinese = type === 'chinese'
  const puppetImg = isChinese
    ? '/assets/shadow/chinese_opera.jpg'
    : '/assets/shadow/japanese_bunraku.jpg'

  // 1. Natural idle breathing sway
  useEffect(() => {
    let frame = 0
    const interval = setInterval(() => {
      frame += 0.05
      setSwayAngle(Math.sin(frame) * 2.5)
    }, 30)
    return () => clearInterval(interval)
  }, [mode])

  // 2. React to hovered flower type (lean toward selection)
  useEffect(() => {
    if (hoveredType) {
      setSwayAngle(isChinese ? 6 : -6)
    }
  }, [hoveredType, isChinese])

  // 3. Gesture trigger on click
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
      className={`relative cursor-pointer transition-transform duration-500 select-none group flex flex-col items-center ${className}`}
      title={`Click ${isChinese ? 'Chinese Opera Marionette' : 'Japanese Bunraku Marionette'} to trigger performance gesture`}
    >
      {/* Overhead Wooden Control Cross Bar */}
      <div className="relative w-36 h-4 mb-1 flex items-center justify-center">
        {/* Wooden Bar */}
        <div className="w-full h-2 rounded-full bg-[#6d4c28] border border-[#4a3219] shadow-md relative">
          {/* Gold Finials on tips */}
          <div className="absolute -left-1.5 -top-1 w-4 h-4 rounded-full bg-gold border border-gold/60 shadow-xs" />
          <div className="absolute -right-1.5 -top-1 w-4 h-4 rounded-full bg-gold border border-gold/60 shadow-xs" />
          {/* Silk chrysanthemum tassel */}
          <div className="absolute right-0 top-3 w-1.5 h-6 bg-gold/90 rounded-full shadow-xs" />
        </div>
      </div>

      {/* Real Silk Marionette Strings (Suspension Lines) */}
      <div className="relative w-full h-12 flex justify-around opacity-60">
        <div className="w-[1px] h-full bg-gold shadow-[0_0_4px_gold]" />
        <div className="w-[1px] h-full bg-gold shadow-[0_0_4px_gold]" />
        <div className="w-[1px] h-full bg-gold shadow-[0_0_4px_gold]" />
      </div>

      {/* Authentic Generated Shadow Puppet Cutout Figure */}
      <div
        className="relative w-48 sm:w-56 rounded-2xl overflow-hidden border-2 border-gold/50 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-gold group-hover:shadow-gold/30"
        style={{
          transform: `rotate(${swayAngle + (isGesturing ? (isChinese ? -8 : 8) : 0)}deg)`,
          transformOrigin: 'top center',
          boxShadow: isGesturing
            ? '0 0 32px var(--gold-glow), 0 12px 36px rgba(0,0,0,0.6)'
            : '0 12px 32px -8px rgba(0,0,0,0.5)',
        }}
      >
        {/* The Authentic Generated High-Resolution Image */}
        <img
          src={puppetImg}
          alt={isChinese ? 'Chinese Opera Shadow Puppet' : 'Japanese Bunraku Shadow Puppet'}
          className="w-full h-auto object-cover filter contrast-[105%] saturate-[110%]"
        />

        {/* Translucent Shadow Screen Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Puppet Role Label Badge */}
        <div className="absolute bottom-2 inset-x-2 text-center py-1 px-2 rounded-lg bg-black/75 backdrop-blur-xs border border-gold/40 text-gold text-[11px] font-display font-semibold flex items-center justify-center gap-1.5">
          <span>{isChinese ? '✦ Chinese Opera' : '✦ Japanese Bunraku'}</span>
        </div>
      </div>

      {/* Interactive Click Hint */}
      <span className="text-[10px] text-muted font-sans mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {isChinese ? 'Click to flick water sleeves' : 'Click to sweep fan'}
      </span>
    </div>
  )
}
