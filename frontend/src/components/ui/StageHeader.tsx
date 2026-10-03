import React from 'react'
import { Icon } from './Icon'
import { useThemeStore } from '../../stores/useThemeStore'
import { useAudioStore } from '../../stores/useAudioStore'
import { useFlowStore } from '../../stores/useFlowStore'

export const StageHeader: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore()
  const { isMuted, toggleAudio, playClick } = useAudioStore()
  const { stage, setStage } = useFlowStore()

  const stages = [
    { key: 'overture', label: 'Overture' },
    { key: 'casting', label: 'Casting' },
    { key: 'workshop', label: 'Workshop' },
    { key: 'premiere', label: 'Premiere' },
  ] as const

  return (
    <header className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-border-warm bg-surface/60 backdrop-blur-md transition-colors duration-500">
      {/* Brand & Metaphor Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            playClick()
            setStage('overture')
          }}
          className="group flex items-center gap-2.5 text-left focus:outline-none"
          title="Return to Overture"
        >
          {/* Silk thread icon */}
          <div className="relative w-8 h-8 rounded-full border border-gold/40 flex items-center justify-center bg-gold/10 group-hover:border-gold transition-colors">
            <Icon name="clone" size={18} className="text-gold group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-ink group-hover:text-gold transition-colors">
              SuperFlow
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-muted font-sans border-l border-border-warm pl-2">
              Marionette Theatre
            </span>
          </div>
        </button>
      </div>

      {/* Stage Breadcrumb Pills */}
      <nav aria-label="Experience stages" className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-canvas/60 border border-border-warm">
        {stages.map((st, i) => {
          const isActive = stage === st.key
          return (
            <button
              key={st.key}
              onClick={() => {
                playClick()
                setStage(st.key)
              }}
              className={`px-3 py-1 rounded-full text-xs font-sans transition-all duration-300 ${
                isActive
                  ? 'bg-gold/20 text-ink font-semibold shadow-xs border border-gold/40'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <span className="opacity-50 mr-1">{i + 1}.</span>
              {st.label}
            </button>
          )
        })}
      </nav>

      {/* Controls: Audio Toggle & Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* Audio Toggle */}
        <button
          onClick={() => toggleAudio()}
          aria-label={isMuted ? 'Unmute koto sound' : 'Mute sound'}
          title={isMuted ? 'Sound: Muted (Click to play Koto ambient)' : 'Sound: Playing'}
          className={`p-2 rounded-lg border border-border-warm transition-all duration-300 ${
            !isMuted
              ? 'bg-gold/15 text-gold border-gold/50 shadow-xs'
              : 'bg-surface hover:bg-surface-hover text-muted hover:text-ink'
          }`}
        >
          <Icon name={isMuted ? 'volume-x' : 'volume'} size={18} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            playClick()
            toggleTheme()
          }}
          aria-label={theme === 'dark' ? 'Switch to Washi light paper' : 'Switch to Lacquer dark'}
          title={theme === 'dark' ? 'Theme: Lacquer Dark (Click for Washi Light)' : 'Theme: Washi Light (Click for Lacquer Dark)'}
          className="p-2 rounded-lg border border-border-warm bg-surface hover:bg-surface-hover text-muted hover:text-ink transition-all duration-300"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
      </div>
    </header>
  )
}
