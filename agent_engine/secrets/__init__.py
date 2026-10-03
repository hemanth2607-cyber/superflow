"""
SuperFlow Secrets & Credential Management Subsystem.
Implements encrypted-at-rest vault storage with zero-exposure runtime injection.
"""

from .vault import EncryptedVault, SecretMetadata
from .injector import SecretInjector

__all__ = ["EncryptedVault", "SecretMetadata", "SecretInjector"]
