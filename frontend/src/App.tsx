import React, { useState } from 'react'
import { StageHeader } from './components/ui/StageHeader'
import { AtmosphereBackground } from './components/ui/AtmosphereBackground'
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

  // The ONLY puppet in the app: Dancing puppet on loading screen (black background)
  // Per user instruction: all other screens have zero puppets until requested!
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative min-h-screen flex flex-col font-sans transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* 1. The ONLY puppet: Dancing Woman Theatrical Loading Page (Black background, dancing in both directions) */}
      {isLoading && (
        <DancingWomanLoadingScreen onComplete={handleLoadingComplete} />
      )}

      {/* 2. Parallax Atmospheric Background (No puppets) */}
      <AtmosphereBackground />

      {/* 3. Stage Header & Navigation Controls */}
      <StageHeader />

      {/* 4. Experience Flow Stages: Clean workbench with ZERO puppets */}
      <main className="relative z-20 flex-1 flex flex-col justify-center pb-12">
        {stage === 'overture' && <SuperFlowWelcomeView />}
        {stage === 'casting' && <CastingView />}
        {stage === 'workshop' && <WorkshopView />}
        {stage === 'premiere' && <PremiereView />}
      </main>

      {/* 5. Ground Footer with Loading Replay Button */}
      <footer className="relative z-20 py-3 text-center text-xs text-muted/70 font-sans border-t border-border-warm/40 flex items-center justify-between px-6">
        <span>SuperFlow • Intelligent Agent Engine & Polyglot Studio</span>
        <button
          onClick={() => {
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
