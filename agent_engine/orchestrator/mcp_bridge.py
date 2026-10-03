"""
Model Context Protocol (MCP) Bridge for SuperFlow.
Exposes the SuperFlow Tool Registry as an MCP-compliant JSON-RPC tool server,
allowing external tools and agents (Claude Desktop, Cursor, etc.) to invoke SuperFlow capabilities.
"""

from __future__ import annotations

import json
from typing import Any, Dict

from agent_engine.tools.registry import registry


class MCPBridge:
    """Implements standard MCP JSON-RPC 2.0 tool endpoints."""

    @staticmethod
    def list_tools() -> Dict[str, Any]:
        """Returns tool declarations formatted according to the MCP standard."""
        mcp_tools = []
        for name, spec in registry.all().items():
            mcp_tools.append({
                "name": name,
                "description": spec.description,
                "inputSchema": spec.parameters,
                "risk": spec.risk.name,
            })
        return {
            "tools": mcp_tools,
        }

    @staticmethod
    def call_tool(name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Invokes a SuperFlow tool through the standard MCP interface."""
        try:
            tool_spec = registry.get(name)
            result = tool_spec.fn(**arguments)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(result, default=str),
                    }
                ],
                "isError": False,
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Tool execution failed: {str(e)}"}
                ],
                "isError": True,
            }

    @classmethod
    def handle_json_rpc(cls, rpc_request: str) -> str:
        """Handles standard JSON-RPC 2.0 requests over stdin/stdout."""
        try:
            data = json.loads(rpc_request)
            req_id = data.get("id")
            method = data.get("method")
            params = data.get("params", {})

            if method == "tools/list":
                result = cls.list_tools()
            elif method == "tools/call":
                result = cls.call_tool(params.get("name", ""), params.get("arguments", {}))
            else:
                return json.dumps({
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32601, "message": f"Method '{method}' not found"},
                })

            return json.dumps({
                "jsonrpc": "2.0",
                "id": req_id,
                "result": result,
            })
        except Exception as e:
            return json.dumps({
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": f"Parse error: {str(e)}"},
            })
