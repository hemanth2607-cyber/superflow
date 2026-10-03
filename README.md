# 🌌 SuperFlow — Frontier Multi-Model AI Orchestrator

**SuperFlow** is a production-grade, multi-agent AI orchestrator designed to solve complex multi-language coding tasks, rigorous mathematical derivations, visual computer-use automation, zero-exposure credential deployments, and automated SEO.

It connects seamlessly across:
1. **Local GPUs & CPUs** via [Ollama](https://ollama.com) (Qwen 2.5 Coder, Llama 3, DeepSeek).
2. **Distributed LAN Nodes** (Offload heavy models to a secondary gaming laptop like a Lenovo LOQ, HP Victus, or ASUS TUF).
3. **Hosted Frontier APIs** (Groq, OpenRouter, Hugging Face) for zero-local-RAM inference.
4. **Google Colab QLoRA Fine-Tuning** with automatic GGUF export.

---

## 🏛️ The 5 Core Pillars

```
                        ┌───────────────────────────────────────────────┐
                        │              SuperFlow Core Router            │
                        │      (Task Classification & Model Routing)    │
                        └───────┬───────────────────────────────┬───────┘
                                │                               │
     ┌──────────────────────────┴───────────────┐               │
     ▼                                          ▼               ▼
┌──────────────────────────┐       ┌────────────────────────┐  ┌────────────────────────┐
│  Pillar 1: Computer-Use  │       │ Pillar 2: Secret Vault │  │  Pillar 3: Deployment  │
│  - Screen Capture & Grid │       │ - AES-256-GCM Vault    │  │  - Universal DeploySpec│
│  - Mouse/Keyboard Ground │       │ - Zero LLM Exposure    │  │  - Vercel & Docker     │
│  - Visual HTML Rewind    │       │ - Auto-Redacted Logs   │  │  - 1-Click Rollback    │
└──────────────────────────┘       └────────────────────────┘  └────────────────────────┘
                                                ▲
                                                │
                               ┌────────────────┴───────────────┐
                               ▼                                ▼
                  ┌────────────────────────┐       ┌────────────────────────┐
                  │ Pillar 4: SEO Engine   │       │ Pillar 5: MCP Bridge   │
                  │ - OpenGraph & JSON-LD  │       │ - JSON-RPC 2.0 Server  │
                  │ - Sitemap & robots.txt │       │ - Claude & Cursor Spec │
                  │ - Lighthouse Autofix   │       │ - RiskTier Gatekeeper  │
                  └────────────────────────┘       └────────────────────────┘
```

---

### 1. Computer-Use Layer (Screen & Input Grounding)
* **Screen Capture & Grid Grounding**: High-resolution screen grabbing with automatic downsampling and coordinate grid overlays for visual models.
* **Input Execution**: Subpixel mouse clicks, double clicks, dragging, scrolling, text typing, and keyboard hotkeys (`Ctrl+C`, `Alt+Tab`).
* **Visual Session Rewind**: Captures before-and-after screenshots for every single action, generating an interactive HTML timeline (`artifacts/sessions/index.html`) for full transparency and trust.
* **Tools**: `capture_screen`, `mouse_click`, `keyboard_type`, `keyboard_hotkey`.

---

### 2. Credential & Secrets Vault (Zero-Exposure)
* **AES-256-GCM Encrypted Storage**: Passwords, API tokens, and private keys are encrypted at rest with PBKDF2-HMAC-SHA256 key derivation.
* **Zero Context-Window Exposure**: Plaintext secrets **never** enter the LLM's prompt or context window. The agent refers to handles like `vault://vercel-token` or `vault://github-pat`.
* **Runtime Injection & Redaction**: Secrets are injected only at the operating system subprocess boundary. All outputs, logs, and exception stack traces automatically redact tokens into `[REDACTED:<alias>]`.
* **Tools**: `list_vault_secrets`, `store_vault_secret`.

---

### 3. Deployment Abstraction Layer (Universal Deploy & Rollback)
* **Target Adapters**: First-class support for **Vercel** (serverless/frontend) and **Docker** (containers/microservices).
* **Universal `DeploySpec`**: Single declarative spec (build command, output directory, environment variables, domains).
* **Instant Rollback**: Every deployment stores audit metadata and previous references. A single command reverts custom domains or restarts previous container tags.
* **Tools**: `deploy_application`, `rollback_deployment`, `get_deployment_history`.

---

### 4. SEO-by-Default Engine
* **Metadata & Structured Data Injection**: Automatically injects `<title>`, `<meta name="description">`, OpenGraph, Twitter Cards, and Schema.org JSON-LD blocks into HTML.
* **Sitemap & Robots Generator**: Discovers all HTML routes and compiles compliant `sitemap.xml` and `robots.txt`.
* **Lighthouse Auditor & Autofixer**: Scans for accessibility violations, missing image `alt` attributes, heading hierarchy errors, and viewport tags, applying fixes in place.
* **Tools**: `audit_html_seo`, `inject_seo_metadata`, `generate_sitemap_and_robots`.

---

### 5. Orchestrator & MCP Bridge
* **Task Router**: Automatically classifies user goals (`coding`, `math_reasoning`, `computer_use`, `deployment`, `seo_optimization`) and compiles a tailored multi-step DAG.
* **Model Context Protocol (MCP) Bridge**: Exposes all SuperFlow capabilities over standard JSON-RPC 2.0 for Claude Desktop, Cursor, and external IDE integration.
* **Risk-Tiered Permission Gate**: Every action passes through `RiskTier` (`SAFE`, `MODERATE`, `DANGEROUS`, `CRITICAL`) with interactive terminal consent prompts.

---

## 🚀 Quick Start

### 1. Installation

```powershell
# Clone and install dependencies
pip install -r requirements.txt
pip install -e .

# Run the 1-click Setup Wizard
superflow-setup
```

### 2. Run Comprehensive Test Suite

Verify all 5 pillars in seconds:
```powershell
python test_superflow_pillars.py
```

### 3. Run Autonomous Workflows

```powershell
# Run using local Ollama model
superflow-workflow "Write an optimized Dijkstra shortest path algorithm in C++" --model qwen2.5:3b

# Run across local network using a secondary laptop GPU (e.g. Lenovo LOQ, HP Victus)
$env:OLLAMA_HOST = "http://192.168.137.1:11434"
superflow-workflow "Build an interactive web portfolio, audit its SEO, and deploy to Vercel" --model qwen2.5-coder:7b

# Run using free hosted open models (Zero local RAM)
$env:GROQ_API_KEY = "gsk_..."
superflow-workflow "Solve the Riemann zeta function derivation and verify numerically"
```

---

## 🎓 Google Colab Fine-Tuning Pipeline

Fine-tune your own specialist coding and math models (e.g. `Qwen2.5-Coder-7B` or `Llama-3.1-8B`) using **QLoRA 4-bit** on a free Google Colab GPU (T4 / A100):

1. **Curate the Dataset**:
   ```python
   from agent_engine.training.dataset_curator import CodeMathDatasetCurator
   curator = CodeMathDatasetCurator("./superflow_train_data.jsonl")
   curator.generate_seed_dataset()
   ```
2. **Generate the Colab Script**:
   ```python
   from agent_engine.training.colab_train_pipeline import generate_colab_notebook_script
   generate_colab_notebook_script("./colab_train_superflow.py")
   ```
3. Open `colab_train_superflow.py` in [Google Colab](https://colab.research.google.com), upload your dataset, and click **Run All**.
4. The script automatically exports the model into a quantized **GGUF** file (`superflow-coder-7b-Q4_K_M.gguf`), ready to import into Ollama:
   ```bash
   ollama create superflow -f Modelfile
   superflow-workflow "your task" --model superflow
   ```

---

## 📦 Standalone Windows Executable (.EXE Setup)

To distribute SuperFlow to any computer without requiring terminal commands or manual Python setup:

```powershell
python -m agent_engine.installer.build_exe
```

This compiles a standalone installer executable into:
```
dist/SuperFlow_Setup.exe
```
Any user can simply double-click `SuperFlow_Setup.exe` on their Windows computer to launch the interactive setup wizard, initialize the encrypted vault, and create desktop shortcuts automatically.
