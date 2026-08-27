from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["Health"])


@router.get("/health", status_code=200)
async def health_check():
    return {
        "status": "healthy",
        "service": "TaskFlow Backend API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
