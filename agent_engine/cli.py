"""
Minimal CLI to drive the engine end-to-end: you type a goal, the agent
plans/acts, and anything above the auto-approve tier stops and asks you
for a real y/n before running. This is the reference consent UI — a web
or desktop product would replace `confirm_in_terminal` with a proper
dialog, but the shape (show action + risk, block until decided) stays.
"""

from __future__ import annotations

import argparse
import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from agent_engine.audit import AuditLog
from agent_engine.engine import AgentEngine
from agent_engine.model_client import ModelClient
from agent_engine.permissions import PendingAction, PermissionManager, RiskTier

# Import tool modules so their @registry.register decorators run.
import agent_engine.tools.filesystem  # noqa: F401
import agent_engine.tools.shell  # noqa: F401
import agent_engine.tools.computer_tools  # noqa: F401
import agent_engine.tools.secrets_tools  # noqa: F401
import agent_engine.tools.deploy_tools  # noqa: F401
import agent_engine.tools.seo_tools  # noqa: F401
import agent_engine.tools.preview_tools  # noqa: F401


def confirm_in_terminal(action: PendingAction) -> bool:
    print(f"\n⚠️  Agent wants to run: {action.tool_name}  [{action.risk.name}]")
    print(f"   {action.description}")
    answer = input("   Allow? [y/N]: ").strip().lower()
    return answer == "y"


def on_step(kind: str, payload):
    if kind == "thought" and payload:
        print(f"\n🤔 {payload}")
    elif kind == "tool_call":
        print(f"🔧 calling {payload['name']}({payload['params']})")
    elif kind == "tool_result":
        preview = str(payload["result"])[:300]
        print(f"   → {preview}")
    elif kind == "final":
        print(f"\n✅ {payload}")


def main():
    parser = argparse.ArgumentParser(description="Agent engine CLI")
    parser.add_argument("goal", nargs="?", help="Task for the agent to do")
    parser.add_argument("--model", default="qwen2.5-coder:32b")
    parser.add_argument(
        "--auto-approve",
        default="MODERATE",
        choices=[t.name for t in RiskTier],
        help="Risk tier below which actions run without asking (default: MODERATE, i.e. SAFE actions auto-run)",
    )
    args = parser.parse_args()

    goal = args.goal or input("What should the agent do? ")

    permissions = PermissionManager(
        auto_approve_below=RiskTier[args.auto_approve],
        confirm_fn=confirm_in_terminal,
    )
    engine = AgentEngine(
        model_client=ModelClient(model=args.model),
        permissions=permissions,
        audit=AuditLog(),
    )

    result = engine.run(goal, on_step=on_step)
    print(f"\n--- Result ---\n{result}")


if __name__ == "__main__":
    sys.exit(main())
