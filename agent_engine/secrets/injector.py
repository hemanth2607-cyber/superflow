"""
Runtime Secret Injector for SuperFlow.
Substitutes 'vault://<alias>' handles with real decrypted values exclusively
at the execution boundary (HTTP requests, subprocess env vars), and automatically
redacts plaintext secrets from stdout, stderr, logs, and exception messages.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Tuple

from .vault import EncryptedVault

VAULT_HANDLE_REGEX = re.compile(r"vault://([a-zA-Z0-9_\-]+)")


class SecretInjector:
    """Safely injects vault secrets into execution environments without LLM visibility."""

    def __init__(self, vault: EncryptedVault):
        self.vault = vault

    def inject_into_env(
        self,
        env_dict: Dict[str, str],
        allowed_scope: str = "deploy",
    ) -> Tuple[Dict[str, str], Dict[str, str]]:
        """
        Inspects an environment dictionary for 'vault://' values.
        Returns:
          - injected_env: dictionary containing actual secrets for subprocess execution
          - redaction_map: mapping of {plaintext_secret: '[REDACTED_SECRET:alias]'}
        """
        injected = dict(env_dict)
        redaction_map: Dict[str, str] = {}

        for k, v in env_dict.items():
            if not isinstance(v, str):
                continue
            matches = VAULT_HANDLE_REGEX.findall(v)
            for alias in matches:
                secret_val = self.vault.retrieve_secret_internal(alias)
                handle_str = f"vault://{alias}"
                injected[k] = injected[k].replace(handle_str, secret_val)
                redaction_map[secret_val] = f"[REDACTED:{alias}]"

        return injected, redaction_map

    def inject_into_headers(
        self,
        headers: Dict[str, str],
    ) -> Tuple[Dict[str, str], Dict[str, str]]:
        """Injects vault credentials into HTTP headers."""
        injected = dict(headers)
        redaction_map: Dict[str, str] = {}

        for k, v in headers.items():
            if not isinstance(v, str):
                continue
            matches = VAULT_HANDLE_REGEX.findall(v)
            for alias in matches:
                secret_val = self.vault.retrieve_secret_internal(alias)
                handle_str = f"vault://{alias}"
                injected[k] = injected[k].replace(handle_str, secret_val)
                redaction_map[secret_val] = f"[REDACTED:{alias}]"

        return injected, redaction_map

    def redact_output(self, text: str, redaction_map: Dict[str, str]) -> str:
        """Scrubs any real secrets from command outputs or error messages."""
        if not text or not redaction_map:
            return text
        sanitized = text
        for secret_val, replacement in redaction_map.items():
            if secret_val in sanitized:
                sanitized = sanitized.replace(secret_val, replacement)
        return sanitized
