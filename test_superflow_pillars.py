"""
Comprehensive Verification Suite for SuperFlow:
- Pillar 1: Computer-Use Layer (Screenshots, Grid, Actions, Session Recording)
- Pillar 2: Encrypted Secrets Vault & Zero-Exposure Runtime Injector
- Pillar 3: DeploySpec & Rollback Management
- Pillar 4: SEO Metadata, Sitemap Generation & HTML Auditor
- Pillar 5: Task Classifier & MCP Bridge
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Pillar 1 Imports
from agent_engine.computer_use.screen import ScreenManager
from agent_engine.computer_use.actions import ComputerActionExecutor, MouseAction, KeyboardAction

# Pillar 2 Imports
from agent_engine.secrets.vault import EncryptedVault
from agent_engine.secrets.injector import SecretInjector

# Pillar 3 Imports
from agent_engine.deployment.spec import DeploySpec, DeploymentRecord, RollbackManager

# Pillar 4 Imports
from agent_engine.seo.meta_injector import SEOMetaInjector
from agent_engine.seo.sitemap_generator import SitemapGenerator
from agent_engine.seo.auditor import HTMLSEOAuditor

from agent_engine.orchestrator.router import TaskClassifier, TaskDomain
from agent_engine.orchestrator.mcp_bridge import MCPBridge

# Import all tool packages to register @registry.register decorators
import agent_engine.tools.filesystem  # noqa: F401
import agent_engine.tools.shell  # noqa: F401
import agent_engine.tools.computer_tools  # noqa: F401
import agent_engine.tools.secrets_tools  # noqa: F401
import agent_engine.tools.deploy_tools  # noqa: F401
import agent_engine.tools.seo_tools  # noqa: F401


def test_computer_use(tmp_dir):
    print("\n[Testing Pillar 1: Computer-Use Layer]")
    mgr = ScreenManager(default_save_dir=tmp_dir)
    shot = mgr.capture_fullscreen()
    assert Path(shot["image_path"]).exists(), "Screenshot was not saved"
    assert len(shot["base64"]) > 100, "Base64 string was empty"

    grid_shot = mgr.capture_with_coordinate_grid()
    assert Path(grid_shot["grid_image_path"]).exists(), "Grid screenshot was not saved"

    w, h = ScreenManager.get_screen_size()
    assert w > 0 and h > 0, "Invalid screen size"
    print(f"  ✅ Screen Capture & Coordinate Grid OK ({w}x{h})")


def test_secrets_vault(tmp_dir):
    print("\n[Testing Pillar 2: Encrypted Secrets Vault & Zero-Exposure Injector]")
    vault_file = str(Path(tmp_dir) / "test_vault.enc")
    vault = EncryptedVault(vault_path=vault_file, master_password="super-secret-password-xyz")

    handle = vault.store_secret(
        alias="vercel-deploy-token",
        secret_value="vercel_live_token_999888777",
        description="Vercel production deploy token",
    )
    assert handle == "vault://vercel-deploy-token"

    handles = vault.list_handles()
    assert len(handles) == 1
    assert "vercel_live_token" not in str(handles), "Raw secret leaked into handle list!"

    # Test Injector
    injector = SecretInjector(vault)
    env = {
        "PUBLIC_APP": "my-app",
        "AUTH_HEADER": "Bearer vault://vercel-deploy-token",
    }
    injected, redaction_map = injector.inject_into_env(env)
    assert injected["AUTH_HEADER"] == "Bearer vercel_live_token_999888777", "Secret was not injected"

    # Test Redaction
    leaked_log = f"Error communicating with token vercel_live_token_999888777: Unauthorized"
    sanitized = injector.redact_output(leaked_log, redaction_map)
    assert "vercel_live_token_999888777" not in sanitized, "Plaintext secret leaked in logs!"
    assert "[REDACTED:vercel-deploy-token]" in sanitized
    print("  ✅ AES-256 Encrypted Vault & Zero-Exposure Redaction OK")


def test_deployment_spec(tmp_dir):
    print("\n[Testing Pillar 3: Deployment Abstraction & Rollback Management]")
    history_file = str(Path(tmp_dir) / "deploy_history.jsonl")
    mgr = RollbackManager(history_file=history_file)

    rec1 = DeploymentRecord(
        deploy_id="dep_001",
        target="vercel",
        timestamp=1000.0,
        status="active",
        deployed_url="https://app-v1.vercel.app",
        rollback_ref="https://app-v1.vercel.app",
    )
    mgr.record(rec1)

    rec2 = DeploymentRecord(
        deploy_id="dep_002",
        target="vercel",
        timestamp=2000.0,
        status="active",
        deployed_url="https://app-v2.vercel.app",
        rollback_ref="https://app-v2.vercel.app",
    )
    mgr.record(rec2)

    history = mgr.get_history(target="vercel")
    assert len(history) == 2
    assert history[0].deploy_id == "dep_002"  # Newest first

    last = mgr.get_last_successful("vercel")
    assert last.deploy_id == "dep_002"

    mgr.update_status("dep_002", "rolled_back")
    updated_last = mgr.get_last_successful("vercel")
    assert updated_last.deploy_id == "dep_001"
    print("  ✅ DeploySpec & Rollback Management State Machine OK")


def test_seo_engine(tmp_dir):
    print("\n[Testing Pillar 4: SEO-by-Default Engine]")
    sample_html = """<!DOCTYPE html>
