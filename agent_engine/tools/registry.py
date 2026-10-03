"""
Tool registry. Tools register themselves with @tool(...). The registry can
then emit the JSON-schema tool list Ollama's chat API expects, and dispatch
a model's tool_call back to the right Python function — running it through
the PermissionManager first.
"""

from __future__ import annotations

import inspect
from dataclasses import dataclass, field
from typing import Any, Callable, Optional

from agent_engine.permissions import PendingAction, PermissionManager, RiskTier


@dataclass
class ToolSpec:
    name: str
    description: str
    parameters: dict  # JSON schema "properties" + "required"
    risk: RiskTier
    fn: Callable
    describe_call: Optional[Callable[[dict], str]] = None


class ToolRegistry:
    def __init__(self):
        self._tools: dict[str, ToolSpec] = {}

    def register(
        self,
        name: str,
        description: str,
        parameters: dict,
        risk: RiskTier,
        describe_call: Optional[Callable[[dict], str]] = None,
    ):
        def decorator(fn: Callable):
            self._tools[name] = ToolSpec(
                name=name,
                description=description,
                parameters=parameters,
                risk=risk,
                fn=fn,
                describe_call=describe_call,
            )
            return fn

        return decorator

    def as_ollama_tools(self, names: list[str] | None = None) -> list[dict]:
        """
        Emit the tool list in the shape Ollama's /api/chat expects.
        If `names` is given, only those tools are included — lets a
        workflow step offer a restricted subset (e.g. no write_file for a
        review-only step) without removing the tool from the registry.
        """
        out = []
        wanted = set(names) if names is not None else None
        for spec in self._tools.values():
            if wanted is not None and spec.name not in wanted:
                continue
            out.append(
                {
                    "type": "function",
                    "function": {
                        "name": spec.name,
                        "description": spec.description,
                        "parameters": {
                            "type": "object",
                            "properties": spec.parameters.get("properties", {}),
                            "required": spec.parameters.get("required", []),
                        },
                    },
                }
            )
        return out

    def all(self) -> dict[str, ToolSpec]:
        """Returns all registered tool specifications."""
        return dict(self._tools)

    def get(self, name: str) -> ToolSpec:
        if name not in self._tools:
            raise KeyError(f"Unknown tool: {name}")
        return self._tools[name]

    def execute(
        self, name: str, params: dict, permissions: PermissionManager
    ) -> Any:
        spec = self.get(name)
        human_desc = (
            spec.describe_call(params) if spec.describe_call else f"{name}({params})"
        )
        action = PendingAction(
            tool_name=name, description=human_desc, params=params, risk=spec.risk
        )
        permissions.require(action)  # raises PermissionDenied if not authorized
        return spec.fn(**params)


# Single shared registry instance tools attach to on import.
registry = ToolRegistry()
