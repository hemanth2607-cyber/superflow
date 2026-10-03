"""
Mocks requests.get to return payloads shaped exactly like OpenRouter's and
Groq's real /models responses, proving: (1) free-vs-paid filtering works,
(2) tag inference is sane, (3) models actually get registered and are
immediately usable through the normal ModelRegistry.select() path.
"""

import os
import sys
import tempfile
from unittest import mock

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

os.environ["OPENROUTER_API_KEY"] = "fake-key-for-test"
os.environ["GROQ_API_KEY"] = "fake-key-for-test"

from agent_engine.models import auto_discovery  # noqa: E402


FAKE_OPENROUTER_RESPONSE = {
    "data": [
        {"id": "qwen/qwen-2.5-coder-32b-instruct:free", "name": "Qwen2.5 Coder 32B (free)",
         "pricing": {"prompt": "0", "completion": "0"}},
        {"id": "meta-llama/llama-3.1-8b-instruct:free", "name": "Llama 3.1 8B (free)",
         "pricing": {"prompt": "0", "completion": "0"}},
        {"id": "anthropic/claude-sonnet-4.5", "name": "Claude Sonnet (paid)",
         "pricing": {"prompt": "0.000003", "completion": "0.000015"}},  # should be excluded
    ]
}

FAKE_GROQ_RESPONSE = {
    "data": [
        {"id": "llama-3.3-70b-versatile"},
        {"id": "gemma2-9b-it"},
    ]
}


def fake_requests_get(url, headers=None, timeout=None):
    resp = mock.Mock()
    resp.raise_for_status = lambda: None
    if "openrouter" in url:
        resp.json = lambda: FAKE_OPENROUTER_RESPONSE
    elif "groq" in url:
        resp.json = lambda: FAKE_GROQ_RESPONSE
    else:
        raise RuntimeError(f"unexpected URL in test: {url}")
    return resp


def main():
    with mock.patch("agent_engine.models.auto_discovery.requests.get", side_effect=fake_requests_get):
        free_or = auto_discovery.discover_openrouter_free()
        groq_models = auto_discovery.discover_groq_models()

        print("OpenRouter free models discovered:", [m["id"] for m in free_or])
        print("Groq models discovered:", [m["id"] for m in groq_models])

        # Filtering: paid model must be excluded, free ones included
        ids = {m["id"] for m in free_or}
        assert "anthropic/claude-sonnet-4.5" not in ids, "paid model leaked through free filter"
        assert "qwen/qwen-2.5-coder-32b-instruct:free" in ids
        assert "meta-llama/llama-3.1-8b-instruct:free" in ids
        assert len(groq_models) == 2

        # Tag inference sanity
        coder_tags = auto_discovery._infer_tags("qwen/qwen-2.5-coder-32b-instruct:free")
        print("Tags for qwen coder model:", coder_tags)
        assert "coding" in coder_tags  # "coder" keyword matched

        llama_tags = auto_discovery._infer_tags("llama-3.3-70b-versatile")
        print("Tags for llama-3.3-70b:", llama_tags)
        assert "quality" in llama_tags  # 70b -> quality

        # Full registry build (still mocked HTTP, real Ollama skipped since
        # no local server exists in this sandbox)
        registry = auto_discovery.build_auto_registry(
            include_ollama=False, include_openrouter=True, include_groq=True
        )
        all_ids = {m.id for m in registry.list()}
        print("\nFull registry contents:", all_ids)
        assert "openrouter/qwen/qwen-2.5-coder-32b-instruct:free" in all_ids
        assert "groq/llama-3.3-70b-versatile" in all_ids
        assert len(registry.list()) == 4  # 2 openrouter free + 2 groq

        # select() should be able to route to a coding-tagged model from
        # among the auto-discovered ones
        picked = registry.select(["coding"])
        print("select(['coding']) picked:", picked.id)
        assert "coder" in picked.id.lower() or "coding" in picked.tags

    print("\n✅ ALL AUTO-DISCOVERY CHECKS PASSED")


if __name__ == "__main__":
    sys.exit(main())
