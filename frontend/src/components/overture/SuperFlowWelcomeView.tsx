import React, { useState } from 'react'
import { Icon } from '../ui/Icon'
import { useFlowStore } from '../../stores/useFlowStore'
import { useAudioStore } from '../../stores/useAudioStore'
import { PolyglotCompilerStudio, SUPPORTED_LANGUAGES } from '../compiler/PolyglotCompilerStudio'
import { VirtualAIModelHubModal } from '../compiler/VirtualAIModelHubModal'
import { LanguageCatalog500Modal } from '../compiler/LanguageCatalog500Modal'
import { PolyglotLanguage } from '../../services/polyglot500Languages'
import { getStoredVirtualModel, VIRTUAL_AI_MODELS } from '../../services/virtualAiService'

export const SuperFlowWelcomeView: React.FC = () => {
  const { setStage, setActionType, setFolderPath, setProjectName } = useFlowStore()
  const { playClick, playPluck } = useAudioStore()

  // Selected file for inspection
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  // Active view: 'welcome' or 'compiler'
  const [showCompiler, setShowCompiler] = useState(false)
  const [selectedCompilerLang, setSelectedCompilerLang] = useState('python')

  // 505 Languages Directory Modal State
  const [is500CatalogOpen, setIs500CatalogOpen] = useState(false)

  // Virtual AI Hub Modal state
  const [isVirtualAIModalOpen, setIsVirtualAIModalOpen] = useState(false)
  const [activeVirtualModelId, setActiveVirtualModelId] = useState<string>(getStoredVirtualModel())

  const activeModel =
    VIRTUAL_AI_MODELS.find((m) => m.id === activeVirtualModelId) || VIRTUAL_AI_MODELS[0]

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
      title: '500+ Polyglot Language Compiler',
      tagline: '505 Languages Supported',
      desc: 'Compile, interpret, and run over 500 programming languages from systems (C, C++, Rust, Zig, Go) to enterprise (Java, C#, Kotlin), scripting (Python, Ruby, Lua), functional (Haskell, Lisp, Elixir), logic, and esoteric computing.',
      icon: '⚡',
      accent: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
      action: 'Open 505 Polyglot Studio',
      onClick: () => {
        playPluck('C5')
        setShowCompiler(true)
      },
    },
    {
      id: 'virtual-ai-models',
      title: '13 Virtual Coding AI Models',
      tagline: 'Zero Local Setup Required',
      desc: 'Connected virtually in the cloud (Claude 3.7 Sonnet, DeepSeek-R1, GPT-4o, Gemini 2.5, Qwen 2.5 Coder, Codestral). No local model weights, GPUs, or Ollama needed.',
      icon: '☁️',
      accent: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
      action: 'Configure AI Models',
      onClick: () => {
        playClick()
        setIsVirtualAIModalOpen(true)
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

  const handleSelectFrom500Modal = (lang: PolyglotLanguage) => {
    setSelectedCompilerLang(lang.id)
    setShowCompiler(true)
    setIs500CatalogOpen(false)
    playPluck('E5')
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-border-warm/50 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-sans mb-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SuperFlow Autonomous Polyglot Workbench</span>
            <span className="text-muted/60">•</span>
            <span className="text-gold font-mono font-bold">505 Programming Languages</span>
            <span className="text-muted/60">•</span>
            <span className="text-blue-300 font-mono">13 Virtual Models</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
            Welcome to <span className="text-gold">SuperFlow</span>
          </h1>
          <p className="text-muted text-sm sm:text-base font-sans mt-1">
            Universal development engine with 505-language compilation, 13 virtual coding AI models (zero local downloads), and autonomous agent loops.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 505 Languages Directory Modal Trigger */}
          <button
            onClick={() => {
              playClick()
              setIs500CatalogOpen(true)
            }}
            className="px-3.5 py-2 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold font-sans text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            title="Browse all 505 supported programming languages"
          >
            <span>⚡</span>
            <span>505 Languages</span>
            <span className="px-1.5 py-0.5 rounded bg-gold/30 text-gold text-[10px] font-mono">Directory</span>
          </button>

          {/* Virtual AI Hub Trigger */}
          <button
            onClick={() => {
              playClick()
              setIsVirtualAIModalOpen(true)
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-300 font-sans text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <span>☁️</span>
            <span>Virtual AI Hub</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] font-mono">
              {activeModel.name.split(' ')[0]}
            </span>
          </button>

          {/* Polyglot Compiler Toggle */}
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
            <span>{showCompiler ? '✕ Close Compiler' : '⚡ Polyglot Compiler (505)'}</span>
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
      <div className="mb-6 p-3 rounded-2xl border border-border-warm/60 bg-surface/40 flex items-center justify-between gap-3 overflow-x-auto scrollbar-thin">
        <span className="text-[11px] font-sans font-semibold text-foreground/80 shrink-0 flex items-center gap-1.5">
          <span>⚡</span>
          <span>Compile & Run:</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: 'python', name: 'Python', icon: '🐍' },
            { id: 'c', name: 'C', icon: '⚙️' },
            { id: 'cpp', name: 'C++', icon: '⚡' },
            { id: 'rust', name: 'Rust', icon: '🦀' },
            { id: 'go', name: 'Go', icon: '🐹' },
            { id: 'zig', name: 'Zig', icon: '⚡' },
            { id: 'java', name: 'Java', icon: '☕' },
            { id: 'kotlin', name: 'Kotlin', icon: '🟣' },
            { id: 'typescript', name: 'TypeScript', icon: '📘' },
            { id: 'csharp', name: 'C#', icon: '🔷' },
            { id: 'ruby', name: 'Ruby', icon: '💎' },
            { id: 'swift', name: 'Swift', icon: '🕊️' },
            { id: 'haskell', name: 'Haskell', icon: 'λ' },
            { id: 'sql', name: 'SQL', icon: '🗄️' },
          ].map((lang) => {
            const isCurrent = showCompiler && selectedCompilerLang === lang.id
            return (
              <button
                key={lang.id}
                onClick={() => handleOpenCompilerWithLang(lang.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-gold text-black font-bold shadow-xs'
                    : 'bg-surface hover:bg-surface-hover border border-border-warm text-muted hover:text-ink hover:border-gold/40'
                }`}
              >
                <span>{lang.icon}</span>
                <span>{lang.name}</span>
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
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel p-5 border border-border-warm flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-warm/50">
              <div className="flex items-center gap-2">
                <Icon name="folder" size={16} className="text-gold" />
                <h3 className="font-display font-bold text-sm text-ink">Project Explorer</h3>
              </div>
              <span className="text-[10px] font-mono text-muted">
                {workspaceFiles.length} key files in workspace
              </span>
            </div>

            <p className="text-xs text-muted font-sans mb-3">
              Explore your live SuperFlow workspace files. Click any file to inspect purpose, size, and code.
            </p>

            {/* File List */}
            <div className="flex flex-col gap-1.5">
              {workspaceFiles.map((file) => {
                const isSelected = selectedFile === file.name
                return (
                  <div
                    key={file.name}
                    onClick={() => {
                      playClick()
                      setSelectedFile(isSelected ? null : file.name)
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'border-gold bg-gold/10 shadow-xs'
                        : 'border-border-warm/60 bg-surface/50 hover:bg-surface-hover hover:border-gold/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <Icon
                          name="file"
                          size={14}
                          className={file.category === 'python' ? 'text-gold' : 'text-muted'}
                        />
                        <span className="truncate font-semibold text-foreground/90">{file.name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border-warm text-muted shrink-0">
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

            {/* Direct Folder Jump Buttons */}
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

          {/* Quick Stats / Recent Projects */}
          <div className="glass-panel p-4 border border-border-warm text-xs font-sans">
            <h4 className="font-display font-bold text-ink mb-2">Recent Agent Sessions</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { name: 'superflow-core', path: '~/agent_engine', status: 'Active' },
                { name: 'polyglot-compiler', path: '~/compiler/engine', status: '505 Langs' },
                { name: 'virtual-ai-hub', path: '~/virtual/models', status: '13 Models' },
              ].map((rec) => (
                <button
                  key={rec.name}
                  onClick={() => handleOpenFolder('c:/Users/heman/Desktop/agent_engine', rec.name)}
                  className="p-2 rounded-lg hover:bg-surface-hover border border-transparent hover:border-border-warm transition-colors flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="truncate">
                    <div className="font-semibold text-ink truncate">{rec.name}</div>
                    <div className="text-[10px] text-muted font-mono">{rec.path}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {rec.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==============================================================
            RIGHT PANEL (7 COLS): SUPERFLOW CAPABILITIES & WALKTHROUGHS
           ============================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-panel p-5 border border-border-warm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-warm/40">
              <div>
                <h3 className="font-display font-bold text-base text-ink">What SuperFlow Can Do</h3>
                <p className="text-xs text-muted">Core capabilities, compilers, and virtual cloud AI models</p>
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
                  className="p-4 rounded-xl border border-border-warm/70 bg-surface/40 hover:bg-surface hover:border-gold/50 transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-medium ${cap.accent}`}>
                        {cap.tagline}
                      </span>
                      <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">
                        {cap.icon === 'sparkles' ? '✨' : cap.icon === 'settings' ? '⚙️' : cap.icon === 'website' ? '🌐' : cap.icon}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-ink group-hover:text-gold transition-colors mb-1">
                      {cap.title}
                    </h4>
                    <p className="text-xs text-muted font-sans leading-relaxed mb-4">
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

            {/* Interactive Quick Prompts */}
            <div className="mt-5 pt-4 border-t border-border-warm/50">
              <span className="text-xs font-display font-bold text-ink block mb-2">
                Prompt Suggestions & Fast Starters:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Compile C / C++ Algorithm',
                  'Run Rust Memory Safety Check',
                  'Ask Claude 3.7 to Refactor Function',
                  'DeepSeek-R1 Math Reasoning',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      playPluck('A4')
                      if (prompt.includes('C / C++')) {
                        handleOpenCompilerWithLang('c')
                      } else if (prompt.includes('Rust')) {
                        handleOpenCompilerWithLang('rust')
                      } else if (prompt.includes('Claude 3.7') || prompt.includes('DeepSeek-R1')) {
                        setIsVirtualAIModalOpen(true)
                      } else {
                        setProjectName(prompt.toLowerCase().replace(/\s+/g, '-'))
                        setStage('workshop')
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-border-warm text-[11px] text-muted hover:text-ink hover:border-gold/50 transition-all cursor-pointer"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Engine Health Status Banner */}
          <div className="p-4 rounded-xl border border-gold/30 bg-gold/5 flex items-center justify-between text-xs font-sans text-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-foreground/90 font-medium">Virtual AI & Polyglot Engine:</span>
              <span className="font-mono text-[11px]">505 Languages • 13 Virtual AI Models Active</span>
            </div>
            <button
              onClick={() => setIs500CatalogOpen(true)}
              className="text-gold hover:underline cursor-pointer font-medium"
            >
              Browse 505 Languages Catalog →
            </button>
          </div>
        </div>
      </div>

      {/* Virtual AI Hub Modal */}
      <VirtualAIModelHubModal
        isOpen={isVirtualAIModalOpen}
        onClose={() => setIsVirtualAIModalOpen(false)}
        onSelectModel={(modelId) => {
          setActiveVirtualModelId(modelId)
          playPluck('F4')
        }}
      />

      {/* Universal 500+ Programming Languages Catalog Modal */}
      <LanguageCatalog500Modal
        isOpen={is500CatalogOpen}
        onClose={() => setIs500CatalogOpen(false)}
        onSelectLanguage={handleSelectFrom500Modal}
        currentLanguageId={selectedCompilerLang}
      />
    </div>
  )
}

export default SuperFlowWelcomeView
