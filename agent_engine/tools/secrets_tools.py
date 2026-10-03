"""
Tool bindings for SuperFlow Vault & Secrets Management.
Allows agents to discover available credential handles without exposing raw secrets.
"""

from __future__ import annotations

from typing import List, Optional

from agent_engine.permissions import RiskTier
from agent_engine.secrets.vault import EncryptedVault
from agent_engine.tools.registry import registry

_vault = None


def get_vault() -> EncryptedVault:
    global _vault
    if _vault is None:
        _vault = EncryptedVault()
    return _vault


@registry.register(
    name="list_vault_secrets",
    description="Lists all secret handles available in the encrypted vault (e.g. 'vault://vercel-token', 'vault://aws-key'). NEVER exposes raw tokens.",
    risk=RiskTier.SAFE,
    parameters={"type": "object", "properties": {}},
)
def list_vault_secrets() -> dict:
    vault = get_vault()
    handles = vault.list_handles()
    return {
        "status": "success",
        "count": len(handles),
        "secrets": handles,
        "usage_instruction": "Reference these in deploy commands or environment variables as 'vault://<alias>'. The system automatically injects them without displaying plaintext.",
    }


@registry.register(
    name="store_vault_secret",
    description="Stores or updates an encrypted secret in the vault under an alias. Requires CRITICAL permission tier.",
    risk=RiskTier.CRITICAL,
    parameters={
        "type": "object",
        "properties": {
            "alias": {"type": "string", "description": "Unique identifier, e.g. 'github-pat' or 'vercel-token'"},
            "secret_value": {"type": "string", "description": "The confidential token or password to encrypt"},
            "description": {"type": "string", "description": "Human-readable description of what this key accesses"},
        },
        "required": ["alias", "secret_value"],
    },
)
def store_vault_secret(alias: str, secret_value: str, description: str = "") -> dict:
    vault = get_vault()
    handle = vault.store_secret(alias=alias, secret_value=secret_value, description=description)
    return {
        "status": "success",
        "handle": handle,
        "message": f"Secret '{alias}' successfully encrypted and saved in vault under handle '{handle}'.",
    }
