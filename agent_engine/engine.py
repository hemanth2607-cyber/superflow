"""
The engine: a bounded plan/act/observe loop. This is the piece every other
product feature (computer-use, deploy, SEO) plugs into as "just another
tool" — the loop itself doesn't know or care what the tools do, only how to
call them safely and feed results back to the model.
"""

from __future__ import annotations

from agent_engine.audit import AuditLog
from agent_engine.model_client import ModelClient
from agent_engine.permissions import PermissionDenied, PermissionManager
from agent_engine.tools.registry import registry

SYSTEM_PROMPT = """You are a careful coding and deployment agent. You have \
access to tools for reading/writing files, running shell commands, and (as \
more tools are added) controlling a browser or deploying code. Always \
explain your plan briefly before acting. Use tools one step at a time and \
read their results before deciding the next step. If a tool call is denied \
by the user, do not retry it — explain the alternative you'll take instead. \
When the task is complete, respond with a final plain-text summary and no \
further tool calls."""


class AgentEngine:
    def __init__(
        self,
        model_client: ModelClient,
        permissions: PermissionManager,
        audit: AuditLog | None = None,
        max_iterations: int = 15,
    ):
        self.model = model_client
        self.permissions = permissions
        self.audit = audit or AuditLog()
        self.max_iterations = max_iterations

    def run(
        self,
        user_goal: str,
        on_step=None,
        model_override=None,
        allowed_tools: list[str] | None = None,
        system_prompt: str | None = None,
    ) -> str:
        """
        Runs the loop until the model stops calling tools or we hit
        max_iterations. `on_step` is an optional callback(kind, payload)
        for streaming progress to a UI/CLI.

        `model_override`: use this provider for just this run instead of
        self.model — this is what lets a WorkflowEngine run each step on a
        different model without creating a new AgentEngine per step.
        `allowed_tools`: restrict which tools are offered to the model this
        run (e.g. a "review" step gets read_file but not write_file).
        """
        model = model_override or self.model
        messages = [
            {"role": "system", "content": system_prompt or SYSTEM_PROMPT},
            {"role": "user", "content": user_goal},
        ]
        tools = registry.as_ollama_tools(names=allowed_tools)
        self.audit.record("goal_received", goal=user_goal)

        for i in range(self.max_iterations):
            msg = model.chat(messages=messages, tools=tools)
            messages.append(msg)

            tool_calls = msg.get("tool_calls")
            if not tool_calls:
                final_text = msg.get("content", "")
                self.audit.record("completed", iterations=i + 1, final=final_text)
                if on_step:
                    on_step("final", final_text)
                return final_text

            if on_step:
                on_step("thought", msg.get("content", ""))

            for call in tool_calls:
                fn = call["function"]
                name = fn["name"]
                params = fn.get("arguments", {})

                if on_step:
                    on_step("tool_call", {"name": name, "params": params})

                try:
                    result = registry.execute(name, params, self.permissions)
                    self.audit.record(
                        "tool_executed", tool=name, params=params, ok=True
                    )
                except PermissionDenied as e:
                    result = f"DENIED: {e}"
                    self.audit.record(
                        "tool_denied", tool=name, params=params, reason=str(e)
                    )
                except Exception as e:  # tool errors shouldn't crash the loop
                    result = f"ERROR: {e}"
                    self.audit.record(
                        "tool_error", tool=name, params=params, error=str(e)
                    )

                if on_step:
                    on_step("tool_result", {"name": name, "result": result})

                messages.append(
                    {
                        "role": "tool",
                        "content": str(result),
                        "name": name,
                    }
                )

        self.audit.record("max_iterations_reached", limit=self.max_iterations)
        return "Stopped: reached max iterations without a final answer."
