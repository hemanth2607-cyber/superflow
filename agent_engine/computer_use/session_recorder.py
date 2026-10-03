"""
Visual Session Recording for SuperFlow Computer-Use.
Captures before/after screen states for every action, producing an audit log
and visual artifact trail for trust, rewind, and debugging.
"""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any, Callable

from .actions import ComputerActionExecutor, KeyboardAction, MouseAction
from .screen import ScreenManager


class VisualSessionRecorder:
    """Manages recorded sessions of computer use with visual state before and after each action."""

    def __init__(self, session_dir: str = "./artifacts/sessions"):
        self.session_id = f"session_{int(time.time())}"
        self.session_dir = Path(session_dir) / self.session_id
        self.session_dir.mkdir(parents=True, exist_ok=True)
        self.screenshots_dir = self.session_dir / "frames"
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)

        self.screen = ScreenManager(default_save_dir=str(self.screenshots_dir))
        self.executor = ComputerActionExecutor()
        self.log_path = self.session_dir / "timeline.jsonl"
        self.step_counter = 0

    def record_action(
        self,
        action_type: str,
        action_payload: dict,
        execute_fn: Callable[[], Any],
    ) -> dict:
        """
        1. Captures 'before' screenshot.
        2. Executes the action.
        3. Waits brief settle delay and captures 'after' screenshot.
        4. Writes audit entry to timeline.jsonl.
        """
        self.step_counter += 1
        step_id = f"step_{self.step_counter:04d}"

        # 1. Capture Before
        before_file = str(self.screenshots_dir / f"{step_id}_before.png")
        before_shot = self.screen.capture_fullscreen(save_path=before_file)

        # 2. Execute Action
        start_t = time.time()
        error = None
        result = None
        try:
            result = execute_fn()
        except Exception as e:
            error = str(e)
        duration = time.time() - start_t

        # Small settle delay for UI to react
        time.sleep(0.3)

        # 3. Capture After
        after_file = str(self.screenshots_dir / f"{step_id}_after.png")
        after_shot = self.screen.capture_fullscreen(save_path=after_file)

        # 4. Record entry
        entry = {
            "step_id": step_id,
            "timestamp": time.time(),
            "action_type": action_type,
            "action_payload": action_payload,
            "duration_sec": round(duration, 3),
            "before_image": before_shot["image_path"],
            "after_image": after_shot["image_path"],
            "result": result,
            "error": error,
        }

        with open(self.log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, default=str) + "\n")

        if error:
            raise RuntimeError(f"Action {action_type} failed: {error}")

        return entry

    def generate_html_viewer(self) -> str:
        """Generates a standalone interactive HTML visual session player."""
        entries = []
        if self.log_path.exists():
            with open(self.log_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        entries.append(json.loads(line))

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SuperFlow Session Rewind: {self.session_id}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0d1117; color: #c9d1d9; margin: 0; padding: 20px; }}
    h1 {{ color: #58a6ff; }}
    .step {{ background: #161b22; border: 1px solid #30363d; border-radius: 8px; margin-bottom: 24px; padding: 16px; }}
    .step-header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 8px; margin-bottom: 12px; }}
    .action-badge {{ background: #238636; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px; }}
    .images {{ display: flex; gap: 16px; margin-top: 12px; }}
    .img-box {{ flex: 1; text-align: center; }}
    .img-box img {{ max-width: 100%; border: 1px solid #30363d; border-radius: 4px; }}
    .label {{ font-weight: bold; margin-bottom: 6px; color: #8b949e; }}
  </style>
</head>
<body>
  <h1>SuperFlow Computer-Use Audit: {self.session_id}</h1>
  <p>Recorded {len(entries)} action steps with visual proof.</p>
  <div class="timeline">
"""
        for e in entries:
            html_content += f"""
    <div class="step">
      <div class="step-header">
        <span class="action-badge">{e.get('action_type', 'ACTION')}</span>
        <span>Step {e.get('step_id')} | Duration: {e.get('duration_sec')}s</span>
      </div>
      <div><strong>Payload:</strong> <code>{json.dumps(e.get('action_payload', {}))}</code></div>
      <div class="images">
        <div class="img-box">
          <div class="label">BEFORE</div>
          <img src="{Path(e.get('before_image')).name}" alt="Before state" />
        </div>
        <div class="img-box">
          <div class="label">AFTER</div>
          <img src="{Path(e.get('after_image')).name}" alt="After state" />
        </div>
      </div>
    </div>
"""
        html_content += """
  </div>
</body>
</html>
"""
        viewer_path = self.session_dir / "index.html"
        viewer_path.write_text(html_content, encoding="utf-8")
        return str(viewer_path)
