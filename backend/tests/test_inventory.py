import pytest
from fastapi import status
from datetime import datetime, timedelta

# Test data
SAMPLE_PRODUCT = {
    "sku": "TEST-001",
    "name": "Test Product",
    "description": "A test product",
    "category": "Test Category",
    "unit_price": 100.00,
    "stock_quantity": 100,
    "reorder_level": 20,
    "reorder_quantity": 50,
    "lead_time_days": 7
}

SAMPLE_SUPPLIER = {
    "name": "Test Supplier",
    "contact_person": "Jane Doe",
    "email": "jane@supplier.com",
    "phone": "9876543210",
    "address": "456 Supplier St"
}

SAMPLE_PURCHASE_ORDER = {
    "po_number": "PO-001",
    "supplier_id": 1,  # Will be updated in tests
    "order_date": datetime.now().isoformat(),
    "expected_delivery_date": (datetime.now() + timedelta(days=14)).isoformat(),
    "status": "draft",
    "total_amount": 5000.00,
    "items": [
        {
            "product_id": 1,  # Will be updated in tests
            "quantity": 50,
            "unit_price": 100.00,
            "total_price": 5000.00
        }
    ]
}

def test_create_product(client, auth_headers):
    """Test creating a new product."""
    response = client.post(
        "/api/inventory/products",
        json=SAMPLE_PRODUCT,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["sku"] == SAMPLE_PRODUCT["sku"]
    assert data["name"] == SAMPLE_PRODUCT["name"]
    assert "id" in data
    return data["id"]

def test_get_products(client, auth_headers):
    """Test retrieving all products."""
    # First create a product
    client.post(
        "/api/inventory/products",
        json=SAMPLE_PRODUCT,
        headers=auth_headers
    )
    
    # Then get all products
    response = client.get("/api/inventory/products", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_product(client, auth_headers):
    """Test retrieving a specific product."""
    # First create a product
    create_response = client.post(
        "/api/inventory/products",
        json=SAMPLE_PRODUCT,
        headers=auth_headers
    )
    product_id = create_response.json()["id"]
    
    # Then get the specific product
    response = client.get(
        f"/api/inventory/products/{product_id}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == product_id
    assert data["sku"] == SAMPLE_PRODUCT["sku"]

def test_update_product(client, auth_headers):
    """Test updating a product."""
    # First create a product
    create_response = client.post(
        "/api/inventory/products",
        json=SAMPLE_PRODUCT,
        headers=auth_headers
    )
    product_id = create_response.json()["id"]
    
    # Update the product
    update_data = {
        "name": "Updated Product",
        "unit_price": 150.00
    }
    response = client.put(
        f"/api/inventory/products/{product_id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["unit_price"] == update_data["unit_price"]

def test_create_inventory_movement(client, auth_headers, test_product):
    """Test creating an inventory movement."""
    movement_data = {
        "product_id": test_product.id,
        "quantity": 10,
        "movement_type": "in",
        "reference": "Test movement",
        "movement_date": datetime.now().isoformat()
    }
    
    response = client.post(
        "/api/inventory/movements",
        json=movement_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["product_id"] == movement_data["product_id"]
    assert data["quantity"] == movement_data["quantity"]
    assert "id" in data

def test_get_inventory_movements(client, auth_headers, test_product):
    """Test retrieving inventory movements."""
    # First create a movement
    movement_data = {
        "product_id": test_product.id,
        "quantity": 10,
        "movement_type": "in",
        "reference": "Test movement",
        "movement_date": datetime.now().isoformat()
    }
    
    client.post(
        "/api/inventory/movements",
        json=movement_data,
        headers=auth_headers
    )
    
    # Then get all movements
    response = client.get("/api/inventory/movements", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_create_supplier(client, auth_headers):
    """Test creating a new supplier."""
    response = client.post(
        "/api/inventory/suppliers",
        json=SAMPLE_SUPPLIER,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == SAMPLE_SUPPLIER["name"]
    assert data["email"] == SAMPLE_SUPPLIER["email"]
    assert "id" in data
    return data["id"]

def test_get_suppliers(client, auth_headers):
    """Test retrieving all suppliers."""
    # First create a supplier
    client.post(
        "/api/inventory/suppliers",
        json=SAMPLE_SUPPLIER,
        headers=auth_headers
    )
    
    # Then get all suppliers
    response = client.get("/api/inventory/suppliers", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_create_purchase_order(client, auth_headers, test_supplier, test_product):
    """Test creating a new purchase order."""
    po_data = SAMPLE_PURCHASE_ORDER.copy()
    po_data["supplier_id"] = test_supplier.id
    po_data["items"][0]["product_id"] = test_product.id
    
    response = client.post(
        "/api/inventory/purchase-orders",
        json=po_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["po_number"] == po_data["po_number"]
    assert data["total_amount"] == po_data["total_amount"]
    assert len(data["po_items"]) == len(po_data["items"])
    assert "id" in data
    return data["id"]

def test_get_purchase_orders(client, auth_headers, test_supplier, test_product):
    """Test retrieving all purchase orders."""
    # First create a purchase order
    po_data = SAMPLE_PURCHASE_ORDER.copy()
    po_data["supplier_id"] = test_supplier.id
    po_data["items"][0]["product_id"] = test_product.id
    
    client.post(
        "/api/inventory/purchase-orders",
        json=po_data,
        headers=auth_headers
    )
    
    # Then get all purchase orders
    response = client.get("/api/inventory/purchase-orders", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_update_purchase_order_status(client, auth_headers, test_supplier, test_product):
    """Test updating a purchase order's status."""
    # First create a purchase order
    po_data = SAMPLE_PURCHASE_ORDER.copy()
    po_data["supplier_id"] = test_supplier.id
    po_data["items"][0]["product_id"] = test_product.id
    
    create_response = client.post(
        "/api/inventory/purchase-orders",
        json=po_data,
        headers=auth_headers
    )
    po_id = create_response.json()["id"]
    
    # Update the purchase order status
    new_status = "received"
    response = client.put(
        f"/api/inventory/purchase-orders/{po_id}/status",
        json={"status": new_status},
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == new_status

def test_inventory_valuation_report(client, auth_headers, test_product):
    """Test inventory valuation report."""
    # First create a product
    client.post(
        "/api/inventory/products",
        json=SAMPLE_PRODUCT,
        headers=auth_headers
    )
    
    # Get the report
    response = client.get("/api/inventory/reports/inventory-valuation", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total_value" in data
    assert "products" in data

def test_low_stock_report(client, auth_headers):
    """Test low stock report."""
    # Create a product with low stock
    product_data = SAMPLE_PRODUCT.copy()
    product_data["stock_quantity"] = 10
    product_data["reorder_level"] = 20
    
    client.post(
        "/api/inventory/products",
        json=product_data,
        headers=auth_headers
    )
    
    # Get the report
    response = client.get("/api/inventory/reports/low-stock", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "low_stock_items" in data
    assert len(data["low_stock_items"]) > 0 