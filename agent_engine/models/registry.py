"""
Model registry: every model you can call — local Ollama models, hosted API
models, whatever — gets registered once with a set of tags describing what
it's good for. Workflow steps then ask for a tag combination ("coding",
"fast") instead of hardcoding a model name, so swapping qwen2.5-coder for
something better later is a one-line registry change, not a find-and-replace
across your workflows.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from agent_engine.models.provider import ModelProvider


@dataclass
class ModelInfo:
    id: str
    provider: ModelProvider
    tags: set[str]
    description: str = ""
    context_window: int | None = None


class ModelRegistry:
    def __init__(self):
        self._models: dict[str, ModelInfo] = {}

    def register(
        self,
        id: str,
        provider: ModelProvider,
        tags: list[str],
        description: str = "",
        context_window: int | None = None,
    ) -> None:
        self._models[id] = ModelInfo(
            id=id,
            provider=provider,
            tags=set(tags),
            description=description,
            context_window=context_window,
        )

    def get(self, id: str) -> ModelInfo:
        if id not in self._models:
            raise KeyError(
                f"Unknown model id '{id}'. Registered: {list(self._models)}"
            )
        return self._models[id]

    def list(self) -> list[ModelInfo]:
        return list(self._models.values())

    def select(self, tags: list[str]) -> ModelInfo:
        """
        Pick the registered model with the highest overlap against the
        requested tags. Ties broken by registration order (first wins).
        This is deliberately simple scoring, not ML-based routing — good
        enough to start with, and the one place you'd upgrade later (e.g.
        factoring in latency/cost/recent failure rate) without touching
        anything that calls select().
        """
        if not self._models:
            raise RuntimeError("No models registered")

        wanted = set(tags)
        best: ModelInfo | None = None
        best_score = -1
        for info in self._models.values():
            score = len(wanted & info.tags)
            if score > best_score:
                best = info
                best_score = score

        if best is None or best_score == 0:
            # No tag overlap at all — fall back to the first registered
            # model rather than failing the workflow outright.
            fallback = next(iter(self._models.values()))
            return fallback
        return best


# Shared instance, analogous to tools.registry.registry.
registry = ModelRegistry()
