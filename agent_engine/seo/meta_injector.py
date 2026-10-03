"""
Automated OpenGraph, Twitter Card, and Schema.org JSON-LD Meta Injector for SuperFlow.
"""

from __future__ import annotations

import json
import re
from typing import Any, Dict, Optional


class SEOMetaInjector:
    """Injects high-conversion SEO and social tags into HTML templates or pages."""

    @staticmethod
    def generate_json_ld(
        title: str,
        description: str,
        url: str,
        author: str = "SuperFlow",
        schema_type: str = "WebPage",
    ) -> str:
        """Constructs valid Schema.org JSON-LD structured data."""
        data = {
            "@context": "https://schema.org",
            "@type": schema_type,
            "name": title,
            "headline": title,
            "description": description,
            "url": url,
            "author": {
                "@type": "Person",
                "name": author,
            },
        }
        return f'<script type="application/ld+json">\n{json.dumps(data, indent=2)}\n</script>'

    @classmethod
    def inject_seo(
        cls,
        html_content: str,
        title: str,
        description: str,
        canonical_url: str = "https://example.com",
        og_image: str = "https://example.com/og-image.jpg",
        twitter_handle: str = "@superflow",
    ) -> str:
        """
        Injects a complete, modern SEO head block into HTML before </head> or <body>.
        """
        json_ld = cls.generate_json_ld(title, description, canonical_url)

        seo_tags = f"""
  <!-- SuperFlow Automated SEO Tags -->
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="canonical" href="{canonical_url}">

  <!-- OpenGraph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical_url}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="{og_image}">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="{twitter_handle}">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{og_image}">

  <!-- Structured Data (JSON-LD) -->
  {json_ld}
  <!-- End SuperFlow SEO Tags -->
"""

        # Replace existing title and description if already present
        cleaned_html = re.sub(r"<title>.*?</title>", "", html_content, flags=re.IGNORECASE | re.DOTALL)
        cleaned_html = re.sub(r'<meta\s+name=["\']description["\'].*?>', "", cleaned_html, flags=re.IGNORECASE)

        if "</head>" in cleaned_html:
            return cleaned_html.replace("</head>", f"{seo_tags}\n</head>", 1)
        elif "<body" in cleaned_html:
            return cleaned_html.replace("<body", f"<head>{seo_tags}</head>\n<body", 1)
        else:
            return f"<head>{seo_tags}</head>\n{cleaned_html}"
