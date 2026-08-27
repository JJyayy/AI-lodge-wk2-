import html
import re
from typing import Optional


def sanitize_text(text: Optional[str]) -> str:
    """
    Sanitizes plain text input by trimming whitespace and escaping HTML entities
    to prevent Cross-Site Scripting (XSS) attacks.
    """
    if not text:
        return ""
    # Strip dangerous control characters and trim
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text).strip()
    return html.escape(cleaned)


def sanitize_markdown(text: Optional[str]) -> str:
    """
    Sanitizes markdown or multi-line description content.
    Removes dangerous embedded script tags and iframe injections while preserving valid markdown.
    """
    if not text:
        return ""
    # Strip script/iframe tags
    cleaned = re.sub(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", "", text, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r"<\s*iframe[^>]*>.*?<\s*/\s*iframe\s*>", "", cleaned, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r"<\s*object[^>]*>.*?<\s*/\s*object\s*>", "", cleaned, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r"<\s*embed[^>]*>.*?<\s*/\s*embed\s*>", "", cleaned, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r"javascript:", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()
