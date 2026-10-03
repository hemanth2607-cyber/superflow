"""
Example runnable entrypoint for real multi-model workflows. Edit the
`build_registry()` function to add/remove models — everything else (routing,
chaining, permissions) stays the same regardless of how many models or
providers you plug in.
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
from agent_engine.models.auto_discovery import build_auto_registry
from agent_engine.models.registry import ModelRegistry
from agent_engine.permissions import PendingAction, PermissionManager, RiskTier
from agent_engine.workflow import Workflow, WorkflowEngine, WorkflowStep

import agent_engine.tools.filesystem  # noqa: F401
import agent_engine.tools.shell  # noqa: F401
import agent_engine.tools.computer_tools  # noqa: F401
import agent_engine.tools.secrets_tools  # noqa: F401
import agent_engine.tools.deploy_tools  # noqa: F401
import agent_engine.tools.seo_tools  # noqa: F401
import agent_engine.tools.preview_tools  # noqa: F401


def build_registry() -> ModelRegistry:
    """
    Auto-discovers every model actually available right now instead of
    hardcoding model names (which go stale — OpenRouter's free catalog
    alone rotates weekly). Three sources, each opt-in by having the
    corresponding credential/server present:
      - Ollama: whatever you've already `ollama pull`-ed locally
      - OpenRouter: every model currently priced at $0, if OPENROUTER_API_KEY
        is set (free signup at openrouter.ai, no card)
      - Groq: Groq's hosted open models, if GROQ_API_KEY is set
        (free signup at console.groq.com)
    No single provider is required — this runs fine with just Ollama, just
    the free API keys, or any mix.
    """
    registry = build_auto_registry()
    if not registry.list():
        print(
            "⚠️  No models discovered. Either start Ollama with at least one "
            "model pulled, or set OPENROUTER_API_KEY / GROQ_API_KEY (both free)."
        )
    else:
        print(f"Discovered {len(registry.list())} models:")
        for m in registry.list():
            print(f"  - {m.id}  [{', '.join(sorted(m.tags))}]")
    return registry


def confirm_in_terminal(action: PendingAction) -> bool:
    print(f"\n⚠️  [{action.risk.name}] {action.tool_name}: {action.description}")
    return input("   Allow? [y/N]: ").strip().lower() == "y"


def on_step(kind, payload):
    if kind == "step_start":
        print(f"\n=== Step: {payload['step']} (model: {payload['model']}) ===")
    elif kind == "tool_call":
        detail = payload.get("detail", payload)
        print(f"  🔧 {detail}")
    elif kind == "step_end":
        print(f"  ✅ {payload['output']}")


def main():
    parser = argparse.ArgumentParser(description="Multi-model workflow runner")
    parser.add_argument("task", help="The task to run through the workflow")
    parser.add_argument(
        "--auto-approve",
        default="MODERATE",
        choices=[t.name for t in RiskTier],
    )
    parser.add_argument(
        "--model",
        help="Specify a model to use for all steps (e.g. 'qwen2.5:3b', 'llama3:8b'). Partial matches work.",
    )
    args = parser.parse_args()

    registry = build_registry()
    permissions = PermissionManager(
        auto_approve_below=RiskTier[args.auto_approve], confirm_fn=confirm_in_terminal
    )
    wf_engine = WorkflowEngine(
        model_registry=registry, permissions=permissions, audit=AuditLog()
    )

    import os
    target_model = args.model or os.environ.get("AGENT_MODEL")
    chosen_model_id = None
    if target_model:
        matches = [m.id for m in registry.list() if target_model.lower() in m.id.lower()]
        if matches:
            chosen_model_id = matches[0]
            print(f"\nUsing model: {chosen_model_id}")
        else:
            print(f"\n⚠️  Model matching '{target_model}' not found in registry. Using tag routing.")

    # Auto-discovered models aren't hand-tagged "review" or "planning" — prefer a
    # "quality"/"reasoning" tagged model if one was discovered, otherwise fall back.
    available_tags = {t for m in registry.list() for t in m.tags}
    if "quality" in available_tags:
        review_tags = ["quality"]
    elif "reasoning" in available_tags:
        review_tags = ["reasoning"]
    else:
        review_tags = ["coding"]

    if "planning" in available_tags:
        plan_tags = ["planning"]
    elif "reasoning" in available_tags:
        plan_tags = ["reasoning"]
    else:
        plan_tags = ["general"]

    workflow = Workflow(
        name="plan-code-review",
        steps=[
            WorkflowStep(
                name="plan",
                tags=plan_tags,
                model_id=chosen_model_id,
                instructions="Task: {task}\nBreak this into a short, concrete plan. Do not write any files yet.",
                allowed_tools=[],
            ),
            WorkflowStep(
                name="implement",
                tags=["coding"],
                model_id=chosen_model_id,
                instructions="Task: {task}\nPlan:\n{previous}\nImplement the plan now using the available tools.",
                allowed_tools=["write_file", "read_file", "list_dir"],
            ),
            WorkflowStep(
                name="review",
                tags=review_tags,
                model_id=chosen_model_id,
                instructions="Task: {task}\nImplementation report:\n{previous}\nRead back what was created and confirm it satisfies the task. Note any issues.",
                allowed_tools=["read_file", "list_dir"],
            ),
        ],
    )

    results = wf_engine.run(workflow, task=args.task, on_step=on_step)

    print("\n=== FINAL SUMMARY ===")
    for r in results:
        print(f"- {r.step_name} ({r.model_used}): {r.output}")


if __name__ == "__main__":
    main()
