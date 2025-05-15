from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base
import bcrypt
from datetime import datetime

# User and Authentication Models
class UserRole(enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    FINANCE = "finance"
    SALES = "sales"
    INVENTORY = "inventory"
    PROJECT = "project"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def verify_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.hashed_password.encode('utf-8'))

    def set_password(self, password):
        self.hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Finance and Accounting Models
class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_code = Column(String, unique=True, index=True)
    name = Column(String)
    type = Column(String)  # asset, liability, equity, revenue, expense
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    transactions = relationship("Transaction", back_populates="account")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(DateTime, default=func.now())
    amount = Column(Float)
    description = Column(String)
    type = Column(String)  # debit, credit
    account_id = Column(Integer, ForeignKey("accounts.id"))
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    account = relationship("Account", back_populates="transactions")
    order = relationship("Order", back_populates="transactions")
    project = relationship("Project", back_populates="transactions")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    amount = Column(Float)
    tax_amount = Column(Float)
    total_amount = Column(Float)
    issue_date = Column(DateTime, default=func.now())
    due_date = Column(DateTime)
    status = Column(String)  # draft, sent, paid, overdue
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    customer = relationship("Customer", back_populates="invoices")
    order = relationship("Order", back_populates="invoices")

# Sales and Order Management Models
class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact_person = Column(String)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    credit_limit = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    orders = relationship("Order", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")

class OrderStatus(enum.Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    order_date = Column(DateTime, default=func.now())
    required_date = Column(DateTime)
    shipped_date = Column(DateTime, nullable=True)
    status = Column(String)
    total_amount = Column(Float)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    customer = relationship("Customer", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")
    transactions = relationship("Transaction", back_populates="order")
    invoices = relationship("Invoice", back_populates="order")
    shipments = relationship("Shipment", back_populates="order")
    process_events = relationship("ProcessEvent", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    unit_price = Column(Float)
    discount = Column(Float, default=0.0)
    total_price = Column(Float)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

# Inventory and Supply Chain Models
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    category = Column(String)
    unit_price = Column(Float)
    stock_quantity = Column(Integer, default=0)
    reorder_level = Column(Integer, default=0)
    reorder_quantity = Column(Integer, default=0)
    lead_time_days = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    order_items = relationship("OrderItem", back_populates="product")
    inventory_movements = relationship("InventoryMovement", back_populates="product")
    bom_items = relationship("BOMItem", back_populates="product")
    bom_parents = relationship("BOMItem", foreign_keys="BOMItem.parent_product_id", back_populates="parent_product")

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    movement_type = Column(String)  # in, out, adjustment
    reference = Column(String)  # order number, adjustment reason, etc.
    movement_date = Column(DateTime, default=func.now())
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="inventory_movements")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact_person = Column(String)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String, unique=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    order_date = Column(DateTime, default=func.now())
    expected_delivery_date = Column(DateTime)
    status = Column(String)  # draft, sent, received, cancelled
    total_amount = Column(Float)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    supplier = relationship("Supplier", back_populates="purchase_orders")
    po_items = relationship("PurchaseOrderItem", back_populates="purchase_order")
    process_events = relationship("ProcessEvent", back_populates="purchase_order")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    unit_price = Column(Float)
    total_price = Column(Float)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    purchase_order = relationship("PurchaseOrder", back_populates="po_items")
    product = relationship("Product")

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    shipment_number = Column(String, unique=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    shipment_date = Column(DateTime)
    carrier = Column(String)
    tracking_number = Column(String)
    status = Column(String)  # preparing, shipped, delivered, delayed
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    order = relationship("Order", back_populates="shipments")
    process_events = relationship("ProcessEvent", back_populates="shipment")

# Business Process Controls Models
class ProcessEvent(Base):
    __tablename__ = "process_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String)  # alert, notification, approval, etc.
    description = Column(Text)
    status = Column(String)  # pending, resolved, approved, rejected
    severity = Column(String)  # low, medium, high
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime, nullable=True)

    order = relationship("Order", back_populates="process_events")
    purchase_order = relationship("PurchaseOrder", back_populates="process_events")
    project = relationship("Project", back_populates="process_events")
    shipment = relationship("Shipment", back_populates="process_events")
    creator = relationship("User", foreign_keys=[created_by])
    assignee = relationship("User", foreign_keys=[assigned_to])

class WorkflowRule(Base):
    __tablename__ = "workflow_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    entity_type = Column(String)  # order, inventory, project, etc.
    condition = Column(Text)  # JSON or serialized condition
    action = Column(Text)  # JSON or serialized action
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

# Project and Job Management Models
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_code = Column(String, unique=True, index=True)
    name = Column(String)
    description = Column(Text)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    budget = Column(Float)
    status = Column(String)  # planning, active, on-hold, completed
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    customer = relationship("Customer")
    tasks = relationship("Task", back_populates="project")
    transactions = relationship("Transaction", back_populates="project")
    process_events = relationship("ProcessEvent", back_populates="project")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String)
    description = Column(Text)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String)  # not-started, in-progress, completed, delayed
    progress = Column(Integer, default=0)  # 0-100%
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User")

# Material Requirements Planning (MRP) Models
class BOMItem(Base):
    __tablename__ = "bom_items"

    id = Column(Integer, primary_key=True, index=True)
    parent_product_id = Column(Integer, ForeignKey("products.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    parent_product = relationship("Product", foreign_keys=[parent_product_id], back_populates="bom_parents")
    product = relationship("Product", foreign_keys=[product_id], back_populates="bom_items")

class ProductionOrder(Base):
    __tablename__ = "production_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String)  # planned, in-progress, completed, cancelled
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    product = relationship("Product")

# Business Intelligence and Analytics Models
class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    report_type = Column(String)  # financial, inventory, sales, etc.
    query = Column(Text)  # SQL query or report definition
    parameters = Column(Text)  # JSON parameters
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    creator = relationship("User")

class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    layout = Column(Text)  # JSON layout configuration
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    creator = relationship("User")
    widgets = relationship("DashboardWidget", back_populates="dashboard")

class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"

    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id"))
    widget_type = Column(String)  # chart, table, metric, etc.
    title = Column(String)
    configuration = Column(Text)  # JSON configuration
    position_x = Column(Integer)
    position_y = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    dashboard = relationship("Dashboard", back_populates="widgets")

# Extension Points for Future MAS and KG-RAG Integration
class AgentConfig(Base):
    __tablename__ = "agent_configs"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String, unique=True)
    agent_type = Column(String)  # reasoning, retrieval, task, etc.
    configuration = Column(Text)  # JSON configuration
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class KnowledgeEntity(Base):
    __tablename__ = "knowledge_entities"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String)  # product, customer, supplier, etc.
    entity_id = Column(Integer)  # ID in the respective table
    properties = Column(Text)  # JSON properties for KG
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

# Association table for entity relationships in Knowledge Graph
entity_relationships = Table(
    "entity_relationships",
    Base.metadata,
    Column("source_entity_id", Integer, ForeignKey("knowledge_entities.id"), primary_key=True),
    Column("target_entity_id", Integer, ForeignKey("knowledge_entities.id"), primary_key=True),
    Column("relationship_type", String, primary_key=True),
    Column("properties", Text),  # JSON properties for the relationship
    Column("created_at", DateTime, default=func.now()),
)
