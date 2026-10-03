from setuptools import setup, find_packages

setup(
    name="superflow",
    version="1.0.0",
    description="SuperFlow: Frontier Multi-Model AI Orchestrator with Computer-Use, Zero-Exposure Vault, Deployment, and SEO",
    packages=find_packages(),
    install_requires=[
        "ollama>=0.4.0",
        "requests>=2.31.0",
        "cryptography>=42.0.0",
        "pillow>=10.0.0",
        "pyautogui>=0.9.54",
        "pydantic>=2.9.0",
    ],
    entry_points={
        "console_scripts": [
            "superflow=agent_engine.cli:main",
            "superflow-workflow=agent_engine.workflow_cli:main",
            "superflow-setup=agent_engine.installer.setup_wizard:run_setup_wizard",
            "superflow-live=agent_engine.preview.live_server:main",
        ]
    },
)
