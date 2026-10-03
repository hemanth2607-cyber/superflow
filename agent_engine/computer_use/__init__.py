"""
SuperFlow Computer-Use Subsystem.
Provides screen capture, element grounding, mouse/keyboard input simulation,
and visual before/after session recording with permission gating.
"""

from .screen import ScreenManager
from .actions import ComputerActionExecutor, MouseAction, KeyboardAction
from .session_recorder import VisualSessionRecorder

__all__ = [
    "ScreenManager",
    "ComputerActionExecutor",
    "MouseAction",
    "KeyboardAction",
    "VisualSessionRecorder",
]
