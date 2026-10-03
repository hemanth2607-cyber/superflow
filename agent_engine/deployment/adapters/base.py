"""
Base interface for SuperFlow Deployment Target Adapters.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Tuple

from ..spec import DeploySpec, DeploymentRecord


class BaseDeployAdapter(ABC):
    """Abstract interface that all deployment targets implement."""

    @abstractmethod
    def deploy(self, spec: DeploySpec) -> DeploymentRecord:
        """Executes the deployment pipeline and returns an audit record."""
        pass

    @abstractmethod
    def rollback(self, record_to_rollback: DeploymentRecord) -> Tuple[bool, str]:
        """Rolls back the target to the specified past deployment version."""
        pass
