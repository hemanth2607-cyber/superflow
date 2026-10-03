"""
Deployment specifications and rollback management for SuperFlow.
"""

from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional


@dataclass
class DeploySpec:
    """Universal deployment specification consumed by all adapters."""
    target: Literal["vercel", "docker", "ssh_vps", "static_s3"]
    project_path: str = "./workspace"
    build_command: str = "npm run build"
    output_dir: str = "dist"
    env_vars: Dict[str, str] = field(default_factory=dict)
    domains: List[str] = field(default_factory=list)
    health_check_url: Optional[str] = None
    adapter_options: Dict[str, Any] = field(default_factory=dict)


@dataclass
class DeploymentRecord:
    """Historical audit record of a single deployment."""
    deploy_id: str
    target: str
    timestamp: float
    status: Literal["active", "failed", "rolled_back"]
    deployed_url: str = ""
    rollback_ref: str = ""
    logs: str = ""
    spec: Dict[str, Any] = field(default_factory=dict)


class RollbackManager:
    """Tracks deploy history and coordinates rollbacks across targets."""

    def __init__(self, history_file: str = "./artifacts/deployments/history.jsonl"):
        self.history_file = Path(history_file)
        self.history_file.parent.mkdir(parents=True, exist_ok=True)

    def record(self, record: DeploymentRecord) -> None:
        """Appends a new deployment record to the audit file."""
        with open(self.history_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(asdict(record), default=str) + "\n")

    def get_history(self, target: Optional[str] = None) -> List[DeploymentRecord]:
        """Returns all historical deployment records, newest first."""
        records: List[DeploymentRecord] = []
        if not self.history_file.exists():
            return records

        with open(self.history_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    data = json.loads(line)
                    if not target or data.get("target") == target:
                        records.append(DeploymentRecord(**data))

        records.sort(key=lambda r: r.timestamp, reverse=True)
        return records

    def get_last_successful(self, target: str) -> Optional[DeploymentRecord]:
        """Finds the most recent active deployment that can be rolled back to."""
        history = self.get_history(target=target)
        for r in history:
            if r.status == "active" and r.rollback_ref:
                return r
        return None

    def update_status(self, deploy_id: str, new_status: Literal["active", "failed", "rolled_back"]) -> bool:
        """Updates the status of a past deployment."""
        history = self.get_history()
        updated = False
        new_lines = []
        for r in history:
            if r.deploy_id == deploy_id:
                r.status = new_status
                updated = True
            new_lines.append(json.dumps(asdict(r), default=str) + "\n")

        with open(self.history_file, "w", encoding="utf-8") as f:
            f.writelines(new_lines)

        return updated
