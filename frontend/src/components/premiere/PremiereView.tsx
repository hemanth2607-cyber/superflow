import React, { useState, useEffect } from 'react'
import { Icon } from '../ui/Icon'
import { useFlowStore } from '../../stores/useFlowStore'
import { useAudioStore } from '../../stores/useAudioStore'
import { useBuildStore } from '../../stores/useBuildStore'

export const PremiereView: React.FC = () => {
  const { projectName, projectType, projectFeel, setStage } = useFlowStore()
  const { playPluck, playClick } = useAudioStore()
  const { resetBuild } = useBuildStore()

  const [activeTab, setActiveTab] = useState('Sanctuary')
  const [teaTimer, setTeaTimer] = useState(180)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [gameScore, setGameScore] = useState(0)
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop')

  // Timer logic for tea ceremony companion
  useEffect(() => {
    let interval: number
    if (isTimerRunning && teaTimer > 0) {
      interval = window.setInterval(() => {
        setTeaTimer((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, teaTimer])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 animate-fadeIn">
      {/* Premiere Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-border-warm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-bamboo/15 text-bamboo text-xs font-sans font-semibold mb-1">
            <Icon name="check" size={12} />
            <span>Live Preview</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink capitalize">
            {projectName}
          </h2>
          <p className="text-xs text-muted font-sans">
            Color palette: <span className="capitalize text-gold font-medium">{projectFeel}</span> • Interactive Preview
          </p>
        </div>

        {/* Device Switcher & Re-start */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-surface border border-border-warm flex items-center gap-1">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`px-3 py-1 rounded-md text-xs font-sans transition-colors ${
                deviceView === 'desktop' ? 'bg-gold/20 text-ink font-semibold' : 'text-muted hover:text-ink'
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`px-3 py-1 rounded-md text-xs font-sans transition-colors ${
                deviceView === 'mobile' ? 'bg-gold/20 text-ink font-semibold' : 'text-muted hover:text-ink'
              }`}
            >
              Mobile
            </button>
          </div>

          <button
            onClick={() => {
              playClick()
              resetBuild()
              setStage('overture')
            }}
            className="px-4 py-2 rounded-lg border border-border-warm bg-surface hover:bg-surface-hover text-xs text-muted hover:text-ink transition-colors flex items-center gap-1.5"
          >
            <Icon name="refresh" size={14} />
            <span>Start New Project</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex justify-center mb-6">
        {/* === A. DESKTOP BROWSER FRAME === */}
        {deviceView === 'desktop' && (
          <div className="w-full glass-panel border-border-warm-strong shadow-2xl rounded-2xl overflow-hidden flex flex-col min-h-[480px] bg-canvas">
            {/* Browser chrome header */}
            <div className="px-4 py-3 bg-surface border-b border-border-warm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-vermilion/80" />
                <span className="w-3 h-3 rounded-full bg-gold/80" />
                <span className="w-3 h-3 rounded-full bg-bamboo/80" />
              </div>
              <div className="px-6 py-1 rounded-full bg-canvas/80 border border-border-warm text-[11px] font-mono text-muted flex items-center gap-2">
                <span>https://superflow.app/{projectName.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>
              <div className="w-12" />
            </div>

            {/* In-Browser Application Content */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
              {/* Top Navigation */}
              <div className="flex items-center justify-between pb-6 border-b border-border-warm/60">
                <div className="font-display font-bold text-lg text-ink flex items-center gap-2">
                  <Icon name="website" size={20} className="text-sakura" />
                  <span>{projectName}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-sans">
                  {['Sanctuary', 'Tea Pavilion', 'Lantern Walk'].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        playPluck('Eb4')
                        setActiveTab(item)
                      }}
                      className={`transition-colors ${
                        activeTab === item ? 'text-gold font-bold underline underline-offset-4' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Content based on Archetype */}
              {projectType === 'game' ? (
                /* Interactive Falling Petals Game */
                <div className="py-8 text-center">
                  <h3 className="font-display font-bold text-xl text-ink mb-1">
                    Floating Blossom Catcher
                  </h3>
                  <p className="text-xs text-muted mb-6">
                    Click the floating petals to harvest seasonal tea leaves.
                  </p>

                  <div className="inline-block p-8 rounded-2xl border border-gold/30 bg-gold/5 mb-4">
                    <div className="text-4xl font-display font-black text-gold mb-2">{gameScore}</div>
                    <div className="text-xs text-muted uppercase tracking-widest font-sans">Blossoms Caught</div>
                  </div>

                  <div className="flex justify-center gap-4">
                    {[1, 2, 3].map((petal) => (
                      <button
                        key={petal}
                        onClick={() => {
                          playPluck('C5')
                          setGameScore((s) => s + 1)
                        }}
                        className="w-14 h-14 rounded-full bg-sakura/25 hover:bg-sakura/40 border border-sakura text-sakura flex items-center justify-center transition-transform hover:scale-125"
                      >
                        <Icon name="website" size={24} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : projectType === 'dashboard' ? (
                /* Living Dashboard with Real-Time Counters */
                <div className="py-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-border-warm bg-surface/50">
                      <div className="text-xs text-muted">Daily Tea Guests</div>
                      <div className="text-2xl font-display font-bold text-ink mt-1">1,248</div>
                      <span className="text-[10px] text-bamboo">↑ 18% this moon cycle</span>
                    </div>
                    <div className="p-4 rounded-xl border border-border-warm bg-surface/50">
                      <div className="text-xs text-muted">Koto Harmonics Played</div>
                      <div className="text-2xl font-display font-bold text-gold mt-1">8,490</div>
                      <span className="text-[10px] text-gold">Pentatonic Insen mode</span>
                    </div>
                    <div className="p-4 rounded-xl border border-border-warm bg-surface/50">
                      <div className="text-xs text-muted">Sanctuary Health</div>
                      <div className="text-2xl font-display font-bold text-bamboo mt-1">99.9%</div>
                      <span className="text-[10px] text-bamboo">Clean spring water flow</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Default Sanctuary / Web app interactive hero */
                <div className="py-10 text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sakura/15 text-sakura flex items-center justify-center border border-sakura/30">
                    <Icon name="sparkles" size={32} />
                  </div>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink mb-2">
                    Welcome to {activeTab}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted mb-6 leading-relaxed">
                    A peaceful digital domain tailored with {projectFeel} tones and handcrafted with artisanal care.
                  </p>
                  <button
                    onClick={() => playPluck('G4')}
                    className="px-6 py-2.5 rounded-full bg-gold/20 hover:bg-gold/30 border border-gold/50 text-gold text-xs font-display font-bold transition-all shadow-xs"
                  >
                    Ring the Sanctuary Bell
                  </button>
                </div>
              )}

              {/* Bottom Footer Note */}
              <div className="pt-6 border-t border-border-warm/60 flex items-center justify-between text-[11px] text-muted font-sans">
                <span>SuperFlow Project Starter • Live Preview</span>
                <span>Powered by SuperFlow</span>
              </div>
            </div>
          </div>
        )}

        {/* === B. MOBILE SMARTPHONE BEZEL FRAME === */}
        {deviceView === 'mobile' && (
          <div className="w-80 h-[560px] rounded-[3rem] border-8 border-[#2e2620] dark:border-[#1a1714] shadow-2xl bg-canvas overflow-hidden flex flex-col relative">
            {/* Notch */}
            <div className="w-32 h-4 bg-[#2e2620] dark:border-[#1a1714] mx-auto rounded-b-xl" />

            {/* Mobile App Screen Content */}
            <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="text-center mt-2 mb-6">
                  <div className="text-xs text-gold uppercase tracking-widest font-sans">Application Preview</div>
                  <h3 className="font-display font-bold text-xl text-ink mt-0.5">{projectName}</h3>
                </div>

                {/* Zen Tea Timer Circle */}
                <div className="w-40 h-40 mx-auto rounded-full border-4 border-gold/40 flex flex-col items-center justify-center bg-gold/5 mb-6">
                  <div className="text-3xl font-mono font-bold text-ink">{formatTimer(teaTimer)}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider mt-1">Countdown Timer</div>
                </div>

                <div className="flex justify-center gap-2 mb-4">
                  <button
                    onClick={() => {
                      playClick()
                      setIsTimerRunning(!isTimerRunning)
                    }}
                    className="px-5 py-2 rounded-full bg-gold text-white font-sans text-xs font-bold shadow-md hover:bg-gold/90 transition-colors"
                  >
                    {isTimerRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={() => {
                      playClick()
                      setIsTimerRunning(false)
                      setTeaTimer(180)
                    }}
                    className="px-4 py-2 rounded-full border border-border-warm text-xs text-muted hover:text-ink transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Mobile bottom nav */}
              <div className="p-3 rounded-2xl bg-surface border border-border-warm flex items-center justify-around text-xs text-muted">
                <span className="text-gold font-bold">Home</span>
                <span>Analytics</span>
                <span>Settings</span>
              </div>
            </div>

            {/* Home indicator bar */}
            <div className="w-24 h-1 bg-muted/40 mx-auto rounded-full mb-2" />
          </div>
        )}
      </div>

      {/* Navigation Return */}
      <div className="text-center">
        <button
          onClick={() => setStage('workshop')}
          className="text-xs text-muted hover:text-ink underline underline-offset-4"
        >
          ← Return to Build Workspace
        </button>
      </div>
    </div>
  )
}
