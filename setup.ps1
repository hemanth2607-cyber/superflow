# PowerShell setup script for Windows
Write-Host "Installing Python dependencies..."
pip install -r requirements.txt

Write-Host "`nChecking what's available..."
python -c @"
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ollama_ok = False
try:
    import ollama
    ollama.Client().list()
    ollama_ok = True
except Exception:
    pass

print(f\"  Ollama (local, free, needs 'ollama pull <model>'):        {'reachable' if ollama_ok else 'not running — install from https://ollama.com'}\")
print(f\"  OPENROUTER_API_KEY (dozens of free hosted open models):    {'set' if os.environ.get('OPENROUTER_API_KEY') else 'not set — free signup at openrouter.ai/keys'}\")
print(f\"  GROQ_API_KEY (fast free hosted open models):                {'set' if os.environ.get('GROQ_API_KEY') else 'not set — free signup at console.groq.com/keys'}\")
print(f\"  HF_TOKEN (Hugging Face free inference):                     {'set' if os.environ.get('HF_TOKEN') else 'not set — free token at huggingface.co/settings/tokens'}\")
"@

Write-Host "`nRun the end-to-end mock tests (no credentials needed):"
Write-Host "  python test_engine.py"
Write-Host "  python test_workflow.py"
Write-Host "  python test_auto_discovery.py"
Write-Host "`nThen try a real multi-model workflow:"
Write-Host "  python -m agent_engine.workflow_cli `"your task here`""
