import random
from datetime import datetime

from sqlalchemy.exc import IntegrityError

from database import SessionLocal, engine, Base
from models import (
    User,
    Customer,
    Supplier,
    Product,
    InventoryMovement,
    Account,
)

# ---------- helper seeding functions ---------- #

def seed_users(session):
    if session.query(User).count() > 0:
        return

    users = []
    admin = User(
        username="admin",
        email="admin@example.com",
        full_name="Administrator",
        role="admin",
    )
    admin.set_password("adminpass")
    users.append(admin)

    sales = User(
        username="sales_mgr",
        email="sales@example.com",
        full_name="Sales Manager",
        role="sales",
    )
    sales.set_password("salespass")
    users.append(sales)

    inventory = User(
        username="inv_mgr",
        email="inventory@example.com",
        full_name="Inventory Manager",
        role="inventory",
    )
    inventory.set_password("invpass")
    users.append(inventory)

    session.add_all(users)
    print(f"Seeded {len(users)} users.")


def seed_customers(session):
    if session.query(Customer).count() > 0:
        return

    customers_data = [
        ("Acme Corp", "Alice", "alice@acme.com", "+1-202-555-0100", "123 Main St, Metropolis"),
        ("Globex", "Bob", "bob@globex.com", "+1-202-555-0111", "456 Industrial Rd, Springfield"),
        ("Initech", "Carol", "carol@initech.com", "+1-202-555-0122", "789 Business Ave, Silicon Valley"),
        ("Umbrella", "Dave", "dave@umbrella.com", "+1-202-555-0133", "321 Pharma Dr, Raccoon City"),
        ("Soylent", "Eve", "eve@soylent.com", "+1-202-555-0144", "654 Nutrition St, Los Angeles"),
    ]

    customers = [
        Customer(
            name=name,
            contact_person=cp,
            email=email,
            phone=phone,
            address=addr,
            credit_limit=50000.0,
        )
        for name, cp, email, phone, addr in customers_data
    ]
    session.add_all(customers)
    print(f"Seeded {len(customers)} customers.")


def seed_suppliers(session):
    if session.query(Supplier).count() > 0:
        return

    suppliers_data = [
        ("Parts Unlimited", "Frank", "frank@partsunltd.com", "+1-404-555-0155", "77 Supply Ln, Detroit"),
        ("MegaManufacturing", "Grace", "grace@mega.com", "+1-404-555-0166", "88 Factory Rd, Houston"),
        ("Gadgets Inc.", "Heidi", "heidi@gadgets.com", "+1-404-555-0177", "99 Tech Blvd, Austin"),
        ("Raw Materials Co", "Ivan", "ivan@rawmat.com", "+1-404-555-0188", "100 Quarry St, Denver"),
        ("PackagePro", "Judy", "judy@pkgpro.com", "+1-404-555-0199", "200 Packaging Pkwy, Atlanta"),
    ]

    suppliers = [
        Supplier(
            name=name,
            contact_person=cp,
            email=email,
            phone=phone,
            address=addr,
        )
        for name, cp, email, phone, addr in suppliers_data
    ]
    session.add_all(suppliers)
    print(f"Seeded {len(suppliers)} suppliers.")


def seed_products(session):
    if session.query(Product).count() > 0:
        return

    sample_products = [
        ("SKU-001", "Widget A", "Standard widget", "Widgets", 9.99, 100),
        ("SKU-002", "Widget B", "Premium widget", "Widgets", 14.99, 50),
        ("SKU-003", "Gadget X", "Basic gadget", "Gadgets", 19.99, 200),
        ("SKU-004", "Gadget Y", "Advanced gadget", "Gadgets", 29.99, 150),
        ("SKU-005", "Component 1", "Electronic component", "Components", 1.99, 1000),
        ("SKU-006", "Component 2", "Mechanical component", "Components", 2.49, 800),
        ("SKU-007", "Accessory Alpha", "Accessory for Widget A", "Accessories", 4.99, 300),
        ("SKU-008", "Accessory Beta", "Accessory for Widget B", "Accessories", 5.49, 250),
        ("SKU-009", "Spare Part S", "Spare part", "Spare Parts", 0.99, 500),
        ("SKU-010", "Spare Part T", "Spare part", "Spare Parts", 1.49, 450),
    ]

    products = [
        Product(
            sku=sku,
            name=name,
            description=desc,
            category=cat,
            unit_price=price,
            stock_quantity=qty,
            reorder_level=int(qty * 0.2),
            reorder_quantity=int(qty * 0.5),
            lead_time_days=random.randint(5, 20),
        )
        for sku, name, desc, cat, price, qty in sample_products
    ]
    session.add_all(products)
    session.flush()  # obtain IDs for inventory movements

    movements = [
        InventoryMovement(
            product_id=p.id,
            quantity=p.stock_quantity,
            movement_type="in",
            reference="initial stock",
            movement_date=datetime.utcnow(),
        )
        for p in products
    ]
    session.add_all(movements)

    print(f"Seeded {len(products)} products & inventory movements.")


def seed_accounts(session):
    if session.query(Account).count() > 0:
        return

    accounts_data = [
        ("1000", "Cash", "asset"),
        ("2000", "Accounts Payable", "liability"),
        ("3000", "Equity", "equity"),
        ("4000", "Sales Revenue", "revenue"),
        ("5000", "Cost of Goods Sold", "expense"),
    ]

    accounts = [
        Account(account_code=code, name=name, type=typ, balance=0.0)
        for code, name, typ in accounts_data
    ]
    session.add_all(accounts)
    print(f"Seeded {len(accounts)} accounts.")


# ---------- main entry ---------- #

def main():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        seed_users(session)
        seed_customers(session)
        seed_suppliers(session)
        seed_products(session)
        seed_accounts(session)

        session.commit()
        print("Seeding completed successfully ✔️")
    except IntegrityError as exc:
        session.rollback()
        print("Integrity error while seeding:", exc.orig)
    except Exception as exc:
        session.rollback()
        print("Unexpected error while seeding:", exc)
    finally:
        session.close()


if __name__ == "__main__":
    main() 