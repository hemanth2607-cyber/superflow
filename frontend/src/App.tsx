import React, { useState, useEffect } from 'react'
import { StageHeader } from './components/ui/StageHeader'
import { AtmosphereBackground } from './components/ui/AtmosphereBackground'
import { Curtain } from './components/ui/Curtain'
import { StageCanvas } from './components/3d/StageCanvas'
import { OvertureView } from './components/overture/OvertureView'
import { CastingView } from './components/casting/CastingView'
import { WorkshopView } from './components/workshop/WorkshopView'
import { PremiereView } from './components/premiere/PremiereView'
import { useFlowStore } from './stores/useFlowStore'
import { useThemeStore } from './stores/useThemeStore'

export const App: React.FC = () => {
  const { stage } = useFlowStore()
  const { theme } = useThemeStore()
  const [curtainOpen, setCurtainOpen] = useState(false)

  // Open the curtain after initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurtainOpen(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`relative min-h-screen flex flex-col font-sans transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* 1. Stage Velvet/Washi Curtain */}
      <Curtain isOpen={curtainOpen} />

      {/* 2. Parallax Atmospheric Background with 4 Photos, Bamboo & Petals */}
      <AtmosphereBackground />

      {/* 3. Stage Header & Navigation Controls */}
      <StageHeader />

      {/* 4. Puppet Marionette Theatre (3D R3F Rig with 2D SVG Fallback) */}
      <div className="relative z-10 w-full pt-2">
        <StageCanvas />
      </div>

      {/* 5. Dynamic Experience Flow Stages */}
      <main className="relative z-20 flex-1 flex flex-col justify-center pb-12">
        {stage === 'overture' && <OvertureView />}
        {stage === 'casting' && <CastingView />}
        {stage === 'workshop' && <WorkshopView />}
        {stage === 'premiere' && <PremiereView />}
      </main>

      {/* 6. Subtle Ground Footer */}
      <footer className="relative z-20 py-4 text-center text-xs text-muted/70 font-sans border-t border-border-warm/40">
        <span>SuperFlow Marionette Theatre • Handcrafted Artisanal Software Experience</span>
      </footer>
    </div>
  )
}

export default App
