import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app
from models import User, Account
import models
from schemas import UserCreate

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with a fresh database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(db_session):
    """Create a test user for authentication tests."""
    user = User(
        username="testuser",
        email="test@example.com",
        full_name="Test User"
    )
    user.set_password("testpassword")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def test_account(db_session):
    """Create a test account for finance tests."""
    account = Account(
        account_code="TEST001",
        name="Test Account",
        type="asset",
        balance=0.0
    )
    db_session.add(account)
    db_session.commit()
    db_session.refresh(account)
    return account

@pytest.fixture(scope="function")
def test_product(db_session):
    """Create a test product for inventory tests."""
    product = models.Product(
        sku="TESTSKU",
        name="Test Product",
        description="Test Product Description",
        category="Test",
        unit_price=100.0,
        stock_quantity=100,
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product

@pytest.fixture(scope="function")
def test_customer(db_session):
    """Create a test customer for sales tests."""
    customer = models.Customer(
        name="Test Customer",
        contact_person="John Doe",
        email="customer@test.com",
        phone="1234567890",
        address="123 Test St",
        credit_limit=1000.0,
    )
    db_session.add(customer)
    db_session.commit()
    db_session.refresh(customer)
    return customer

@pytest.fixture(scope="function")
def test_supplier(db_session):
    """Create a test supplier for purchase order tests."""
    supplier = models.Supplier(
        name="Test Supplier",
        contact_person="Jane Doe",
        email="supplier@test.com",
        phone="0987654321",
        address="456 Supplier St",
    )
    db_session.add(supplier)
    db_session.commit()
    db_session.refresh(supplier)
    return supplier

@pytest.fixture(scope="function")
def auth_headers(client, test_user):
    """Generate authentication headers for protected endpoints."""
    response = client.post(
        "/token",
        data={"username": test_user.username, "password": "testpassword"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"} 