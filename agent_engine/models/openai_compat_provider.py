"""
OpenAI-compatible provider. Works with OpenAI itself and with the many
providers (Groq, Together, Fireworks, OpenRouter, vLLM's own server, etc.)
that speak the same /chat/completions schema — just point base_url at them.

API key is read from an env var, never hardcoded or passed in model context.
"""

from __future__ import annotations

import json
import os

import requests


class OpenAICompatProvider:
    def __init__(
        self,
        model: str,
        base_url: str = "https://api.openai.com/v1",
        api_key_env: str = "OPENAI_API_KEY",
        timeout: int = 120,
    ):
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.api_key = os.environ.get(api_key_env)
        if not self.api_key:
            raise RuntimeError(
                f"Missing API key: set the {api_key_env} environment variable"
            )
        self.timeout = timeout

    def _to_openai_tools(self, tools: list[dict]) -> list[dict]:
        # Our internal tool schema already matches OpenAI's function-calling
        # shape (we modeled registry.as_ollama_tools on it), so this is a
        # passthrough — kept as its own method so a future schema drift
        # between Ollama's and OpenAI's tool format has one place to fix.
        return tools

    def chat(self, messages, tools=None, options=None) -> dict:
        payload = {
            "model": self.model,
            "messages": messages,
            **(options or {}),
        }
        if tools:
            payload["tools"] = self._to_openai_tools(tools)

        resp = requests.post(
            f"{self.base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=self.timeout,
        )
        resp.raise_for_status()
        choice = resp.json()["choices"][0]["message"]

        tool_calls = None
        if choice.get("tool_calls"):
            tool_calls = []
            for tc in choice["tool_calls"]:
                fn = tc["function"]
                args = fn.get("arguments", "{}")
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except json.JSONDecodeError:
                        args = {}
                tool_calls.append({"function": {"name": fn["name"], "arguments": args}})

        return {
            "role": "assistant",
            "content": choice.get("content") or "",
            "tool_calls": tool_calls,
        }
