import React, { useState } from 'react'
import { ArticulatedCutoutPuppet, PuppetCharacterType } from './ArticulatedCutoutPuppet'
import { useFlowStore } from '../../stores/useFlowStore'

export const PuppetStage: React.FC = () => {
  const { stage } = useFlowStore()
  const [selectedCharacter, setSelectedCharacter] = useState<PuppetCharacterType | 'duo'>('duo')

  const isWorkshop = stage === 'workshop'
  const isPremiere = stage === 'premiere'

  const characterTabs: { id: PuppetCharacterType | 'duo'; label: string; tag: string }[] = [
    { id: 'duo', label: 'Duo Stage', tag: 'Traditional' },
    { id: 'chinese', label: 'Chinese Opera', tag: 'Warrior' },
    { id: 'japanese', label: 'Japanese Bunraku', tag: 'Kimono' },
    { id: 'wayang', label: 'Wayang Kulit', tag: 'Shadow Prince' },
    { id: 'dancer', label: 'Silk Dancer', tag: 'Celestial' },
  ]

  return (
    <div className="relative w-full flex flex-col items-center justify-center pointer-events-none select-none">
      {/* 4-Character Selection Bar */}
      {!isWorkshop && (
        <div className="pointer-events-auto mb-2 flex items-center flex-wrap justify-center gap-1.5 px-3 py-1 rounded-full bg-cream-light/80 dark:bg-sumi-800/80 backdrop-blur-md border border-gold/30 shadow-sm text-xs font-sans text-muted">
          <span className="text-[11px] font-medium text-foreground/80 mr-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>Puppet Ensemble:</span>
          </span>

          {characterTabs.map((tab) => {
            const isSelected = selectedCharacter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCharacter(tab.id)}
                className={`px-2.5 py-0.5 rounded-full transition-all text-[11px] cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-gold/30 text-gold-dark dark:text-gold font-semibold shadow-xs border border-gold/40'
                    : 'hover:text-foreground text-muted hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[9px] opacity-70">({tab.tag})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Main Marionette Proscenium Container */}
      <div
        className={`relative w-full flex items-center justify-center transition-all duration-700 ${
          isWorkshop
            ? 'max-w-2xl py-1 opacity-85'
            : isPremiere
            ? 'max-w-3xl py-2'
            : 'max-w-4xl py-3'
        }`}
      >
        {/* DUO MODE: Chinese Opera & Japanese Bunraku side-by-side */}
        {selectedCharacter === 'duo' && (
          <div className="w-full flex items-center justify-center gap-4 md:gap-8">
            <div className="w-48 sm:w-56 md:w-64 flex flex-col items-center">
              <ArticulatedCutoutPuppet type="chinese" />
            </div>
            <div className="hidden sm:flex flex-col items-center justify-center px-2">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
              <span className="text-[9px] text-muted/60 tracking-widest uppercase mt-1">Ensemble</span>
            </div>
            <div className="w-48 sm:w-56 md:w-64 flex flex-col items-center">
              <ArticulatedCutoutPuppet type="japanese" />
            </div>
          </div>
        )}

        {/* SINGLE FOCUS MODES */}
        {selectedCharacter === 'chinese' && (
          <div className="w-64 sm:w-72 md:w-80 mx-auto">
            <ArticulatedCutoutPuppet type="chinese" />
          </div>
        )}

        {selectedCharacter === 'japanese' && (
          <div className="w-64 sm:w-72 md:w-80 mx-auto">
            <ArticulatedCutoutPuppet type="japanese" />
          </div>
        )}

        {selectedCharacter === 'wayang' && (
          <div className="w-64 sm:w-72 md:w-80 mx-auto">
            <ArticulatedCutoutPuppet type="wayang" />
          </div>
        )}

        {selectedCharacter === 'dancer' && (
          <div className="w-64 sm:w-72 md:w-80 mx-auto">
            <ArticulatedCutoutPuppet type="dancer" />
          </div>
        )}
      </div>
    </div>
  )
}

export default PuppetStage
