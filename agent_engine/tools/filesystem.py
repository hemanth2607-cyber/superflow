"""
Filesystem tools. Every path is resolved against PROJECT_ROOT and checked
to still be inside it afterward — this is what stops the agent (accidentally
or via a prompt injection) from reading/writing outside the sandboxed
project directory.
"""

from __future__ import annotations

import os
from pathlib import Path

from agent_engine.permissions import RiskTier
from agent_engine.tools.registry import registry

PROJECT_ROOT = Path(os.environ.get("AGENT_PROJECT_ROOT", "./workspace")).resolve()
PROJECT_ROOT.mkdir(parents=True, exist_ok=True)


def _safe_path(rel_path: str) -> Path:
    candidate = (PROJECT_ROOT / rel_path).resolve()
    if PROJECT_ROOT not in candidate.parents and candidate != PROJECT_ROOT:
        raise PermissionError(
            f"Path '{rel_path}' escapes project root {PROJECT_ROOT}"
        )
    return candidate


@registry.register(
    name="read_file",
    description="Read the full text contents of a file in the project.",
    parameters={
        "properties": {
            "path": {"type": "string", "description": "Path relative to project root"}
        },
        "required": ["path"],
    },
    risk=RiskTier.SAFE,
    describe_call=lambda p: f"Read file: {p.get('path')}",
)
def read_file(path: str) -> str:
    target = _safe_path(path)
    if not target.exists():
        return f"ERROR: file not found: {path}"
    return target.read_text(errors="replace")


@registry.register(
    name="list_dir",
    description="List files and directories at a given path in the project.",
    parameters={
        "properties": {
            "path": {"type": "string", "description": "Path relative to project root, '' for root"}
        },
        "required": [],
    },
    risk=RiskTier.SAFE,
    describe_call=lambda p: f"List directory: {p.get('path') or '.'}",
)
def list_dir(path: str = "") -> str:
    target = _safe_path(path)
    if not target.exists():
        return f"ERROR: path not found: {path}"
    entries = sorted(os.listdir(target))
    return "\n".join(entries) if entries else "(empty)"


@registry.register(
    name="write_file",
    description="Create or overwrite a file with the given text content.",
    parameters={
        "properties": {
            "path": {"type": "string", "description": "Path relative to project root"},
            "content": {"type": "string", "description": "Full file content to write"},
        },
        "required": ["path", "content"],
    },
    risk=RiskTier.MODERATE,
    describe_call=lambda p: f"Write file: {p.get('path')} ({len(p.get('content', ''))} chars)",
)
def write_file(path: str, content: str) -> str:
    target = _safe_path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content)
    return f"Wrote {len(content)} chars to {path}"
