"""
Tool bindings for SuperFlow Live Preview & Hot-Reload Engine.
Serves web applications with automatic WebSocket refresh on file edit.
"""

from __future__ import annotations

from typing import Optional

from agent_engine.permissions import RiskTier
from agent_engine.preview.live_server import SuperFlowLiveServer
from agent_engine.tools.registry import registry

_active_server: Optional[SuperFlowLiveServer] = None


@registry.register(
    name="start_live_preview",
    description="Starts a local live development server with instant WebSocket hot-reload on code save.",
    risk=RiskTier.SAFE,
    parameters={
        "type": "object",
        "properties": {
            "root_dir": {
                "type": "string",
                "description": "Directory containing web assets (HTML, CSS, JS) to serve. Defaults to ./workspace.",
                "default": "./workspace",
            },
            "port": {
                "type": "integer",
                "description": "Port number to host the live preview HTTP server on.",
                "default": 3000,
            },
            "open_browser": {
                "type": "boolean",
                "description": "Whether to automatically open the default web browser.",
                "default": True,
            },
        },
    },
)
def start_live_preview(
    root_dir: str = "./workspace", port: int = 3000, open_browser: bool = True
) -> dict:
    global _active_server
    if _active_server and _active_server._is_running:
        return {
            "status": "already_running",
            "url": f"http://localhost:{_active_server.port}",
            "root_dir": str(_active_server.root_dir),
            "message": "Live preview server is already active.",
        }

    try:
        _active_server = SuperFlowLiveServer(root_dir=root_dir, port=port)
        url = _active_server.start(open_browser=open_browser)
        return {
            "status": "running",
            "url": url,
            "root_dir": root_dir,
            "port": port,
            "message": f"SuperFlow live preview server active at {url}. Changes will refresh live in browser.",
        }
    except Exception as exc:
        return {"status": "error", "message": f"Failed to start live preview server: {exc}"}


@registry.register(
    name="stop_live_preview",
    description="Stops the running live development server.",
    risk=RiskTier.SAFE,
    parameters={"type": "object", "properties": {}},
)
def stop_live_preview() -> dict:
    global _active_server
    if _active_server and _active_server._is_running:
        _active_server.stop()
        _active_server = None
        return {"status": "stopped", "message": "Live preview server stopped."}
    return {"status": "not_running", "message": "No live preview server was active."}
