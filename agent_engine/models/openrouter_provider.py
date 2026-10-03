"""
OpenRouter and Groq both speak the OpenAI /chat/completions schema, so they
reuse OpenAICompatProvider — these are just named convenience wrappers with
the right base_url and default key env baked in.
"""

from __future__ import annotations

from agent_engine.models.openai_compat_provider import OpenAICompatProvider


class OpenRouterProvider(OpenAICompatProvider):
    def __init__(self, model: str, api_key_env: str = "OPENROUTER_API_KEY"):
        super().__init__(
            model=model,
            base_url="https://openrouter.ai/api/v1",
            api_key_env=api_key_env,
        )


class GroqProvider(OpenAICompatProvider):
    def __init__(self, model: str, api_key_env: str = "GROQ_API_KEY"):
        super().__init__(
            model=model,
            base_url="https://api.groq.com/openai/v1",
            api_key_env=api_key_env,
        )
