"""
Tool bindings for SuperFlow SEO-by-Default Subsystem.
Audits HTML pages, injects structured JSON-LD and OpenGraph tags, and generates sitemaps.
"""

from __future__ import annotations

from pathlib import Path

from agent_engine.permissions import RiskTier
from agent_engine.seo.auditor import HTMLSEOAuditor
from agent_engine.seo.meta_injector import SEOMetaInjector
from agent_engine.seo.sitemap_generator import SitemapGenerator
from agent_engine.tools.registry import registry

_auditor = HTMLSEOAuditor()


@registry.register(
    name="audit_html_seo",
    description="Audits an HTML file for SEO best practices, mobile responsiveness, heading structure, and missing alt text.",
    risk=RiskTier.SAFE,
    parameters={
        "type": "object",
        "properties": {
            "file_path": {"type": "string", "description": "Path to the HTML file to audit"},
        },
        "required": ["file_path"],
    },
)
def audit_html_seo(file_path: str) -> dict:
    target = Path(file_path)
    if not target.exists():
        return {"status": "error", "message": f"File '{file_path}' does not exist."}

    content = target.read_text(encoding="utf-8")
    result = _auditor.audit(content)
    result["file"] = file_path
    return result


@registry.register(
    name="inject_seo_metadata",
    description="Injects OpenGraph, Twitter Card, Schema.org JSON-LD structured data, and meta tags into an HTML file.",
    risk=RiskTier.MODERATE,
    parameters={
        "type": "object",
        "properties": {
            "file_path": {"type": "string", "description": "Path to the HTML file to enhance"},
            "title": {"type": "string", "description": "Optimized page title"},
            "description": {"type": "string", "description": "High-converting meta description"},
            "canonical_url": {"type": "string", "description": "Canonical production URL"},
            "auto_fix_issues": {"type": "boolean", "description": "Whether to auto-fix missing alt tags and viewport"},
        },
        "required": ["file_path", "title", "description"],
    },
)
def inject_seo_metadata(
    file_path: str,
    title: str,
    description: str,
    canonical_url: str = "https://example.com",
    auto_fix_issues: bool = True,
) -> dict:
    target = Path(file_path)
    if not target.exists():
        return {"status": "error", "message": f"File '{file_path}' does not exist."}

    content = target.read_text(encoding="utf-8")

    if auto_fix_issues:
        content = _auditor.autofix(content, title_fallback=title, description_fallback=description)

    enhanced_content = SEOMetaInjector.inject_seo(
        html_content=content,
        title=title,
        description=description,
        canonical_url=canonical_url,
    )
    target.write_text(enhanced_content, encoding="utf-8")

    return {
        "status": "success",
        "file": file_path,
        "message": f"Successfully injected SEO metadata, OpenGraph, and JSON-LD into {file_path}",
    }


@registry.register(
    name="generate_sitemap_and_robots",
    description="Generates sitemap.xml and robots.txt in the web directory based on all HTML files and routes.",
    risk=RiskTier.MODERATE,
    parameters={
        "type": "object",
        "properties": {
            "web_root": {"type": "string", "description": "Root web output directory (e.g. 'dist', 'public', or workspace)"},
            "base_url": {"type": "string", "description": "Base production URL, e.g. 'https://myproject.com'"},
        },
        "required": ["web_root", "base_url"],
    },
)
def generate_sitemap_and_robots(web_root: str, base_url: str) -> dict:
    generator = SitemapGenerator(base_url=base_url)
    sitemap_path = generator.generate_sitemap(web_root)
    robots_path = generator.generate_robots_txt(web_root)

    return {
        "status": "success",
        "sitemap_file": sitemap_path,
        "robots_file": robots_path,
        "message": "Generated valid sitemap.xml and robots.txt.",
    }
