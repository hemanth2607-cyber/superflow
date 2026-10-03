"""
Append-only audit log. Every tool call attempt — approved, denied, or
errored — gets a line. This is what lets a user (or you, debugging) answer
"what did the agent actually do" after the fact.
"""

from __future__ import annotations

import json
import time
from pathlib import Path


class AuditLog:
    def __init__(self, path: str = "./agent_audit.jsonl"):
        self.path = Path(path)

    def record(self, event: str, **fields):
        entry = {"ts": time.time(), "event": event, **fields}
        with self.path.open("a") as f:
            f.write(json.dumps(entry, default=str) + "\n")
