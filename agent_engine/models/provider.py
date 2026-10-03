"""
All providers expose the same .chat(messages, tools, options) -> message dict
interface, shaped like Ollama's:

    {"role": "assistant", "content": "...", "tool_calls": [
        {"function": {"name": "write_file", "arguments": {"path": "x", ...}}}
    ]}

This is the one contract the engine depends on. Every provider below —
whatever the underlying API actually returns — translates into this shape,
which is what lets the same AgentEngine loop run on an Ollama model, an
OpenAI-compatible endpoint, or Anthropic's API interchangeably.
"""

from __future__ import annotations

from typing import Protocol


class ModelProvider(Protocol):
    def chat(
        self,
        messages: list[dict],
        tools: list[dict] | None = None,
        options: dict | None = None,
    ) -> dict: ...


class OllamaProvider:
    """Wraps a local Ollama model. No translation needed — this is the
    native shape everything else converges to."""

    def __init__(self, model: str, host: str | None = None):
        import ollama

        self.model = model
        self.client = ollama.Client(host=host) if host else ollama.Client()

    def chat(self, messages, tools=None, options=None) -> dict:
        import os
        default_ctx = int(os.environ.get("OLLAMA_NUM_CTX", "4096"))
        opts = {"num_ctx": default_ctx}
        if options:
            opts.update(options)
        response = self.client.chat(
            model=self.model,
            messages=messages,
            tools=tools or [],
            options=opts,
        )
        return response["message"]
