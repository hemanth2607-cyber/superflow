"""
SuperFlow Deployment Abstraction Layer.
Provides a unified DeploySpec across targets (Vercel, Docker, SSH/VPS),
automated health checking, and built-in rollback capabilities.
"""

from .spec import DeploySpec, DeploymentRecord, RollbackManager

__all__ = ["DeploySpec", "DeploymentRecord", "RollbackManager"]
