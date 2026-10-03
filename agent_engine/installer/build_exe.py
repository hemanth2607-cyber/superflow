"""
Automated PyInstaller Standalone .EXE Compiler for SuperFlow.
Bundles the entire application into a single executable installer that runs
without requiring manual python commands on any target Windows computer.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def compile_standalone_exe(entrypoint: str = "agent_engine/installer/setup_wizard.py", output_name: str = "SuperFlow_Setup"):
    """Compiles the project into a single .exe using PyInstaller."""
    print("Checking PyInstaller dependency...")
    try:
        import PyInstaller
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], check=True)

    hidden_imports = [
        "agent_engine",
        "agent_engine.computer_use",
        "agent_engine.secrets",
        "agent_engine.deployment",
        "agent_engine.seo",
        "agent_engine.orchestrator",
        "agent_engine.models",
        "agent_engine.tools",
        "cryptography",
        "PIL",
        "pyautogui",
        "requests",
        "pydantic",
        "ollama",
    ]

    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--onefile",
        "--name",
        output_name,
        "--clean",
    ]

    for imp in hidden_imports:
        cmd.extend(["--hidden-import", imp])

    cmd.append(entrypoint)

    print(f"Executing build: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)

    exe_path = Path("./dist") / f"{output_name}.exe"
    print(f"\n✅ Standalone executable successfully built: {exe_path.resolve()}")
    return str(exe_path)


if __name__ == "__main__":
    compile_standalone_exe()
