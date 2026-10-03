"""
Vercel deployment adapter for SuperFlow.
Deploys frontend / Next.js / static applications and manages instant rollback aliases.
"""

from __future__ import annotations

import os
import subprocess
import time
from typing import Tuple

from agent_engine.secrets.injector import SecretInjector
from agent_engine.secrets.vault import EncryptedVault

from ..spec import DeploySpec, DeploymentRecord
from .base import BaseDeployAdapter


class VercelDeployAdapter(BaseDeployAdapter):
    """Adapter for Vercel edge and serverless deployments."""

    def __init__(self, vault: EncryptedVault | None = None):
        self.vault = vault or EncryptedVault()
        self.injector = SecretInjector(self.vault)

    def deploy(self, spec: DeploySpec) -> DeploymentRecord:
        deploy_id = f"vercel_{int(time.time())}"
        start_time = time.time()

        # Step 1: Run build command if configured
        if spec.build_command:
            try:
                subprocess.run(
                    spec.build_command,
                    shell=True,
                    cwd=spec.project_path,
                    check=True,
                    capture_output=True,
                    text=True,
                )
            except subprocess.CalledProcessError as e:
                return DeploymentRecord(
                    deploy_id=deploy_id,
                    target="vercel",
                    timestamp=start_time,
                    status="failed",
                    logs=f"Build step failed:\n{e.stderr or e.stdout}",
                )

        # Step 2: Inject secret environment variables
        injected_env, redaction_map = self.injector.inject_into_env(spec.env_vars)
        os_env = os.environ.copy()
        os_env.update(injected_env)

        # Step 3: Run vercel deploy command
        token_arg = []
        token_env = os_env.get("VERCEL_TOKEN")
        if token_env:
            token_arg = ["--token", token_env]

        cmd = ["npx", "vercel", "--prod", "--yes"] + token_arg
        try:
            res = subprocess.run(
                cmd,
                cwd=spec.project_path,
                capture_output=True,
                text=True,
                env=os_env,
                check=True,
            )
            raw_output = res.stdout.strip()
            # Extract deployment URL (typically the last line output by vercel cli)
            deployed_url = raw_output.split()[-1] if raw_output else "https://vercel.app"

            return DeploymentRecord(
                deploy_id=deploy_id,
                target="vercel",
                timestamp=start_time,
                status="active",
                deployed_url=deployed_url,
                rollback_ref=deployed_url,
                logs=self.injector.redact_output(raw_output, redaction_map),
                spec={"target": spec.target, "domains": spec.domains},
            )
        except subprocess.CalledProcessError as e:
            sanitized_err = self.injector.redact_output(e.stderr or e.stdout, redaction_map)
            return DeploymentRecord(
                deploy_id=deploy_id,
                target="vercel",
                timestamp=start_time,
                status="failed",
                logs=f"Vercel deploy command failed:\n{sanitized_err}",
            )

    def rollback(self, record_to_rollback: DeploymentRecord) -> Tuple[bool, str]:
        """Rolls back by pointing domains back to the previous deployment URL."""
        if not record_to_rollback.rollback_ref:
            return False, "No rollback reference (previous deployment URL) available."

        target_url = record_to_rollback.rollback_ref
        domains = record_to_rollback.spec.get("domains", [])
        if not domains:
            return True, f"Rolled back active reference to {target_url} (no custom domains to re-alias)."

        # Re-alias the domains to the previous deployment
        errors = []
        for domain in domains:
            try:
                subprocess.run(
                    ["npx", "vercel", "alias", "set", target_url, domain],
                    check=True,
                    capture_output=True,
                    text=True,
                )
            except subprocess.CalledProcessError as e:
                errors.append(f"Failed to re-alias {domain}: {e.stderr}")

        if errors:
            return False, "; ".join(errors)
        return True, f"Successfully rolled back custom domains {domains} to {target_url}"
