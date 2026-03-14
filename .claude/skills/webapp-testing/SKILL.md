# Web Application Testing Toolkit

This documentation describes a Python-based testing framework leveraging Playwright for local web application verification. The toolkit emphasizes a decision-tree approach: static HTML files can be read directly, while dynamic applications require either server management or reconnaissance-then-action patterns.

## Key Components

**Helper Scripts**: The `with_server.py` utility manages server lifecycles, supporting multiple simultaneous servers (backend + frontend scenarios). Users should invoke `--help` before executing scripts.

**Core Workflow**: The recommended pattern involves three steps—navigate with network waiting, capture screenshots or inspect the DOM, then identify CSS/text selectors before executing automation actions.

**Critical Implementation Detail**: "Wait for `page.wait_for_load_state('networkidle')` before inspection" on dynamic applications to ensure JavaScript execution completes.

## Example Usage

Single server invocation:
```bash
python scripts/with_server.py --server "npm run dev" --port 5173 -- python automation.py
```

A basic Playwright script structure:
```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
```

The toolkit prioritizes treating bundled scripts as black-box utilities rather than reading source code directly, preserving context window space for actual automation logic.
