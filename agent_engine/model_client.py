"""
Thin wrapper around the Ollama chat API with tool-calling. Kept separate
from the engine loop so you can swap the backend (e.g. point this at a
different local server, or add a cloud fallback) without touching the loop
or permission logic.
"""

from __future__ import annotations

from typing import Any

import ollama


class ModelClient:
    def __init__(self, model: str = "qwen2.5-coder:32b", host: str | None = None):
        self.model = model
        self.client = ollama.Client(host=host) if host else ollama.Client()

    def chat(
        self,
        messages: list[dict],
        tools: list[dict] | None = None,
        options: dict | None = None,
    ) -> dict:
        """
        Returns the raw Ollama response message dict:
        { "role": "assistant", "content": "...", "tool_calls": [...] }
        """
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