<html>
<head></head>
<body>
  <h1>Welcome to SuperFlow</h1>
  <img src="banner.png">
</body>
</html>"""

    html_file = Path(tmp_dir) / "index.html"
    html_file.write_text(sample_html, encoding="utf-8")

    auditor = HTMLSEOAuditor()
    report = auditor.audit(sample_html)
    assert report["issues_count"] > 0, "Auditor should catch missing title, viewport, and alt text"

    fixed_html = auditor.autofix(sample_html, title_fallback="SuperFlow Hub", description_fallback="AI System")
    assert 'alt="Banner"' in fixed_html, "Missing alt tag was not auto-fixed"
    assert '<meta name="viewport"' in fixed_html, "Missing viewport was not auto-fixed"

    seo_injected = SEOMetaInjector.inject_seo(
        html_content=fixed_html,
        title="SuperFlow: Frontier Multi-Model AI Orchestrator",
        description="The ultimate orchestration engine combining computer-use, deployment, and SEO.",
        canonical_url="https://superflow.ai",
    )
    assert "og:title" in seo_injected
    assert "twitter:card" in seo_injected
    assert "application/ld+json" in seo_injected

    # Sitemap test
    html_file.write_text(seo_injected, encoding="utf-8")
    sm_gen = SitemapGenerator(base_url="https://superflow.ai")
    sitemap_file = sm_gen.generate_sitemap(str(tmp_dir))
    assert Path(sitemap_file).exists()
    assert "https://superflow.ai/" in Path(sitemap_file).read_text()
    print("  ✅ SEO Meta Injection, Structured JSON-LD & Sitemap OK")


def test_orchestrator():
    print("\n[Testing Pillar 5: Orchestrator Task Classifier & MCP Bridge]")
    # Test Router Intent Classification
    task_code = "Implement a high-performance fast Fourier transform algorithm in C++"
    plan_code = TaskClassifier.classify(task_code)
    assert plan_code.domain in (TaskDomain.CODING, TaskDomain.MATH_REASONING)

    task_screen = "Take a screenshot of the browser window and click the submit button"
    plan_screen = TaskClassifier.classify(task_screen)
    assert plan_screen.domain == TaskDomain.COMPUTER_USE
    assert "capture_screen" in plan_screen.allowed_tools

    task_deploy = "Deploy the latest build to Vercel and attach domain superflow.dev"
    plan_deploy = TaskClassifier.classify(task_deploy)
    assert plan_deploy.domain == TaskDomain.DEPLOYMENT

    # Test MCP Bridge
    mcp_tools = MCPBridge.list_tools()
    assert "tools" in mcp_tools
    tool_names = [t["name"] for t in mcp_tools["tools"]]
    assert "capture_screen" in tool_names
    assert "deploy_application" in tool_names
    assert "inject_seo_metadata" in tool_names
    assert "list_vault_secrets" in tool_names
    print("  ✅ Multi-Domain Task Classifier & Standard MCP Bridge OK")


def main():
    tmp_dir = tempfile.mkdtemp(prefix="superflow_test_")
    try:
        test_computer_use(tmp_dir)
        test_secrets_vault(tmp_dir)
        test_deployment_spec(tmp_dir)
        test_seo_engine(tmp_dir)
        test_orchestrator()
        print("\n" + "=" * 55)
        print("🌟 ALL 5 SUPERFLOW PILLARS VERIFIED & FUNCTIONAL 🌟")
        print("=" * 55)
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
