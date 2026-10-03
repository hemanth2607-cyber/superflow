"""
Task Classification and Multi-Model Routing for SuperFlow.
Analyzes user goals, detects required toolchains and domains,
and generates optimal multi-agent execution workflows.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional

from agent_engine.workflow import Workflow, WorkflowStep


class TaskDomain(Enum):
    CODING = "coding"
    MATH_REASONING = "math_reasoning"
    COMPUTER_USE = "computer_use"
    DEPLOYMENT = "deployment"
    SEO_OPTIMIZATION = "seo_optimization"
    FULL_STACK = "full_stack"
    GENERAL = "general"


@dataclass
class TaskPlan:
    domain: TaskDomain
    confidence: float
    recommended_model_tags: List[str]
    allowed_tools: List[str]
    workflow: Workflow


class TaskClassifier:
    """Classifies user tasks and compiles specialized workflow chains."""

    DOMAIN_KEYWORDS = {
        TaskDomain.COMPUTER_USE: [
            "screen", "click", "mouse", "keyboard", "window", "type on", "screenshot",
            "browser window", "desktop", "ui", "button", "app"
        ],
        TaskDomain.DEPLOYMENT: [
            "deploy", "vercel", "docker", "vps", "server", "host", "rollback",
            "production", "container", "publish"
        ],
        TaskDomain.SEO_OPTIMIZATION: [
            "seo", "meta tag", "sitemap", "robots.txt", "opengraph", "json-ld",
            "lighthouse", "ranking", "search engine"
        ],
        TaskDomain.MATH_REASONING: [
            "math", "proof", "equation", "solve", "calculus", "algebra",
            "algorithm complexity", "matrix", "combinatorics", "theorem"
        ],
        TaskDomain.CODING: [
            "code", "function", "refactor", "bug", "write script", "python", "javascript",
            "typescript", "implement", "class", "api", "backend", "frontend"
        ],
    }

    @classmethod
    def classify(cls, task: str) -> TaskPlan:
        lower = task.lower()
        scores = {}
        for domain, keywords in cls.DOMAIN_KEYWORDS.items():
            score = sum(1 for kw in keywords if re.search(r"\b" + re.escape(kw) + r"\b", lower))
            scores[domain] = score

        best_domain = max(scores, key=scores.get)
        if scores[best_domain] == 0:
            best_domain = TaskDomain.CODING if ("create" in lower or "write" in lower) else TaskDomain.GENERAL

        return cls._build_plan(best_domain, task)

    @classmethod
    def _build_plan(cls, domain: TaskDomain, task: str) -> TaskPlan:
        if domain == TaskDomain.COMPUTER_USE:
            workflow = Workflow(
                name="computer-use-loop",
                steps=[
                    WorkflowStep(
                        name="observe_screen",
                        tags=["vision", "quality"],
                        instructions="Task: {task}\nFirst capture the current screen to locate UI elements.",
                        allowed_tools=["capture_screen"],
                    ),
                    WorkflowStep(
                        name="actuate_ui",
                        tags=["coding", "fast"],
                        instructions="Task: {task}\nScreen state observation:\n{previous}\nExecute the necessary mouse and keyboard actions.",
                        allowed_tools=["capture_screen", "mouse_click", "keyboard_type", "keyboard_hotkey"],
                    ),
                ],
            )
            return TaskPlan(
                domain=domain,
                confidence=0.9,
                recommended_model_tags=["vision", "fast"],
                allowed_tools=["capture_screen", "mouse_click", "keyboard_type", "keyboard_hotkey"],
                workflow=workflow,
            )

        elif domain == TaskDomain.DEPLOYMENT:
            workflow = Workflow(
                name="deploy-pipeline",
                steps=[
                    WorkflowStep(
                        name="plan_deploy",
                        tags=["planning", "general"],
                        instructions="Task: {task}\nInspect files and plan the build/deploy configuration.",
                        allowed_tools=["list_dir", "read_file", "list_vault_secrets"],
                    ),
                    WorkflowStep(
                        name="execute_deploy",
                        tags=["coding"],
                        instructions="Task: {task}\nPlan:\n{previous}\nTrigger deployment and verify output URL.",
                        allowed_tools=["deploy_application", "rollback_deployment", "get_deployment_history", "run_command"],
                    ),
                ],
            )
            return TaskPlan(
                domain=domain,
                confidence=0.9,
                recommended_model_tags=["coding"],
                allowed_tools=["deploy_application", "rollback_deployment", "list_vault_secrets"],
                workflow=workflow,
            )

        elif domain == TaskDomain.SEO_OPTIMIZATION:
            workflow = Workflow(
                name="seo-audit-and-fix",
                steps=[
                    WorkflowStep(
                        name="audit_and_enhance",
                        tags=["quality", "coding"],
                        instructions="Task: {task}\nAudit target HTML files, inject meta tags/JSON-LD, and generate sitemap.",
                        allowed_tools=["audit_html_seo", "inject_seo_metadata", "generate_sitemap_and_robots", "read_file", "write_file", "list_dir"],
                    )
                ],
            )
            return TaskPlan(
                domain=domain,
                confidence=0.9,
                recommended_model_tags=["coding", "quality"],
                allowed_tools=["audit_html_seo", "inject_seo_metadata", "generate_sitemap_and_robots"],
                workflow=workflow,
            )

        elif domain == TaskDomain.MATH_REASONING:
            workflow = Workflow(
                name="deep-math-solve",
                steps=[
                    WorkflowStep(
                        name="mathematical_derivation",
                        tags=["reasoning", "quality"],
                        instructions="Task: {task}\nProvide step-by-step rigorous mathematical derivation and proof.",
                        allowed_tools=[],
                    ),
                    WorkflowStep(
                        name="code_verification",
                        tags=["coding"],
                        instructions="Task: {task}\nDerivation:\n{previous}\nWrite a Python verification script to numerically or symbolically verify the solution.",
                        allowed_tools=["write_file", "read_file", "run_command"],
                    ),
                ],
            )
            return TaskPlan(
                domain=domain,
                confidence=0.9,
                recommended_model_tags=["reasoning", "coding"],
                allowed_tools=["write_file", "read_file", "run_command"],
                workflow=workflow,
            )

        else:  # CODING / GENERAL
            workflow = Workflow(
                name="full-stack-coder",
                steps=[
                    WorkflowStep(
                        name="architect_plan",
                        tags=["planning", "reasoning"],
                        instructions="Task: {task}\nBreak this down into an architectural plan and file breakdown.",
                        allowed_tools=["list_dir", "read_file"],
                    ),
                    WorkflowStep(
                        name="implement_code",
                        tags=["coding"],
                        instructions="Task: {task}\nPlan:\n{previous}\nImplement the complete code and test files.",
                        allowed_tools=["write_file", "read_file", "list_dir", "run_command"],
                    ),
                    WorkflowStep(
                        name="quality_review",
                        tags=["quality", "coding"],
                        instructions="Task: {task}\nImplementation:\n{previous}\nReview the code against edge cases, correctness, and security.",
                        allowed_tools=["read_file", "list_dir", "run_command"],
                    ),
                ],
            )
            return TaskPlan(
                domain=TaskDomain.CODING,
                confidence=0.85,
                recommended_model_tags=["coding", "reasoning"],
                allowed_tools=["write_file", "read_file", "list_dir", "run_command"],
                workflow=workflow,
            )
