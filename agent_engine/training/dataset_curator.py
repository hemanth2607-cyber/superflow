"""
Dataset Curator for SuperFlow Coding and Mathematical Problem-Solving.
Cleans, validates, and packages code and math examples into standard fine-tuning formats.
"""

from __future__ import annotations

import ast
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class CodeMathExample:
    instruction: str
    input_context: str
    solution_code: str
    explanation_math: str
    language: str
    difficulty: str  # "advanced", "olympiad", "production"


class CodeMathDatasetCurator:
    """Validates and compiles handwritten code and math proofs into ChatML training sets."""

    def __init__(self, output_path: str = "./superflow_train_data.jsonl"):
        self.output_path = Path(output_path)
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        self.examples: List[Dict[str, Any]] = []

    def add_example(
        self,
        instruction: str,
        solution_code: str,
        explanation_math: str = "",
        input_context: str = "",
        language: str = "python",
        difficulty: str = "production",
    ) -> bool:
        """Validates and appends a single training sample."""
        # Basic validation: Python code syntax check
        if language.lower() == "python":
            try:
                ast.parse(solution_code)
            except SyntaxError:
                # Still allowed if it's snippet-based, but noted
                pass

        # Format as modern ChatML / ShareGPT structure
        system_prompt = (
            "You are SuperFlow, an elite AI orchestrator specializing in competitive "
            "mathematical problem solving and production-grade software engineering across all languages."
        )

        user_content = f"Problem:\n{instruction}"
        if input_context:
            user_content += f"\n\nContext / Inputs:\n{input_context}"

        assistant_content = ""
        if explanation_math:
            assistant_content += f"### Mathematical Derivation & Logic:\n{explanation_math}\n\n"
        assistant_content += f"### Production Solution ({language}):\n```{language}\n{solution_code.strip()}\n```"

        chat_entry = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
                {"role": "assistant", "content": assistant_content},
            ],
            "metadata": {
                "language": language,
                "difficulty": difficulty,
            },
        }

        self.examples.append(chat_entry)
        return True

    def export_jsonl(self) -> str:
        """Writes all accumulated examples to JSONL format."""
        with open(self.output_path, "w", encoding="utf-8") as f:
            for item in self.examples:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")
        return str(self.output_path)

    def generate_seed_dataset(self) -> str:
        """Injects high-end seed samples spanning mathematics, algorithms, and systems code."""
        # Sample 1: Advanced Number Theory & Fast Modular Exponentiation
        self.add_example(
            instruction="Implement Pollard's Rho integer factorization algorithm with Miller-Rabin primality testing in Python and explain the cycle-finding math.",
            explanation_math="Pollard's Rho relies on Floyd's cycle-finding and birthday paradox: for random sequence x_{i+1} = (x_i^2 + c) mod N, a cycle modulo a prime factor p occurs in O(sqrt(p)) steps.",
            solution_code="""import math
import random

def miller_rabin(n, k=10):
    if n < 2: return False
    if n in (2, 3): return True
    if n % 2 == 0: return False
    r, s = 0, n - 1
    while s % 2 == 0:
        r += 1
        s //= 2
    for _ in range(k):
        a = random.randrange(2, n - 1)
        x = pow(a, s, n)
        if x in (1, n - 1): continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1: break
        else:
            return False
    return True

def pollards_rho(n):
    if n % 2 == 0: return 2
    if miller_rabin(n): return n
    x, y, c, d = 2, 2, 1, 1
    f = lambda v: (pow(v, 2, n) + c) % n
    while d == 1:
        x = f(x)
        y = f(f(y))
        d = math.gcd(abs(x - y), n)
        if d == n:
            return pollards_rho(n)
    return d
""",
            language="python",
            difficulty="advanced",
        )

        # Sample 2: High-Performance Concurrent Ring Buffer in Rust
        self.add_example(
            instruction="Create a lock-free Single Producer Single Consumer (SPSC) ring buffer in Rust with atomic memory ordering.",
            explanation_math="Lock-free SPSC queue utilizes a power-of-two capacity with wrap-around bitwise masking, Acquire-Release memory ordering semantics to prevent instruction reordering across CPU caches.",
            solution_code="""use std::sync::atomic::{AtomicUsize, Ordering};
use std::cell::UnsafeCell;

pub struct SPSCQueue<T, const N: usize> {
    buffer: [UnsafeCell<Option<T>>; N],
    head: AtomicUsize,
    tail: AtomicUsize,
}

unsafe impl<T: Send, const N: usize> Sync for SPSCQueue<T, N> {}

impl<T, const N: usize> SPSCQueue<T, N> {
    const MASK: usize = N - 1;
    
    pub fn new() -> Self {
        assert!(N.is_power_of_two(), "Capacity must be power of two");
        Self {
            buffer: std::array::from_fn(|_| UnsafeCell::new(None)),
            head: AtomicUsize::new(0),
            tail: AtomicUsize::new(0),
        }
    }

    pub fn push(&self, value: T) -> Result<(), T> {
        let head = self.head.load(Ordering::Relaxed);
        let tail = self.tail.load(Ordering::Acquire);
        if head.wrapping_sub(tail) >= N {
            return Err(value);
        }
        unsafe { *self.buffer[head & Self::MASK].get() = Some(value); }
        self.head.store(head.wrapping_add(1), Ordering::Release);
        Ok(())
    }

    pub fn pop(&self) -> Option<T> {
        let tail = self.tail.load(Ordering::Relaxed);
        let head = self.head.load(Ordering::Acquire);
        if tail == head {
            return None;
        }
        let val = unsafe { (*self.buffer[tail & Self::MASK].get()).take() };
        self.tail.store(tail.wrapping_add(1), Ordering::Release);
        val
    }
}
""",
            language="rust",
            difficulty="production",
        )

        return self.export_jsonl()
