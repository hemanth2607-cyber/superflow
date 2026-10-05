import React, { useState, useEffect } from 'react'
import { useAudioStore } from '../../stores/useAudioStore'

// Declare electronAPI on window for TypeScript
declare global {
  interface Window {
    electronAPI?: {
      isDesktop?: boolean
      openDirectoryDialog?: () => Promise<string | null>
      executeCode?: (args: { language: string; code: string; stdin?: string }) => Promise<{
        success: boolean
        notInstalled?: boolean
        stage?: string
        stdout?: string
        stderr?: string
        exitCode?: number
        duration?: number
        error?: string
      }>
      checkCompilers?: () => Promise<Record<string, string | null>>
    }
  }
}

export interface LanguageDef {
  id: string
  name: string
  extension: string
  pistonLang: string
  version: string
  icon: string
  category: 'systems' | 'interpreted' | 'web' | 'jvm' | 'functional'
  starterCode: string
}

export const SUPPORTED_LANGUAGES: LanguageDef[] = [
  {
    id: 'python',
    name: 'Python 3',
    extension: '.py',
    pistonLang: 'python',
    version: '3.14 / 3.10',
    icon: '🐍',
    category: 'interpreted',
    starterCode: `# SuperFlow Polyglot Python Runner
import sys

def main():
    languages = ["Python", "Rust", "C", "C++", "Java", "Go", "TypeScript"]
    print(f"🐍 Python {sys.version.split()[0]} is running inside SuperFlow!")
    print("Polyglot Engine supports compiling all major languages.")
    
    # Simple algorithm demonstration
    squares = [x**2 for x in range(1, 6)]
    print(f"Generated squares: {squares}")

if __name__ == "__main__":
    main()
`,
  },
  {
    id: 'c',
    name: 'C (GCC)',
    extension: '.c',
    pistonLang: 'c',
    version: 'GCC 16 / C17',
    icon: '⚙️',
    category: 'systems',
    starterCode: `// SuperFlow Polyglot C Runner
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("⚙️ Compiled with GCC!\\n");
    printf("SuperFlow Native C Execution Engine\\n");
    
    // Memory allocation demonstration
    int n = 5;
    int *arr = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        arr[i] = (i + 1) * 10;
        printf("Index [%d] = %d\\n", i, arr[i]);
    }
    
    free(arr);
    return 0;
}
`,
  },
  {
    id: 'cpp',
    name: 'C++ 20',
    extension: '.cpp',
    pistonLang: 'cpp',
    version: 'G++ 16 / C++20',
    icon: '⚡',
    category: 'systems',
    starterCode: `// SuperFlow Polyglot C++20 Runner
#include <iostream>
#include <vector>
#include <numeric>
#include <string>

int main() {
    std::cout << "⚡ Compiled with G++ (C++20)!\\n";
    
    std::vector<std::string> features = {
        "Concepts", "Ranges", "Coroutines", "Autonomous Agent Engine"
    };
    
    std::cout << "SuperFlow Polyglot Engine active features:\\n";
    for (const auto& feat : features) {
        std::cout << "  - " << feat << "\\n";
    }
    
    return 0;
}
`,
  },
  {
    id: 'rust',
    name: 'Rust',
    extension: '.rs',
    pistonLang: 'rust',
    version: 'rustc 1.97.1',
    icon: '🦀',
    category: 'systems',
    starterCode: `// SuperFlow Polyglot Rust Runner
fn main() {
    println!("🦀 Hello from Rust in SuperFlow!");
    
    let tasks = vec!["Parse AST", "Verify Memory Safety", "Compile to Native", "Execute Loop"];
    
    println!("Pipeline stages:");
    for (idx, task) in tasks.iter().enumerate() {
        println!("  [{}] {}", idx + 1, task);
    }
    
    let sum: i32 = (1..=10).sum();
    println!("Sum 1..10 = {}", sum);
}
`,
  },
  {
    id: 'java',
    name: 'Java 21',
    extension: '.java',
    pistonLang: 'java',
    version: 'OpenJDK 21',
    icon: '☕',
    category: 'jvm',
    starterCode: `// SuperFlow Polyglot Java Runner
import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.println("☕ Compiled with javac (Java 21) in SuperFlow!");
        
        List<String> modules = List.of("Agent Core", "Tool Registry", "Computer Use", "Polyglot Compiler");
        System.out.println("Active SuperFlow Modules:");
        modules.forEach(m -> System.out.println("  • " + m));
    }
}
`,
  },
  {
    id: 'javascript',
    name: 'JavaScript (Node)',
    extension: '.js',
    pistonLang: 'javascript',
    version: 'Node.js v26.3',
    icon: '🟨',
    category: 'web',
    starterCode: `// SuperFlow Polyglot JavaScript Runner
console.log("🟨 Node.js V8 Runtime in SuperFlow!");

const agentStatus = {
  engine: "SuperFlow",
  version: "1.0.0",
  polyglot: true,
  timestamp: new Date().toISOString()
};

console.log("Telemetry payload:", JSON.stringify(agentStatus, null, 2));
`,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: '.ts',
    pistonLang: 'typescript',
    version: 'TypeScript 5.x',
    icon: '🔷',
    category: 'web',
    starterCode: `// SuperFlow Polyglot TypeScript Runner
interface AgentWorkflow {
  id: string;
  name: string;
  stepCount: number;
  isComplete: boolean;
}

const activeWorkflow: AgentWorkflow = {
  id: "wf-101",
  name: "Polyglot Compiler Compilation",
  stepCount: 4,
  isComplete: true
};

console.log(\`🔷 TypeScript Typed Execution: \${activeWorkflow.name} (Steps: \${activeWorkflow.stepCount})\`);
`,
  },
  {
    id: 'go',
    name: 'Go',
    extension: '.go',
    pistonLang: 'go',
    version: 'Go 1.22',
    icon: '🐹',
    category: 'systems',
    starterCode: `// SuperFlow Polyglot Go Runner
package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("🐹 Hello from Go in SuperFlow!")
	fmt.Printf("Timestamp: %s\\n", time.Now().Format(time.RFC3339))
	
	ch := make(chan string)
	go func() {
		ch <- "Goroutine thread executed successfully!"
	}()
	
	msg := <-ch
	fmt.Println("Channel received:", msg)
}
`,
  },
  {
    id: 'powershell',
    name: 'PowerShell',
    extension: '.ps1',
    pistonLang: 'powershell',
    version: 'PS 5.1 / 7.x',
    icon: '💻',
    category: 'interpreted',
    starterCode: `# SuperFlow Polyglot PowerShell Runner
Write-Host "💻 PowerShell Script Execution in SuperFlow!" -ForegroundColor Cyan

$info = [PSCustomObject]@{
    Platform = $PSVersionTable.Platform
    OS       = $env:OS
    Host     = $Host.Name
}

$info | Format-Table -AutoSize
`,
  },
  {
    id: 'csharp',
    name: 'C# (.NET)',
    extension: '.cs',
    pistonLang: 'csharp',
    version: '.NET 8 / 9',
    icon: '🟣',
    category: 'systems',
    starterCode: `// SuperFlow Polyglot C# Runner
using System;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("🟣 Hello from C# in SuperFlow Polyglot Engine!");
        var numbers = Enumerable.Range(1, 5).Select(x => x * x);
        Console.WriteLine("Squares: " + string.Join(", ", numbers));
    }
}
`,
  },
  {
    id: 'php',
    name: 'PHP',
    extension: '.php',
    pistonLang: 'php',
    version: 'PHP 8.x',
    icon: '🐘',
    category: 'interpreted',
    starterCode: `<?php
// SuperFlow Polyglot PHP Runner
echo "🐘 Hello from PHP in SuperFlow!\\n";
$data = ["Autonomous", "Agent", "Compiler", "Marionette"];
echo "Tokens: " . implode(" -> ", $data) . "\\n";
`,
  },
  {
    id: 'ruby',
    name: 'Ruby',
    extension: '.rb',
    pistonLang: 'ruby',
    version: 'Ruby 3.x',
    icon: '💎',
    category: 'interpreted',
    starterCode: `# SuperFlow Polyglot Ruby Runner
puts "💎 Hello from Ruby in SuperFlow!"

[1, 2, 3, 4, 5].each do |n|
  puts "  Diamond step: #{n} (cubed: #{n**3})"
end
`,
  },
  {
    id: 'zig',
    name: 'Zig',
    extension: '.zig',
    pistonLang: 'zig',
    version: 'Zig 0.13',
    icon: '⚡',
    category: 'systems',
    starterCode: `// SuperFlow Polyglot Zig Runner
const std = @import("std");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("⚡ Hello from Zig in SuperFlow!\\n", .{});
    try stdout.print("Zero overhead, robust systems programming.\\n", .{});
}
`,
  },
  {
    id: 'lua',
    name: 'Lua',
    extension: '.lua',
    pistonLang: 'lua',
    version: 'Lua 5.4',
    icon: '🌙',
    category: 'interpreted',
    starterCode: `-- SuperFlow Polyglot Lua Runner
print("🌙 Hello from Lua in SuperFlow!")

local languages = {"Lua", "Python", "Rust", "C"}
for i, lang in ipairs(languages) do
    print(string.format("  [%d] %s", i, lang))
end
`,
  },
  {
    id: 'sql',
    name: 'SQL (SQLite)',
    extension: '.sql',
    pistonLang: 'sqlite3',
    version: 'SQLite 3',
    icon: '🗄️',
    category: 'functional',
    starterCode: `-- SuperFlow Polyglot SQL Runner
CREATE TABLE agents (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'active'
);

INSERT INTO agents (name, role) VALUES 
('Chinese Opera', 'Martial Shadow Warrior'),
('Bunraku Dancer', 'Kimono Fan Performer'),
('Wayang Prince', 'Javanese Shadow Hero'),
('Celestial Dancer', 'Silk Ribbon Maiden');

SELECT id, name, role, status FROM agents;
`,
  },
]

