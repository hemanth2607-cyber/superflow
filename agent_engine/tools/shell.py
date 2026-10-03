"""
Shell tool. DANGEROUS tier by default — requires explicit confirmation
unless the user has raised their auto-approve threshold. Runs with a
timeout and captures both streams; does not use shell=True, so the model
must pass a real argv list rather than a single string it could smuggle
shell metacharacters into.

NOTE: in a real deployment this should run inside a container/VM, not the
host process. This module only adds the second layer (timeouts, argv-only,
permission gating) — it is not a substitute for sandboxing.
"""

from __future__ import annotations

import subprocess

from agent_engine.permissions import RiskTier
from agent_engine.tools.filesystem import PROJECT_ROOT
from agent_engine.tools.registry import registry


@registry.register(
    name="run_command",
    description=(
        "Run a shell command (as an argv list, e.g. ['pytest', '-q']) inside "
        "the project directory and return its stdout/stderr."
    ),
    parameters={
        "properties": {
            "argv": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Command and arguments as a list, e.g. ['npm', 'run', 'build']",
            },
            "timeout_seconds": {
                "type": "integer",
                "description": "Max seconds to let the command run (default 60)",
            },
        },
        "required": ["argv"],
    },
    risk=RiskTier.DANGEROUS,
    describe_call=lambda p: f"Run command: {' '.join(p.get('argv', []))}",
)
def run_command(argv: list[str], timeout_seconds: int = 60) -> str:
    try:
        result = subprocess.run(
            argv,
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
        )
        return (
            f"exit_code: {result.returncode}\n"
            f"--- stdout ---\n{result.stdout[-4000:]}\n"
            f"--- stderr ---\n{result.stderr[-4000:]}"
        )
    except subprocess.TimeoutExpired:
        return f"ERROR: command timed out after {timeout_seconds}s"
    except FileNotFoundError as e:
        return f"ERROR: {e}"
