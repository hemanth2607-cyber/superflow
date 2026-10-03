"""
Tool bindings for SuperFlow Computer-Use.
Registers screen capture, mouse control, and keyboard execution into the
permission-gated AgentEngine tool registry.
"""

from __future__ import annotations

import os
from typing import List

from agent_engine.computer_use.actions import (
    ComputerActionExecutor,
    KeyboardAction,
    MouseAction,
)
from agent_engine.computer_use.screen import ScreenManager
from agent_engine.computer_use.session_recorder import VisualSessionRecorder
from agent_engine.permissions import RiskTier
from agent_engine.tools.registry import registry

_recorder = None


def get_recorder() -> VisualSessionRecorder:
    global _recorder
    if _recorder is None:
        _recorder = VisualSessionRecorder()
    return _recorder


@registry.register(
    name="capture_screen",
    description="Captures the full desktop screen. Returns resolution, image path, and a coordinate grid image for accurate pixel grounding.",
    risk=RiskTier.SAFE,
    parameters={
        "type": "object",
        "properties": {
            "include_grid": {
                "type": "boolean",
                "description": "If true, overlays a visual pixel coordinate grid on the image to help identify precise button locations.",
            }
        },
    },
)
def capture_screen(include_grid: bool = True) -> dict:
    mgr = ScreenManager()
    if include_grid:
        shot = mgr.capture_with_coordinate_grid()
    else:
        shot = mgr.capture_fullscreen()

    return {
        "status": "success",
        "image_path": shot.get("grid_image_path", shot["image_path"]),
        "width": shot["width"],
        "height": shot["height"],
        "message": f"Screen captured ({shot['width']}x{shot['height']}). Image saved to {shot.get('grid_image_path', shot['image_path'])}",
    }


@registry.register(
    name="mouse_click",
    description="Clicks at the specified screen pixel coordinates (X, Y). Captures before and after screenshots.",
    risk=RiskTier.DANGEROUS,
    parameters={
        "type": "object",
        "properties": {
            "x": {"type": "integer", "description": "X coordinate in pixels"},
            "y": {"type": "integer", "description": "Y coordinate in pixels"},
            "button": {
                "type": "string",
                "enum": ["left", "right", "double"],
                "description": "Mouse button or double-click. Default is 'left'.",
            },
        },
        "required": ["x", "y"],
    },
)
def mouse_click(x: int, y: int, button: str = "left") -> dict:
    rec = get_recorder()
    action_type = "double_click" if button == "double" else ("right_click" if button == "right" else "click")
    action = MouseAction(action=action_type, x=x, y=y)

    entry = rec.record_action(
        action_type=f"mouse_{action_type}",
        action_payload={"x": x, "y": y, "button": button},
        execute_fn=lambda: rec.executor.execute_mouse(action),
    )
    return {
        "status": "success",
        "action": action_type,
        "x": x,
        "y": y,
        "before_image": entry["before_image"],
        "after_image": entry["after_image"],
    }


@registry.register(
    name="keyboard_type",
    description="Types text into the currently active window or input element. Captures before and after screenshots.",
    risk=RiskTier.DANGEROUS,
    parameters={
        "type": "object",
        "properties": {
            "text": {"type": "string", "description": "The exact text string to type into the keyboard"},
        },
        "required": ["text"],
    },
)
def keyboard_type(text: str) -> dict:
    rec = get_recorder()
    action = KeyboardAction(action="type", text=text)

    entry = rec.record_action(
        action_type="keyboard_type",
        action_payload={"text_length": len(text), "preview": text[:20]},
        execute_fn=lambda: rec.executor.execute_keyboard(action),
    )
    return {
        "status": "success",
        "action": "type",
        "typed_chars": len(text),
        "before_image": entry["before_image"],
        "after_image": entry["after_image"],
    }


@registry.register(
    name="keyboard_hotkey",
    description="Presses a combination of keys simultaneously (e.g. ['ctrl', 'c'], ['alt', 'tab'], ['enter']).",
    risk=RiskTier.DANGEROUS,
    parameters={
        "type": "object",
        "properties": {
            "keys": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of key names to press together, e.g. ['ctrl', 'v'] or ['enter']",
            },
        },
        "required": ["keys"],
    },
)
def keyboard_hotkey(keys: List[str]) -> dict:
    rec = get_recorder()
    action = KeyboardAction(action="hotkey", keys=keys)

    entry = rec.record_action(
        action_type="keyboard_hotkey",
        action_payload={"keys": keys},
        execute_fn=lambda: rec.executor.execute_keyboard(action),
    )
    return {
        "status": "success",
        "action": "hotkey",
        "keys": keys,
        "before_image": entry["before_image"],
        "after_image": entry["after_image"],
    }
