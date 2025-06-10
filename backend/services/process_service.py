from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json

from database import get_db
import models
import schemas

router = APIRouter()

# Process Event endpoints
@router.post("/events", response_model=schemas.ProcessEvent, status_code=status.HTTP_201_CREATED)
async def create_process_event(event: schemas.ProcessEventCreate, db: Session = Depends(get_db)):
    db_event = models.ProcessEvent(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/events", response_model=List[schemas.ProcessEvent])
async def get_process_events(
    skip: int = 0, 
    limit: int = 100, 
    event_type: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    order_id: Optional[int] = None,
    purchase_order_id: Optional[int] = None,
    project_id: Optional[int] = None,
    shipment_id: Optional[int] = None,
    assigned_to: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.ProcessEvent)
    
    if event_type:
        query = query.filter(models.ProcessEvent.event_type == event_type)
    if status:
        query = query.filter(models.ProcessEvent.status == status)
    if severity:
        query = query.filter(models.ProcessEvent.severity == severity)
    if order_id:
        query = query.filter(models.ProcessEvent.order_id == order_id)
    if purchase_order_id:
        query = query.filter(models.ProcessEvent.purchase_order_id == purchase_order_id)
    if project_id:
        query = query.filter(models.ProcessEvent.project_id == project_id)
    if shipment_id:
        query = query.filter(models.ProcessEvent.shipment_id == shipment_id)
    if assigned_to:
        query = query.filter(models.ProcessEvent.assigned_to == assigned_to)
    if start_date:
        query = query.filter(models.ProcessEvent.created_at >= start_date)
    if end_date:
        query = query.filter(models.ProcessEvent.created_at <= end_date)
    
    events = query.offset(skip).limit(limit).all()
    return events

@router.get("/events/{event_id}", response_model=schemas.ProcessEvent)
async def get_process_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.ProcessEvent).filter(models.ProcessEvent.id == event_id).first()
    if event is None:
        raise HTTPException(status_code=404, detail="Process Event not found")
    return event

@router.put("/events/{event_id}/status", response_model=schemas.ProcessEvent)
async def update_process_event_status(
    event_id: int, 
    status: str, 
    assigned_to: Optional[int] = None,
    db: Session = Depends(get_db)
):
    db_event = db.query(models.ProcessEvent).filter(models.ProcessEvent.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Process Event not found")
    
    valid_statuses = ["pending", "in-progress", "resolved", "approved", "rejected"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    db_event.status = status
    
    if assigned_to:
        # Validate user exists
        user = db.query(models.User).filter(models.User.id == assigned_to).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        db_event.assigned_to = assigned_to
    
    if status in ["resolved", "approved", "rejected"]:
        db_event.resolved_at = datetime.now()
    
    db.commit()
    db.refresh(db_event)
    return db_event

# Workflow Rule endpoints
@router.post("/workflow-rules", response_model=schemas.WorkflowRule, status_code=status.HTTP_201_CREATED)
async def create_workflow_rule(rule: schemas.WorkflowRuleCreate, db: Session = Depends(get_db)):
    # Validate condition and action JSON
    try:
        json.loads(rule.condition)
        json.loads(rule.action)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Condition and action must be valid JSON")
    
    db_rule = models.WorkflowRule(**rule.dict())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

@router.get("/workflow-rules", response_model=List[schemas.WorkflowRule])
async def get_workflow_rules(
    skip: int = 0, 
    limit: int = 100, 
    entity_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.WorkflowRule)
    
    if entity_type:
        query = query.filter(models.WorkflowRule.entity_type == entity_type)
    if is_active is not None:
        query = query.filter(models.WorkflowRule.is_active == is_active)
    
    rules = query.offset(skip).limit(limit).all()
    return rules

@router.get("/workflow-rules/{rule_id}", response_model=schemas.WorkflowRule)
async def get_workflow_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(models.WorkflowRule).filter(models.WorkflowRule.id == rule_id).first()
    if rule is None:
        raise HTTPException(status_code=404, detail="Workflow Rule not found")
    return rule

@router.put("/workflow-rules/{rule_id}", response_model=schemas.WorkflowRule)
async def update_workflow_rule(rule_id: int, rule: schemas.WorkflowRuleCreate, db: Session = Depends(get_db)):
    db_rule = db.query(models.WorkflowRule).filter(models.WorkflowRule.id == rule_id).first()
    if db_rule is None:
        raise HTTPException(status_code=404, detail="Workflow Rule not found")
    
    # Validate condition and action JSON
    try:
        json.loads(rule.condition)
        json.loads(rule.action)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Condition and action must be valid JSON")
    
    for key, value in rule.dict().items():
        setattr(db_rule, key, value)
    
    db.commit()
    db.refresh(db_rule)
    return db_rule

@router.put("/workflow-rules/{rule_id}/toggle", response_model=schemas.WorkflowRule)
async def toggle_workflow_rule(rule_id: int, db: Session = Depends(get_db)):
    db_rule = db.query(models.WorkflowRule).filter(models.WorkflowRule.id == rule_id).first()
    if db_rule is None:
        raise HTTPException(status_code=404, detail="Workflow Rule not found")
    
    db_rule.is_active = not db_rule.is_active
    db.commit()
    db.refresh(db_rule)
    return db_rule

# Process monitoring endpoints
@router.get("/monitoring/alerts")
async def get_active_alerts(
    severity: Optional[str] = None,
    entity_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.ProcessEvent).filter(
        models.ProcessEvent.event_type == "alert",
        models.ProcessEvent.status.in_(["pending", "in-progress"])
    )
    
    if severity:
        query = query.filter(models.ProcessEvent.severity == severity)
    
    if entity_type:
        if entity_type == "order":
            query = query.filter(models.ProcessEvent.order_id.isnot(None))
        elif entity_type == "purchase_order":
            query = query.filter(models.ProcessEvent.purchase_order_id.isnot(None))
        elif entity_type == "project":
            query = query.filter(models.ProcessEvent.project_id.isnot(None))
        elif entity_type == "shipment":
            query = query.filter(models.ProcessEvent.shipment_id.isnot(None))
    
    alerts = query.all()
    
    # Group by severity
    result = {
        "high": [],
        "medium": [],
        "low": []
    }
    
    for alert in alerts:
        alert_data = {
            "id": alert.id,
            "description": alert.description,
            "status": alert.status,
            "created_at": alert.created_at,
            "entity_type": None,
            "entity_id": None
        }
        
        if alert.order_id:
            alert_data["entity_type"] = "order"
            alert_data["entity_id"] = alert.order_id
        elif alert.purchase_order_id:
            alert_data["entity_type"] = "purchase_order"
            alert_data["entity_id"] = alert.purchase_order_id
        elif alert.project_id:
            alert_data["entity_type"] = "project"
            alert_data["entity_id"] = alert.project_id
        elif alert.shipment_id:
            alert_data["entity_type"] = "shipment"
            alert_data["entity_id"] = alert.shipment_id
        
        result[alert.severity].append(alert_data)
    
    return {
        "total_alerts": len(alerts),
        "high_priority": len(result["high"]),
        "medium_priority": len(result["medium"]),
        "low_priority": len(result["low"]),
        "alerts": result
    }

@router.get("/monitoring/delayed-shipments")
async def get_delayed_shipments(db: Session = Depends(get_db)):
    # Get shipments that are delayed
    delayed_shipments = db.query(models.Shipment).filter(
        models.Shipment.status == "delayed"
    ).all()
    
    result = []
    for shipment in delayed_shipments:
        order = db.query(models.Order).filter(models.Order.id == shipment.order_id).first()
        
        if order:
            customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
            
            result.append({
                "shipment_id": shipment.id,
                "shipment_number": shipment.shipment_number,
                "order_id": order.id,
                "order_number": order.order_number,
                "customer_id": customer.id if customer else None,
                "customer_name": customer.name if customer else "Unknown",
                "shipment_date": shipment.shipment_date,
                "carrier": shipment.carrier,
                "tracking_number": shipment.tracking_number
            })
    
    return {
        "delayed_count": len(result),
        "shipments": result
    }

@router.get("/monitoring/process-performance")
async def get_process_performance(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
):
    # Get all resolved events in date range
    resolved_events = db.query(models.ProcessEvent).filter(
        models.ProcessEvent.created_at >= start_date,
        models.ProcessEvent.created_at <= end_date,
        models.ProcessEvent.resolved_at.isnot(None)
    ).all()
    
    # Calculate resolution times
    total_resolution_time = timedelta()
    event_counts = {
        "alert": 0,
        "notification": 0,
        "approval": 0,
        "other": 0
    }
    
    for event in resolved_events:
        resolution_time = event.resolved_at - event.created_at
        total_resolution_time += resolution_time
        
        event_type = event.event_type if event.event_type in event_counts else "other"
        event_counts[event_type] += 1
    
    avg_resolution_time = total_resolution_time / len(resolved_events) if resolved_events else timedelta()
    
    # Get pending events
    pending_events = db.query(models.ProcessEvent).filter(
        models.ProcessEvent.status.in_(["pending", "in-progress"]),
        models.ProcessEvent.created_at >= start_date,
        models.ProcessEvent.created_at <= end_date
    ).count()
    
    # Get total events
    total_events = db.query(models.ProcessEvent).filter(
        models.ProcessEvent.created_at >= start_date,
        models.ProcessEvent.created_at <= end_date
    ).count()
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_events": total_events,
        "resolved_events": len(resolved_events),
        "pending_events": pending_events,
        "resolution_rate": len(resolved_events) / total_events if total_events > 0 else 0,
        "avg_resolution_time_hours": avg_resolution_time.total_seconds() / 3600,
        "event_breakdown": event_counts
    }
