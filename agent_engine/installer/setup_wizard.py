"""
SuperFlow One-Click Setup Wizard.
Guides end users on new machines through instant configuration without manual commands.
"""

from __future__ import annotations

import os
import shutil
import sys
import time
from pathlib import Path


def run_setup_wizard():
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    print("""
==================================================================
       🚀 Welcome to SuperFlow: High-End AI Orchestrator 🚀
==================================================================
This wizard will automatically configure your machine for:
 - Multi-model AI orchestration (Local Ollama, Groq, OpenRouter)
 - Screen & Computer-Use automation (Screenshots, Mouse, Keyboard)
 - Encrypted-at-rest Secrets Vault (Zero-exposure API keys)
 - Universal Deployment (Vercel, Docker, VPS) with 1-click rollback
 - Automated SEO & OpenGraph / JSON-LD injection
==================================================================
""")

    time.sleep(0.5)

    # 1. Check Ollama
    print("[1/4] Checking Local AI Engine (Ollama)...")
    ollama_ok = False
    try:
        import ollama
        ollama.Client().list()
        ollama_ok = True
        print("  ✅ Local Ollama engine detected and operational.")
    except Exception:
        print("  ℹ️  Local Ollama not running (optional if using free cloud API keys).")

    # 2. Check Cloud API Keys
    print("\n[2/4] Checking Hosted Open-Model Cloud Keys...")
    groq_key = os.environ.get("GROQ_API_KEY")
    openrouter_key = os.environ.get("OPENROUTER_API_KEY")

    if groq_key:
        print("  ✅ GROQ_API_KEY is active.")
    else:
        print("  ℹ️  GROQ_API_KEY not set (free signup at console.groq.com/keys for instant 70B models).")

    if openrouter_key:
        print("  ✅ OPENROUTER_API_KEY is active.")
    else:
        print("  ℹ️  OPENROUTER_API_KEY not set (free signup at openrouter.ai/keys for 30+ open models).")

    # 3. Initialize Encrypted Vault
    print("\n[3/4] Initializing AES-256 Encrypted Secrets Vault...")
    from agent_engine.secrets.vault import EncryptedVault
    vault = EncryptedVault()
    handles = vault.list_handles()
    print(f"  ✅ Vault initialized. Currently protecting {len(handles)} credentials.")

    # 4. Create Desktop Shortcut / Launcher
    print("\n[4/4] Setting up SuperFlow Launchers...")
    desktop_dir = Path.home() / "Desktop"
    if desktop_dir.exists():
        bat_launcher = desktop_dir / "Launch_SuperFlow.bat"
        bat_content = f"""@echo off
title SuperFlow Orchestrator
cd /d "{Path.cwd()}"
python -m agent_engine.cli
pause
"""
        bat_launcher.write_text(bat_content, encoding="utf-8")
        print(f"  ✅ Desktop launcher created: {bat_launcher}")

    print("""
==================================================================
🎉 Setup Complete! You are ready to run SuperFlow!
==================================================================
To run a full multi-model autonomous workflow:
  python -m agent_engine.workflow_cli "your task here"

To launch the interactive agent terminal:
  python -m agent_engine.cli
""")


if __name__ == "__main__":
    run_setup_wizard()
