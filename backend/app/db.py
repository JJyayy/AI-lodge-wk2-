import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from uuid import UUID
import httpx
from fastapi import HTTPException, status
from app.config import settings
from app.models import (
    TaskResponse,
    TaskCreate,
    TaskUpdate,
    CategoryResponse,
    CategoryCreate,
    FilterStatus,
    PriorityLevel,
    SortOption,
    SubTask,
)

logger = logging.getLogger(__name__)


def get_headers(token: str) -> Dict[str, str]:
    return {
        "apikey": settings.SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def row_to_task_response(row: Dict[str, Any]) -> TaskResponse:
    subtasks_data = row.get("subtasks") or []
    subtasks = []
    if isinstance(subtasks_data, list):
        for st in subtasks_data:
            if isinstance(st, dict):
                subtasks.append(
                    SubTask(
                        id=str(st.get("id", "")),
                        title=st.get("title", ""),
                        is_completed=st.get("is_completed") or st.get("isCompleted") or False,
                    )
                )

    return TaskResponse(
        id=UUID(row["id"]),
        user_id=UUID(row["user_id"]),
        title=row["title"],
        description=row.get("description", "") or "",
        is_completed=row.get("is_completed", False),
        priority=row.get("priority", "P4"),
        category_id=row.get("category_id", "work"),
        due_date=row.get("due_date"),
        subtasks=subtasks,
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def row_to_category_response(row: Dict[str, Any]) -> CategoryResponse:
    user_id = UUID(row["user_id"]) if row.get("user_id") else None
    return CategoryResponse(
        id=row["id"],
        user_id=user_id,
        name=row["name"],
        color_hex=row["color_hex"],
        icon=row.get("icon"),
        created_at=row.get("created_at"),
    )


class DatabaseClient:
    def __init__(self):
        self.base_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1"

    async def get_tasks(
        self,
        token: str,
        search: Optional[str] = None,
        status_filter: Optional[FilterStatus] = None,
        category_id: Optional[str] = None,
        priority: Optional[PriorityLevel] = None,
        sort_by: Optional[SortOption] = None,
    ) -> List[TaskResponse]:
        url = f"{self.base_url}/tasks"
        params: Dict[str, str] = {"select": "*"}

        if status_filter == "ACTIVE":
            params["is_completed"] = "eq.false"
        elif status_filter == "COMPLETED":
            params["is_completed"] = "eq.true"

        if category_id:
            params["category_id"] = f"eq.{category_id}"

        if priority:
            params["priority"] = f"eq.{priority}"

        if search:
            # PostgREST fuzzy search across title and description
            clean_search = search.replace("%", "").replace("*", "").strip()
            if clean_search:
                params["or"] = f"(title.ilike.*{clean_search}*,description.ilike.*{clean_search}*)"

        # Sorting logic
        if sort_by == "DUE_DATE_ASC":
            params["order"] = "due_date.asc.nullslast,created_at.desc"
        elif sort_by == "DUE_DATE_DESC":
            params["order"] = "due_date.desc.nullslast,created_at.desc"
        elif sort_by == "PRIORITY_DESC":
            params["order"] = "priority.asc,created_at.desc"
        elif sort_by == "TITLE_ASC":
            params["order"] = "title.asc"
        else:
            # Default CREATED_DESC
            params["order"] = "created_at.desc"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=get_headers(token), params=params)

            if response.status_code != 200:
                logger.error(f"Failed to fetch tasks: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Database query error: {response.text}",
                )

            rows = response.json()
            return [row_to_task_response(r) for r in rows]
        except httpx.RequestError as exc:
            logger.error(f"Database connection error: {str(exc)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable",
            )

    async def get_task(self, token: str, task_id: UUID) -> TaskResponse:
        url = f"{self.base_url}/tasks"
        params = {"id": f"eq.{str(task_id)}", "select": "*"}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=get_headers(token), params=params)

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Database query error",
                )

            rows = response.json()
            if not rows:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found or access denied",
                )

            return row_to_task_response(rows[0])
        except httpx.RequestError as exc:
            logger.error(f"Database connection error: {str(exc)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable",
            )

    async def create_task(self, token: str, user_id: UUID, task: TaskCreate) -> TaskResponse:
        url = f"{self.base_url}/tasks"
        now_iso = datetime.now(timezone.utc).isoformat()

        payload = {
            "user_id": str(user_id),
            "title": task.title,
            "description": task.description or "",
            "is_completed": task.isCompleted,
            "priority": task.priority,
            "category_id": task.categoryId,
            "due_date": task.dueDate.isoformat() if task.dueDate else None,
            "subtasks": [st.model_dump(by_alias=True) for st in task.subtasks],
            "created_at": now_iso,
            "updated_at": now_iso,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=get_headers(token), json=payload)

            if response.status_code not in (200, 201):
                logger.error(f"Failed to create task: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to create task: {response.text}",
                )

            rows = response.json()
            if not rows:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No data returned after insert",
                )

            return row_to_task_response(rows[0])
        except httpx.RequestError as exc:
            logger.error(f"Database connection error: {str(exc)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable",
            )

    async def update_task(self, token: str, task_id: UUID, task_update: TaskUpdate) -> TaskResponse:
        url = f"{self.base_url}/tasks"
        params = {"id": f"eq.{str(task_id)}", "select": "*"}

        update_dict = task_update.model_dump(exclude_unset=True)
        if not update_dict:
            return await self.get_task(token, task_id)

        payload: Dict[str, Any] = {
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if "title" in update_dict and update_dict["title"] is not None:
            payload["title"] = update_dict["title"]
        if "description" in update_dict:
            payload["description"] = update_dict["description"] or ""
        if "isCompleted" in update_dict and update_dict["isCompleted"] is not None:
            payload["is_completed"] = update_dict["isCompleted"]
        if "priority" in update_dict and update_dict["priority"] is not None:
            payload["priority"] = update_dict["priority"]
        if "categoryId" in update_dict and update_dict["categoryId"] is not None:
            payload["category_id"] = update_dict["categoryId"]
        if "dueDate" in update_dict:
            payload["due_date"] = (
                update_dict["dueDate"].isoformat() if update_dict["dueDate"] else None
            )
        if "subtasks" in update_dict and update_dict["subtasks"] is not None:
            payload["subtasks"] = [
                st if isinstance(st, dict) else st.model_dump(by_alias=True)
                for st in update_dict["subtasks"]
            ]

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.patch(
                    url, headers=get_headers(token), params=params, json=payload
                )

            if response.status_code != 200:
                logger.error(f"Failed to update task: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to update task: {response.text}",
                )

            rows = response.json()
            if not rows:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found or access denied",
                )

            return row_to_task_response(rows[0])
        except httpx.RequestError as exc:
            logger.error(f"Database connection error: {str(exc)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable",
            )

    async def delete_task(self, token: str, task_id: UUID) -> bool:
        url = f"{self.base_url}/tasks"
        params = {"id": f"eq.{str(task_id)}"}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.delete(url, headers=get_headers(token), params=params)

            if response.status_code not in (200, 204):
                logger.error(f"Failed to delete task: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to delete task: {response.text}",
                )

            return True
        except httpx.RequestError as exc:
            logger.error(f"Database connection error: {str(exc)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable",
            )

    async def bulk_delete_tasks(self, token: str, task_ids: List[UUID]) -> int:
        if not task_ids:
            return 0

        url = f"{self.base_url}/tasks"
        id_str_list = ",".join(str(tid) for tid in task_ids)
        params = {"id": f"in.({id_str_list})"}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.delete(url, headers=get_headers(token), params=params)

            if response.status_code not in (200, 204):
                logger.error(f"Failed to bulk delete tasks: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to bulk delete tasks",
                )

            rows = response.json() if response.text else []
            return len(rows) if isinstance(rows, list) else len(task_ids)
        except httpx.RequestError as exc:
            logger.error(f"Database connection error: {str(exc)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable",
            )

    async def bulk_complete_tasks(
        self, token: str, task_ids: List[UUID], is_completed: bool
    ) -> int:
        if not task_ids:
            return 0

        url = f"{self.base_url}/tasks"
        id_str_list = ",".join(str(tid) for tid in task_ids)
        params = {"id": f"in.({id_str_list})", "select": "*"}
        payload = {
            "is_completed": is_completed,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.patch(
                    url, headers=get_headers(token), params=params, json=payload
                )

            if response.status_code != 200:
                logger.error(f"Failed to bulk update tasks: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to bulk update tasks",
                )

            rows = response.json()
            return len(rows) if isinstance(rows, list) else len(task_ids)
        except httpx.RequestError as exc:
            logger.error(f"Database connection error: {str(exc)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable",
            )

    async def get_categories(self, token: str) -> List[CategoryResponse]:
        url = f"{self.base_url}/categories"
        params = {"select": "*", "order": "created_at.asc"}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=get_headers(token), params=params)

            default_categories = [
                CategoryResponse(id="work", name="Work", color_hex="#6366F1", icon="Briefcase"),
                CategoryResponse(id="study", name="Study", color_hex="#EC4899", icon="GraduationCap"),
                CategoryResponse(id="personal", name="Personal", color_hex="#10B981", icon="User"),
                CategoryResponse(id="health", name="Health", color_hex="#F59E0B", icon="Heart"),
            ]

            if response.status_code != 200:
                return default_categories

            rows = response.json()
            custom = [row_to_category_response(r) for r in rows]
            # Merge custom with defaults if not already present
            existing_ids = {c.id for c in custom}
            merged = custom + [d for d in default_categories if d.id not in existing_ids]
            return merged
        except Exception as exc:
            logger.warning(f"Error fetching categories, falling back to defaults: {str(exc)}")
            return [
                CategoryResponse(id="work", name="Work", color_hex="#6366F1", icon="Briefcase"),
                CategoryResponse(id="study", name="Study", color_hex="#EC4899", icon="GraduationCap"),
                CategoryResponse(id="personal", name="Personal", color_hex="#10B981", icon="User"),
                CategoryResponse(id="health", name="Health", color_hex="#F59E0B", icon="Heart"),
            ]

    async def create_category(
        self, token: str, user_id: UUID, category: CategoryCreate
    ) -> CategoryResponse:
        url = f"{self.base_url}/categories"
        payload = {
            "id": category.id,
            "user_id": str(user_id),
            "name": category.name,
            "color_hex": category.colorHex,
            "icon": category.icon,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=get_headers(token), json=payload)

            if response.status_code not in (200, 201):
                logger.error(f"Failed to create category: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to create custom category",
                )

            rows = response.json()
            return row_to_category_response(rows[0])
        except httpx.RequestError as exc:
            logger.error(f"Database connection error: {str(exc)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable",
            )


db = DatabaseClient()
