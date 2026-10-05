import React, { useState, useEffect } from 'react'
import { useAudioStore } from '../../stores/useAudioStore'
import { Icon } from '../ui/Icon'
import { VirtualAIModelHubModal } from './VirtualAIModelHubModal'
import { LanguageCatalog500Modal } from './LanguageCatalog500Modal'
import {
  VIRTUAL_AI_MODELS,
  getStoredVirtualModel,
  executeVirtualAICodingTask,
  VirtualAIResponse,
} from '../../services/virtualAiService'
import {
  POLYGLOT_500_LANGUAGES,
  PolyglotLanguage,
} from '../../services/polyglot500Languages'

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
  category: 'systems' | 'interpreted' | 'web' | 'jvm' | 'functional' | 'scientific' | 'mobile'
  starterCode: string
}

export const SUPPORTED_LANGUAGES: LanguageDef[] = [
  // ==========================================
  // SYSTEMS & LOW LEVEL
  // ==========================================
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
    languages = ["Python", "Rust", "C", "C++", "Java", "Go", "TypeScript", "Zig"]
    print(f"🐍 Python {sys.version.split()[0]} running in SuperFlow!")
    print(f"Supported Polyglot suite: {len(languages)} languages active.")
    
    # List comprehension & algorithm
    squares = [x**2 for x in range(1, 7)]
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
    id: 'go',
    name: 'Go',
    extension: '.go',
    pistonLang: 'go',
    version: 'Go 1.23',
    icon: '🐹',
    category: 'systems',
    starterCode: `// SuperFlow Polyglot Go Runner
package main

import (
    "fmt"
    "time"
)

func worker(id int, ch chan<- string) {
    ch <- fmt.Sprintf("Goroutine %d completed", id)
}

func main() {
    fmt.Println("🐹 Hello from Go in SuperFlow!")
    
    ch := make(chan string, 3)
    for i := 1; i <= 3; i++ {
        go worker(i, ch)
    }
    
    for i := 1; i <= 3; i++ {
        msg := <-ch
        fmt.Println("  -> Received:", msg)
    }
    
    fmt.Println("All goroutines completed at:", time.Now().Format(time.RFC3339))
}
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
    
    const numbers = [_]i32{ 1, 2, 3, 4, 5 };
    var sum: i32 = 0;
    for (numbers) |num| {
        sum += num;
    }
    
    try stdout.print("Sum of numbers: {d}\\n", .{sum});
}
`,
  },
  {
    id: 'd',
    name: 'D (Dlang)',
    extension: '.d',
    pistonLang: 'd',
    version: 'DMD 2.108',
    icon: '🎯',
    category: 'systems',
    starterCode: `// SuperFlow Polyglot D Runner
import std.stdio;
import std.algorithm : map;
import std.array : array;

void main() {
    writeln("🎯 Hello from D (Dlang) in SuperFlow!");
    auto numbers = [1, 2, 3, 4, 5];
    auto cubes = numbers.map!(x => x * x * x).array;
    writeln("Cubes: ", cubes);
}
`,
  },
  {
    id: 'nim',
    name: 'Nim',
    extension: '.nim',
    pistonLang: 'nim',
    version: 'Nim 2.0',
    icon: '👑',
    category: 'systems',
    starterCode: `# SuperFlow Polyglot Nim Runner
import strutils

echo "👑 Hello from Nim in SuperFlow!"

let languages = @["Nim", "C++", "Rust", "Python"]
echo "Expressive systems programming: ", languages.join(", ")

var total = 0
for i in 1..10:
  total += i
echo "Sum 1..10: ", total
`,
  },
  {
    id: 'fortran',
    name: 'Fortran',
    extension: '.f90',
    pistonLang: 'fortran',
    version: 'Fortran 95 / GCC',
    icon: '🔢',
    category: 'scientific',
    starterCode: `! SuperFlow Polyglot Fortran Runner
program hello
    implicit none
    integer :: i, total
    total = 0
    print *, "🔢 Hello from Fortran 95 in SuperFlow!"
    do i = 1, 10
        total = total + i
    end do
    print *, "Sum 1 to 10 is: ", total
end program hello
`,
  },
  {
    id: 'nasm',
    name: 'Assembly (NASM x86)',
    extension: '.asm',
    pistonLang: 'nasm',
    version: 'NASM 2.16',
    icon: '💾',
    category: 'systems',
    starterCode: `; SuperFlow Polyglot Assembly Runner (x86_64 Linux)
section .data
    msg db '💾 Hello from x86 Assembly in SuperFlow!', 0xA
    len equ $ - msg

section .text
    global _start

_start:
    mov edx, len
    mov ecx, msg
    mov ebx, 1
    mov eax, 4
    int 0x80

    mov eax, 1
    xor ebx, ebx
    int 0x80
`,
  },
  {
    id: 'pascal',
    name: 'Pascal',
    extension: '.pas',
    pistonLang: 'pascal',
    version: 'Free Pascal 3.2',
    icon: '📜',
    category: 'systems',
    starterCode: `// SuperFlow Polyglot Pascal Runner
program SuperFlowPascal;
var
  i, sum: integer;
begin
  writeln('📜 Hello from Free Pascal in SuperFlow!');
  sum := 0;
  for i := 1 to 10 do
    sum := sum + i;
  writeln('Sum from 1 to 10 = ', sum);
end.
`,
  },

  // ==========================================
  // JVM & ENTERPRISE
  // ==========================================
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
        System.out.println("☕ Compiled with Java 21 in SuperFlow!");
        
        List<String> modules = List.of("Agent Core", "Tool Registry", "Computer Use", "Polyglot Compiler");
        System.out.println("Active SuperFlow Modules:");
        modules.forEach(m -> System.out.println("  • " + m));
        
        int total = modules.stream().mapToInt(String::length).sum();
        System.out.println("Total characters in module names: " + total);
    }
}
`,
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    extension: '.kt',
    pistonLang: 'kotlin',
    version: 'Kotlin 2.0',
    icon: '🟣',
    category: 'jvm',
    starterCode: `// SuperFlow Polyglot Kotlin Runner
