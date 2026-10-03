"""
Permission system: every tool call is tagged with a risk tier. Tiers above
the user's auto-approve threshold must be explicitly confirmed before they
run. This is the single choke point all tool execution passes through —
individual tools never decide for themselves whether they're allowed to run.
"""

from __future__ import annotations

import enum
from dataclasses import dataclass
from typing import Callable, Optional


class RiskTier(enum.IntEnum):
    SAFE = 0        # read-only: list files, read a file, http GET to a public URL
    MODERATE = 1    # local side effects: write/edit a file, create a directory
    DANGEROUS = 2   # shell exec, network mutation, anything irreversible locally
    CRITICAL = 3    # uses stored credentials, deploys publicly, spends money


@dataclass
class PendingAction:
    tool_name: str
    description: str
    params: dict
    risk: RiskTier


class PermissionDenied(Exception):
    pass


class PermissionManager:
    """
    Holds the user's auto-approve threshold and a confirm callback.
    auto_approve_below: any action with risk < this tier runs without asking.
    confirm_fn: called for anything at or above the threshold; must return bool.
    """

    def __init__(
        self,
        auto_approve_below: RiskTier = RiskTier.MODERATE,
        confirm_fn: Optional[Callable[[PendingAction], bool]] = None,
    ):
        self.auto_approve_below = auto_approve_below
        self.confirm_fn = confirm_fn or self._default_confirm

    def _default_confirm(self, action: PendingAction) -> bool:
        # Fallback confirm: deny by default if no UI is wired up. A real
        # product MUST replace this with an actual user-facing prompt.
        print(
            f"[permission] BLOCKED (no confirm_fn configured): "
            f"{action.tool_name} ({action.risk.name}) — {action.description}"
        )
        return False

    def authorize(self, action: PendingAction) -> bool:
        if action.risk < self.auto_approve_below:
            return True
        return self.confirm_fn(action)

    def require(self, action: PendingAction) -> None:
        if not self.authorize(action):
            raise PermissionDenied(
                f"User declined: {action.tool_name} ({action.risk.name})"
            )
