"""
Workflow: an ordered sequence of steps, each one routed to whichever
registered model best matches its tags. A step's prompt is built from the
original task plus every previous step's output, so a "coding" model can
act on what the "planning" model decided, and a "review" model can critique
what the "coding" model produced — each on the model best suited for that
particular kind of work, local or hosted, mixed freely.

This sits on top of engine.py and models/registry.py without changing
either: it just calls AgentEngine.run() once per step with a different
model_override and allowed_tools each time.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from agent_engine.audit import AuditLog
from agent_engine.engine import AgentEngine
from agent_engine.models.registry import ModelRegistry


@dataclass
class WorkflowStep:
    name: str
    tags: list[str]  # used to select a model, e.g. ["planning"], ["coding", "local"]
    instructions: str  # what this step should do; {task} and {previous} are filled in
    allowed_tools: list[str] | None = None  # None = all registered tools
    max_iterations: int = 10
    model_id: str | None = None  # force a specific model instead of tag-selecting


@dataclass
class StepResult:
    step_name: str
    model_used: str
    output: str


class Workflow:
    def __init__(self, name: str, steps: list[WorkflowStep]):
        self.name = name
        self.steps = steps


class WorkflowEngine:
    def __init__(
        self,
        model_registry: ModelRegistry,
        permissions,
        audit: AuditLog | None = None,
    ):
        self.models = model_registry
        self.permissions = permissions
        self.audit = audit or AuditLog()

    def run(self, workflow: Workflow, task: str, on_step=None) -> list[StepResult]:
        results: list[StepResult] = []
        previous_output = ""

        self.audit.record("workflow_started", workflow=workflow.name, task=task)

        for step in workflow.steps:
            model_info = (
                self.models.get(step.model_id)
                if step.model_id
                else self.models.select(step.tags)
            )

            self.audit.record(
                "workflow_step_start", step=step.name, model=model_info.id
            )
            if on_step:
                on_step("step_start", {"step": step.name, "model": model_info.id})

            prompt = step.instructions.format(task=task, previous=previous_output)

            engine = AgentEngine(
                model_client=model_info.provider,  # unused as default, overridden below
                permissions=self.permissions,
                audit=self.audit,
                max_iterations=step.max_iterations,
            )

            def forward(kind, payload, _step=step.name):
                if on_step:
                    on_step(kind, {"step": _step, **({"detail": payload} if not isinstance(payload, dict) else payload)})

            output = engine.run(
                user_goal=prompt,
                on_step=forward,
                model_override=model_info.provider,
                allowed_tools=step.allowed_tools,
            )

            result = StepResult(
                step_name=step.name, model_used=model_info.id, output=output
            )
            results.append(result)
            previous_output = output

            self.audit.record(
                "workflow_step_end", step=step.name, model=model_info.id, output=output
            )
            if on_step:
                on_step("step_end", {"step": step.name, "output": output})

        self.audit.record("workflow_completed", workflow=workflow.name)
        return results
