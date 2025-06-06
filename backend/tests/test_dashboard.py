import pytest
from fastapi import status


def test_dashboard_summary(client, auth_headers):
    response = client.get("/api/dashboard/summary", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "financial_kpis" in data
    assert "active_orders" in data
    assert "low_stock_items" in data
    assert "sales_trend" in data
    assert "notifications" in data

