import React from 'react'
import { Icon, IconName } from '../ui/Icon'
import { useFlowStore, ProjectType, ProjectFeel } from '../../stores/useFlowStore'
import { usePuppetStore } from '../../stores/usePuppetStore'
import { useAudioStore } from '../../stores/useAudioStore'
import { useBuildStore } from '../../stores/useBuildStore'

interface FlowerOption {
  type: ProjectType
  flower: string
  label: string
  subtext: string
  icon: IconName
  colorClass: string
  accentColor: string
}

const FLOWER_OPTIONS: FlowerOption[] = [
  {
    type: 'website',
    flower: 'Blooming Lotus',
    label: 'Website',
    subtext: 'Editorial stories, portfolios & serene landing pages',
    icon: 'website',
    colorClass: 'text-sakura border-sakura/40 hover:border-sakura',
    accentColor: 'var(--sakura)',
  },
  {
    type: 'webapp',
    flower: 'Chrysanthemum',
    label: 'Web app',
    subtext: 'Dynamic interactive tools & rich software in the browser',
    icon: 'webapp',
    colorClass: 'text-gold border-gold/40 hover:border-gold',
    accentColor: 'var(--gold)',
  },
  {
    type: 'mobile',
    flower: 'Plum Blossom',
    label: 'Mobile app',
    subtext: 'Pocket companions, tactile gestures & haptic mobile flows',
    icon: 'mobile',
    colorClass: 'text-vermilion border-vermilion/40 hover:border-vermilion',
    accentColor: 'var(--vermilion)',
  },
  {
    type: 'desktop',
    flower: 'Imperial Peony',
    label: 'Desktop software',
    subtext: 'High-performance local native studio applications',
    icon: 'desktop',
    colorClass: 'text-sakura border-sakura/40 hover:border-sakura',
    accentColor: 'var(--sakura)',
  },
  {
    type: 'game',
    flower: 'Wild Camellia',
    label: 'Game',
    subtext: 'Playable interactive physics, 2D/3D worlds & canvases',
    icon: 'game',
    colorClass: 'text-vermilion border-vermilion/40 hover:border-vermilion',
    accentColor: 'var(--vermilion)',
  },
  {
    type: 'dashboard',
    flower: 'Bamboo Grove',
    label: 'Dashboard',
    subtext: 'Organized analytics, monitors & living control views',
    icon: 'dashboard',
    colorClass: 'text-bamboo border-bamboo/40 hover:border-bamboo',
    accentColor: 'var(--bamboo)',
  },
  {
    type: 'api',
    flower: 'Forest Orchid',
    label: 'API & Service',
    subtext: 'Underlying endpoints, lightning schemas & data pipelines',
    icon: 'api',
    colorClass: 'text-wisteria border-wisteria/40 hover:border-wisteria',
    accentColor: 'var(--wisteria)',
  },
  {
    type: 'other',
    flower: 'Cascading Wisteria',
    label: 'Something else',
    subtext: 'Experimental hybrids, custom creative prototypes & magic',
    icon: 'other',
    colorClass: 'text-wisteria border-wisteria/40 hover:border-wisteria',
    accentColor: 'var(--wisteria)',
  },
]

const FEEL_OPTIONS: { feel: ProjectFeel; label: string; flower: string; color: string }[] = [
  { feel: 'sakura', label: 'Sakura', flower: 'Cherry Blossom', color: 'bg-sakura' },
  { feel: 'camellia', label: 'Camellia', flower: 'Red Tsubaki', color: 'bg-vermilion' },
  { feel: 'bamboo', label: 'Bamboo', flower: 'Forest Grove', color: 'bg-bamboo' },
  { feel: 'wisteria', label: 'Wisteria', flower: 'Purple Fuji', color: 'bg-wisteria' },
]

export const CastingView: React.FC = () => {
  const {
    projectType,
    setProjectType,
    projectFeel,
    setProjectFeel,
    projectDescription,
    setProjectDescription,
    setStage,
  } = useFlowStore()

  const { setHoveredType } = usePuppetStore()
  const { playClick, playPluck } = useAudioStore()
  const { startBuild } = useBuildStore()

  const handleSelectType = (t: ProjectType) => {
    playPluck('Eb4')
    setProjectType(t)
  }

  const handleStartWorkshop = () => {
    playPluck('C5')
    startBuild()
    setStage('workshop')
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-fadeIn">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-ink mb-2">
          What are you building?
        </h2>
        <p className="text-muted text-sm max-w-md mx-auto">
          Select your application archetype and aesthetic color palette.
        </p>
      </div>

      {/* 8 Flower Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
        {FLOWER_OPTIONS.map((opt) => {
          const isSelected = projectType === opt.type
          return (
            <button
              key={opt.type}
              onClick={() => handleSelectType(opt.type)}
              onMouseEnter={() => setHoveredType(opt.type)}
              onMouseLeave={() => setHoveredType(null)}
              className={`p-4 rounded-xl text-left transition-all duration-300 relative group overflow-hidden ${
                isSelected
                  ? 'bg-surface border-2 shadow-lg scale-102'
                  : 'bg-surface/50 border border-border-warm hover:bg-surface-hover hover:border-border-warm-strong'
              }`}
              style={{
                borderColor: isSelected ? opt.accentColor : undefined,
                boxShadow: isSelected ? `0 8px 24px -4px ${opt.accentColor}30` : undefined,
              }}
            >
              {/* Flower Icon */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${opt.colorClass}`}
                >
                  <Icon name={opt.icon} size={24} />
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-gold flex items-center justify-center">
                    <Icon name="check" size={12} />
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="font-display font-bold text-sm text-ink mb-0.5">{opt.label}</div>
              <div className="text-[11px] text-gold font-sans mb-1.5 opacity-90">{opt.flower}</div>
              <div className="text-[11px] text-muted line-clamp-2 leading-relaxed">{opt.subtext}</div>
            </button>
          )
        })}
      </div>

      {/* Palette Selector & Description Input */}
      <div className="glass-panel p-6 mb-8 border-border-warm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Palette Selector */}
          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-muted mb-2">
              Color Palette
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FEEL_OPTIONS.map((f) => {
                const isActive = projectFeel === f.feel
                return (
                  <button
                    key={f.feel}
                    onClick={() => {
                      playClick()
                      setProjectFeel(f.feel)
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      isActive
                        ? 'border-gold bg-gold/15 text-ink shadow-xs'
                        : 'border-border-warm bg-surface hover:bg-surface-hover text-muted'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${f.color}`} />
                    <span>{f.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Project Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-sans uppercase tracking-wider text-muted mb-2">
              Project Description
            </label>
            <input
              type="text"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="e.g. A high-performance productivity dashboard with clean analytics."
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-border-warm bg-surface text-ink focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Action: Start Build */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            playClick()
            setStage('overture')
          }}
          className="text-xs text-muted hover:text-ink px-4 py-2"
        >
          ← Return to Start
        </button>

        <button
          onClick={handleStartWorkshop}
          className="px-6 py-3 rounded-full bg-gold hover:bg-gold/90 text-white font-display font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
        >
          <span>Build Project</span>
          <Icon name="arrow-right" size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
