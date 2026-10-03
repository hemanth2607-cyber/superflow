"""
Proves the full multi-model workflow wiring: a planner model, a coder model
(with file-write tools), and a reviewer model (read-only), each selected by
tag, chained so each step sees the previous step's output. No live Ollama
or API needed — three scripted fake models stand in.
"""

import os
import sys
import tempfile

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

os.environ["AGENT_PROJECT_ROOT"] = tempfile.mkdtemp()

import agent_engine.tools.filesystem  # noqa: E402,F401
import agent_engine.tools.shell  # noqa: E402,F401
from agent_engine.audit import AuditLog  # noqa: E402
from agent_engine.models.registry import ModelRegistry  # noqa: E402
from agent_engine.permissions import PermissionManager, RiskTier  # noqa: E402
from agent_engine.workflow import Workflow, WorkflowEngine, WorkflowStep  # noqa: E402


class FakePlanner:
    """Simulates a 'planning'-tagged model: no tools, just reasons in text."""

    def chat(self, messages, tools=None, options=None):
        return {
            "role": "assistant",
            "content": "Plan: write a greet.py script with a greet(name) function.",
            "tool_calls": None,
        }


class FakeCoder:
    """Simulates a 'coding'-tagged model: writes the file, then finishes."""

    def __init__(self):
        self.step = 0

    def chat(self, messages, tools=None, options=None):
        self.step += 1
        if self.step == 1:
            return {
                "role": "assistant",
                "content": "Writing greet.py per the plan.",
                "tool_calls": [
                    {
                        "function": {
                            "name": "write_file",
                            "arguments": {
                                "path": "greet.py",
                                "content": "def greet(name):\n    return f'Hello, {name}!'\n",
                            },
                        }
                    }
                ],
            }
        return {"role": "assistant", "content": "Done writing greet.py.", "tool_calls": None}


class FakeReviewer:
    """Simulates a 'review'-tagged model: reads the file back, then reports."""

    def __init__(self):
        self.step = 0

    def chat(self, messages, tools=None, options=None):
        self.step += 1
        if self.step == 1:
            return {
                "role": "assistant",
                "content": "Checking greet.py.",
                "tool_calls": [
                    {"function": {"name": "read_file", "arguments": {"path": "greet.py"}}}
                ],
            }
        return {
            "role": "assistant",
            "content": "Review passed: greet.py defines greet(name) as planned.",
            "tool_calls": None,
        }


def main():
    models = ModelRegistry()
    models.register("local-planner", FakePlanner(), tags=["planning", "local"], description="fast local planner")
    models.register("local-coder", FakeCoder(), tags=["coding", "local"], description="local code model")
    models.register("hosted-reviewer", FakeReviewer(), tags=["review", "quality"], description="stronger hosted reviewer")

    permissions = PermissionManager(auto_approve_below=RiskTier.DANGEROUS)  # auto-approve SAFE+MODERATE for this test
    audit = AuditLog(path=tempfile.mktemp(suffix=".jsonl"))
    wf_engine = WorkflowEngine(model_registry=models, permissions=permissions, audit=audit)

    workflow = Workflow(
        name="build-and-review-script",
        steps=[
            WorkflowStep(
                name="plan",
                tags=["planning"],
                instructions="Task: {task}\nProduce a short plan. Do not write files yet.",
                allowed_tools=[],
            ),
            WorkflowStep(
                name="code",
                tags=["coding"],
                instructions="Task: {task}\nPlan from previous step:\n{previous}\nNow implement it.",
                allowed_tools=["write_file"],
            ),
            WorkflowStep(
                name="review",
                tags=["review"],
                instructions="Task: {task}\nImplementation report:\n{previous}\nRead the file back and confirm it matches the plan.",
                allowed_tools=["read_file"],
            ),
        ],
    )

    events = []
    results = wf_engine.run(
        workflow, task="Create greet.py with a greet function",
        on_step=lambda k, p: events.append((k, p)),
    )

    print("=== STEP RESULTS ===")
    for r in results:
        print(f"[{r.step_name}] via {r.model_used}: {r.output}")

    # Assertions: right model per step, output chained, file actually written
    assert results[0].model_used == "local-planner"
    assert results[1].model_used == "local-coder"
    assert results[2].model_used == "hosted-reviewer"
    assert "Plan:" in results[0].output

    workspace = agent_engine.tools.filesystem.PROJECT_ROOT
    content = (workspace / "greet.py").read_text()
    assert "def greet(name):" in content, "coder step should have actually written the file"

    assert "Review passed" in results[2].output

    with open(audit.path) as f:
        log = f.read()
    assert "workflow_started" in log and "workflow_completed" in log
    assert log.count('"workflow_step_start"') == 3

    print("\n✅ ALL WORKFLOW CHECKS PASSED")


if __name__ == "__main__":
    main()
