"""
Tool bindings for SuperFlow Deployment & Rollback.
Exposes universal deployment across Vercel, Docker, and Cloud targets.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from agent_engine.deployment.adapters.docker_deploy import DockerDeployAdapter
from agent_engine.deployment.adapters.vercel import VercelDeployAdapter
from agent_engine.deployment.spec import DeploySpec, RollbackManager
from agent_engine.permissions import RiskTier
from agent_engine.tools.registry import registry

_rollback_mgr = RollbackManager()


@registry.register(
    name="deploy_application",
    description="Deploys the application using the universal DeploySpec. Supports 'vercel', 'docker', 'ssh_vps'. Handles secret injection and records deploy history for rollbacks.",
    risk=RiskTier.DANGEROUS,
    parameters={
        "type": "object",
        "properties": {
            "target": {
                "type": "string",
                "enum": ["vercel", "docker"],
                "description": "Deployment target platform",
            },
            "project_path": {
                "type": "string",
                "description": "Path to project root. Defaults to current workspace.",
            },
            "build_command": {
                "type": "string",
                "description": "Build command to run before deploy, e.g. 'npm run build'",
            },
            "domains": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Custom domains to attach to this deployment",
            },
            "env_vars": {
                "type": "object",
                "description": "Environment variables. Secrets can be specified as 'vault://<alias>'",
            },
        },
        "required": ["target"],
    },
)
def deploy_application(
    target: str,
    project_path: str = "./workspace",
    build_command: str = "npm run build",
    domains: Optional[List[str]] = None,
    env_vars: Optional[Dict[str, str]] = None,
) -> dict:
    spec = DeploySpec(
        target=target,  # type: ignore
        project_path=project_path,
        build_command=build_command,
        domains=domains or [],
        env_vars=env_vars or {},
    )

    if target == "vercel":
        adapter = VercelDeployAdapter()
    elif target == "docker":
        adapter = DockerDeployAdapter()
    else:
        raise ValueError(f"Unsupported deployment target: '{target}'")

    record = adapter.deploy(spec)
    _rollback_mgr.record(record)

    return {
        "status": record.status,
        "deploy_id": record.deploy_id,
        "target": record.target,
        "deployed_url": record.deployed_url,
        "logs": record.logs,
        "can_rollback": bool(record.rollback_ref),
    }


@registry.register(
    name="rollback_deployment",
    description="Instantly reverts the active deployment on the specified target to the last known successful version.",
    risk=RiskTier.DANGEROUS,
    parameters={
        "type": "object",
        "properties": {
            "target": {
                "type": "string",
                "enum": ["vercel", "docker"],
                "description": "Deployment target platform to roll back",
            }
        },
        "required": ["target"],
    },
)
def rollback_deployment(target: str) -> dict:
    last_active = _rollback_mgr.get_last_successful(target)
    if not last_active:
        return {"status": "error", "message": f"No previous successful deployment found for target '{target}'."}

    if target == "vercel":
        adapter = VercelDeployAdapter()
    elif target == "docker":
        adapter = DockerDeployAdapter()
    else:
        return {"status": "error", "message": f"Unsupported target '{target}'"}

    success, msg = adapter.rollback(last_active)
    if success:
        _rollback_mgr.update_status(last_active.deploy_id, "rolled_back")

    return {
        "status": "success" if success else "failed",
        "target": target,
        "rolled_back_to": last_active.deploy_id,
        "details": msg,
    }


@registry.register(
    name="get_deployment_history",
    description="Retrieves the historical deployment log and rollback references for a target.",
    risk=RiskTier.SAFE,
    parameters={
        "type": "object",
        "properties": {
            "target": {
                "type": "string",
                "description": "Filter by target (optional), e.g. 'vercel' or 'docker'",
            }
        },
    },
)
def get_deployment_history(target: Optional[str] = None) -> dict:
    history = _rollback_mgr.get_history(target)
    return {
        "status": "success",
        "count": len(history),
        "history": [
            {
                "deploy_id": r.deploy_id,
                "target": r.target,
                "timestamp": r.timestamp,
                "status": r.status,
                "url": r.deployed_url,
            }
            for r in history[:10]  # Return last 10 entries
        ],
    }
