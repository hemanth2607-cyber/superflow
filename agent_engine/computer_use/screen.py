"""
Screen capture and display management for SuperFlow Computer-Use.
Supports full screen capture, region cropping, base64 encoding for multimodal LLMs,
and visual coordinate grid overlays for grounding.
"""

from __future__ import annotations

import base64
import io
import time
from pathlib import Path
from typing import Tuple

try:
    from PIL import Image, ImageDraw, ImageFont, ImageGrab
except ImportError:
    Image = None
    ImageGrab = None

try:
    import pyautogui
except ImportError:
    pyautogui = None


class ScreenManager:
    """Handles screen capture, resolution scaling, and multimodal formatting."""

    def __init__(self, default_save_dir: str = "./artifacts/screenshots"):
        self.save_dir = Path(default_save_dir)
        self.save_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def get_screen_size() -> Tuple[int, int]:
        """Returns (width, height) of the primary display in pixels."""
        if pyautogui:
            return pyautogui.size()
        if ImageGrab:
            img = ImageGrab.grab()
            return img.size
        return (1920, 1080)

    def capture_fullscreen(
        self,
        save_path: str | None = None,
        max_dimension: int | None = 1920,
    ) -> dict:
        """
        Captures the primary monitor screen.
        Returns a dict containing:
          - 'image_path': saved filepath (if saved)
          - 'base64': base64-encoded PNG string for LLM vision consumption
          - 'width': captured image width
          - 'height': captured image height
          - 'timestamp': capture timestamp
        """
        if ImageGrab is None:
            raise RuntimeError("Pillow is required for screen capture (pip install pillow)")

        try:
            img = ImageGrab.grab()
        except OSError:
            if pyautogui:
                try:
                    img = pyautogui.screenshot()
                except Exception:
                    img = Image.new("RGB", (1920, 1080), color=(30, 30, 30))
            else:
                img = Image.new("RGB", (1920, 1080), color=(30, 30, 30))
        orig_w, orig_h = img.size

        # Resize if max_dimension is specified to save tokens and bandwidth
        if max_dimension and (orig_w > max_dimension or orig_h > max_dimension):
            scale = max_dimension / max(orig_w, orig_h)
            new_w, new_h = int(orig_w * scale), int(orig_h * scale)
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        else:
            new_w, new_h = orig_w, orig_h

        # Save to disk
        if not save_path:
            filename = f"screen_{int(time.time() * 1000)}.png"
            target = self.save_dir / filename
        else:
            target = Path(save_path)
            target.parent.mkdir(parents=True, exist_ok=True)

        img.save(str(target), format="PNG")

        # Encode to Base64 for multimodal vision models (OpenAI/Anthropic/Qwen-VL format)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")

        return {
            "image_path": str(target),
            "base64": b64_str,
            "width": new_w,
            "height": new_h,
            "original_width": orig_w,
            "original_height": orig_h,
            "timestamp": time.time(),
        }

    def capture_with_coordinate_grid(
        self,
        grid_step: int = 100,
        save_path: str | None = None,
    ) -> dict:
        """
        Captures the screen and overlays an explicit coordinate grid with (X, Y) labels.
        This provides instant visual grounding for models that cannot predict exact pixels.
        """
        shot = self.capture_fullscreen(save_path=save_path)
        img = Image.open(shot["image_path"]).convert("RGB")
        draw = ImageDraw.Draw(img)

        w, h = img.size
        for x in range(0, w, grid_step):
            draw.line([(x, 0), (x, h)], fill=(255, 0, 0, 128), width=1)
            draw.text((x + 2, 5), str(x), fill=(255, 255, 0))

        for y in range(0, h, grid_step):
            draw.line([(0, y), (w, y)], fill=(255, 0, 0, 128), width=1)
            draw.text((5, y + 2), str(y), fill=(255, 255, 0))

        grid_path = str(Path(shot["image_path"]).with_name(f"grid_{Path(shot['image_path']).name}"))
        img.save(grid_path, format="PNG")

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")

        shot["grid_image_path"] = grid_path
        shot["grid_base64"] = b64_str
        return shot
