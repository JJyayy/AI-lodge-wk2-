import uuid
from unittest.mock import AsyncMock, patch
from fastapi import status


def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"


def test_unauthenticated_access_denied(unauthenticated_client):
    response = unauthenticated_client.get("/api/v1/tasks")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@patch("app.db.db.get_tasks")
def test_list_tasks(mock_get_tasks, client, sample_task):
    mock_get_tasks.return_value = [sample_task]
    response = client.get("/api/v1/tasks")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Complete CS201 Assignment"
    assert data[0]["priority"] == "P1"
    assert data[0]["categoryId"] == "study"


@patch("app.db.db.create_task")
def test_create_task_success(mock_create_task, client, sample_task):
    mock_create_task.return_value = sample_task
    payload = {
        "title": "New Task",
        "description": "Task description",
        "priority": "P2",
        "categoryId": "work",
        "subtasks": [{"id": "1", "title": "Subtask 1", "isCompleted": False}],
    }
    response = client.post("/api/v1/tasks", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    assert mock_create_task.called


def test_create_task_empty_title_validation(client):
    payload = {
        "title": "   ",
        "priority": "P2",
    }
    response = client.post("/api/v1/tasks", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


@patch("app.db.db.update_task")
def test_update_task(mock_update_task, client, sample_task):
    sample_task.isCompleted = True
    mock_update_task.return_value = sample_task
    payload = {"isCompleted": True}
    response = client.put(f"/api/v1/tasks/{sample_task.id}", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["isCompleted"] is True


@patch("app.db.db.delete_task")
def test_delete_task(mock_delete_task, client, sample_task):
    mock_delete_task.return_value = True
    response = client.delete(f"/api/v1/tasks/{sample_task.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT


@patch("app.db.db.bulk_delete_tasks")
def test_bulk_delete_tasks(mock_bulk_delete, client):
    mock_bulk_delete.return_value = 2
    task_id1 = str(uuid.uuid4())
    task_id2 = str(uuid.uuid4())
    response = client.post("/api/v1/tasks/bulk-delete", json={"ids": [task_id1, task_id2]})
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["deleted"] == 2


@patch("app.db.db.bulk_complete_tasks")
def test_bulk_complete_tasks(mock_bulk_complete, client):
    mock_bulk_complete.return_value = 2
    task_id1 = str(uuid.uuid4())
    task_id2 = str(uuid.uuid4())
    response = client.post(
        "/api/v1/tasks/bulk-complete",
        json={"ids": [task_id1, task_id2], "isCompleted": True},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["updated"] == 2
