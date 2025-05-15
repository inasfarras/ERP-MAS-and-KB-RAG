import pytest
from fastapi import status
from datetime import datetime, timedelta

# Test data
SAMPLE_PROJECT = {
    "project_code": "PRJ-001",
    "name": "Test Project",
    "description": "A test project",
    "customer_id": 1,  # Will be updated in tests
    "start_date": datetime.now().isoformat(),
    "end_date": (datetime.now() + timedelta(days=30)).isoformat(),
    "budget": 10000.00,
    "status": "planning",
    "tasks": [
        {
            "name": "Task 1",
            "description": "First task",
            "start_date": datetime.now().isoformat(),
            "end_date": (datetime.now() + timedelta(days=7)).isoformat(),
            "status": "not-started",
            "progress": 0
        },
        {
            "name": "Task 2",
            "description": "Second task",
            "start_date": (datetime.now() + timedelta(days=8)).isoformat(),
            "end_date": (datetime.now() + timedelta(days=15)).isoformat(),
            "status": "not-started",
            "progress": 0
        }
    ]
}

def test_create_project(client, auth_headers, test_customer):
    """Test creating a new project."""
    project_data = SAMPLE_PROJECT.copy()
    project_data["customer_id"] = test_customer.id
    
    response = client.post(
        "/api/projects/projects",
        json=project_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["project_code"] == project_data["project_code"]
    assert data["name"] == project_data["name"]
    assert len(data["tasks"]) == len(project_data["tasks"])
    assert "id" in data
    return data["id"]

def test_get_projects(client, auth_headers, test_customer):
    """Test retrieving all projects."""
    # First create a project
    project_data = SAMPLE_PROJECT.copy()
    project_data["customer_id"] = test_customer.id
    
    client.post(
        "/api/projects/projects",
        json=project_data,
        headers=auth_headers
    )
    
    # Then get all projects
    response = client.get("/api/projects/projects", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_project(client, auth_headers, test_customer):
    """Test retrieving a specific project."""
    # First create a project
    project_data = SAMPLE_PROJECT.copy()
    project_data["customer_id"] = test_customer.id
    
    create_response = client.post(
        "/api/projects/projects",
        json=project_data,
        headers=auth_headers
    )
    project_id = create_response.json()["id"]
    
    # Then get the specific project
    response = client.get(
        f"/api/projects/projects/{project_id}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == project_id
    assert data["project_code"] == project_data["project_code"]

def test_update_project(client, auth_headers, test_customer):
    """Test updating a project."""
    # First create a project
    project_data = SAMPLE_PROJECT.copy()
    project_data["customer_id"] = test_customer.id
    
    create_response = client.post(
        "/api/projects/projects",
        json=project_data,
        headers=auth_headers
    )
    project_id = create_response.json()["id"]
    
    # Update the project
    update_data = {
        "name": "Updated Project",
        "budget": 15000.00
    }
    response = client.put(
        f"/api/projects/projects/{project_id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["budget"] == update_data["budget"]

def test_update_project_status(client, auth_headers, test_customer):
    """Test updating a project's status."""
    # First create a project
    project_data = SAMPLE_PROJECT.copy()
    project_data["customer_id"] = test_customer.id
    
    create_response = client.post(
        "/api/projects/projects",
        json=project_data,
        headers=auth_headers
    )
    project_id = create_response.json()["id"]
    
    # Update the project status
    new_status = "active"
    response = client.put(
        f"/api/projects/projects/{project_id}/status",
        json={"status": new_status},
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == new_status

def test_create_task(client, auth_headers, test_customer):
    """Test creating a new task."""
    # First create a project
    project_data = SAMPLE_PROJECT.copy()
    project_data["customer_id"] = test_customer.id
    
    create_response = client.post(
        "/api/projects/projects",
        json=project_data,
        headers=auth_headers
    )
    project_id = create_response.json()["id"]
    
    # Create a new task
    task_data = {
        "name": "New Task",
        "description": "A new task",
        "start_date": datetime.now().isoformat(),
        "end_date": (datetime.now() + timedelta(days=7)).isoformat(),
        "status": "not-started",
        "progress": 0
    }
    
    response = client.post(
        f"/api/projects/tasks?project_id={project_id}",
        json=task_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == task_data["name"]
    assert data["project_id"] == project_id
    assert "id" in data

def test_get_tasks(client, auth_headers, test_customer):
    """Test retrieving all tasks."""
    # First create a project with tasks
    project_data = SAMPLE_PROJECT.copy()
    project_data["customer_id"] = test_customer.id
    
    client.post(
        "/api/projects/projects",
        json=project_data,
        headers=auth_headers
    )
    
    # Then get all tasks
    response = client.get("/api/projects/tasks", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_update_task_status(client, auth_headers, test_customer):
    """Test updating a task's status and progress."""
    # First create a project with tasks
    project_data = SAMPLE_PROJECT.copy()
    project_data["customer_id"] = test_customer.id
    
    create_response = client.post(
        "/api/projects/projects",
        json=project_data,
        headers=auth_headers
    )
    task_id = create_response.json()["tasks"][0]["id"]
    
    # Update the task status and progress
    new_status = "in-progress"
    new_progress = 50
    response = client.put(
        f"/api/projects/tasks/{task_id}/status",
        json={"status": new_status, "progress": new_progress},
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == new_status
    assert data["progress"] == new_progress

def test_project_performance_report(client, auth_headers, test_customer):
    """Test project performance report."""
    # First create a project with tasks
    project_data = SAMPLE_PROJECT.copy()
    project_data["customer_id"] = test_customer.id
    
    create_response = client.post(
        "/api/projects/projects",
        json=project_data,
        headers=auth_headers
    )
    project_id = create_response.json()["id"]
    
    # Get the report
    response = client.get(
        f"/api/projects/reports/project-performance?project_id={project_id}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "task_statistics" in data
    assert "financial_statistics" in data
    assert "overall_progress" in data

def test_resource_allocation_report(client, auth_headers, test_customer):
    """Test resource allocation report."""
    # First create a project with tasks
    project_data = SAMPLE_PROJECT.copy()
    project_data["customer_id"] = test_customer.id
    
    client.post(
        "/api/projects/projects",
        json=project_data,
        headers=auth_headers
    )
    
    # Get the report
    response = client.get("/api/projects/reports/resource-allocation", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "resource_allocations" in data
    assert "workload_summary" in data 