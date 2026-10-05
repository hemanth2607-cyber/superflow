import React, { useState, useEffect } from 'react'
import { StageHeader } from './components/ui/StageHeader'
import { AtmosphereBackground } from './components/ui/AtmosphereBackground'
import { Curtain } from './components/ui/Curtain'
import { StageCanvas } from './components/3d/StageCanvas'
import { SuperFlowWelcomeView } from './components/overture/SuperFlowWelcomeView'
import { CastingView } from './components/casting/CastingView'
import { WorkshopView } from './components/workshop/WorkshopView'
import { PremiereView } from './components/premiere/PremiereView'
import { DancingWomanLoadingScreen } from './components/ui/DancingWomanLoadingScreen'
import { useFlowStore } from './stores/useFlowStore'
import { useThemeStore } from './stores/useThemeStore'

export const App: React.FC = () => {
  const { stage } = useFlowStore()
  const { theme } = useThemeStore()
  const [curtainOpen, setCurtainOpen] = useState(false)

  // Dancing woman loading screen active on app startup
  const [isLoading, setIsLoading] = useState(true)

  // Open the stage curtain when loading finishes
  const handleLoadingComplete = () => {
    setIsLoading(false)
    setTimeout(() => {
      setCurtainOpen(true)
    }, 200)
  }

  return (
    <div className={`relative min-h-screen flex flex-col font-sans transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* 1. Dancing Woman Theatrical Loading Page (Turns both directions, shakes & dances) */}
      {isLoading && (
        <DancingWomanLoadingScreen onComplete={handleLoadingComplete} />
      )}

      {/* 2. Stage Velvet/Washi Curtain */}
      <Curtain isOpen={curtainOpen} />

      {/* 3. Parallax Atmospheric Background with 4 Stages */}
      <AtmosphereBackground />

      {/* 4. Stage Header & Navigation Controls */}
      <StageHeader />

      {/* 5. 4-Character Puppet Marionette Theatre Stage */}
      <div className="relative z-10 w-full pt-1">
        <StageCanvas />
      </div>

      {/* 6. Dynamic Experience Flow Stages: Defaults to SuperFlow Welcome Page */}
      <main className="relative z-20 flex-1 flex flex-col justify-center pb-12">
        {stage === 'overture' && <SuperFlowWelcomeView />}
        {stage === 'casting' && <CastingView />}
        {stage === 'workshop' && <WorkshopView />}
        {stage === 'premiere' && <PremiereView />}
      </main>

      {/* 7. Ground Footer with Loading Replay Button */}
      <footer className="relative z-20 py-3 text-center text-xs text-muted/70 font-sans border-t border-border-warm/40 flex items-center justify-between px-6">
        <span>SuperFlow • Intelligent Agent Engine & Marionette Theatre</span>
        <button
          onClick={() => {
            setCurtainOpen(false)
            setIsLoading(true)
          }}
          className="text-[11px] text-gold/80 hover:text-gold hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Replay Loading Dance</span>
          <span>↺</span>
        </button>
      </footer>
    </div>
  )
}

export default App
