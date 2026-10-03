"""
Docker container deployment adapter for SuperFlow.
Builds, tags, and manages local or remote container deployments with image rollback.
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


class DockerDeployAdapter(BaseDeployAdapter):
    """Adapter for Docker container builds and container lifecycle management."""

    def __init__(self, vault: EncryptedVault | None = None):
        self.vault = vault or EncryptedVault()
        self.injector = SecretInjector(self.vault)

    def deploy(self, spec: DeploySpec) -> DeploymentRecord:
        deploy_id = f"docker_{int(time.time())}"
        start_time = time.time()
        container_name = spec.adapter_options.get("container_name", "superflow-app")
        port_mapping = spec.adapter_options.get("port_mapping", "3000:3000")
        image_tag = f"{container_name}:{deploy_id}"

        # 1. Build Docker image
        try:
            build_res = subprocess.run(
                ["docker", "build", "-t", image_tag, "."],
                cwd=spec.project_path,
                capture_output=True,
                text=True,
                check=True,
            )
        except subprocess.CalledProcessError as e:
            return DeploymentRecord(
                deploy_id=deploy_id,
                target="docker",
                timestamp=start_time,
                status="failed",
                logs=f"Docker build failed:\n{e.stderr or e.stdout}",
            )

        # 2. Stop old container if running
        subprocess.run(["docker", "rm", "-f", container_name], capture_output=True)

        # 3. Inject secrets into environment
        injected_env, redaction_map = self.injector.inject_into_env(spec.env_vars)
        env_args = []
        for k, v in injected_env.items():
            env_args.extend(["-e", f"{k}={v}"])

        # 4. Run new container
        run_cmd = ["docker", "run", "-d", "--name", container_name, "-p", port_mapping] + env_args + [image_tag]
        try:
            run_res = subprocess.run(run_cmd, capture_output=True, text=True, check=True)
            container_id = run_res.stdout.strip()[:12]

            return DeploymentRecord(
                deploy_id=deploy_id,
                target="docker",
                timestamp=start_time,
                status="active",
                deployed_url=f"http://localhost:{port_mapping.split(':')[0]}",
                rollback_ref=image_tag,
                logs=f"Container started: {container_id} ({image_tag})",
                spec={"container_name": container_name, "port_mapping": port_mapping},
            )
        except subprocess.CalledProcessError as e:
            return DeploymentRecord(
                deploy_id=deploy_id,
                target="docker",
                timestamp=start_time,
                status="failed",
                logs=f"Docker run failed:\n{e.stderr or e.stdout}",
            )

    def rollback(self, record_to_rollback: DeploymentRecord) -> Tuple[bool, str]:
        """Rolls back by restarting the previous docker image tag."""
        prev_image = record_to_rollback.rollback_ref
        if not prev_image:
            return False, "No previous Docker image tag found."

        container_name = record_to_rollback.spec.get("container_name", "superflow-app")
        port_mapping = record_to_rollback.spec.get("port_mapping", "3000:3000")

        subprocess.run(["docker", "rm", "-f", container_name], capture_output=True)
        try:
            subprocess.run(
                ["docker", "run", "-d", "--name", container_name, "-p", port_mapping, prev_image],
                check=True,
                capture_output=True,
                text=True,
            )
            return True, f"Successfully rolled back container '{container_name}' to image '{prev_image}'"
        except subprocess.CalledProcessError as e:
            return False, f"Failed to restart previous image {prev_image}: {e.stderr}"
