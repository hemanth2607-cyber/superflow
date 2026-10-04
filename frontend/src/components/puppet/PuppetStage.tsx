import React, { useState } from 'react'
import { ArticulatedCutoutPuppet } from './ArticulatedCutoutPuppet'
import { useFlowStore } from '../../stores/useFlowStore'

export const PuppetStage: React.FC = () => {
  const { stage } = useFlowStore()
  const [viewMode, setViewMode] = useState<'both' | 'chinese' | 'japanese'>('both')

  const isWorkshop = stage === 'workshop'
  const isPremiere = stage === 'premiere'

  return (
    <div className="relative w-full flex flex-col items-center justify-center pointer-events-none select-none">
      {/* Subtle stage control pill to switch focus if desired */}
      {!isWorkshop && (
        <div className="pointer-events-auto mb-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-light/80 dark:bg-sumi-800/80 backdrop-blur-md border border-gold/30 shadow-sm text-xs font-sans text-muted">
          <span className="text-[11px] font-medium text-foreground/80 mr-1">Shadow Puppet:</span>
          <button
            onClick={() => setViewMode('chinese')}
            className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
              viewMode === 'chinese'
                ? 'bg-crimson text-white font-medium shadow-xs'
                : 'hover:text-foreground text-muted'
            }`}
          >
            Chinese Opera
          </button>
          <button
            onClick={() => setViewMode('both')}
            className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
              viewMode === 'both'
                ? 'bg-gold/30 text-gold-dark dark:text-gold font-semibold'
                : 'hover:text-foreground text-muted'
            }`}
          >
            Both
          </button>
          <button
            onClick={() => setViewMode('japanese')}
            className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
              viewMode === 'japanese'
                ? 'bg-indigo-600 text-white font-medium shadow-xs'
                : 'hover:text-foreground text-muted'
            }`}
          >
            Japanese Bunraku
          </button>
        </div>
      )}

      {/* Main Marionette Proscenium Container */}
      <div
        className={`relative w-full flex items-center justify-center transition-all duration-700 ${
          isWorkshop
            ? 'max-w-2xl py-1 opacity-85'
            : isPremiere
            ? 'max-w-3xl py-2'
            : 'max-w-4xl py-4'
        }`}
      >
        {/* Left / Center Puppet: Chinese Opera Shadow Puppet (Attached Image) */}
        {(viewMode === 'both' || viewMode === 'chinese') && (
          <div
            className={`transition-all duration-500 flex flex-col items-center ${
              viewMode === 'chinese'
                ? 'w-72 md:w-80 mx-auto'
                : isWorkshop
                ? 'w-36 md:w-44 -mr-4'
                : 'w-56 md:w-64 mx-4'
            }`}
          >
            <ArticulatedCutoutPuppet type="chinese" />
          </div>
        )}

        {/* Center Golden Stage Beam (Visible in 'both' mode) */}
        {viewMode === 'both' && !isWorkshop && (
          <div className="hidden sm:flex flex-1 flex-col items-center justify-center px-4">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            <span className="text-[10px] text-muted/60 tracking-widest uppercase mt-1">
              Suspended Marionettes
            </span>
          </div>
        )}

        {/* Right / Center Puppet: Japanese Bunraku Shadow Puppet */}
        {(viewMode === 'both' || viewMode === 'japanese') && (
          <div
            className={`transition-all duration-500 flex flex-col items-center ${
              viewMode === 'japanese'
                ? 'w-72 md:w-80 mx-auto'
                : isWorkshop
                ? 'w-36 md:w-44 -ml-4'
                : 'w-56 md:w-64 mx-4'
            }`}
          >
            <ArticulatedCutoutPuppet type="japanese" />
          </div>
        )}
      </div>
    </div>
  )
}

export default PuppetStage
