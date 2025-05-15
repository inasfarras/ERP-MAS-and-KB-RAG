import pytest
from fastapi import status

# Test data
SAMPLE_TRANSACTION = {
    "transaction_date": "2024-03-20T10:00:00",
    "amount": 1000.00,
    "description": "Test transaction",
    "type": "credit",
    "account_id": 1
}

def test_create_transaction(client, auth_headers, test_account):
    """Test creating a new financial transaction."""
    transaction_data = SAMPLE_TRANSACTION.copy()
    transaction_data["account_id"] = test_account.id
    
    response = client.post(
        "/api/finance/transactions",
        json=transaction_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["amount"] == transaction_data["amount"]
    assert data["description"] == transaction_data["description"]
    assert "id" in data

def test_get_transactions(client, auth_headers, test_account):
    """Test retrieving all transactions."""
    # First create a transaction
    transaction_data = SAMPLE_TRANSACTION.copy()
    transaction_data["account_id"] = test_account.id
    
    client.post(
        "/api/finance/transactions",
        json=transaction_data,
        headers=auth_headers
    )
    
    # Then get all transactions
    response = client.get("/api/finance/transactions", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_transaction_by_id(client, auth_headers, test_account):
    """Test retrieving a specific transaction."""
    # First create a transaction
    transaction_data = SAMPLE_TRANSACTION.copy()
    transaction_data["account_id"] = test_account.id
    
    create_response = client.post(
        "/api/finance/transactions",
        json=transaction_data,
        headers=auth_headers
    )
    transaction_id = create_response.json()["id"]
    
    # Then get the specific transaction
    response = client.get(
        f"/api/finance/transactions/{transaction_id}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == transaction_id
    assert data["amount"] == transaction_data["amount"]

def test_update_transaction(client, auth_headers, test_account):
    """Test updating a transaction."""
    # First create a transaction
    transaction_data = SAMPLE_TRANSACTION.copy()
    transaction_data["account_id"] = test_account.id
    
    create_response = client.post(
        "/api/finance/transactions",
        json=transaction_data,
        headers=auth_headers
    )
    transaction_id = create_response.json()["id"]
    
    # Update the transaction
    update_data = {
        "amount": 2000.00,
        "description": "Updated transaction"
    }
    response = client.put(
        f"/api/finance/transactions/{transaction_id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["amount"] == update_data["amount"]
    assert data["description"] == update_data["description"]

def test_delete_transaction(client, auth_headers, test_account):
    """Test deleting a transaction."""
    # First create a transaction
    transaction_data = SAMPLE_TRANSACTION.copy()
    transaction_data["account_id"] = test_account.id
    
    create_response = client.post(
        "/api/finance/transactions",
        json=transaction_data,
        headers=auth_headers
    )
    transaction_id = create_response.json()["id"]
    
    # Delete the transaction
    response = client.delete(
        f"/api/finance/transactions/{transaction_id}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify the transaction is deleted
    get_response = client.get(
        f"/api/finance/transactions/{transaction_id}",
        headers=auth_headers
    )
    assert get_response.status_code == status.HTTP_404_NOT_FOUND 