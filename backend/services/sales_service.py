from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
import models
import schemas
from services import inventory_service, process_service

router = APIRouter()

# Customer endpoints
@router.post("/customers", response_model=schemas.Customer)
async def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/customers", response_model=List[schemas.Customer])
async def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    customers = db.query(models.Customer).offset(skip).limit(limit).all()
    return customers

@router.get("/customers/{customer_id}", response_model=schemas.Customer)
async def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/customers/{customer_id}", response_model=schemas.Customer)
async def update_customer(customer_id: int, customer: schemas.CustomerUpdate, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = customer.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)
    
    db.commit()
    db.refresh(db_customer)
    return db_customer

# Order endpoints
@router.post("/orders", response_model=schemas.Order)
async def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Validate customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Create order
    order_data = order.dict(exclude={"items"})
    db_order = models.Order(**order_data)
    db.add(db_order)
    db.flush()  # Get the order ID without committing
    
    # Create order items
    for item in order.items:
        # Validate product exists and has enough stock
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product is None:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
        
        if product.stock_quantity < item.quantity:
            # Create a low stock alert
            process_event = models.ProcessEvent(
                event_type="alert",
                description=f"Low stock for product {product.name} (ID: {product.id}). Required: {item.quantity}, Available: {product.stock_quantity}",
                status="pending",
                severity="high",
                order_id=db_order.id
            )
            db.add(process_event)
        
        # Create order item
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            discount=item.discount,
            total_price=item.total_price
        )
        db.add(db_order_item)
        
        # Update inventory (reduce stock)
        inventory_movement = models.InventoryMovement(
            product_id=item.product_id,
            quantity=-item.quantity,  # Negative for outgoing
            movement_type="out",
            reference=f"Order #{db_order.order_number}",
            movement_date=datetime.now()
        )
        db.add(inventory_movement)
        
        # Update product stock
        product.stock_quantity -= item.quantity
        
        # Check if reorder level is reached
        if product.stock_quantity <= product.reorder_level:
            # Create a reorder alert
            process_event = models.ProcessEvent(
                event_type="alert",
                description=f"Reorder point reached for product {product.name} (ID: {product.id}). Current stock: {product.stock_quantity}, Reorder level: {product.reorder_level}",
                status="pending",
                severity="medium"
            )
            db.add(process_event)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/orders", response_model=List[schemas.Order])
async def get_orders(
    skip: int = 0, 
    limit: int = 100, 
    customer_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Order)
    
    if customer_id:
        query = query.filter(models.Order.customer_id == customer_id)
    if status:
        query = query.filter(models.Order.status == status)
    if start_date:
        query = query.filter(models.Order.order_date >= start_date)
    if end_date:
        query = query.filter(models.Order.order_date <= end_date)
    
    orders = query.offset(skip).limit(limit).all()
    return orders

@router.get("/orders/{order_id}", response_model=schemas.Order)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/orders/{order_id}/status", response_model=schemas.Order)
async def update_order_status(order_id: int, status_update: schemas.StatusUpdate, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    status = status_update.status
    valid_statuses = ["draft", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    # If cancelling an order, restore inventory
    if status == "cancelled" and db_order.status != "cancelled":
        order_items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).all()
        
        for item in order_items:
            # Add inventory back
            inventory_movement = models.InventoryMovement(
                product_id=item.product_id,
                quantity=item.quantity,  # Positive for incoming
                movement_type="in",
                reference=f"Cancelled Order #{db_order.order_number}",
                movement_date=datetime.now()
            )
            db.add(inventory_movement)
            
            # Update product stock
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            if product:
                product.stock_quantity += item.quantity
    
    # If shipping an order, create shipment record
    if status == "shipped" and db_order.status != "shipped":
        shipment = models.Shipment(
            shipment_number=f"SHP-{datetime.now().strftime('%Y%m%d')}-{order_id}",
            order_id=order_id,
            shipment_date=datetime.now(),
            carrier="Default Carrier",  # This would be a parameter in a real system
            tracking_number=f"TRK-{order_id}-{datetime.now().strftime('%Y%m%d%H%M')}",
            status="shipped"
        )
        db.add(shipment)
        db_order.shipped_date = datetime.now()
    
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order

# Sales reporting endpoints
@router.get("/reports/sales-by-customer")
async def get_sales_by_customer(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
):
    # Get all orders in date range
    orders = db.query(models.Order).filter(
        models.Order.order_date >= start_date,
        models.Order.order_date <= end_date,
        models.Order.status != "cancelled"
    ).all()
    
    # Group by customer
    customer_sales = {}
    for order in orders:
        customer_id = order.customer_id
        if customer_id not in customer_sales:
            customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
            customer_sales[customer_id] = {
                "customer_id": customer_id,
                "customer_name": customer.name if customer else "Unknown",
                "order_count": 0,
                "total_sales": 0.0
            }
        
        customer_sales[customer_id]["order_count"] += 1
        customer_sales[customer_id]["total_sales"] += order.total_amount
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "sales_by_customer": list(customer_sales.values())
    }

@router.get("/reports/sales-by-product")
async def get_sales_by_product(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
):
    # Get all order items in date range
    order_items = db.query(models.OrderItem).join(models.Order).filter(
        models.Order.order_date >= start_date,
        models.Order.order_date <= end_date,
        models.Order.status != "cancelled"
    ).all()
    
    # Group by product
    product_sales = {}
    for item in order_items:
        product_id = item.product_id
        if product_id not in product_sales:
            product = db.query(models.Product).filter(models.Product.id == product_id).first()
            product_sales[product_id] = {
                "product_id": product_id,
                "product_name": product.name if product else "Unknown",
                "quantity_sold": 0,
                "total_sales": 0.0
            }
        
        product_sales[product_id]["quantity_sold"] += item.quantity
        product_sales[product_id]["total_sales"] += item.total_price
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "sales_by_product": list(product_sales.values())
    }

@router.get("/reports/sales-trend")
async def get_sales_trend(
    start_date: datetime,
    end_date: datetime,
    interval: str = "month",
    db: Session = Depends(get_db)
):
    # Get all orders in date range
    orders = db.query(models.Order).filter(
        models.Order.order_date >= start_date,
        models.Order.order_date <= end_date,
        models.Order.status != "cancelled"
    ).all()
    
    # Group by time interval
    sales_trend = {}
    
    for order in orders:
        if interval == "day":
            key = order.order_date.strftime("%Y-%m-%d")
        elif interval == "week":
            key = f"{order.order_date.year}-W{order.order_date.isocalendar()[1]}"
        elif interval == "month":
            key = order.order_date.strftime("%Y-%m")
        elif interval == "quarter":
            quarter = (order.order_date.month - 1) // 3 + 1
            key = f"{order.order_date.year}-Q{quarter}"
        elif interval == "year":
            key = str(order.order_date.year)
        else:
            key = order.order_date.strftime("%Y-%m")
        
        if key not in sales_trend:
            sales_trend[key] = {
                "period": key,
                "order_count": 0,
                "total_sales": 0.0
            }
        
        sales_trend[key]["order_count"] += 1
        sales_trend[key]["total_sales"] += order.total_amount
    
    # Sort by period
    sorted_trend = sorted(sales_trend.values(), key=lambda x: x["period"])
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "interval": interval,
        "sales_trend": sorted_trend
    }
