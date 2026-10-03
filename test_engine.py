"""
Mocks ModelClient.chat so we can exercise the full engine loop (tool call ->
permission gate -> execution -> observation -> final answer) without a live
Ollama server. Proves the plumbing works before you plug in a real model.
"""

import os
import shutil
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
from agent_engine.engine import AgentEngine  # noqa: E402
from agent_engine.permissions import PermissionManager, RiskTier  # noqa: E402


class FakeModel:
    """Scripted responses simulating a model that: writes a file (MODERATE,
    auto-approved), then tries a shell command (DANGEROUS, gets denied),
    adapts, then finishes."""

    def __init__(self):
        self.step = 0

    def chat(self, messages, tools=None, options=None):
        self.step += 1
        if self.step == 1:
            return {
                "role": "assistant",
                "content": "I'll write hello.txt first.",
                "tool_calls": [
                    {
                        "function": {
                            "name": "write_file",
                            "arguments": {"path": "hello.txt", "content": "hello world"},
                        }
                    }
                ],
            }
        if self.step == 2:
            return {
                "role": "assistant",
                "content": "Now I'll try to run a command.",
                "tool_calls": [
                    {
                        "function": {
                            "name": "run_command",
                            "arguments": {"argv": ["cat", "hello.txt"]},
                        }
                    }
                ],
            }
        return {
            "role": "assistant",
            "content": "Done: wrote hello.txt (command was denied, adapted accordingly).",
            "tool_calls": None,
        }


def confirm_deny_dangerous(action):
    # Simulate a user approving MODERATE but denying DANGEROUS actions.
    return action.risk < RiskTier.DANGEROUS


def main():
    audit_path = tempfile.mktemp(suffix=".jsonl")
    permissions = PermissionManager(
        auto_approve_below=RiskTier.MODERATE, confirm_fn=confirm_deny_dangerous
    )
    engine = AgentEngine(
        model_client=FakeModel(),
        permissions=permissions,
        audit=AuditLog(path=audit_path),
        max_iterations=10,
    )

    events = []
    result = engine.run("Create hello.txt and verify it", on_step=lambda k, p: events.append((k, p)))

    print("FINAL RESULT:", result)
    print("\nEVENTS:")
    for kind, payload in events:
        print(f"  {kind}: {payload}")

    # Assertions
    workspace = agent_engine.tools.filesystem.PROJECT_ROOT
    written = (workspace / "hello.txt").read_text()
    assert written == "hello world", "file write tool did not actually write"

    assert any(k == "tool_result" and "DENIED" in str(p.get("result", "")) for k, p in events), \
        "dangerous action should have been denied and reported back to the model"

    with open(audit_path) as f:
        lines = f.readlines()
    assert any('"tool_denied"' in l for l in lines), "audit log should record the denial"
    assert any('"tool_executed"' in l for l in lines), "audit log should record the successful write"

    print("\n✅ ALL CHECKS PASSED")
    shutil.rmtree(workspace, ignore_errors=True)


if __name__ == "__main__":
    main()
