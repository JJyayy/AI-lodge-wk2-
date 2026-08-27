import logging
from uuid import UUID
from typing import Optional
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.models import UserContext

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> UserContext:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Validate the token against Supabase Auth API
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        # Fallback for local mock testing only if configured
        if settings.ENVIRONMENT == "test":
            try:
                # If mock test token format: "mock-user-<uuid>"
                import jwt
                payload = jwt.decode(token, options={"verify_signature": False})
                user_id = payload.get("sub") or payload.get("user_id")
                return UserContext(id=UUID(user_id), email=payload.get("email"), token=token)
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid test token",
                )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase configuration missing on server",
        )

    auth_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"
    headers = {
        "apikey": settings.SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token}",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(auth_url, headers=headers)

        if response.status_code != 200:
            logger.warning(f"Supabase auth validation failed: status={response.status_code}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid, expired, or revoked authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        data = response.json()
        user_id_str = data.get("id")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User identifier missing in authentication payload",
            )

        return UserContext(
            id=UUID(user_id_str),
            email=data.get("email"),
            token=token,
        )

    except HTTPException:
        raise
    except httpx.RequestError as exc:
        logger.error(f"Error connecting to Supabase Auth: {str(exc)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is temporarily unavailable",
        )
    except Exception as exc:
        logger.error(f"Unexpected error during token verification: {str(exc)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication credentials",
        )
