"""
Lighthouse-style HTML SEO and accessibility auditor with auto-fixer for SuperFlow.
"""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, List


@dataclass
class SEOIssue:
    severity: str  # "error", "warning", "info"
    rule: str
    message: str
    element: str = ""
    can_autofix: bool = False


class HTMLSEOAuditor:
    """Inspects web pages against SEO best practices and fixes common deficiencies."""

    def audit(self, html: str) -> Dict[str, Any]:
        issues: List[SEOIssue] = []
        score = 100

        # Rule 1: <title> tag
        title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        if not title_match or not title_match.group(1).strip():
            issues.append(SEOIssue(severity="error", rule="title_missing", message="Missing <title> tag.", can_autofix=True))
            score -= 25
        else:
            title_text = title_match.group(1).strip()
            if len(title_text) < 20 or len(title_text) > 70:
                issues.append(SEOIssue(severity="warning", rule="title_length", message=f"Title length is {len(title_text)} chars. Recommended: 30-65 chars."))
                score -= 5

        # Rule 2: Meta description
        desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', html, re.IGNORECASE)
        if not desc_match or not desc_match.group(1).strip():
            issues.append(SEOIssue(severity="error", rule="meta_description_missing", message="Missing meta description tag.", can_autofix=True))
            score -= 20

        # Rule 3: Viewport meta tag (Mobile-friendliness)
        if not re.search(r'<meta\s+name=["\']viewport["\']', html, re.IGNORECASE):
            issues.append(SEOIssue(severity="error", rule="viewport_missing", message="Missing <meta name='viewport'> tag for mobile responsiveness.", can_autofix=True))
            score -= 20

        # Rule 4: <img> missing alt attribute
        img_tags = re.findall(r"<img\b[^>]*>", html, re.IGNORECASE)
        missing_alt_count = 0
        for tag in img_tags:
            if not re.search(r'\balt=["\'][^"\']*["\']', tag, re.IGNORECASE):
                missing_alt_count += 1

        if missing_alt_count > 0:
            issues.append(SEOIssue(severity="warning", rule="images_missing_alt", message=f"{missing_alt_count} image(s) missing alt text.", can_autofix=True))
            score -= min(15, missing_alt_count * 5)

        # Rule 5: <h1> count
        h1_matches = re.findall(r"<h1\b[^>]*>", html, re.IGNORECASE)
        if len(h1_matches) == 0:
            issues.append(SEOIssue(severity="warning", rule="h1_missing", message="No <h1> heading found on the page."))
            score -= 10
        elif len(h1_matches) > 1:
            issues.append(SEOIssue(severity="warning", rule="multiple_h1", message=f"Found {len(h1_matches)} <h1> headings. Best practice is exactly one <h1> per page."))
            score -= 5

        return {
            "score": max(0, score),
            "passed": score >= 80,
            "issues_count": len(issues),
            "issues": [asdict(i) for i in issues],
        }

    def autofix(
        self,
        html: str,
        title_fallback: str = "Home",
        description_fallback: str = "High-performance web application.",
    ) -> str:
        """Automatically resolves auto-fixable SEO issues in the HTML markup."""
        fixed = html

        # 1. Fix missing alt tags on images
        def _add_alt(match):
            tag = match.group(0)
            if not re.search(r'\balt=["\']', tag, re.IGNORECASE):
                src_match = re.search(r'src=["\']([^"\']+)["\']', tag, re.IGNORECASE)
                alt_text = Path(src_match.group(1)).stem.replace("-", " ").replace("_", " ").title() if src_match else "Image asset"
                return tag[:-1] + f' alt="{alt_text}">'
            return tag

        fixed = re.sub(r"<img\b[^>]*>", _add_alt, fixed, flags=re.IGNORECASE)

        # 2. Fix missing viewport tag
        if not re.search(r'<meta\s+name=["\']viewport["\']', fixed, re.IGNORECASE):
            viewport_tag = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            if "<head>" in fixed:
                fixed = fixed.replace("<head>", f"<head>\n  {viewport_tag}", 1)
            elif "</head>" in fixed:
                fixed = fixed.replace("</head>", f"  {viewport_tag}\n</head>", 1)

        # 3. Fix missing title
        if not re.search(r"<title>.*?</title>", fixed, re.IGNORECASE | re.DOTALL):
            title_tag = f"<title>{title_fallback}</title>"
            if "<head>" in fixed:
                fixed = fixed.replace("<head>", f"<head>\n  {title_tag}", 1)

        # 4. Fix missing meta description
        if not re.search(r'<meta\s+name=["\']description["\']', fixed, re.IGNORECASE):
            desc_tag = f'<meta name="description" content="{description_fallback}">'
            if "<head>" in fixed:
                fixed = fixed.replace("<head>", f"<head>\n  {desc_tag}", 1)

        return fixed
