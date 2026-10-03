"""
Automated sitemap.xml and robots.txt generation for SuperFlow.
"""

from __future__ import annotations

import datetime
from pathlib import Path
from typing import List, Optional


class SitemapGenerator:
    """Scans static web roots and generates sitemap.xml and robots.txt."""

    def __init__(self, base_url: str = "https://example.com"):
        self.base_url = base_url.rstrip("/")

    def generate_sitemap(
        self,
        web_root: str,
        output_file: Optional[str] = None,
        routes: Optional[List[str]] = None,
    ) -> str:
        """
        Scans web_root for .html files (or takes routes list) and produces sitemap.xml.
        """
        discovered_routes = set(routes or [])

        root_path = Path(web_root)
        if root_path.exists():
            for f in root_path.rglob("*.html"):
                rel = f.relative_to(root_path).as_posix()
                if rel == "index.html":
                    discovered_routes.add("/")
                else:
                    route = "/" + rel.replace(".html", "").rstrip("/")
                    discovered_routes.add(route)

        if not discovered_routes:
            discovered_routes.add("/")

        today = datetime.date.today().isoformat()

        xml_lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ]

        for route in sorted(discovered_routes):
            full_url = f"{self.base_url}{route}" if route != "/" else f"{self.base_url}/"
            priority = "1.0" if route == "/" else "0.8"
            xml_lines.append(f"""  <url>
    <loc>{full_url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>{priority}</priority>
  </url>""")

        xml_lines.append("</urlset>")
        sitemap_content = "\n".join(xml_lines)

        target_path = Path(output_file) if output_file else root_path / "sitemap.xml"
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_text(sitemap_content, encoding="utf-8")

        return str(target_path)

    def generate_robots_txt(
        self,
        web_root: str,
        output_file: Optional[str] = None,
        allow_all: bool = True,
    ) -> str:
        """Generates standard compliant robots.txt pointing to the sitemap."""
        sitemap_url = f"{self.base_url}/sitemap.xml"
        content = f"""User-agent: *
{"Allow: /" if allow_all else "Disallow: /"}

Sitemap: {sitemap_url}
"""
        root_path = Path(web_root)
        target_path = Path(output_file) if output_file else root_path / "robots.txt"
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_text(content, encoding="utf-8")
        return str(target_path)
