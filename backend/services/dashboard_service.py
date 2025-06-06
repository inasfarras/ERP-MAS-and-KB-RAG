from collections import defaultdict
from datetime import datetime, timedelta
from typing import List, Dict, Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models
import schemas

router = APIRouter()

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)) -> schemas.DashboardSummary:
    """Aggregate metrics for the main dashboard."""
    # Financial KPIs
    revenue = (
        db.query(func.coalesce(func.sum(models.Transaction.amount), 0))
        .join(models.Account)
        .filter(models.Transaction.type == "credit", models.Account.type == "revenue")
        .scalar()
    )
    expenses = (
        db.query(func.coalesce(func.sum(models.Transaction.amount), 0))
        .join(models.Account)
        .filter(models.Transaction.type == "debit", models.Account.type == "expense")
        .scalar()
    )
    profit = revenue - expenses

    # Active orders (not cancelled)
    active_orders = db.query(models.Order).filter(models.Order.status != "cancelled").count()

    # Low stock items
    low_stock_items = db.query(models.Product).filter(models.Product.stock_quantity <= models.Product.reorder_level).count()

    # Sales trend for last 6 months
    start_date = datetime.utcnow() - timedelta(days=180)
    orders = db.query(models.Order).filter(models.Order.order_date >= start_date).all()
    trend_map: Dict[str, Dict[str, Any]] = defaultdict(lambda: {"month": "", "total_sales": 0.0, "order_count": 0})
    for order in orders:
        key = order.order_date.strftime("%Y-%m")
        bucket = trend_map[key]
        bucket["month"] = key
        bucket["total_sales"] += order.total_amount
        bucket["order_count"] += 1
    sales_trend = [trend_map[k] for k in sorted(trend_map.keys())]

    # Recent notifications (process events)
    events = (
        db.query(models.ProcessEvent)
        .filter(models.ProcessEvent.status == "pending")
        .order_by(models.ProcessEvent.created_at.desc())
        .limit(5)
        .all()
    )
    notifications = [
        {"id": e.id, "message": e.description, "date": e.created_at} for e in events
    ]

    return schemas.DashboardSummary(
        financial_kpis={"total_revenue": revenue, "total_expenses": expenses, "profit_loss": profit},
        active_orders=active_orders,
        low_stock_items=low_stock_items,
        sales_trend=sales_trend,
        notifications=notifications,
    )

