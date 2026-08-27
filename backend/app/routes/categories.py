from typing import List
from fastapi import APIRouter, Depends, status
from app.auth import get_current_user
from app.db import db
from app.models import UserContext, CategoryResponse, CategoryCreate
from app.services.task_service import sanitize_text

router = APIRouter(prefix="/api/v1/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
async def list_categories(
    current_user: UserContext = Depends(get_current_user),
):
    return await db.get_categories(token=current_user.token)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    current_user: UserContext = Depends(get_current_user),
):
    clean_name = sanitize_text(category.name)
    clean_id = sanitize_text(category.id).lower().replace(" ", "-")
    sanitized = CategoryCreate(
        id=clean_id,
        name=clean_name,
        color_hex=category.colorHex,
        icon=category.icon,
    )
    return await db.create_category(
        token=current_user.token,
        user_id=current_user.id,
        category=sanitized,
    )