interface PolyglotCompilerStudioProps {
  onClose?: () => void
  initialLanguage?: string
}

export const PolyglotCompilerStudio: React.FC<PolyglotCompilerStudioProps> = ({
  onClose,
  initialLanguage = 'python',
}) => {
  const { playClick, playPluck } = useAudioStore()

  // Selected language definition
  const [selectedLang, setSelectedLang] = useState<LanguageDef>(
    SUPPORTED_LANGUAGES.find((l) => l.id === initialLanguage) || SUPPORTED_LANGUAGES[0]
  )

  // Current code buffer (keyed by language id)
  const [codeMap, setCodeMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    SUPPORTED_LANGUAGES.forEach((l) => {
      map[l.id] = l.starterCode
    })
    return map
  })

  // Stdin input buffer
  const [stdin, setStdin] = useState('')
  const [showStdin, setShowStdin] = useState(false)

  // Execution state
  const [isRunning, setIsRunning] = useState(false)
  const [stdout, setStdout] = useState('')
  const [stderr, setStderr] = useState('')
  const [exitCode, setExitCode] = useState<number | null>(null)
  const [durationMs, setDurationMs] = useState<number | null>(null)
  const [executionEngine, setExecutionEngine] = useState<string>('Ready')

  // Search filter for languages
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const currentCode = codeMap[selectedLang.id] || selectedLang.starterCode

  const handleCodeChange = (newCode: string) => {
    setCodeMap((prev) => ({
      ...prev,
      [selectedLang.id]: newCode,
    }))
  }

  const handleSelectLanguage = (lang: LanguageDef) => {
    playClick()
    setSelectedLang(lang)
    setStdout('')
    setStderr('')
    setExitCode(null)
    setDurationMs(null)
    setExecutionEngine('Ready')
  }

  // Universal Code Execution Engine (Local Native Electron + Universal Piston Cloud Fallback)
  const handleRunCode = async () => {
    if (isRunning) return
    playPluck('C5')
    setIsRunning(true)
    setStdout('')
    setStderr('')
    setExitCode(null)
    setDurationMs(null)
    setExecutionEngine('Compiling & Running...')

    const startTime = performance.now()

    // 1. First Attempt: Native Local Compiler (If running inside Electron)
    if (typeof window !== 'undefined' && window.electronAPI?.executeCode) {
      try {
        const localResult = await window.electronAPI.executeCode({
          language: selectedLang.id,
          code: currentCode,
          stdin,
        })

        // If local compiler ran (even if code failed), use the output
        if (!localResult.notInstalled) {
          setStdout(localResult.stdout || '')
          setStderr(localResult.stderr || '')
          setExitCode(localResult.exitCode ?? (localResult.success ? 0 : 1))
          setDurationMs(Math.round(localResult.duration || performance.now() - startTime))
          setExecutionEngine(`Native Local Engine (${selectedLang.version})`)
          setIsRunning(false)
          return
        }
      } catch (err) {
        console.warn('Native execution skipped, trying universal sandbox:', err)
      }
    }

    // 2. Second Attempt: Universal Cloud Sandbox API (Piston v2 - 50+ languages supported)
    try {
      setExecutionEngine('Universal Sandbox Engine...')
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLang.pistonLang,
          version: '*',
          files: [
            {
              name: `main${selectedLang.extension}`,
              content: currentCode,
            },
          ],
          stdin: stdin,
        }),
      })

      const data = await response.json()
      const totalElapsed = Math.round(performance.now() - startTime)

      if (data.run) {
        setStdout(data.run.stdout || '')
        setStderr(data.run.stderr || data.compile?.stderr || '')
        setExitCode(data.run.code ?? (data.compile?.code || 0))
        setDurationMs(totalElapsed)
        setExecutionEngine(`Universal Sandbox Engine (${data.language} v${data.version})`)
      } else if (data.message) {
        setStderr(data.message)
        setExitCode(1)
        setDurationMs(totalElapsed)
        setExecutionEngine('Universal Sandbox Error')
      }
    } catch (err: any) {
      // 3. Fallback for JavaScript: In-browser execution!
      if (selectedLang.id === 'javascript') {
        try {
          const logs: string[] = []
          const originalLog = console.log
          console.log = (...args: any[]) => {
            logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '))
          }

          // Evaluate JS safely
          const evalFn = new Function(currentCode)
          evalFn()

          console.log = originalLog
          setStdout(logs.join('\n') || 'Executed successfully with no output.')
          setExitCode(0)
          setDurationMs(Math.round(performance.now() - startTime))
          setExecutionEngine('Browser V8 Engine')
        } catch (evalErr: any) {
          setStderr(evalErr.message)
          setExitCode(1)
          setDurationMs(Math.round(performance.now() - startTime))
          setExecutionEngine('Browser V8 Error')
        }
      } else {
        setStderr(`Execution error: ${err.message || 'Unable to connect to compiler engine'}`)
        setExitCode(1)
        setDurationMs(Math.round(performance.now() - startTime))
        setExecutionEngine('Offline')
      }
    } finally {
      setIsRunning(false)
    }
  }

  // Filtered languages
  const filteredLanguages = SUPPORTED_LANGUAGES.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.id.toLowerCase().includes(searchFilter.toLowerCase())
    const matchesCat = selectedCategory === 'all' || l.category === selectedCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 glass-panel rounded-3xl border border-border-warm shadow-2xl animate-fadeIn flex flex-col gap-4">
      {/* 1. Header & Language Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border-warm/50 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center border border-gold/40 text-xl shadow-xs">
            {selectedLang.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-xl text-ink">
                {selectedLang.name}
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold-dark dark:text-gold border border-gold/40 font-medium">
                {selectedLang.extension}
              </span>
              <span className="text-xs text-muted font-sans hidden md:inline">
                • {selectedLang.version}
              </span>
            </div>
            <p className="text-xs text-muted font-sans">
              Universal Polyglot Runner • Compiles and executes native C, C++, Rust, Python, Java, Go & more
            </p>
          </div>
        </div>

        {/* Compile & Run Action Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowStdin(!showStdin)}
            className={`px-3 py-2 rounded-xl text-xs font-sans font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
              showStdin
                ? 'bg-gold/20 border-gold/50 text-gold'
                : 'bg-surface border-border-warm text-muted hover:text-foreground'
            }`}
          >
            <span>Stdin</span>
            {stdin.trim() && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`px-5 py-2 rounded-xl font-sans text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer ${
              isRunning
                ? 'bg-muted/30 text-muted cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 hover:scale-105 active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Compiling...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Compile & Run</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-hover text-muted hover:text-foreground transition-colors cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Language Selection Carousel / Pill Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5">
            {['all', 'systems', 'interpreted', 'web', 'jvm'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-medium capitalize transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gold/20 text-gold border border-gold/40'
                    : 'text-muted hover:text-foreground hover:bg-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search language..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-40 sm:w-48 px-2.5 py-1 rounded-lg bg-surface border border-border-warm text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-gold/50 font-sans"
            />
          </div>
        </div>

        {/* Language Grid / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {filteredLanguages.map((lang) => {
            const isSelected = selectedLang.id === lang.id
            return (
              <button
                key={lang.id}
                onClick={() => handleSelectLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-sans whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'border-gold bg-gold/20 text-gold-dark dark:text-gold font-bold shadow-xs'
                    : 'border-border-warm/60 bg-surface/50 text-muted hover:text-foreground hover:border-gold/30 hover:bg-surface-hover'
                }`}
              >
                <span>{lang.icon}</span>
                <span>{lang.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Code Editor & Terminal Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[420px]">
        {/* Code Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-border-warm bg-[#0f0e0d] overflow-hidden shadow-inner">
          <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-border-warm/40 text-xs font-mono text-muted">
            <span className="flex items-center gap-2 text-foreground/80 font-medium">
              <span>{selectedLang.icon}</span>
              <span>main{selectedLang.extension}</span>
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-muted/60">Ctrl + Enter to run</span>
              <button
                onClick={() => handleCodeChange(selectedLang.starterCode)}
                className="text-muted hover:text-gold transition-colors cursor-pointer"
              >
                Reset Template
              </button>
            </div>
          </div>

          <textarea
            value={currentCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                handleRunCode()
              }
            }}
            spellCheck={false}
            className="flex-1 w-full p-4 bg-transparent font-mono text-xs md:text-sm text-cream-light leading-relaxed resize-none focus:outline-none selection:bg-gold/30 border-none"
            placeholder={`Write ${selectedLang.name} code here...`}
          />

          {/* Stdin Drawer (if toggled) */}
          {showStdin && (
            <div className="p-3 border-t border-border-warm/40 bg-black/60 flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted flex items-center justify-between">
                <span>Standard Input (stdin):</span>
                <span className="text-[10px] text-muted/60">Passed to program input</span>
              </span>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input values here..."
                rows={2}
                className="w-full p-2 rounded-lg bg-surface border border-border-warm font-mono text-xs text-ink focus:outline-none focus:border-gold/50"
              />
            </div>
          )}
        </div>

        {/* Execution Output Terminal (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-border-warm bg-[#0a0a0a] overflow-hidden shadow-inner">
          <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-border-warm/40 text-xs font-mono text-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-foreground/80">Output Terminal</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              {durationMs !== null && (
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-muted font-mono">
                  {durationMs}ms
                </span>
              )}
              {exitCode !== null && (
                <span
                  className={`px-1.5 py-0.5 rounded font-mono font-medium ${
                    exitCode === 0
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      : 'bg-crimson/20 text-crimson border border-crimson/40'
                  }`}
                >
                  Exit: {exitCode}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto max-h-[360px] flex flex-col gap-2">
            {isRunning && (
              <div className="flex items-center gap-2 text-gold animate-pulse">
                <span className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                <span>Compiling and executing code...</span>
              </div>
            )}

            {!isRunning && !stdout && !stderr && (
              <div className="text-muted/60 italic py-12 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-2xl opacity-40">▶</span>
                <span>Click "Compile & Run" to execute this code.</span>
                <span className="text-[11px] text-muted/40">
                  Runs natively on local machine or via universal sandbox.
                </span>
              </div>
            )}

            {stdout && (
              <div className="text-cream-light whitespace-pre-wrap break-words leading-relaxed">
                {stdout}
              </div>
            )}

            {stderr && (
              <div className="text-red-400 whitespace-pre-wrap break-words leading-relaxed border-t border-red-950/40 pt-2">
                <span className="font-bold text-red-300 block mb-1">Compiler / Runtime Error:</span>
                {stderr}
              </div>
            )}
          </div>

          {/* Engine Telemetry Footer */}
          <div className="px-4 py-2 bg-black/60 border-t border-border-warm/40 flex items-center justify-between text-[11px] font-mono text-muted">
            <span className="truncate max-w-[240px]">Engine: {executionEngine}</span>
            <button
              onClick={() => {
                setStdout('')
                setStderr('')
                setExitCode(null)
                setDurationMs(null)
              }}
              className="text-muted/60 hover:text-muted cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PolyglotCompilerStudio
