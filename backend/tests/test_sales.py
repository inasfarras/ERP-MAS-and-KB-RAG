import pytest
from fastapi import status
from datetime import datetime, timedelta

# Test data
SAMPLE_CUSTOMER = {
    "name": "Test Customer",
    "contact_person": "John Doe",
    "email": "john@test.com",
    "phone": "1234567890",
    "address": "123 Test St",
    "credit_limit": 5000.00
}

SAMPLE_ORDER = {
    "order_number": "ORD-001",
    "customer_id": 1,  # Will be updated in tests
    "order_date": datetime.now().isoformat(),
    "required_date": (datetime.now() + timedelta(days=7)).isoformat(),
    "status": "draft",
    "total_amount": 1000.00,
    "items": [
        {
            "product_id": 1,  # Will be updated in tests
            "quantity": 2,
            "unit_price": 500.00,
            "discount": 0.00,
            "total_price": 1000.00
        }
    ]
}

def test_create_customer(client, auth_headers):
    """Test creating a new customer."""
    response = client.post(
        "/api/sales/customers",
        json=SAMPLE_CUSTOMER,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == SAMPLE_CUSTOMER["name"]
    assert data["email"] == SAMPLE_CUSTOMER["email"]
    assert "id" in data
    return data["id"]

def test_get_customers(client, auth_headers):
    """Test retrieving all customers."""
    # First create a customer
    client.post(
        "/api/sales/customers",
        json=SAMPLE_CUSTOMER,
        headers=auth_headers
    )
    
    # Then get all customers
    response = client.get("/api/sales/customers", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_customer(client, auth_headers):
    """Test retrieving a specific customer."""
    # First create a customer
    create_response = client.post(
        "/api/sales/customers",
        json=SAMPLE_CUSTOMER,
        headers=auth_headers
    )
    customer_id = create_response.json()["id"]
    
    # Then get the specific customer
    response = client.get(
        f"/api/sales/customers/{customer_id}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == customer_id
    assert data["name"] == SAMPLE_CUSTOMER["name"]

def test_update_customer(client, auth_headers):
    """Test updating a customer."""
    # First create a customer
    create_response = client.post(
        "/api/sales/customers",
        json=SAMPLE_CUSTOMER,
        headers=auth_headers
    )
    customer_id = create_response.json()["id"]
    
    # Update the customer
    update_data = {
        "name": "Updated Customer",
        "email": "updated@test.com"
    }
    response = client.put(
        f"/api/sales/customers/{customer_id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["email"] == update_data["email"]

def test_create_order(client, auth_headers, test_customer, test_product):
    """Test creating a new order."""
    order_data = SAMPLE_ORDER.copy()
    order_data["customer_id"] = test_customer.id
    order_data["items"][0]["product_id"] = test_product.id
    
    response = client.post(
        "/api/sales/orders",
        json=order_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["order_number"] == order_data["order_number"]
    assert data["total_amount"] == order_data["total_amount"]
    assert len(data["order_items"]) == len(order_data["items"])
    assert "id" in data
    return data["id"]

def test_get_orders(client, auth_headers, test_customer, test_product):
    """Test retrieving all orders."""
    # First create an order
    order_data = SAMPLE_ORDER.copy()
    order_data["customer_id"] = test_customer.id
    order_data["items"][0]["product_id"] = test_product.id
    
    client.post(
        "/api/sales/orders",
        json=order_data,
        headers=auth_headers
    )
    
    # Then get all orders
    response = client.get("/api/sales/orders", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_order(client, auth_headers, test_customer, test_product):
    """Test retrieving a specific order."""
    # First create an order
    order_data = SAMPLE_ORDER.copy()
    order_data["customer_id"] = test_customer.id
    order_data["items"][0]["product_id"] = test_product.id
    
    create_response = client.post(
        "/api/sales/orders",
        json=order_data,
        headers=auth_headers
    )
    order_id = create_response.json()["id"]
    
    # Then get the specific order
    response = client.get(
        f"/api/sales/orders/{order_id}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == order_id
    assert data["order_number"] == order_data["order_number"]

def test_update_order_status(client, auth_headers, test_customer, test_product):
    """Test updating an order's status."""
    # First create an order
    order_data = SAMPLE_ORDER.copy()
    order_data["customer_id"] = test_customer.id
    order_data["items"][0]["product_id"] = test_product.id
    
    create_response = client.post(
        "/api/sales/orders",
        json=order_data,
        headers=auth_headers
    )
    order_id = create_response.json()["id"]
    
    # Update the order status
    new_status = "confirmed"
    response = client.put(
        f"/api/sales/orders/{order_id}/status",
        json={"status": new_status},
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == new_status

def test_sales_by_customer_report(client, auth_headers, test_customer, test_product):
    """Test sales by customer report."""
    # First create an order
    order_data = SAMPLE_ORDER.copy()
    order_data["customer_id"] = test_customer.id
    order_data["items"][0]["product_id"] = test_product.id
    
    client.post(
        "/api/sales/orders",
        json=order_data,
        headers=auth_headers
    )
    
    # Get the report
    start_date = (datetime.now() - timedelta(days=30)).isoformat()
    end_date = datetime.now().isoformat()
    
    response = client.get(
        f"/api/sales/reports/sales-by-customer?start_date={start_date}&end_date={end_date}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "sales_by_customer" in data
    assert len(data["sales_by_customer"]) > 0

def test_sales_by_product_report(client, auth_headers, test_customer, test_product):
    """Test sales by product report."""
    # First create an order
    order_data = SAMPLE_ORDER.copy()
    order_data["customer_id"] = test_customer.id
    order_data["items"][0]["product_id"] = test_product.id
    
    client.post(
        "/api/sales/orders",
        json=order_data,
        headers=auth_headers
    )
    
    # Get the report
    start_date = (datetime.now() - timedelta(days=30)).isoformat()
    end_date = datetime.now().isoformat()
    
    response = client.get(
        f"/api/sales/reports/sales-by-product?start_date={start_date}&end_date={end_date}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "sales_by_product" in data
    assert len(data["sales_by_product"]) > 0 