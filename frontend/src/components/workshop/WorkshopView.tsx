import React, { useEffect } from 'react'
import { Icon } from '../ui/Icon'
import { AIThinkingOrbAndInput } from '../ui/ai-thinking-orb-and-input'
import { useBuildStore } from '../../stores/useBuildStore'
import { useFlowStore } from '../../stores/useFlowStore'
import { usePuppetStore } from '../../stores/usePuppetStore'
import { useAudioStore } from '../../stores/useAudioStore'
import confetti from 'canvas-confetti'

export const WorkshopView: React.FC = () => {
  const { files, activeFileIndex, setActiveFileIndex, isLivePreviewReady, phase } = useBuildStore()
  const { setStage, projectName, projectType } = useFlowStore()
  const { setMode } = usePuppetStore()
  const { playCelebration, playPluck } = useAudioStore()

  // Manage puppet mode: 'building' while building, 'celebrating' when done
  useEffect(() => {
    if (phase === 'done') {
      setMode('celebrating')
      playCelebration()
      // Confetti burst of gold and sakura petals
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ea7a99', '#c89532', '#d33828', '#3d8050'],
      })
    } else if (phase !== 'idle') {
      setMode('building')
    }
  }, [phase, setMode, playCelebration])

  const activeFile = files[activeFileIndex] || files[0]

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 animate-fadeIn">
      {/* Top Banner: Project Title & Thinking Orb */}
      <div className="glass-panel p-5 mb-6 border-border-warm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="text-xs uppercase tracking-wider text-muted font-sans flex items-center gap-1.5 justify-center md:justify-start mb-1">
              <Icon name="sparkles" size={14} className="text-gold" />
              <span>Workshop Loom</span>
            </span>
            <h2 className="font-display font-extrabold text-2xl text-ink capitalize">
              {projectName || 'Unnamed Sanctuary'}
            </h2>
            <p className="text-xs text-muted font-sans mt-0.5">
              Archetype: <span className="text-gold font-medium capitalize">{projectType}</span> • Woven with silk threads
            </p>
          </div>

          {/* Dotted Blooming Orb */}
          <AIThinkingOrbAndInput className="py-0" />
        </div>
      </div>

      {/* Main Workshop Grid: File Tree + Code Editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
        {/* Left Column (4 cols): File Inscription Tree */}
        <div className="md:col-span-4 glass-panel p-4 border-border-warm flex flex-col h-96">
          <div className="flex items-center justify-between pb-3 border-b border-border-warm mb-3">
            <div className="flex items-center gap-2 text-xs font-display font-bold text-ink">
              <Icon name="folder" size={16} className="text-gold" />
              <span>Project Artifacts</span>
            </div>
            <span className="text-[10px] text-muted font-mono">{files.length} files</span>
          </div>

          {/* File list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {files.map((file, idx) => {
              const isActive = activeFileIndex === idx
              const isWritten = file.status === 'written'
              const isWriting = file.status === 'writing'

              return (
                <button
                  key={file.path}
                  onClick={() => {
                    playPluck('D4')
                    setActiveFileIndex(idx)
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-gold/15 border border-gold/40 text-ink shadow-2xs'
                      : 'hover:bg-surface-hover text-muted hover:text-ink border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon name="file" size={15} className={isWritten ? 'text-bamboo' : 'text-muted'} />
                    <span className="truncate">{file.path}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 ml-2">
                    {isWritten && (
                      <span className="text-[10px] text-bamboo font-sans px-1.5 py-0.5 rounded-full bg-bamboo/10">
                        done
                      </span>
                    )}
                    {isWriting && (
                      <span className="text-[10px] text-sakura font-sans px-1.5 py-0.5 rounded-full bg-sakura/15 animate-pulse">
                        weaving...
                      </span>
                    )}
                    {file.status === 'pending' && (
                      <span className="text-[10px] text-faint font-sans">queued</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Real Syntax Code View */}
        <div className="md:col-span-8 glass-panel border-border-warm flex flex-col h-96 overflow-hidden">
          {/* Code Window Header */}
          <div className="px-4 py-2.5 border-b border-border-warm bg-canvas/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-ink">
              <span className="w-2.5 h-2.5 rounded-full bg-vermilion/70 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-gold/70 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-bamboo/70 inline-block" />
              <span className="ml-2 text-muted">{activeFile.path}</span>
            </div>
            <span className="text-[10px] text-faint font-mono">{activeFile.size}</span>
          </div>

          {/* Code Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-canvas/80 font-mono text-xs leading-relaxed text-ink select-text">
            <pre className="m-0 whitespace-pre-wrap font-mono text-xs">
              <code>{activeFile.code}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Bottom Stage Action: STRICT RULE - Live Preview button is NEVER visible before build finishes */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            setMode('idle')
            setStage('casting')
          }}
          className="text-xs text-muted hover:text-ink px-3 py-1.5"
        >
          ← Return to Casting
        </button>

        {/* The Live preview button appears ONLY when isLivePreviewReady === true */}
        {isLivePreviewReady && (
          <div className="animate-bounce">
            <button
              onClick={() => {
                setStage('premiere')
              }}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-bamboo to-[#4ba165] hover:brightness-110 text-white font-display font-bold text-sm shadow-xl shadow-bamboo/25 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Icon name="sparkles" size={18} />
              <span>Enter Live Premiere</span>
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
