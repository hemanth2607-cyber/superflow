import React, { useState } from 'react'
import { Icon } from '../ui/Icon'
import { useFlowStore } from '../../stores/useFlowStore'
import { useAudioStore } from '../../stores/useAudioStore'
import { PolyglotCompilerStudio, SUPPORTED_LANGUAGES } from '../compiler/PolyglotCompilerStudio'

export const SuperFlowWelcomeView: React.FC = () => {
  const { setStage, setActionType, setFolderPath, setProjectName } = useFlowStore()
  const { playClick, playPluck } = useAudioStore()

  // Selected file for inspection
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  // Active view: 'welcome' or 'compiler'
  const [showCompiler, setShowCompiler] = useState(false)
  const [selectedCompilerLang, setSelectedCompilerLang] = useState('python')

  // Real workspace files from the project
  const workspaceFiles = [
    {
      name: 'test_auto_discovery.py',
      category: 'python',
      size: '3.9 KB',
      desc: 'Automated tool discovery suite. Tests real-time registration of agent tools.',
      badge: 'Test Suite',
      codeSnippet: `import unittest\nfrom agent_engine.tools.registry import ToolRegistry\n\nclass TestAutoDiscovery(unittest.TestCase):\n    def test_discovery(self):\n        reg = ToolRegistry()\n        self.assertTrue(len(reg.list_tools()) > 0)\n\nif __name__ == '__main__':\n    unittest.main()`,
    },
    {
      name: 'colab_train_superflow.py',
      category: 'python',
      size: '3.7 KB',
      desc: 'Google Colab cloud training script for SuperFlow foundation models and policies.',
      badge: 'ML Training',
      codeSnippet: `# SuperFlow Cloud Training Script\nimport torch\nprint(f"CUDA available: {torch.cuda.is_available()}")\nprint("Initializing SuperFlow policy network...")`,
    },
    {
      name: 'test_superflow_pillars.py',
      category: 'python',
      size: '8.3 KB',
      desc: 'Comprehensive unit tests for the 4 SuperFlow architectural pillars.',
      badge: 'Architecture',
      codeSnippet: `import pytest\n\ndef test_pillars():\n    pillars = ["Orchestration", "Computer Use", "Tool Registry", "Theatrical Shell"]\n    assert len(pillars) == 4`,
    },
    {
      name: 'test_engine.py',
      category: 'python',
      size: '3.8 KB',
      desc: 'Core execution engine validation. Tests task scheduling, cancellation, and execution.',
      badge: 'Core Engine',
      codeSnippet: `import time\nprint("SuperFlow Core Engine v1.0.0 initializing...")\ntime.sleep(0.1)\nprint("Engine status: Optimal.")`,
    },
    {
      name: 'test_workflow.py',
      category: 'python',
      size: '5.5 KB',
      desc: 'End-to-end multi-step agent workflow execution and rollback tests.',
      badge: 'Workflow',
      codeSnippet: `def run_workflow_pipeline():\n    steps = ["Plan", "Execute", "Verify", "Report"]\n    return all(len(s) > 0 for s in steps)\n\nprint("Workflow test result:", run_workflow_pipeline())`,
    },
    {
      name: 'Launch_SuperFlow_App.bat',
      category: 'batch',
      size: '256 B',
      desc: '1-click Windows native desktop launcher for SuperFlow Electron app.',
      badge: 'Desktop App',
      codeSnippet: `@echo off\necho Launching SuperFlow Native Desktop App...\ncd frontend\nnpm run app:dev`,
    },
    {
      name: 'agent_audit.jsonl',
      category: 'json',
      size: '1.6 KB',
      desc: 'Structured audit trail recording every autonomous tool invocation and result.',
      badge: 'Telemetry',
      codeSnippet: `{"timestamp": "2026-10-05T10:00:00Z", "event": "engine_start", "status": "ok"}`,
    },
  ]

  // SuperFlow Core Capabilities
  const capabilities = [
    {
      id: 'polyglot-compiler',
      title: 'Universal Polyglot Compiler',
      tagline: 'Runs All Languages',
      desc: 'Compile & execute C, C++, Rust, Python, Java, Go, TypeScript, C#, Ruby, PHP, Zig, Lua, and SQL natively or via sandboxed cloud runner.',
      icon: '⚡',
      accent: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
      action: 'Open Polyglot Studio',
      onClick: () => {
        playPluck('C5')
        setSelectedCompilerLang('c')
        setShowCompiler(true)
      },
    },
    {
      id: 'agent-loops',
      title: 'Autonomous Agent Loops',
      tagline: 'Self-Directed Execution',
      desc: 'Break down complex user goals into actionable steps, execute CLI tools, write code, and iterate with self-healing feedback loops until success.',
      icon: 'sparkles',
      accent: 'border-gold/40 text-gold bg-gold/10',
      action: 'Launch Agent Loop',
      onClick: () => {
        playClick()
        setStage('workshop')
      },
    },
    {
      id: 'browser-agents',
      title: 'Computer Use & Browser Subagents',
      tagline: 'Visual Web Automation',
      desc: 'Deploy dedicated browser subagents to crawl websites, test responsive layouts, take visual screenshots, click DOM nodes, and verify UX.',
      icon: 'website',
      accent: 'border-bamboo/40 text-bamboo bg-bamboo/10',
      action: 'Explore Browser Agent',
      onClick: () => {
        playClick()
        setStage('workshop')
      },
    },
    {
      id: 'tool-registry',
      title: 'Dynamic MCP & Tool Auto-Discovery',
      tagline: 'Universal Extensibility',
      desc: 'Instantly discover and bind external tools via Model Context Protocol (MCP), Python tool registries, and sandboxed shell execution.',
      icon: 'settings',
      accent: 'border-vermilion/40 text-vermilion bg-vermilion/10',
      action: 'Browse Tool Registry',
      onClick: () => {
        playClick()
        setStage('workshop')
      },
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

  const handleOpenCompilerWithLang = (langId: string) => {
    playPluck('E5')
    setSelectedCompilerLang(langId)
    setShowCompiler(true)
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 animate-fadeIn">
      {/* 1. Header Banner: VS Code Welcome Page evolved with SuperFlow Power */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-border-warm/50 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-sans mb-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SuperFlow Autonomous Polyglot Workbench</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
            Welcome to <span className="text-gold">SuperFlow</span>
          </h1>
          <p className="text-muted text-sm sm:text-base font-sans mt-1">
            Universal development engine with polyglot code compilation, autonomous agent orchestration, and project management.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              playPluck('C5')
              setShowCompiler(!showCompiler)
            }}
            className={`px-4 py-2 rounded-xl font-sans text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer ${
              showCompiler
                ? 'bg-gold text-sumi-900 border border-gold'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
          >
            <span>{showCompiler ? '✕ Close Compiler' : '⚡ Polyglot Compiler'}</span>
          </button>

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

      {/* 2. Universal Polyglot Code Studio (Toggleable on demand) */}
      {showCompiler && (
        <div className="mb-8">
          <PolyglotCompilerStudio
            initialLanguage={selectedCompilerLang}
            onClose={() => setShowCompiler(false)}
          />
        </div>
      )}

      {/* 3. Polyglot Language Quick-Launch Bar */}
      <div className="mb-6 p-3 rounded-2xl border border-border-warm/60 bg-surface/40 flex items-center justify-between gap-3 overflow-x-auto">
        <span className="text-[11px] font-sans font-semibold text-foreground/80 shrink-0 flex items-center gap-1.5">
          <span>⚡</span>
          <span>Compile & Run:</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {['python', 'c', 'cpp', 'rust', 'java', 'go', 'typescript', 'csharp', 'php', 'ruby', 'zig', 'sql'].map((langId) => {
            const def = SUPPORTED_LANGUAGES.find((l) => l.id === langId)
            if (!def) return null
            return (
              <button
                key={langId}
                onClick={() => handleOpenCompilerWithLang(langId)}
                className="px-2.5 py-1 rounded-lg bg-surface hover:bg-gold/20 border border-border-warm/60 hover:border-gold/40 text-[11px] font-sans text-muted hover:text-foreground transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>{def.icon}</span>
                <span>{def.name.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Main Grid: Left Side (Files & Workspace Explorer) + Right Side (Capabilities & Features) */}
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
                      <div className="mt-2 pt-2 border-t border-gold/20 animate-fadeIn text-[11px] text-muted leading-relaxed flex flex-col gap-2">
                        <p className="text-foreground/90">{file.desc}</p>
                        <div className="flex items-center justify-between font-mono text-[10px] text-muted">
                          <span>Size: {file.size}</span>
                          {file.category === 'python' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenCompilerWithLang('python')
                              }}
                              className="text-gold hover:underline font-semibold cursor-pointer"
                            >
                              Run in Python Runner →
                            </button>
                          )}
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
                className="p-2 rounded-lg bg-surface hover:bg-surface-hover border border-border-warm text-ink text-left transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="folder" size={13} className="text-bamboo" />
                <span>workspace/</span>
              </button>
              <button
                onClick={() => handleOpenFolder('c:/Users/heman/Desktop/agent_engine/frontend', 'frontend')}
                className="p-2 rounded-lg bg-surface hover:bg-surface-hover border border-border-warm text-ink text-left transition-colors flex items-center gap-1.5 cursor-pointer"
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
                { name: 'polyglot-compiler', path: '~/compiler/engine', status: 'Compiled' },
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
                <p className="text-xs text-muted">Core capabilities, compilers, and agent execution architectures</p>
              </div>
              <span className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-gold/15 text-gold font-medium border border-gold/30">
                4 Core Engines
              </span>
            </div>

            {/* 4 SuperFlow Capability Cards */}
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
                    onClick={cap.onClick}
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
                  'Compile C / C++ Algorithm',
                  'Run Rust Memory Safety Check',
                  'Deploy Browser Subagent for Web Crawling',
                  'Train SuperFlow Foundation Model',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      playPluck('A4')
                      if (prompt.includes('C / C++')) {
                        handleOpenCompilerWithLang('c')
                      } else if (prompt.includes('Rust')) {
                        handleOpenCompilerWithLang('rust')
                      } else {
                        setProjectName(prompt.toLowerCase().replace(/\s+/g, '-'))
                        setStage('workshop')
                      }
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
              <span className="text-foreground/90 font-medium">Polyglot Engine Connected:</span>
              <span className="font-mono text-[11px]">GCC 16.1.0 • rustc 1.97 • Python 3.14 • JDK 21 Ready</span>
            </div>
            <button
              onClick={() => handleOpenCompilerWithLang('python')}
              className="text-gold hover:underline cursor-pointer font-medium"
            >
              Open Compiler →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperFlowWelcomeView
