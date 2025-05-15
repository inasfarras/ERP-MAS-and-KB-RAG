from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
import models
import schemas
from services import process_service

router = APIRouter()

# Product endpoints
@router.post("/products", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/products", response_model=List[schemas.Product])
async def get_products(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None,
    low_stock: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)
    
    if category:
        query = query.filter(models.Product.category == category)
    if low_stock:
        query = query.filter(models.Product.stock_quantity <= models.Product.reorder_level)
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/products/{product_id}", response_model=schemas.Product)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/products/{product_id}", response_model=schemas.Product)
async def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

# Inventory Movement endpoints
@router.post("/movements", response_model=schemas.InventoryMovement)
async def create_inventory_movement(movement: schemas.InventoryMovementCreate, db: Session = Depends(get_db)):
    # Validate product exists
    product = db.query(models.Product).filter(models.Product.id == movement.product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Create inventory movement
    db_movement = models.InventoryMovement(**movement.dict())
    db.add(db_movement)
    
    # Update product stock
    if movement.movement_type == "in":
        product.stock_quantity += movement.quantity
    elif movement.movement_type == "out":
        if product.stock_quantity < movement.quantity:
            # Create a low stock alert
            process_event = models.ProcessEvent(
                event_type="alert",
                description=f"Insufficient stock for product {product.name} (ID: {product.id}). Required: {movement.quantity}, Available: {product.stock_quantity}",
                status="pending",
                severity="high"
            )
            db.add(process_event)
            raise HTTPException(status_code=400, detail="Insufficient stock")
        
        product.stock_quantity -= movement.quantity
    elif movement.movement_type == "adjustment":
        product.stock_quantity = movement.quantity
    
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
    db.refresh(db_movement)
    return db_movement

@router.get("/movements", response_model=List[schemas.InventoryMovement])
async def get_inventory_movements(
    skip: int = 0, 
    limit: int = 100, 
    product_id: Optional[int] = None,
    movement_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.InventoryMovement)
    
    if product_id:
        query = query.filter(models.InventoryMovement.product_id == product_id)
    if movement_type:
        query = query.filter(models.InventoryMovement.movement_type == movement_type)
    if start_date:
        query = query.filter(models.InventoryMovement.movement_date >= start_date)
    if end_date:
        query = query.filter(models.InventoryMovement.movement_date <= end_date)
    
    movements = query.offset(skip).limit(limit).all()
    return movements

# Supplier endpoints
@router.post("/suppliers", response_model=schemas.Supplier)
async def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    db_supplier = models.Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.get("/suppliers", response_model=List[schemas.Supplier])
async def get_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    suppliers = db.query(models.Supplier).offset(skip).limit(limit).all()
    return suppliers

@router.get("/suppliers/{supplier_id}", response_model=schemas.Supplier)
async def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

# Purchase Order endpoints
@router.post("/purchase-orders", response_model=schemas.PurchaseOrder)
async def create_purchase_order(purchase_order: schemas.PurchaseOrderCreate, db: Session = Depends(get_db)):
    # Validate supplier exists
    supplier = db.query(models.Supplier).filter(models.Supplier.id == purchase_order.supplier_id).first()
    if supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Create purchase order
    po_data = purchase_order.dict(exclude={"items"})
    db_po = models.PurchaseOrder(**po_data)
    db.add(db_po)
    db.flush()  # Get the PO ID without committing
    
    # Create PO items
    for item in purchase_order.items:
        # Validate product exists
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product is None:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
        
        # Create PO item
        db_po_item = models.PurchaseOrderItem(
            purchase_order_id=db_po.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price
        )
        db.add(db_po_item)
    
    db.commit()
    db.refresh(db_po)
    return db_po

@router.get("/purchase-orders", response_model=List[schemas.PurchaseOrder])
async def get_purchase_orders(
    skip: int = 0, 
    limit: int = 100, 
    supplier_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.PurchaseOrder)
    
    if supplier_id:
        query = query.filter(models.PurchaseOrder.supplier_id == supplier_id)
    if status:
        query = query.filter(models.PurchaseOrder.status == status)
    if start_date:
        query = query.filter(models.PurchaseOrder.order_date >= start_date)
    if end_date:
        query = query.filter(models.PurchaseOrder.order_date <= end_date)
    
    purchase_orders = query.offset(skip).limit(limit).all()
    return purchase_orders

@router.put("/purchase-orders/{po_id}/status", response_model=schemas.PurchaseOrder)
async def update_purchase_order_status(po_id: int, status: str, db: Session = Depends(get_db)):
    db_po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if db_po is None:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    
    valid_statuses = ["draft", "sent", "received", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    # If receiving a purchase order, update inventory
    if status == "received" and db_po.status != "received":
        po_items = db.query(models.PurchaseOrderItem).filter(models.PurchaseOrderItem.purchase_order_id == po_id).all()
        
        for item in po_items:
            # Add inventory
            inventory_movement = models.InventoryMovement(
                product_id=item.product_id,
                quantity=item.quantity,
                movement_type="in",
                reference=f"PO #{db_po.po_number}",
                movement_date=datetime.now()
            )
            db.add(inventory_movement)
            
            # Update product stock
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            if product:
                product.stock_quantity += item.quantity
    
    db_po.status = status
    db.commit()
    db.refresh(db_po)
    return db_po

# Inventory reporting endpoints
@router.get("/reports/inventory-valuation")
async def get_inventory_valuation(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    
    total_valuation = 0.0
    product_valuations = []
    
    for product in products:
        valuation = product.stock_quantity * product.unit_price
        total_valuation += valuation
        
        product_valuations.append({
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "stock_quantity": product.stock_quantity,
            "unit_price": product.unit_price,
            "valuation": valuation
        })
    
    return {
        "total_valuation": total_valuation,
        "products": product_valuations
    }

@router.get("/reports/stock-movements")
async def get_stock_movements(
    start_date: datetime,
    end_date: datetime,
    product_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.InventoryMovement).filter(
        models.InventoryMovement.movement_date >= start_date,
        models.InventoryMovement.movement_date <= end_date
    )
    
    if product_id:
        query = query.filter(models.InventoryMovement.product_id == product_id)
    
    movements = query.all()
    
    # Group by product
    product_movements = {}
    for movement in movements:
        product_id = movement.product_id
        if product_id not in product_movements:
            product = db.query(models.Product).filter(models.Product.id == product_id).first()
            product_movements[product_id] = {
                "product_id": product_id,
                "product_name": product.name if product else "Unknown",
                "starting_stock": 0,  # Will calculate this
                "in_quantity": 0,
                "out_quantity": 0,
                "adjustment_quantity": 0,
                "ending_stock": product.stock_quantity if product else 0,
                "movements": []
            }
        
        # Add to totals
        if movement.movement_type == "in":
            product_movements[product_id]["in_quantity"] += movement.quantity
        elif movement.movement_type == "out":
            product_movements[product_id]["out_quantity"] += movement.quantity
        elif movement.movement_type == "adjustment":
            product_movements[product_id]["adjustment_quantity"] += movement.quantity
        
        # Add to movements list
        product_movements[product_id]["movements"].append({
            "id": movement.id,
            "date": movement.movement_date,
            "type": movement.movement_type,
            "quantity": movement.quantity,
            "reference": movement.reference
        })
    
    # Calculate starting stock for each product
    for product_id, data in product_movements.items():
        # Starting stock = ending stock - ins + outs - adjustments
        data["starting_stock"] = (
            data["ending_stock"] - 
            data["in_quantity"] + 
            data["out_quantity"] - 
            data["adjustment_quantity"]
        )
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "product_movements": list(product_movements.values())
    }

@router.get("/reports/low-stock")
async def get_low_stock_report(db: Session = Depends(get_db)):
    low_stock_products = db.query(models.Product).filter(
        models.Product.stock_quantity <= models.Product.reorder_level
    ).all()
    
    result = []
    for product in low_stock_products:
        days_to_stockout = None
        
        # Calculate average daily usage over the last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        outgoing_movements = db.query(models.InventoryMovement).filter(
            models.InventoryMovement.product_id == product.id,
            models.InventoryMovement.movement_type == "out",
            models.InventoryMovement.movement_date >= thirty_days_ago
        ).all()
        
        total_outgoing = sum(movement.quantity for movement in outgoing_movements)
        avg_daily_usage = total_outgoing / 30 if total_outgoing > 0 else 0
        
        if avg_daily_usage > 0:
            days_to_stockout = product.stock_quantity / avg_daily_usage
        
        result.append({
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "stock_quantity": product.stock_quantity,
            "reorder_level": product.reorder_level,
            "reorder_quantity": product.reorder_quantity,
            "days_to_stockout": days_to_stockout,
            "status": "Out of Stock" if product.stock_quantity == 0 else "Low Stock"
        })
    
    return {
        "low_stock_count": len(result),
        "products": result
    }
