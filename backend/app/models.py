from datetime import datetime
from typing import List, Optional, Literal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, AliasChoices


PriorityLevel = Literal["P1", "P2", "P3", "P4"]
FilterStatus = Literal["ALL", "ACTIVE", "COMPLETED"]
SortOption = Literal[
    "DUE_DATE_ASC", "DUE_DATE_DESC", "PRIORITY_DESC", "CREATED_DESC", "TITLE_ASC"
]


class SubTask(BaseModel):
    id: str
    title: str = Field(..., min_length=1, max_length=250)
    isCompleted: bool = Field(
        default=False,
        validation_alias=AliasChoices("isCompleted", "is_completed"),
    )

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=250)
    description: Optional[str] = Field(default="", max_length=5000)
    priority: PriorityLevel = Field(default="P4")
    categoryId: str = Field(
        default="work",
        validation_alias=AliasChoices("categoryId", "category_id"),
        max_length=50,
    )
    dueDate: Optional[datetime] = Field(
        default=None,
        validation_alias=AliasChoices("dueDate", "due_date"),
    )
    subtasks: List[SubTask] = Field(default_factory=list)

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class TaskCreate(TaskBase):
    isCompleted: bool = Field(
        default=False,
        validation_alias=AliasChoices("isCompleted", "is_completed"),
    )


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=250)
    description: Optional[str] = Field(default=None, max_length=5000)
    isCompleted: Optional[bool] = Field(
        default=None,
        validation_alias=AliasChoices("isCompleted", "is_completed"),
    )
    priority: Optional[PriorityLevel] = Field(default=None)
    categoryId: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("categoryId", "category_id"),
        max_length=50,
    )
    dueDate: Optional[datetime] = Field(
        default=None,
        validation_alias=AliasChoices("dueDate", "due_date"),
    )
    subtasks: Optional[List[SubTask]] = Field(default=None)

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class TaskResponse(BaseModel):
    id: UUID
    userId: UUID = Field(
        ...,
        validation_alias=AliasChoices("userId", "user_id"),
    )
    title: str
    description: str = ""
    isCompleted: bool = Field(
        default=False,
        validation_alias=AliasChoices("isCompleted", "is_completed"),
    )
    priority: PriorityLevel
    categoryId: str = Field(
        default="work",
        validation_alias=AliasChoices("categoryId", "category_id"),
    )
    dueDate: Optional[datetime] = Field(
        default=None,
        validation_alias=AliasChoices("dueDate", "due_date"),
    )
    subtasks: List[SubTask] = Field(default_factory=list)
    createdAt: datetime = Field(
        ...,
        validation_alias=AliasChoices("createdAt", "created_at"),
    )
    updatedAt: datetime = Field(
        ...,
        validation_alias=AliasChoices("updatedAt", "updated_at"),
    )

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class BulkDeleteRequest(BaseModel):
    ids: List[UUID]


class BulkCompleteRequest(BaseModel):
    ids: List[UUID]
    isCompleted: bool = Field(
        ...,
        validation_alias=AliasChoices("isCompleted", "is_completed"),
    )

    model_config = ConfigDict(
        populate_by_name=True,
    )


class CategoryBase(BaseModel):
    id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    colorHex: str = Field(
        ...,
        validation_alias=AliasChoices("colorHex", "color_hex"),
        max_length=20,
    )
    icon: Optional[str] = Field(default=None, max_length=50)

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    userId: Optional[UUID] = Field(
        default=None,
        validation_alias=AliasChoices("userId", "user_id"),
    )
    createdAt: Optional[datetime] = Field(
        default=None,
        validation_alias=AliasChoices("createdAt", "created_at"),
    )

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class UserContext(BaseModel):
    id: UUID
    email: Optional[str] = None
    token: str
