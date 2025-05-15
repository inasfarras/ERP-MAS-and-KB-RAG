from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Base schemas for common fields
class TimestampMixin(BaseModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# User schemas
class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class User(UserBase, TimestampMixin):
    id: int

    class Config:
        orm_mode = True

# Finance schemas
class AccountBase(BaseModel):
    account_code: str
    name: str
    type: str
    balance: float = 0.0

class AccountCreate(AccountBase):
    pass

class Account(AccountBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

class TransactionBase(BaseModel):
    transaction_date: datetime
    amount: float
    description: str
    type: str
    account_id: int
    order_id: Optional[int] = None
    project_id: Optional[int] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    transaction_date: Optional[datetime] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    type: Optional[str] = None
    account_id: Optional[int] = None
    order_id: Optional[int] = None
    project_id: Optional[int] = None

class Transaction(TransactionBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

class InvoiceBase(BaseModel):
    invoice_number: str
    customer_id: int
    order_id: Optional[int] = None
    amount: float
    tax_amount: float
    total_amount: float
    issue_date: datetime
    due_date: datetime
    status: str

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

# Sales schemas
class CustomerBase(BaseModel):
    name: str
    contact_person: str
    email: str
    phone: str
    address: str
    credit_limit: float = 0.0

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    discount: float = 0.0
    total_price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase, TimestampMixin):
    id: int
    order_id: int
    
    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    order_number: str
    customer_id: int
    order_date: datetime
    required_date: datetime
    shipped_date: Optional[datetime] = None
    status: str
    total_amount: float

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase, TimestampMixin):
    id: int
    order_items: List[OrderItem] = []
    
    class Config:
        orm_mode = True

# Inventory schemas
class ProductBase(BaseModel):
    sku: str
    name: str
    description: str
    category: str
    unit_price: float
    stock_quantity: int = 0
    reorder_level: int = 0
    reorder_quantity: int = 0
    lead_time_days: int = 0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

class InventoryMovementBase(BaseModel):
    product_id: int
    quantity: int
    movement_type: str
    reference: str
    movement_date: datetime

class InventoryMovementCreate(InventoryMovementBase):
    pass

class InventoryMovement(InventoryMovementBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

class SupplierBase(BaseModel):
    name: str
    contact_person: str
    email: str
    phone: str
    address: str

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

class PurchaseOrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    total_price: float

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItem(PurchaseOrderItemBase, TimestampMixin):
    id: int
    purchase_order_id: int
    
    class Config:
        orm_mode = True

class PurchaseOrderBase(BaseModel):
    po_number: str
    supplier_id: int
    order_date: datetime
    expected_delivery_date: datetime
    status: str
    total_amount: float

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]

class PurchaseOrder(PurchaseOrderBase, TimestampMixin):
    id: int
    po_items: List[PurchaseOrderItem] = []
    
    class Config:
        orm_mode = True

class ShipmentBase(BaseModel):
    shipment_number: str
    order_id: int
    shipment_date: datetime
    carrier: str
    tracking_number: str
    status: str

class ShipmentCreate(ShipmentBase):
    pass

class Shipment(ShipmentBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

# Business Process schemas
class ProcessEventBase(BaseModel):
    event_type: str
    description: str
    status: str
    severity: str
    order_id: Optional[int] = None
    purchase_order_id: Optional[int] = None
    project_id: Optional[int] = None
    shipment_id: Optional[int] = None
    created_by: Optional[int] = None
    assigned_to: Optional[int] = None
    resolved_at: Optional[datetime] = None

class ProcessEventCreate(ProcessEventBase):
    pass

class ProcessEvent(ProcessEventBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

class WorkflowRuleBase(BaseModel):
    name: str
    description: str
    entity_type: str
    condition: str
    action: str
    is_active: bool = True

class WorkflowRuleCreate(WorkflowRuleBase):
    pass

class WorkflowRule(WorkflowRuleBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

# Project schemas
class TaskBase(BaseModel):
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    assigned_to: Optional[int] = None
    status: str
    progress: int = 0

class TaskCreate(TaskBase):
    pass

class Task(TaskBase, TimestampMixin):
    id: int
    project_id: int
    
    class Config:
        orm_mode = True

class ProjectBase(BaseModel):
    project_code: str
    name: str
    description: str
    customer_id: Optional[int] = None
    start_date: datetime
    end_date: datetime
    budget: float
    status: str

class ProjectCreate(ProjectBase):
    tasks: Optional[List[TaskCreate]] = None

class Project(ProjectBase, TimestampMixin):
    id: int
    tasks: List[Task] = []
    
    class Config:
        orm_mode = True

# MRP schemas
class BOMItemBase(BaseModel):
    parent_product_id: int
    product_id: int
    quantity: float

class BOMItemCreate(BOMItemBase):
    pass

class BOMItem(BOMItemBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

class ProductionOrderBase(BaseModel):
    order_number: str
    product_id: int
    quantity: int
    start_date: datetime
    end_date: datetime
    status: str

class ProductionOrderCreate(ProductionOrderBase):
    pass

class ProductionOrder(ProductionOrderBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

# Analytics schemas
class ReportBase(BaseModel):
    name: str
    description: str
    report_type: str
    query: str
    parameters: str
    created_by: int

class ReportCreate(ReportBase):
    pass

class Report(ReportBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

class DashboardWidgetBase(BaseModel):
    widget_type: str
    title: str
    configuration: str
    position_x: int
    position_y: int
    width: int
    height: int

class DashboardWidgetCreate(DashboardWidgetBase):
    pass

class DashboardWidget(DashboardWidgetBase, TimestampMixin):
    id: int
    dashboard_id: int
    
    class Config:
        orm_mode = True

class DashboardBase(BaseModel):
    name: str
    description: str
    layout: str
    created_by: int

class DashboardCreate(DashboardBase):
    widgets: Optional[List[DashboardWidgetCreate]] = None

class Dashboard(DashboardBase, TimestampMixin):
    id: int
    widgets: List[DashboardWidget] = []
    
    class Config:
        orm_mode = True

# Extension Point schemas for MAS and KG-RAG
class AgentConfigBase(BaseModel):
    agent_name: str
    agent_type: str
    configuration: str
    is_active: bool = True

class AgentConfigCreate(AgentConfigBase):
    pass

class AgentConfig(AgentConfigBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

class KnowledgeEntityBase(BaseModel):
    entity_type: str
    entity_id: int
    properties: str

class KnowledgeEntityCreate(KnowledgeEntityBase):
    pass

class KnowledgeEntity(KnowledgeEntityBase, TimestampMixin):
    id: int
    
    class Config:
        orm_mode = True

class EntityRelationshipBase(BaseModel):
    source_entity_id: int
    target_entity_id: int
    relationship_type: str
    properties: str

class EntityRelationshipCreate(EntityRelationshipBase):
    pass

class EntityRelationship(EntityRelationshipBase, TimestampMixin):
    class Config:
        orm_mode = True

# API Response schemas
class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
