import uuid
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from app.auth import get_current_user
from app.db import db
from app.models import (
    UserContext,
    TaskResponse,
    TaskCreate,
    TaskUpdate,
    BulkDeleteRequest,
    BulkCompleteRequest,
    FilterStatus,
    PriorityLevel,
    SortOption,
    SubTask,
)
from app.services.task_service import sanitize_text, sanitize_markdown

router = APIRouter(prefix="/api/v1/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    search: Optional[str] = Query(None, description="Search by title or description"),
    status: Optional[FilterStatus] = Query("ALL", description="Filter by status"),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    priority: Optional[PriorityLevel] = Query(None, description="Filter by priority level"),
    sort_by: Optional[SortOption] = Query("CREATED_DESC", description="Sorting option"),
    current_user: UserContext = Depends(get_current_user),
):
    return await db.get_tasks(
        token=current_user.token,
        search=search,
        status_filter=status,
        category_id=category_id,
        priority=priority,
        sort_by=sort_by,
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: UserContext = Depends(get_current_user),
):
    # Sanitize title and description
    sanitized_title = sanitize_text(task.title)
    if not sanitized_title:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Task title cannot be empty or whitespace only",
        )

    sanitized_description = sanitize_markdown(task.description)

    # Sanitize subtasks & assign IDs if missing
    sanitized_subtasks: List[SubTask] = []
    for st in task.subtasks:
        st_title = sanitize_text(st.title)
        if st_title:
            st_id = st.id if st.id else str(uuid.uuid4())
            sanitized_subtasks.append(
                SubTask(id=st_id, title=st_title, is_completed=st.isCompleted)
            )

    sanitized_task = TaskCreate(
        title=sanitized_title,
        description=sanitized_description,
        is_completed=task.isCompleted,
        priority=task.priority,
        category_id=task.categoryId,
        due_date=task.dueDate,
        subtasks=sanitized_subtasks,
    )

    return await db.create_task(
        token=current_user.token,
        user_id=current_user.id,
        task=sanitized_task,
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    current_user: UserContext = Depends(get_current_user),
):
    return await db.get_task(token=current_user.token, task_id=task_id)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    current_user: UserContext = Depends(get_current_user),
):
    update_data = task_update.model_dump(exclude_unset=True)

    if "title" in update_data and update_data["title"] is not None:
        clean_title = sanitize_text(update_data["title"])
        if not clean_title:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Task title cannot be empty or whitespace only",
            )
        update_data["title"] = clean_title

    if "description" in update_data and update_data["description"] is not None:
        update_data["description"] = sanitize_markdown(update_data["description"])

    if "subtasks" in update_data and update_data["subtasks"] is not None:
        sanitized_subtasks: List[SubTask] = []
        for st in update_data["subtasks"]:
            if isinstance(st, dict):
                st_title = sanitize_text(st.get("title"))
                st_id = st.get("id") or str(uuid.uuid4())
                st_done = st.get("is_completed") or st.get("isCompleted") or False
            else:
                st_title = sanitize_text(st.title)
                st_id = st.id or str(uuid.uuid4())
                st_done = st.isCompleted

            if st_title:
                sanitized_subtasks.append(
                    SubTask(id=st_id, title=st_title, is_completed=st_done)
                )
        update_data["subtasks"] = sanitized_subtasks

    sanitized_update = TaskUpdate(**update_data)
    return await db.update_task(
        token=current_user.token,
        task_id=task_id,
        task_update=sanitized_update,
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: UserContext = Depends(get_current_user),
):
    await db.delete_task(token=current_user.token, task_id=task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/bulk-delete", status_code=status.HTTP_200_OK)
async def bulk_delete_tasks(
    payload: BulkDeleteRequest,
    current_user: UserContext = Depends(get_current_user),
):
    deleted_count = await db.bulk_delete_tasks(
        token=current_user.token, task_ids=payload.ids
    )
    return {"deleted": deleted_count}


@router.post("/bulk-complete", status_code=status.HTTP_200_OK)
async def bulk_complete_tasks(
    payload: BulkCompleteRequest,
    current_user: UserContext = Depends(get_current_user),
):
    updated_count = await db.bulk_complete_tasks(
        token=current_user.token,
        task_ids=payload.ids,
        is_completed=payload.isCompleted,
    )
    return {"updated": updated_count}
