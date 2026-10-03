"""
Input execution engine for SuperFlow Computer-Use.
Safely maps grounded coordinates and intents to mouse and keyboard events.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import List, Literal

try:
    import pyautogui
    pyautogui.FAILSAFE = True  # Moving cursor to screen corner immediately aborts
    pyautogui.PAUSE = 0.05
except ImportError:
    pyautogui = None

from .screen import ScreenManager


@dataclass
class MouseAction:
    action: Literal["click", "double_click", "right_click", "move", "drag", "scroll"]
    x: int
    y: int
    drag_to_x: int | None = None
    drag_to_y: int | None = None
    scroll_amount: int | None = None  # Positive = up, Negative = down


@dataclass
class KeyboardAction:
    action: Literal["type", "press", "hotkey"]
    text: str | None = None
    key: str | None = None
    keys: List[str] | None = None  # e.g. ["ctrl", "c"] or ["alt", "tab"]


class ComputerActionExecutor:
    """Executes grounded mouse and keyboard actions with coordinate bounds verification."""

    def __init__(self):
        if not pyautogui:
            raise RuntimeError("pyautogui is required for input actions (pip install pyautogui)")
        self.screen_width, self.screen_height = ScreenManager.get_screen_size()

    def _validate_coordinates(self, x: int, y: int) -> tuple[int, int]:
        """Clamps and validates coordinates to keep actions safely inside display limits."""
        clamped_x = max(0, min(x, self.screen_width - 1))
        clamped_y = max(0, min(y, self.screen_height - 1))
        return clamped_x, clamped_y

    def execute_mouse(self, action: MouseAction) -> dict:
        """Executes a mouse operation safely."""
        x, y = self._validate_coordinates(action.x, action.y)

        if action.action == "move":
            pyautogui.moveTo(x, y, duration=0.2)
            return {"status": "ok", "action": "move", "x": x, "y": y}

        elif action.action == "click":
            pyautogui.click(x, y)
            return {"status": "ok", "action": "click", "x": x, "y": y}

        elif action.action == "double_click":
            pyautogui.doubleClick(x, y)
            return {"status": "ok", "action": "double_click", "x": x, "y": y}

        elif action.action == "right_click":
            pyautogui.rightClick(x, y)
            return {"status": "ok", "action": "right_click", "x": x, "y": y}

        elif action.action == "drag":
            if action.drag_to_x is None or action.drag_to_y is None:
                raise ValueError("Drag requires drag_to_x and drag_to_y")
            to_x, to_y = self._validate_coordinates(action.drag_to_x, action.drag_to_y)
            pyautogui.moveTo(x, y)
            pyautogui.dragTo(to_x, to_y, duration=0.5, button="left")
            return {"status": "ok", "action": "drag", "from": (x, y), "to": (to_x, to_y)}

        elif action.action == "scroll":
            pyautogui.moveTo(x, y)
            amount = action.scroll_amount or 0
            pyautogui.scroll(amount)
            return {"status": "ok", "action": "scroll", "at": (x, y), "amount": amount}

        else:
            raise ValueError(f"Unknown mouse action: {action.action}")

    def execute_keyboard(self, action: KeyboardAction) -> dict:
        """Executes a keyboard operation safely."""
        if action.action == "type":
            if not action.text:
                raise ValueError("Text required for type action")
            pyautogui.write(action.text, interval=0.01)
            return {"status": "ok", "action": "type", "length": len(action.text)}

        elif action.action == "press":
            if not action.key:
                raise ValueError("Key required for press action")
            pyautogui.press(action.key.lower())
            return {"status": "ok", "action": "press", "key": action.key}

        elif action.action == "hotkey":
            if not action.keys:
                raise ValueError("Keys list required for hotkey action")
            clean_keys = [k.lower().strip() for k in action.keys]
            pyautogui.hotkey(*clean_keys)
            return {"status": "ok", "action": "hotkey", "keys": clean_keys}

        else:
            raise ValueError(f"Unknown keyboard action: {action.action}")
