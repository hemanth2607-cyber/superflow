import React, { useState } from 'react'
import { Icon } from '../ui/Icon'
import { useFlowStore } from '../../stores/useFlowStore'
import { useAudioStore } from '../../stores/useAudioStore'

export const SuperFlowWelcomeView: React.FC = () => {
  const { setStage, setActionType, setFolderPath, setProjectName } = useFlowStore()
  const { playClick, playPluck } = useAudioStore()

  // Selected file for inspection
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'capabilities' | 'explorer' | 'recent'>('capabilities')

  // Real workspace files from the project
  const workspaceFiles = [
    {
      name: 'test_auto_discovery.py',
      category: 'python',
      size: '3.9 KB',
      desc: 'Automated tool discovery suite. Tests real-time registration of agent tools.',
      badge: 'Test Suite',
    },
    {
      name: 'colab_train_superflow.py',
      category: 'python',
      size: '3.7 KB',
      desc: 'Google Colab cloud training script for SuperFlow foundation models and policies.',
      badge: 'ML Training',
    },
    {
      name: 'test_superflow_pillars.py',
      category: 'python',
      size: '8.3 KB',
      desc: 'Comprehensive unit tests for the 4 SuperFlow architectural pillars.',
      badge: 'Architecture',
    },
    {
      name: 'test_engine.py',
      category: 'python',
      size: '3.8 KB',
      desc: 'Core execution engine validation. Tests task scheduling, cancellation, and execution.',
      badge: 'Core Engine',
    },
    {
      name: 'test_workflow.py',
      category: 'python',
      size: '5.5 KB',
      desc: 'End-to-end multi-step agent workflow execution and rollback tests.',
      badge: 'Workflow',
    },
    {
      name: 'Launch_SuperFlow_App.bat',
      category: 'batch',
      size: '256 B',
      desc: '1-click Windows native desktop launcher for SuperFlow Electron app.',
      badge: 'Desktop App',
    },
    {
      name: 'agent_audit.jsonl',
      category: 'json',
      size: '1.6 KB',
      desc: 'Structured audit trail recording every autonomous tool invocation and result.',
      badge: 'Telemetry',
    },
  ]

  // SuperFlow Core Capabilities
  const capabilities = [
    {
      id: 'agent-loops',
      title: 'Autonomous Agent Loops',
      tagline: 'Self-Directed Execution',
      desc: 'Break down complex user goals into actionable steps, execute CLI tools, write code, and iterate with self-healing feedback loops until success.',
      icon: 'sparkles',
      accent: 'border-gold/40 text-gold bg-gold/10',
      action: 'Launch Agent Loop',
    },
    {
      id: 'browser-agents',
      title: 'Computer Use & Browser Subagents',
      tagline: 'Visual Web Automation',
      desc: 'Deploy dedicated browser subagents to crawl websites, test responsive layouts, take visual screenshots, click DOM nodes, and verify UX.',
      icon: 'website',
      accent: 'border-bamboo/40 text-bamboo bg-bamboo/10',
      action: 'Explore Browser Agent',
    },
    {
      id: 'tool-registry',
      title: 'Dynamic MCP & Tool Auto-Discovery',
      tagline: 'Universal Extensibility',
      desc: 'Instantly discover and bind external tools via Model Context Protocol (MCP), Python tool registries, and sandboxed shell execution.',
      icon: 'settings',
      accent: 'border-vermilion/40 text-vermilion bg-vermilion/10',
      action: 'Browse Tool Registry',
    },
    {
      id: 'desktop-shell',
      title: 'Articulated Theatrical Shell',
      tagline: 'Modern Electron + React Rig',
      desc: 'Pair programming powered by high-performance Vite, React, TypeScript, and interactive articulated marionette shadow puppet theatre.',
      icon: 'desktop',
      accent: 'border-sakura/40 text-sakura bg-sakura/10',
      action: 'Enter Puppet Workshop',
    },
  ]

  const handleStartNew = () => {
    playPluck('C5')
    setActionType('new')
    setStage('casting')
  }

  const handleOpenFolder = (path: string, name: string) => {
    playPluck('G4')
    setFolderPath(path)
    setProjectName(name)
    setActionType('open')
    setStage('casting')
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 animate-fadeIn">
      {/* Header Banner: VS Code Welcome Page evolved with Theatrical Excellence */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-border-warm/50 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-sans mb-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span>SuperFlow Autonomous Engine v1.0</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
            Welcome to <span className="text-gold">SuperFlow</span>
          </h1>
          <p className="text-muted text-sm sm:text-base font-sans mt-1">
            Autonomous agent workflow orchestrator with live tool auto-discovery and articulated puppet theatre.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleStartNew}
            className="px-4 py-2 rounded-xl bg-crimson hover:bg-crimson/90 text-white font-sans text-xs font-semibold shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Icon name="sparkles" size={15} />
            <span>New Workflow</span>
          </button>
          <button
            onClick={() => handleOpenFolder('c:/Users/heman/Desktop/agent_engine', 'agent_engine')}
            className="px-4 py-2 rounded-xl bg-gold/20 hover:bg-gold/30 text-gold-dark dark:text-gold border border-gold/40 font-sans text-xs font-semibold transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <Icon name="folder" size={15} />
            <span>Open Workspace</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Side (Files & Workspace Explorer) + Right Side (Capabilities & Features) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==============================================================
            LEFT PANEL (5 COLS): WORKSPACE & PROJECT FILE EXPLORER
            ============================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Workspace Explorer Container */}
          <div className="glass-panel p-5 rounded-2xl border border-border-warm shadow-md flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-warm/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gold/15 text-gold flex items-center justify-center border border-gold/30">
                  <Icon name="folder" size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-ink">Project Files</h3>
                  <span className="text-[11px] text-muted">c:/Users/heman/Desktop/agent_engine</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-bamboo/15 text-bamboo font-mono font-medium">
                {workspaceFiles.length} Files Ready
              </span>
            </div>

            {/* Scrollable File List with Badges */}
            <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
              {workspaceFiles.map((file) => {
                const isSelected = selectedFile === file.name
                return (
                  <div
                    key={file.name}
                    onClick={() => {
                      playClick()
                      setSelectedFile(isSelected ? null : file.name)
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'border-gold bg-gold/10 shadow-xs'
                        : 'border-border-warm/60 bg-surface/50 hover:bg-surface-hover hover:border-gold/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {file.category === 'python' ? '🐍' : file.category === 'batch' ? '⚡' : '📋'}
                        </span>
                        <span className="font-mono text-xs font-semibold text-ink truncate max-w-[200px]">
                          {file.name}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-sans text-muted font-medium">
                        {file.badge}
                      </span>
                    </div>

                    {/* File Details Drawer */}
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-gold/20 animate-fadeIn text-[11px] text-muted leading-relaxed">
                        <p className="text-foreground/90 mb-2">{file.desc}</p>
                        <div className="flex items-center justify-between font-mono text-[10px] text-muted">
                          <span>Size: {file.size}</span>
                          <span className="text-gold font-semibold">Active in Workspace</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Quick Actions Footer inside Explorer */}
            <div className="mt-4 pt-3 border-t border-border-warm/40 grid grid-cols-2 gap-2 text-xs font-sans">
              <button
                onClick={() => handleOpenFolder('c:/Users/heman/Desktop/agent_engine/workspace', 'workspace')}
                className="p-2 rounded-lg bg-surface hover:bg-surface-hover border border-border-warm text-ink text-left transition-colors flex items-center gap-1.5"
              >
                <Icon name="folder" size={13} className="text-bamboo" />
                <span>workspace/</span>
              </button>
              <button
                onClick={() => handleOpenFolder('c:/Users/heman/Desktop/agent_engine/frontend', 'frontend')}
                className="p-2 rounded-lg bg-surface hover:bg-surface-hover border border-border-warm text-ink text-left transition-colors flex items-center gap-1.5"
              >
                <Icon name="desktop" size={13} className="text-sakura" />
                <span>frontend/</span>
              </button>
            </div>
          </div>

          {/* Recent Workspaces Pinned Card */}
          <div className="glass-panel p-4 rounded-2xl border border-border-warm">
            <h4 className="text-xs font-sans uppercase tracking-widest text-muted mb-2.5 flex items-center gap-2">
              <span>Recent Sessions</span>
              <span className="w-8 h-[1px] bg-border-warm" />
            </h4>
            <div className="flex flex-col gap-1.5">
              {[
                { name: 'superflow-core', path: '~/agent_engine', status: 'Active' },
                { name: 'marionette-theatre', path: '~/frontend/puppet', status: 'Rendered' },
                { name: 'auto-discovery-suite', path: '~/tests/discovery', status: 'Passed' },
              ].map((rec) => (
                <button
                  key={rec.name}
                  onClick={() => handleOpenFolder(rec.path, rec.name)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-hover text-left transition-colors group cursor-pointer text-xs"
                >
                  <span className="font-mono text-ink group-hover:text-gold transition-colors">
                    {rec.name}
                  </span>
                  <span className="text-[10px] text-muted group-hover:text-foreground">
                    {rec.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==============================================================
            RIGHT PANEL (7 COLS): WHAT SUPERFLOW CAN DO (CAPABILITIES)
            ============================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="glass-panel p-6 rounded-2xl border border-border-warm shadow-md flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-warm/40">
              <div>
                <h3 className="font-display font-bold text-base text-ink">What SuperFlow Can Do</h3>
                <p className="text-xs text-muted">Capabilities, automated workflows, and agent execution models</p>
              </div>
              <span className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-gold/15 text-gold font-medium border border-gold/30">
                4 Core Engines
              </span>
            </div>

            {/* 4 SuperFlow Capability Cards (VS Code Walkthrough style with SuperFlow flair) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {capabilities.map((cap) => (
                <div
                  key={cap.id}
                  className="p-4 rounded-xl border border-border-warm/70 bg-surface/40 hover:bg-surface-hover hover:border-gold/40 transition-all flex flex-col justify-between group shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full border ${cap.accent}`}>
                        {cap.tagline}
                      </span>
                      <Icon name="arrow-right" size={14} className="text-muted/50 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="font-display font-bold text-sm text-ink mb-1.5 group-hover:text-gold transition-colors">
                      {cap.title}
                    </h4>
                    <p className="text-xs text-muted leading-relaxed mb-3">
                      {cap.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      playClick()
                      setStage('workshop')
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-gold/20 text-ink text-[11px] font-sans font-medium transition-colors border border-border-warm/50 text-center cursor-pointer"
                  >
                    {cap.action} →
                  </button>
                </div>
              ))}
            </div>

            {/* Sample Ready-to-Run Prompts Bar */}
            <div className="mt-5 pt-4 border-t border-border-warm/40">
              <span className="text-[11px] font-sans font-medium text-muted uppercase tracking-wider block mb-2">
                Quick Prompts for Autonomous Execution:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Build Full-Stack App with Electron',
                  'Run Tool Discovery Tests',
                  'Deploy Browser Subagent for Web Crawling',
                  'Train SuperFlow Foundation Model',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      playPluck('A4')
                      setProjectName(prompt.toLowerCase().replace(/\s+/g, '-'))
                      setStage('workshop')
                    }}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-border-warm text-[11px] text-muted hover:text-ink hover:border-gold/50 transition-all cursor-pointer"
                  >
                    ⚡ {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Engine Architecture Summary Bar */}
          <div className="p-4 rounded-xl border border-gold/30 bg-gold/5 flex items-center justify-between text-xs font-sans text-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-foreground/90 font-medium">Engine Connected:</span>
              <span className="font-mono text-[11px]">agent_engine • 4 Pillars • Zero Lints</span>
            </div>
            <button
              onClick={() => setStage('premiere')}
              className="text-gold hover:underline cursor-pointer font-medium"
            >
              View Full Premiere →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperFlowWelcomeView
