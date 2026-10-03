import React from 'react'
import { SvgPuppet } from './SvgPuppet'
import { useFlowStore } from '../../stores/useFlowStore'

export const FallbackStage: React.FC = () => {
  const { stage } = useFlowStore()

  // In Workshop stage, puppets scale down gracefully to the upper corners
  const isWorkshop = stage === 'workshop'

  return (
    <div
      className={`relative w-full flex items-center justify-between pointer-events-none transition-all duration-700 ${
        isWorkshop ? 'max-w-2xl mx-auto py-2 opacity-90' : 'max-w-4xl mx-auto py-6'
      }`}
    >
      {/* Left Puppet: Chinese Opera */}
      <div className={`pointer-events-auto transition-all duration-700 ${isWorkshop ? 'w-36 -ml-4' : 'w-56 md:w-64'}`}>
        <SvgPuppet type="chinese" />
      </div>

      {/* Center Stage Thread Anchor Indicator */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {/* Subtle decorative thread line */}
        <div className="w-full max-w-xs h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>

      {/* Right Puppet: Japanese Furisode */}
      <div className={`pointer-events-auto transition-all duration-700 ${isWorkshop ? 'w-36 -mr-4' : 'w-56 md:w-64'}`}>
        <SvgPuppet type="japanese" />
      </div>
    </div>
  )
}
