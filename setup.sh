#!/usr/bin/env bash
# Installs Python deps and tells you what's reachable right now.
# Does NOT install Ollama itself or sign you up for anything — those are
# one-time manual steps (see README) since they need your own machine/accounts.
set -e

echo "Installing Python dependencies..."
pip install -r requirements.txt --break-system-packages 2>/dev/null || pip install -r requirements.txt

echo ""
echo "Checking what's available..."
python3 - << 'EOF'
import os

ollama_ok = False
try:
    import ollama
    ollama.Client().list()
    ollama_ok = True
except Exception:
    pass

print(f"  Ollama (local, free, needs 'ollama pull <model>'):        {'reachable' if ollama_ok else 'not running — install from https://ollama.com'}")
print(f"  OPENROUTER_API_KEY (dozens of free hosted open models):    {'set' if os.environ.get('OPENROUTER_API_KEY') else 'not set — free signup at openrouter.ai/keys'}")
print(f"  GROQ_API_KEY (fast free hosted open models):                {'set' if os.environ.get('GROQ_API_KEY') else 'not set — free signup at console.groq.com/keys'}")
print(f"  HF_TOKEN (Hugging Face free inference):                     {'set' if os.environ.get('HF_TOKEN') else 'not set — free token at huggingface.co/settings/tokens'}")
EOF

echo ""
echo "Run the end-to-end mock tests (no credentials needed):"
echo "  python3 test_engine.py"
echo "  python3 test_workflow.py"
echo "  python3 test_auto_discovery.py"
echo ""
echo "Then try a real multi-model workflow:"
echo "  python3 -m agent_engine.workflow_cli \"your task here\""
