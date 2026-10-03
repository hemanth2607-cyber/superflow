"""
Encrypted-at-rest secrets vault for SuperFlow.
Uses AES-256-GCM authenticated encryption with PBKDF2 key derivation.
Secrets are referenced solely by handle aliases (e.g. 'vault://deploy-key')
so plaintext tokens never enter the LLM's context window.
"""

from __future__ import annotations

import base64
import json
import os
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, List, Optional

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


@dataclass
class SecretMetadata:
    alias: str
    description: str = ""
    scopes: List[str] | None = None
    created_at: float = 0.0
    last_accessed: float = 0.0


class EncryptedVault:
    """Manages secure encrypted storage of credentials and API keys."""

    def __init__(self, vault_path: str = "./.superflow_vault.enc", master_password: Optional[str] = None):
        self.vault_path = Path(vault_path)
        self.passphrase = (
            master_password
            or os.environ.get("SUPERFLOW_VAULT_KEY")
            or "superflow-default-machine-key-12345"
        ).encode("utf-8")
        self._salt_file = self.vault_path.with_suffix(".salt")
        self._key = self._derive_key()

    def _derive_key(self) -> bytes:
        """Derives a 256-bit AES key using PBKDF2-HMAC-SHA256."""
        if self._salt_file.exists():
            salt = self._salt_file.read_bytes()
        else:
            salt = os.urandom(16)
            self._salt_file.write_bytes(salt)

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100_000,
        )
        return kdf.derive(self.passphrase)

    def _load_vault(self) -> dict:
        """Loads and decrypts the vault storage."""
        if not self.vault_path.exists():
            return {"secrets": {}, "metadata": {}}

        raw_data = self.vault_path.read_bytes()
        nonce = raw_data[:12]
        ciphertext = raw_data[12:]

        aesgcm = AESGCM(self._key)
        try:
            plaintext = aesgcm.decrypt(nonce, ciphertext, None)
            return json.loads(plaintext.decode("utf-8"))
        except Exception as e:
            raise PermissionError(f"Vault decryption failed (invalid key or corrupted file): {e}")

    def _save_vault(self, data: dict):
        """Encrypts and writes the vault storage to disk atomically."""
        plaintext = json.dumps(data).encode("utf-8")
        nonce = os.urandom(12)
        aesgcm = AESGCM(self._key)
        ciphertext = aesgcm.encrypt(nonce, plaintext, None)

        payload = nonce + ciphertext
        tmp_file = self.vault_path.with_suffix(".tmp")
        tmp_file.write_bytes(payload)
        tmp_file.replace(self.vault_path)

    def store_secret(
        self,
        alias: str,
        secret_value: str,
        description: str = "",
        scopes: Optional[List[str]] = None,
    ) -> str:
        """
        Stores an encrypted secret under an alias.
        Returns the safe handle format (e.g. 'vault://github-token').
        """
        import time
        alias = alias.strip().lower()
        if not alias.replace("-", "").replace("_", "").isalnum():
            raise ValueError(f"Invalid alias name: '{alias}'. Must be alphanumeric with hyphens/underscores.")

        data = self._load_vault()
        data["secrets"][alias] = secret_value
        data["metadata"][alias] = asdict(
            SecretMetadata(
                alias=alias,
                description=description,
                scopes=scopes or ["all"],
                created_at=time.time(),
                last_accessed=0.0,
            )
        )
        self._save_vault(data)
        return f"vault://{alias}"

    def retrieve_secret_internal(self, alias: str) -> str:
        """
        INTERNAL ONLY: Decrypts secret for runtime injection.
        Never call this directly inside prompt construction!
        """
        import time
        alias = alias.replace("vault://", "").strip().lower()
        data = self._load_vault()
        if alias not in data["secrets"]:
            raise KeyError(f"Secret '{alias}' not found in vault. Available: {list(data['secrets'].keys())}")

        # Update last accessed timestamp
        if alias in data.get("metadata", {}):
            data["metadata"][alias]["last_accessed"] = time.time()
            self._save_vault(data)

        return data["secrets"][alias]

    def list_handles(self) -> List[dict]:
        """
        Returns a list of available secret aliases and their descriptions/scopes.
        SAFE for LLM visibility — contains zero plaintext secret tokens.
        """
        data = self._load_vault()
        handles = []
        for alias, meta in data.get("metadata", {}).items():
            handles.append({
                "handle": f"vault://{alias}",
                "alias": alias,
                "description": meta.get("description", ""),
                "scopes": meta.get("scopes", []),
            })
        return handles
