# Vercel Serverless Function entrypoint
from app.main import app

# Export app instance for Vercel @vercel/python
__all__ = ["app"]
