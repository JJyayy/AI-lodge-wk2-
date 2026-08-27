from app.services.task_service import sanitize_text, sanitize_markdown


def test_sanitize_text():
    assert sanitize_text("  hello world  ") == "hello world"
    assert sanitize_text("<script>alert('xss')</script>") == "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
    assert sanitize_text("") == ""
    assert sanitize_text(None) == ""


def test_sanitize_markdown():
    input_md = "## Title\n<script>alert(1)</script>\nSome regular text."
    sanitized = sanitize_markdown(input_md)
    assert "<script>" not in sanitized
    assert "alert(1)" not in sanitized
    assert "## Title" in sanitized
    assert "Some regular text." in sanitized
