import os
import uuid
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.models import UserContext, TaskResponse, SubTask, CategoryResponse
from datetime import datetime, timezone

# Set test environment
os.environ["ENVIRONMENT"] = "test"

TEST_USER_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
TEST_TOKEN = "valid-test-token"


@pytest.fixture
def mock_user():
    return UserContext(
        id=TEST_USER_ID,
        email="testuser@example.com",
        token=TEST_TOKEN,
    )


@pytest.fixture
def client(mock_user):
    from app.auth import get_current_user

    app.dependency_overrides[get_current_user] = lambda: mock_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def unauthenticated_client():
    from app.auth import get_current_user

    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_task():
    return TaskResponse(
        id=uuid.UUID("22222222-2222-2222-2222-222222222222"),
        user_id=TEST_USER_ID,
        title="Complete CS201 Assignment",
        description="Write unit tests and documentation",
        is_completed=False,
        priority="P1",
        category_id="study",
        due_date=datetime.now(timezone.utc),
        subtasks=[
            SubTask(id="st-1", title="Write tests", is_completed=True),
            SubTask(id="st-2", title="Write docs", is_completed=False),
        ],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
