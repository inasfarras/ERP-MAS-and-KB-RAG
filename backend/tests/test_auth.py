import pytest
from fastapi import status

def test_login_success(client, test_user):
    """Test successful login with correct credentials."""
    response = client.post(
        "/token",
        data={"username": test_user.username, "password": "testpassword"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client, test_user):
    """Test login failure with wrong password."""
    response = client.post(
        "/token",
        data={"username": test_user.username, "password": "wrongpassword"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_login_wrong_username(client):
    """Test login failure with non-existent username."""
    response = client.post(
        "/token",
        data={"username": "nonexistent", "password": "testpassword"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_protected_route_with_token(client, auth_headers):
    """Test accessing protected route with valid token."""
    response = client.get("/", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK

def test_protected_route_without_token(client):
    """Test accessing protected route without token."""
    response = client.get("/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_protected_route_with_invalid_token(client):
    """Test accessing protected route with invalid token."""
    response = client.get("/", headers={"Authorization": "Bearer invalid_token"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED 