"""
Hugging Face's router API lets you call open-weight models hosted on their
free serverless inference tier without downloading anything. Uses the
OpenAI-compatible chat endpoint HF exposes at /v1/chat/completions for
models that support it — same response shape, so this is a thin wrapper
around OpenAICompatProvider rather than a bespoke parser.

Free account + token at huggingface.co/settings/tokens — no credit card,
no model download. Rate-limited on the free tier, generous enough for
development.
"""

from __future__ import annotations

from agent_engine.models.openai_compat_provider import OpenAICompatProvider


class HuggingFaceProvider(OpenAICompatProvider):
    def __init__(self, model: str, api_key_env: str = "HF_TOKEN"):
        super().__init__(
            model=model,
            base_url="https://router.huggingface.co/v1",
            api_key_env=api_key_env,
        )
