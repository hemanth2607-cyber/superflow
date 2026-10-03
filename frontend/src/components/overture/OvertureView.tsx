import React, { useState } from 'react'
import { Icon } from '../ui/Icon'
import { useFlowStore } from '../../stores/useFlowStore'
import { useAudioStore } from '../../stores/useAudioStore'

export const OvertureView: React.FC = () => {
  const { setStage, setActionType, setFolderPath, setProjectName } = useFlowStore()
  const { playClick, playPluck } = useAudioStore()

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [cloneUrl, setCloneUrl] = useState('')
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)

  const recentFolders = [
    { name: 'sanctuary-garden', path: '~/projects/sanctuary-garden', time: 'Yesterday' },
    { name: 'zen-dashboard', path: '~/projects/zen-dashboard', time: '3 days ago' },
    { name: 'koto-synth-app', path: '~/projects/koto-synth-app', time: 'Last week' },
  ]

  const handleOpenFolder = (path: string, name: string) => {
    playPluck('G4')
    setFolderPath(path)
    setProjectName(name)
    setActionType('open')
    setIsFolderModalOpen(false)
    setStage('casting')
  }

  const handleStartNew = () => {
    playPluck('C5')
    setActionType('new')
    setStage('casting')
  }

  const handleCloneRepo = () => {
    if (!cloneUrl.trim()) return
    playPluck('Eb5')
    setActionType('clone')
    const extractedName = cloneUrl.split('/').pop()?.replace('.git', '') || 'cloned-theatre'
    setProjectName(extractedName)
    setFolderPath(`~/projects/${extractedName}`)
    setIsCloneModalOpen(false)
    setStage('casting')
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Stage Headline */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-sans mb-3">
          <Icon name="sparkles" size={14} />
          <span>Hand-Crafted Marionette Starter</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight text-ink mb-3">
          Pull a thread, grow something.
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-xl mx-auto font-sans">
          Step onto the stage. Choose how to begin your project, then guide the marionettes to craft it into life.
        </p>
      </div>

      {/* Primary 3 Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        {/* 1. Open Folder */}
        <button
          onClick={() => {
            playClick()
            setIsFolderModalOpen(true)
          }}
          className="glass-panel glass-panel-hover p-6 text-left flex flex-col justify-between h-48 focus:outline-none focus:ring-2 focus:ring-gold/50 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-bamboo/15 text-bamboo flex items-center justify-center border border-bamboo/30 group-hover:scale-110 transition-transform">
              <Icon name="folder" size={26} />
            </div>
            <Icon name="arrow-right" size={16} className="text-muted group-hover:text-ink group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-ink mb-1 group-hover:text-gold transition-colors">
              Open folder
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              Select an existing workspace on your machine or inscribe a new directory.
            </p>
          </div>
        </button>

        {/* 2. New Project */}
        <button
          onClick={handleStartNew}
          className="glass-panel glass-panel-hover p-6 text-left flex flex-col justify-between h-48 focus:outline-none focus:ring-2 focus:ring-sakura/50 border-sakura/30 group relative overflow-hidden"
        >
          {/* Subtle floral watermark */}
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="website" size={120} />
          </div>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-sakura/20 text-sakura flex items-center justify-center border border-sakura/40 group-hover:scale-110 transition-transform">
              <Icon name="sparkles" size={26} />
            </div>
            <Icon name="arrow-right" size={16} className="text-muted group-hover:text-ink group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-ink mb-1 group-hover:text-sakura transition-colors">
              New project
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              Begin from clean washi parchment with an artisanal seasonal archetype.
            </p>
          </div>
        </button>

        {/* 3. Clone Repository */}
        <button
          onClick={() => {
            playClick()
            setIsCloneModalOpen(true)
          }}
          className="glass-panel glass-panel-hover p-6 text-left flex flex-col justify-between h-48 focus:outline-none focus:ring-2 focus:ring-vermilion/50 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-vermilion/15 text-vermilion flex items-center justify-center border border-vermilion/30 group-hover:scale-110 transition-transform">
              <Icon name="clone" size={26} />
            </div>
            <Icon name="arrow-right" size={16} className="text-muted group-hover:text-ink group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-ink mb-1 group-hover:text-vermilion transition-colors">
              Clone repository
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              Tie a crimson silk thread to any Git repository and pull it into the theatre.
            </p>
          </div>
        </button>
      </div>

      {/* Recent Folders Section (Pinned like wooden prayer tablets / Ema) */}
      <div className="border-t border-border-warm pt-6">
        <h3 className="text-xs font-sans uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
          <span>Recent Workspaces</span>
          <span className="w-8 h-[1px] bg-border-warm" />
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recentFolders.map((f) => (
            <button
              key={f.path}
              onClick={() => handleOpenFolder(f.path, f.name)}
              className="flex items-center justify-between p-3.5 rounded-lg border border-border-warm bg-surface/40 hover:bg-surface-hover text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 truncate">
                <Icon name="folder" size={18} className="text-gold shrink-0" />
                <div className="truncate">
                  <div className="font-sans font-medium text-xs text-ink truncate group-hover:text-gold transition-colors">
                    {f.name}
                  </div>
                  <div className="text-[11px] text-faint truncate">{f.path}</div>
                </div>
              </div>
              <span className="text-[10px] text-faint shrink-0 ml-2">{f.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* === MODAL: Open Folder / Create New Folder === */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 w-full max-w-md bg-canvas border-border-warm-strong shadow-2xl relative">
            <h3 className="font-display font-bold text-xl text-ink mb-2">
              Select or Create Folder
            </h3>
            <p className="text-xs text-muted mb-4">
              Pick a directory or inscribe the name of a new workspace folder.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-sans text-muted mb-1">Create new folder</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g. cherry-blossom-app"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-border-warm bg-surface text-ink focus:outline-none focus:border-gold"
                  />
                  <button
                    onClick={() => {
                      if (newFolderName.trim()) {
                        handleOpenFolder(`~/projects/${newFolderName.trim()}`, newFolderName.trim())
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold text-xs font-sans font-semibold transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <span className="block text-xs font-sans text-muted mb-2">Or choose recent:</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {recentFolders.map((f) => (
                    <button
                      key={f.path}
                      onClick={() => handleOpenFolder(f.path, f.name)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-surface-hover text-xs text-ink flex items-center justify-between border border-border-warm/40"
                    >
                      <span>{f.name}</span>
                      <span className="text-[10px] text-muted">{f.time}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="px-4 py-1.5 text-xs text-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL: Clone Repository === */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 w-full max-w-md bg-canvas border-border-warm-strong shadow-2xl relative">
            <h3 className="font-display font-bold text-xl text-ink mb-2">
              Clone Git Repository
            </h3>
            <p className="text-xs text-muted mb-4">
              Enter any public Git URL to pull the repository into the theatre.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-sans text-muted mb-1">Repository URL</label>
              <input
                type="text"
                value={cloneUrl}
                onChange={(e) => setCloneUrl(e.target.value)}
                placeholder="https://github.com/username/project.git"
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-warm bg-surface text-ink focus:outline-none focus:border-vermilion"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCloneModalOpen(false)}
                className="px-4 py-1.5 text-xs text-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleCloneRepo}
                className="px-4 py-2 rounded-lg bg-vermilion/20 hover:bg-vermilion/30 border border-vermilion/50 text-vermilion text-xs font-sans font-semibold transition-colors"
              >
                Clone Repository
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
