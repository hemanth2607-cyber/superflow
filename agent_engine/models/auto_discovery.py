"""
Instead of hand-typing model IDs (which rot — e.g. OpenRouter's free model
catalog rotates weekly, and a hardcoded list is wrong within a month), this
module queries each provider's live /models endpoint at startup and
registers whatever is actually available right now.

Three sources, none requiring a model download:
  - Ollama:      whatever you've already pulled locally (fully free, fully
                  offline, but still needs `ollama pull` per model)
  - OpenRouter:   one free API key -> dozens of hosted open-weight models
                  (Llama, Qwen, Mistral, DeepSeek, Gemma, etc.), filtered to
                  only the ones currently priced at $0
  - Groq:         one free API key -> a short list of open models served at
                  very high speed, generous free tier

Tags are inferred from the model's id/name with simple keyword heuristics —
good enough for routing, not a substitute for curating tags by hand if you
care about precision for a specific workflow.
"""

from __future__ import annotations

import os

import requests

from agent_engine.models.openrouter_provider import GroqProvider, OpenRouterProvider
from agent_engine.models.provider import OllamaProvider
from agent_engine.models.registry import ModelRegistry

KEYWORD_TAGS = {
    "coder": "coding",
    "code": "coding",
    "instruct": "general",
    "chat": "general",
    "vision": "vision",
    "vl": "vision",
    "math": "reasoning",
    "reasoning": "reasoning",
    "r1": "reasoning",
    "mini": "fast",
    "small": "fast",
    "nano": "fast",
    "flash": "fast",
}

SIZE_QUALITY_TAG = {
    # crude param-count heuristic pulled from the id string, e.g. "70b", "8b"
    "70b": "quality", "72b": "quality", "90b": "quality", "405b": "quality",
    "235b": "quality", "large": "quality",
    "7b": "fast", "8b": "fast", "9b": "fast", "3b": "fast", "1b": "fast",
}


def _infer_tags(model_id: str) -> list[str]:
    lower = model_id.lower()
    tags = {"open-source"}
    for kw, tag in KEYWORD_TAGS.items():
        if kw in lower:
            tags.add(tag)
    for kw, tag in SIZE_QUALITY_TAG.items():
        if kw in lower:
            tags.add(tag)
    if not tags & {"coding", "vision", "reasoning"}:
        tags.add("general")
    return sorted(tags)


def discover_ollama_local(host: str | None = None) -> list[str]:
    """Return model names already pulled into the local Ollama server."""
    import ollama

    host = host or os.environ.get("OLLAMA_HOST")
    client = ollama.Client(host=host) if host else ollama.Client()
    try:
        result = client.list()
        raw_models = result.models if hasattr(result, "models") else result.get("models", [])
        names = []
        for m in raw_models:
            name = getattr(m, "model", None) or (m.get("model") if isinstance(m, dict) else None)
            if name:
                names.append(name)
        return names
    except Exception:
        return []  # Ollama not running / not installed — not fatal


def discover_openrouter_free(api_key_env: str = "OPENROUTER_API_KEY") -> list[dict]:
    """Return live OpenRouter models currently priced at $0 in/out."""
    api_key = os.environ.get(api_key_env)
    if not api_key:
        return []
    try:
        resp = requests.get(
            "https://openrouter.ai/api/v1/models",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=15,
        )
        resp.raise_for_status()
        models = resp.json().get("data", [])
    except Exception:
        return []

    free = []
    for m in models:
        pricing = m.get("pricing", {})
        try:
            prompt_cost = float(pricing.get("prompt", "1"))
            completion_cost = float(pricing.get("completion", "1"))
        except (TypeError, ValueError):
            continue
        if prompt_cost == 0 and completion_cost == 0:
            free.append({"id": m["id"], "name": m.get("name", m["id"])})
    return free


def discover_groq_models(api_key_env: str = "GROQ_API_KEY") -> list[dict]:
    """Return Groq's currently hosted models (their free tier covers these)."""
    api_key = os.environ.get(api_key_env)
    if not api_key:
        return []
    try:
        resp = requests.get(
            "https://api.groq.com/openai/v1/models",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=15,
        )
        resp.raise_for_status()
        return [{"id": m["id"], "name": m["id"]} for m in resp.json().get("data", [])]
    except Exception:
        return []


def build_auto_registry(
    include_ollama: bool = True,
    include_openrouter: bool = True,
    include_groq: bool = True,
    ollama_host: str | None = None,
) -> ModelRegistry:
    """
    Builds a ModelRegistry populated from whatever is actually reachable
    right now: local Ollama models you've pulled, plus every free model
    OpenRouter and Groq currently expose (only if the matching API key env
    var is set — each is a free signup, no card required, no download).
    Call registry.list() afterward to see exactly what got registered.
    """
    registry = ModelRegistry()
    ollama_host = ollama_host or os.environ.get("OLLAMA_HOST")

    if include_ollama:
        for name in discover_ollama_local(host=ollama_host):
            registry.register(
                id=f"ollama/{name}",
                provider=OllamaProvider(model=name, host=ollama_host),
                tags=_infer_tags(name) + ["local", "ollama"],
                description=f"Local Ollama model: {name}",
            )

    if include_openrouter:
        for m in discover_openrouter_free():
            registry.register(
                id=f"openrouter/{m['id']}",
                provider=OpenRouterProvider(model=m["id"]),
                tags=_infer_tags(m["id"]) + ["hosted", "free", "openrouter"],
                description=f"OpenRouter free model: {m['name']}",
            )

    if include_groq:
        for m in discover_groq_models():
            registry.register(
                id=f"groq/{m['id']}",
                provider=GroqProvider(model=m["id"]),
                tags=_infer_tags(m["id"]) + ["hosted", "free", "groq", "fast"],
                description=f"Groq-hosted model: {m['name']}",
            )

    return registry