fun main() {
    println("🟣 Hello from Kotlin in SuperFlow!")
    
    val items = listOf("Coroutines", "Null Safety", "Extension Functions", "Multiplatform")
    println("Key Kotlin features:")
    items.forEachIndexed { idx, item ->
        println("  [$idx] $item")
    }
}
`,
  },
  {
    id: 'scala',
    name: 'Scala',
    extension: '.scala',
    pistonLang: 'scala',
    version: 'Scala 3.4',
    icon: '🔴',
    category: 'jvm',
    starterCode: `// SuperFlow Polyglot Scala Runner
object Main extends App {
  println("🔴 Hello from Scala 3 in SuperFlow!")
  
  val numbers = List(1, 2, 3, 4, 5)
  val squares = numbers.map(x => x * x)
  println(s"Mapped squares: $squares")
}
`,
  },
  {
    id: 'csharp',
    name: 'C# 12',
    extension: '.cs',
    pistonLang: 'csharp',
    version: '.NET 8 / C# 12',
    icon: '🔷',
    category: 'jvm',
    starterCode: `// SuperFlow Polyglot C# Runner
using System;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("🔷 Hello from C# 12 (.NET 8) in SuperFlow!");
        
        var numbers = Enumerable.Range(1, 10);
        var evenSquares = numbers.Where(n => n % 2 == 0).Select(n => n * n);
        
        Console.WriteLine("Even squares 1..10: " + string.Join(", ", evenSquares));
    }
}
`,
  },
  {
    id: 'fsharp',
    name: 'F#',
    extension: '.fs',
    pistonLang: 'fsharp',
    version: 'F# 8 / .NET 8',
    icon: '🔶',
    category: 'functional',
    starterCode: `// SuperFlow Polyglot F# Runner
open System

printfn "🔶 Hello from F# in SuperFlow!"

let squares = [ 1 .. 6 ] |> List.map (fun x -> x * x)
printfn "Squares: %A" squares
`,
  },

  // ==========================================
  // WEB & SCRIPTING
  // ==========================================
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: '.ts',
    pistonLang: 'typescript',
    version: 'TS 5.7 / Node',
    icon: '📘',
    category: 'web',
    starterCode: `// SuperFlow Polyglot TypeScript Runner
interface AgentMetric {
    name: string;
    score: number;
    latencyMs: number;
}

const metrics: AgentMetric[] = [
    { name: "Code Analysis", score: 99.4, latencyMs: 12 },
    { name: "Memory Safety", score: 100.0, latencyMs: 8 },
    { name: "Polyglot Runtime", score: 98.8, latencyMs: 15 },
];

