"""
SuperFlow Packaging and Windows .EXE Installer Subsystem.
Automates dependency bundling, environment configuration, and standalone binary builds.
"""

from .setup_wizard import run_setup_wizard
from .build_exe import compile_standalone_exe

__all__ = ["run_setup_wizard", "compile_standalone_exe"]