console.log("📘 TypeScript execution in SuperFlow:");
metrics.forEach(m => {
    console.log(\`  ✓ \${m.name}: Score=\${m.score}%, Latency=\${m.latencyMs}ms\`);
});
`,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: '.js',
    pistonLang: 'javascript',
    version: 'Node.js v26 / V8',
    icon: '💛',
    category: 'web',
    starterCode: `// SuperFlow Polyglot JavaScript Runner
console.log("💛 Node.js / JavaScript V8 Engine Active in SuperFlow!");

const stages = ["Parse", "Typecheck", "Compile", "Sandbox Run"];
const summary = stages.map((s, i) => \`Step \${i + 1}: \${s}\`);

console.log(summary.join(" -> "));
console.log("V8 Execution completed cleanly.");
`,
  },
  {
    id: 'php',
    name: 'PHP 8',
    extension: '.php',
    pistonLang: 'php',
    version: 'PHP 8.3',
    icon: '🐘',
    category: 'interpreted',
    starterCode: `<?php
// SuperFlow Polyglot PHP Runner
echo "🐘 Hello from PHP 8.3 in SuperFlow!\\n";

$data = [
    "engine" => "Polyglot",
    "languages_supported" => 33,
    "virtual_ai_connected" => true
];

echo json_encode($data, JSON_PRETTY_PRINT) . "\\n";
?>
`,
  },
  {
    id: 'ruby',
    name: 'Ruby',
    extension: '.rb',
    pistonLang: 'ruby',
    version: 'Ruby 3.3',
    icon: '💎',
    category: 'interpreted',
    starterCode: `# SuperFlow Polyglot Ruby Runner
puts "💎 Hello from Ruby in SuperFlow!"

words = %w[autumn spring puppet shadow theatre flow]
capitalized = words.map(&:capitalize)

puts "Capitalized collection:"
capitalized.each { |w| puts "  - #{w}" }
`,
  },
  {
    id: 'perl',
    name: 'Perl',
    extension: '.pl',
    pistonLang: 'perl',
    version: 'Perl 5.38',
    icon: '🐪',
    category: 'interpreted',
    starterCode: `#!/usr/bin/perl
# SuperFlow Polyglot Perl Runner
use strict;
use warnings;

print "🐪 Hello from Perl 5 in SuperFlow!\\n";
my @fruits = ("Apple", "Banana", "Cherry", "Dragonfruit");
foreach my $fruit (@fruits) {
    print "  Fruit: $fruit\\n";
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
print("🌙 Hello from Lua 5.4 in SuperFlow!")

local character = {
    name = "Bunraku Puppet",
    culture = "Traditional Japanese",
    joints = 12
}

for k, v in pairs(character) do
    print(string.format("  %s: %s", k, tostring(v)))
end
`,
  },
  {
    id: 'bash',
    name: 'Bash',
    extension: '.sh',
    pistonLang: 'bash',
    version: 'GNU Bash 5.2',
    icon: '🐚',
    category: 'interpreted',
    starterCode: `#!/usr/bin/env bash
# SuperFlow Polyglot Bash Runner
echo "🐚 Hello from Bash in SuperFlow!"
echo "Current Kernel: $(uname -s 2>/dev/null || echo 'Native Host')"

for i in {1..5}; do
    echo "  -> Processing batch item $i"
done

echo "Bash pipeline completed successfully."
`,
  },
  {
    id: 'powershell',
    name: 'PowerShell',
    extension: '.ps1',
    pistonLang: 'powershell',
    version: 'PowerShell 7 / 5.1',
    icon: '💠',
    category: 'interpreted',
    starterCode: `# SuperFlow Polyglot PowerShell Runner
Write-Host "💠 Hello from PowerShell in SuperFlow!" -ForegroundColor Cyan

$processList = @("agent_engine", "electron_host", "polyglot_compiler")
foreach ($proc in $processList) {
    [PSCustomObject]@{
        ProcessName = $proc
        Status = "Running"
        Health = "Optimal"
    } | Format-Table -AutoSize
}
`,
  },
  {
    id: 'r',
    name: 'R (Statistics)',
    extension: '.r',
    pistonLang: 'rscript',
    version: 'R 4.4',
    icon: '📊',
    category: 'scientific',
    starterCode: `# SuperFlow Polyglot R Runner
cat("📊 Hello from R in SuperFlow!\\n")

data <- c(12, 19, 3, 5, 2, 3, 20, 15)
cat("Mean:", mean(data), "\\n")
cat("Standard Deviation:", sd(data), "\\n")
cat("Summary:\\n")
print(summary(data))
`,
  },
  {
    id: 'julia',
    name: 'Julia',
    extension: '.jl',
    pistonLang: 'julia',
    version: 'Julia 1.10',
    icon: '🟣',
    category: 'scientific',
    starterCode: `# SuperFlow Polyglot Julia Runner
println("🟣 Hello from Julia in SuperFlow!")

matrix = [1 2 3; 4 5 6; 7 8 9]
println("Matrix:")
display(matrix)

println("\nSum of diagonal: ", sum(matrix[i, i] for i in 1:3))
`,
  },

  // ==========================================
  // FUNCTIONAL
  // ==========================================
  {
    id: 'haskell',
    name: 'Haskell',
    extension: '.hs',
    pistonLang: 'haskell',
    version: 'GHC 9.8',
    icon: 'λ',
    category: 'functional',
    starterCode: `-- SuperFlow Polyglot Haskell Runner
fib :: Int -> Integer
fib 0 = 0
fib 1 = 1
fib n = fib (n - 1) + fib (n - 2)

main :: IO ()
main = do
    putStrLn "λ Hello from Haskell (GHC) in SuperFlow!"
    let fibs = map fib [0..10]
    putStrLn $ "Fibonacci sequence: " ++ show fibs
`,
  },
  {
    id: 'elixir',
    name: 'Elixir',
    extension: '.ex',
    pistonLang: 'elixir',
    version: 'Elixir 1.16',
    icon: '💧',
    category: 'functional',
    starterCode: `# SuperFlow Polyglot Elixir Runner
defmodule Greeter do
  def run do
    IO.puts("💧 Hello from Elixir (BEAM) in SuperFlow!")
    
    1..5
    |> Enum.map(&(&1 * &1))
    |> Enum.each(&IO.puts("  Square: #{&1}"))
  end
end

Greeter.run()
`,
  },
  {
    id: 'erlang',
    name: 'Erlang',
    extension: '.erl',
    pistonLang: 'erlang',
    version: 'Erlang/OTP 26',
    icon: '🔴',
    category: 'functional',
    starterCode: `% SuperFlow Polyglot Erlang Runner
-module(main).
-export([start/0]).

start() ->
    io:format("🔴 Hello from Erlang/OTP in SuperFlow!~n"),
    List = [1, 2, 3, 4, 5],
    Doubled = lists:map(fun(X) -> X * 2 end, List),
    io:format("Doubled: ~p~n", [Doubled]),
    halt().
`,
  },
  {
    id: 'ocaml',
    name: 'OCaml',
    extension: '.ml',
    pistonLang: 'ocaml',
    version: 'OCaml 5.1',
    icon: '🐫',
    category: 'functional',
    starterCode: `(* SuperFlow Polyglot OCaml Runner *)
let () =
  print_endline "🐫 Hello from OCaml in SuperFlow!";
  let numbers = [1; 2; 3; 4; 5] in
  let squares = List.map (fun x -> x * x) numbers in
  List.iter (fun s -> Printf.printf "  Square: %d\n" s) squares
`,
  },
  {
    id: 'clojure',
    name: 'Clojure',
    extension: '.clj',
    pistonLang: 'clojure',
    version: 'Clojure 1.11',
    icon: '🟢',
    category: 'functional',
    starterCode: `; SuperFlow Polyglot Clojure Runner
(println "🟢 Hello from Clojure in SuperFlow!")

(def agents ["Shadow Puppeteer" "Silk Weaver" "Engine Architect"])
(doseq [a agents]
  (println (str "  Agent active: " a)))
`,
  },
  {
    id: 'lisp',
    name: 'Common Lisp',
    extension: '.lisp',
    pistonLang: 'commonlisp',
    version: 'SBCL 2.4',
    icon: '괄',
    category: 'functional',
    starterCode: `; SuperFlow Polyglot Common Lisp Runner
(format t "괄 Hello from Common Lisp (SBCL) in SuperFlow!~%")
(defparameter *items* '(1 2 3 4 5))
(format t "Squares: ~A~%" (mapcar (lambda (x) (* x x)) *items*))
`,
  },

  // ==========================================
  // MOBILE & DATABASE
  // ==========================================
  {
    id: 'swift',
    name: 'Swift',
    extension: '.swift',
    pistonLang: 'swift',
    version: 'Swift 5.10',
    icon: '🕊️',
    category: 'mobile',
    starterCode: `// SuperFlow Polyglot Swift Runner
import Foundation

print("🕊️ Hello from Swift in SuperFlow!")

struct Puppet {
    let name: String
    let origin: String
}

let troupe = [
    Puppet(name: "Silk Dancer", origin: "China"),
    Puppet(name: "Wayang Kulit", origin: "Java")
]

for puppet in troupe {
    print("  \(puppet.name) from \(puppet.origin)")
}
`,
  },
  {
    id: 'dart',
    name: 'Dart',
    extension: '.dart',
    pistonLang: 'dart',
    version: 'Dart 3.5',
    icon: '🎯',
    category: 'mobile',
    starterCode: `// SuperFlow Polyglot Dart Runner
void main() {
  print('🎯 Hello from Dart in SuperFlow!');
  
  final technologies = ['Flutter', 'Ahead-of-Time', 'Async Streams'];
  for (final tech in technologies) {
    print('  - $tech');
  }
}
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

  // Helper to map 500 catalog language to studio LanguageDef
  const mapPolyglotToLanguageDef = (lang: PolyglotLanguage): LanguageDef => ({
    id: lang.id,
    name: lang.name,
    extension: lang.extension,
    pistonLang: lang.pistonLang || (SUPPORTED_LANGUAGES.some((s) => s.id === lang.id) ? lang.id : 'python'),
    version: lang.year ? `Est. ${lang.year}` : 'Polyglot 500+',
    icon: '⚡',
    category: 'systems',
    starterCode: lang.starterCode,
  })

  // Selected language definition
  const [selectedLang, setSelectedLang] = useState<LanguageDef>(() => {
    const in33 = SUPPORTED_LANGUAGES.find((l) => l.id === initialLanguage)
    if (in33) return in33
    const in500 = POLYGLOT_500_LANGUAGES.find((l) => l.id === initialLanguage)
    if (in500) {
      return mapPolyglotToLanguageDef(in500)
    }
    return SUPPORTED_LANGUAGES[0]
  })

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

  // 505 Languages Directory Modal State
  const [is500CatalogOpen, setIs500CatalogOpen] = useState(false)

  // Virtual AI Model State & Copilot Drawer
  const [isVirtualAIModalOpen, setIsVirtualAIModalOpen] = useState(false)
  const [showAICopilot, setShowAICopilot] = useState(false)
  const [activeVirtualModelId, setActiveVirtualModelId] = useState<string>(getStoredVirtualModel())
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiIsLoading, setAiIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<VirtualAIResponse | null>(null)

  const activeModelDef =
    VIRTUAL_AI_MODELS.find((m) => m.id === activeVirtualModelId) || VIRTUAL_AI_MODELS[0]

  const currentCode = codeMap[selectedLang.id] || selectedLang.starterCode

  // Sync initialLanguage prop changes
  useEffect(() => {
    if (initialLanguage && initialLanguage !== selectedLang.id) {
      const in33 = SUPPORTED_LANGUAGES.find((l) => l.id === initialLanguage)
      if (in33) {
        setSelectedLang(in33)
        return
      }
      const in500 = POLYGLOT_500_LANGUAGES.find((l) => l.id === initialLanguage)
      if (in500) {
        setSelectedLang(mapPolyglotToLanguageDef(in500))
      }
    }
  }, [initialLanguage])

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

  const handleSelectFrom500Catalog = (lang: PolyglotLanguage) => {
    setIs500CatalogOpen(false)
    playPluck('C5')

    // Check if in 33 fast list
    const existing = SUPPORTED_LANGUAGES.find((l) => l.id === lang.id)
    if (existing) {
      handleSelectLanguage(existing)
      return
    }

    // Dynamic language definition from 500 catalog
    const dynamicLang = mapPolyglotToLanguageDef(lang)

    setCodeMap((prev) => ({
      ...prev,
      [dynamicLang.id]: prev[dynamicLang.id] || dynamicLang.starterCode,
    }))
    handleSelectLanguage(dynamicLang)
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
        const res = await window.electronAPI.executeCode({
          language: selectedLang.id,
          code: currentCode,
          stdin: stdin || undefined,
        })

        if (!res.notInstalled) {
          setStdout(res.stdout || '')
          setStderr(res.stderr || (res.error ? String(res.error) : ''))
          setExitCode(res.exitCode ?? (res.success ? 0 : 1))
          setDurationMs(res.duration ?? Math.round(performance.now() - startTime))
          setExecutionEngine(`Native Host (${selectedLang.version})`)
          setIsRunning(false)
          return
        }
      } catch {
        // Fall through to Universal Sandbox
      }
    }

    // 2. Second Attempt: Universal Cloud Sandbox Engine (Piston v2 API)
    setExecutionEngine('Universal Cloud Sandbox (Piston v2)...')
    try {
      const pistonRes = await fetch('https://emkc.org/api/v2/piston/execute', {
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
          run_timeout: 12000,
          compile_timeout: 12000,
        }),
      })

      if (pistonRes.ok) {
        const data = await pistonRes.json()
        const compileOut = data.compile?.output ? `[Compiler]:\n${data.compile.output}\n` : ''
        const runOut = data.run?.stdout || ''
        const runErr = data.run?.stderr || ''

        setStdout((compileOut + runOut).trim())
        setStderr(runErr.trim())
        setExitCode(data.run?.code ?? 0)
        setDurationMs(Math.round(performance.now() - startTime))
        setExecutionEngine(`Universal Sandbox (${data.language || selectedLang.name} ${data.version || ''})`)
        setIsRunning(false)
        return
      }
    } catch {
      // Fall through to in-browser evaluation if JavaScript
    }

    // 3. Fallback for JavaScript: In-browser execution!
    if (selectedLang.id === 'javascript') {
      try {
        const logs: string[] = []
        const originalLog = console.log
        console.log = (...args: unknown[]) => {
          logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '))
          originalLog(...args)
        }

        const fn = new Function(currentCode)
        fn()

        console.log = originalLog
        setStdout(logs.join('\n') || 'Executed successfully (no console output).')
        setExitCode(0)
        setDurationMs(Math.round(performance.now() - startTime))
        setExecutionEngine('Browser V8 Sandbox')
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        setStderr(`JavaScript Runtime Error: ${errorMsg}`)
        setExitCode(1)
        setDurationMs(Math.round(performance.now() - startTime))
        setExecutionEngine('Browser V8 Sandbox')
      }
      setIsRunning(false)
      return
    }

    // Final fallback message
    setStderr(
      `Compilation & execution failed: Local compiler '${selectedLang.id}' not found on PATH, and cloud sandbox was unreachable.`
    )
    setExitCode(1)
    setDurationMs(Math.round(performance.now() - startTime))
    setExecutionEngine('Offline Fallback')
    setIsRunning(false)
  }

  // Handle Virtual AI Coding Actions
  const handleRunAITask = async (action: 'generate' | 'fix' | 'explain' | 'optimize' | 'test') => {
    setAiIsLoading(true)
    playPluck('E4')

    try {
      const res = await executeVirtualAICodingTask({
        modelId: activeVirtualModelId,
        action,
        language: selectedLang.name,
        currentCode,
        prompt: aiPrompt,
        compilerError: stderr,
      })
      setAiResponse(res)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      setAiResponse({
        success: false,
        content: `Virtual AI Error: ${errorMsg}`,
        modelName: activeModelDef.name,
        provider: activeModelDef.provider,
        durationMs: 0,
        isVirtual: true,
      })
    } finally {
      setAiIsLoading(false)
    }
  }

  const handleApplyAICode = () => {
    if (aiResponse?.codeSnippet) {
      handleCodeChange(aiResponse.codeSnippet)
      playPluck('G4')
    }
  }

  // Filter languages by search and category
  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const matchesSearch =
      lang.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      lang.id.toLowerCase().includes(searchFilter.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || lang.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-foreground">
      {/* Top Banner: Polyglot Suite & Virtual AI Hub Notice */}
      <div className="glass-panel p-4 border border-gold/30 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-gold/10 via-surface to-blue-500/10 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-xl shadow-xs">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-lg text-ink">Polyglot Compiler Studio</h2>
              <button
                onClick={() => {
                  playClick()
                  setIs500CatalogOpen(true)
                }}
                className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-gold/20 text-gold font-bold border border-gold/40 hover:bg-gold/30 hover:scale-105 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                title="Browse and search all 505 supported programming languages"
              >
                <span>⚡ 505 Languages</span>
                <span className="text-[9px] opacity-70">Catalog →</span>
              </button>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                ☁️ 13 Virtual AI Models
              </span>
            </div>
            <p className="text-xs text-muted font-sans">
              Compile & run over 500 programming languages natively or via universal cloud sandbox. All coding AI models connected virtually (zero local downloads).
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* 505 Languages Directory Opener */}
          <button
            onClick={() => {
              playClick()
              setIs500CatalogOpen(true)
            }}
            className="px-3 py-1.5 rounded-xl border border-gold/40 bg-gold/15 hover:bg-gold/25 text-gold text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-105"
            title="Open Directory of 505 Programming Languages"
          >
            <span>📚</span>
            <span>505 Languages</span>
            <span className="px-1.5 py-0.2 rounded bg-gold/20 text-[10px] font-mono">Directory</span>
          </button>

          {/* Virtual AI Hub Modal Opener */}
          <button
            onClick={() => {
              playClick()
              setIsVirtualAIModalOpen(true)
            }}
            className="px-3 py-1.5 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span>☁️</span>
            <span>Virtual AI Hub</span>
            <span className="text-[10px] opacity-75">({activeModelDef.name.split(' ')[0]})</span>
          </button>

          {/* AI Copilot Drawer Toggle */}
          <button
            onClick={() => {
              playClick()
              setShowAICopilot(!showAICopilot)
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showAICopilot
                ? 'bg-gold text-black border-gold shadow-md'
                : 'bg-surface hover:bg-surface-hover border-border-warm text-ink'
            }`}
          >
            <Icon name="sparkles" size={14} className={showAICopilot ? 'text-black' : 'text-gold'} />
            <span>AI Copilot</span>
          </button>

          {/* Stdin Toggle */}
          <button
            onClick={() => {
              playClick()
              setShowStdin(!showStdin)
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              showStdin
                ? 'bg-gold/20 border-gold text-gold font-bold'
                : 'bg-surface hover:bg-surface-hover border-border-warm text-muted'
            }`}
          >
            stdin
          </button>

          {/* Run Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs font-sans transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
              isRunning
                ? 'bg-gold/50 text-black/60 cursor-not-allowed'
                : 'bg-gold hover:bg-gold-light text-black hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isRunning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Compiling...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Compile & Run</span>
              </>
            )}
          </button>

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-hover text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <span className="text-base leading-none">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Language Picker Bar */}
      <div className="glass-panel p-3 border border-border-warm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Fast 33' },
            { id: 'systems', label: 'Systems (C/C++/Rust/Zig/Go)' },
            { id: 'interpreted', label: 'Scripting (Python/Ruby/PHP/Lua)' },
            { id: 'jvm', label: 'Enterprise (Java/Kotlin/C#)' },
            { id: 'web', label: 'Web (TypeScript/JS)' },
            { id: 'functional', label: 'Functional (Haskell/Elixir/Lisp)' },
            { id: 'scientific', label: 'Data & Math (R/Julia/Fortran)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-sans transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gold/20 text-gold font-bold border border-gold/40'
                  : 'text-muted hover:text-ink hover:bg-surface-hover border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Direct 500 Directory Modal Button */}
          <button
            onClick={() => {
              playClick()
              setIs500CatalogOpen(true)
            }}
            className="px-2.5 py-1 rounded-lg text-[11px] font-sans transition-all cursor-pointer bg-gold/15 hover:bg-gold/25 text-gold border border-gold/40 font-bold flex items-center gap-1 shadow-xs ml-1"
          >
            <span>⚡ All 505 Languages</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-56">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search language..."
            className="w-full px-3 py-1.5 pl-8 rounded-lg bg-surface border border-border-warm text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-gold"
          />
          <span className="absolute left-2.5 top-2 text-muted text-xs">🔍</span>
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2 top-1.5 text-muted hover:text-ink text-xs cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Language Selector Carousel / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {/* If current selected language is from the 500 catalog and not in the fast 33 list, display it first */}
        {!filteredLanguages.some((l) => l.id === selectedLang.id) && (
          <div className="shrink-0 px-3 py-1.5 rounded-xl border border-gold text-xs font-sans bg-gold/20 text-ink font-bold shadow-xs flex items-center gap-2 ring-2 ring-gold/40">
            <span className="text-base">{selectedLang.icon}</span>
            <span>{selectedLang.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gold/30 text-gold">500+ Active</span>
          </div>
        )}

        {filteredLanguages.map((lang) => {
          const isSelected = selectedLang.id === lang.id
          return (
            <button
              key={lang.id}
              onClick={() => handleSelectLanguage(lang)}
              className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-sans transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-gold/15 border-gold text-ink font-bold shadow-xs'
                  : 'bg-surface hover:bg-surface-hover border-border-warm text-muted hover:text-ink'
              }`}
            >
              <span className="text-base">{lang.icon}</span>
              <span>{lang.name}</span>
              <span className="text-[10px] font-mono opacity-60">({lang.extension})</span>
            </button>
          )
        })}

        {/* 505 Languages Directory Quick Opener */}
        <button
          onClick={() => {
            playClick()
            setIs500CatalogOpen(true)
          }}
          className="shrink-0 px-3 py-1.5 rounded-xl border border-dashed border-gold/60 text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer bg-gold/5 hover:bg-gold/15 text-gold font-bold hover:scale-105"
        >
          <span>⚡</span>
          <span>+ Browse All 505 Languages</span>
        </button>
      </div>

      {/* Main Grid: Code Editor + AI Copilot Drawer (optional) + Output Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Code Editor Panel (7 cols or 6 cols if AI Copilot open) */}
        <div
          className={`${
            showAICopilot ? 'lg:col-span-4' : 'lg:col-span-7'
          } flex flex-col rounded-2xl border border-border-warm bg-[#0d0d0d] overflow-hidden shadow-inner`}
        >
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-border-warm/40 text-xs font-mono text-muted">
            <div className="flex items-center gap-2">
              <span className="text-base">{selectedLang.icon}</span>
              <span className="font-bold text-foreground">main{selectedLang.extension}</span>
              <span className="text-[10px] text-muted/70">({selectedLang.version})</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="hidden sm:inline text-muted/60">Press Ctrl+Enter to Run</span>
              <button
                onClick={() => handleCodeChange(selectedLang.starterCode)}
                className="text-gold/80 hover:text-gold hover:underline cursor-pointer"
              >
                Reset Starter
              </button>
            </div>
          </div>

          {/* Textarea Code Editor */}
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
            className="flex-1 w-full p-4 bg-transparent font-mono text-xs md:text-sm text-cream-light leading-relaxed resize-none focus:outline-none selection:bg-gold/30 border-none min-h-[360px]"
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

        {/* AI Copilot Drawer (3 cols when open) */}
        {showAICopilot && (
          <div className="lg:col-span-4 flex flex-col rounded-2xl border border-blue-500/30 bg-surface overflow-hidden shadow-lg animate-fadeIn font-sans">
            {/* Copilot Header */}
            <div className="p-3.5 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <div>
                  <h4 className="font-display font-bold text-xs text-ink">Virtual AI Copilot</h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
                    <span className="text-blue-400 font-semibold">{activeModelDef.name}</span>
                    <span>•</span>
                    <span className="text-emerald-400">Virtual Cloud</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsVirtualAIModalOpen(true)}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 cursor-pointer"
              >
                Change Model
              </button>
            </div>

            {/* Notice */}
            <div className="px-3 py-1.5 bg-blue-500/5 border-b border-blue-500/10 text-[10px] text-muted flex items-center gap-1">
              <span>☁️</span>
              <span>Zero local installation. AI runs virtually on cloud inference nodes.</span>
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-b border-border-warm space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleRunAITask('fix')}
                  disabled={aiIsLoading}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>🐞</span>
                  <span>Fix Errors</span>
                </button>
                <button
                  onClick={() => handleRunAITask('optimize')}
                  disabled={aiIsLoading}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>🚀</span>
                  <span>Optimize</span>
                </button>
                <button
                  onClick={() => handleRunAITask('explain')}
                  disabled={aiIsLoading}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>⚡</span>
                  <span>Explain Code</span>
                </button>
                <button
                  onClick={() => handleRunAITask('test')}
                  disabled={aiIsLoading}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>🧪</span>
                  <span>Unit Tests</span>
                </button>
              </div>

              {/* Custom Prompt Box */}
              <div className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunAITask('generate')}
                  placeholder={`Ask ${activeModelDef.name.split(' ')[0]} to generate...`}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/10 dark:bg-white/5 border border-border-warm text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-gold"
                />
                <button
                  onClick={() => handleRunAITask('generate')}
                  disabled={aiIsLoading}
                  className="px-3 py-1.5 rounded-lg bg-gold hover:bg-gold-light text-black font-bold text-xs cursor-pointer"
                >
                  Go
                </button>
              </div>
            </div>

            {/* AI Response Area */}
            <div className="flex-1 p-3 overflow-y-auto max-h-[300px] text-xs font-mono space-y-2">
              {aiIsLoading && (
                <div className="p-4 flex flex-col items-center justify-center gap-2 text-gold animate-pulse">
                  <span className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">{activeModelDef.name} thinking virtually...</span>
                </div>
              )}

              {!aiIsLoading && !aiResponse && (
                <div className="py-8 text-center text-muted/60 text-[11px] italic">
                  Select an action above to analyze, fix, or generate code.
                </div>
              )}

              {!aiIsLoading && aiResponse && (
                <div className="space-y-2">
                  <div className="text-ink whitespace-pre-wrap leading-relaxed bg-black/10 dark:bg-white/5 p-2.5 rounded-lg border border-border-warm/60">
                    {aiResponse.content}
                  </div>

                  {aiResponse.codeSnippet && (
                    <button
                      onClick={handleApplyAICode}
                      className="w-full py-1.5 px-3 rounded-lg bg-gold/20 hover:bg-gold text-ink hover:text-black border border-gold/50 text-xs font-sans font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>↙</span>
                      <span>Apply Code to Editor</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Execution Output Terminal (5 cols or 4 cols if AI Copilot open) */}
        <div
          className={`${
            showAICopilot ? 'lg:col-span-4' : 'lg:col-span-5'
          } flex flex-col rounded-2xl border border-border-warm bg-[#0a0a0a] overflow-hidden shadow-inner`}
        >
          <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-border-warm/40 text-xs font-mono text-muted">
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
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-red-300">Compiler / Runtime Error:</span>
                  <button
                    onClick={() => {
                      setShowAICopilot(true)
                      handleRunAITask('fix')
                    }}
                    className="text-[10px] font-sans px-2 py-0.5 rounded bg-red-500/20 text-red-200 hover:bg-red-500/30 cursor-pointer"
                  >
                    Fix with AI →
                  </button>
                </div>
                {stderr}
              </div>
            )}
          </div>

          {/* Engine Telemetry Footer */}
          <div className="px-4 py-2 bg-black/60 border-t border-border-warm/40 flex items-center justify-between text-[11px] font-mono text-muted">
            <span className="truncate max-w-[200px]">Engine: {executionEngine}</span>
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

      {/* Virtual AI Hub Modal */}
      <VirtualAIModelHubModal
        isOpen={isVirtualAIModalOpen}
        onClose={() => setIsVirtualAIModalOpen(false)}
        onSelectModel={(modelId) => {
          setActiveVirtualModelId(modelId)
          playPluck('F4')
        }}
      />

      {/* Universal 500+ Programming Language Directory Modal */}
      <LanguageCatalog500Modal
        isOpen={is500CatalogOpen}
        onClose={() => setIs500CatalogOpen(false)}
        onSelectLanguage={handleSelectFrom500Catalog}
        currentLanguageId={selectedLang.id}
      />
    </div>
  )
}

export default PolyglotCompilerStudio
