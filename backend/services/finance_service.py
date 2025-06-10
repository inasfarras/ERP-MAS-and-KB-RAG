from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
import models
import schemas

router = APIRouter()

# Accounts endpoints
@router.post("/accounts", response_model=schemas.Account, status_code=status.HTTP_201_CREATED)
async def create_account(account: schemas.AccountCreate, db: Session = Depends(get_db)):
    db_account = models.Account(**account.dict())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.get("/accounts", response_model=List[schemas.Account])
async def get_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    accounts = db.query(models.Account).offset(skip).limit(limit).all()
    return accounts

@router.get("/accounts/{account_id}", response_model=schemas.Account)
async def get_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/accounts/{account_id}", response_model=schemas.Account)
async def update_account(account_id: int, account: schemas.AccountCreate, db: Session = Depends(get_db)):
    db_account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    
    for key, value in account.dict().items():
        setattr(db_account, key, value)
    
    db.commit()
    db.refresh(db_account)
    return db_account

# Transactions endpoints
@router.post("/transactions", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
async def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    # Validate account exists
    account = db.query(models.Account).filter(models.Account.id == transaction.account_id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Create transaction
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    
    # Update account balance
    if transaction.type == "credit":
        account.balance += transaction.amount
    elif transaction.type == "debit":
        account.balance -= transaction.amount
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/transactions", response_model=List[schemas.Transaction])
async def get_transactions(
    skip: int = 0, 
    limit: int = 100, 
    account_id: Optional[int] = None,
    order_id: Optional[int] = None,
    project_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction)
    
    if account_id:
        query = query.filter(models.Transaction.account_id == account_id)
    if order_id:
        query = query.filter(models.Transaction.order_id == order_id)
    if project_id:
        query = query.filter(models.Transaction.project_id == project_id)
    if start_date:
        query = query.filter(models.Transaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.transaction_date <= end_date)
    
    transactions = query.offset(skip).limit(limit).all()
    return transactions

@router.get("/transactions/{transaction_id}", response_model=schemas.Transaction)
async def get_transaction_by_id(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.put("/transactions/{transaction_id}", response_model=schemas.Transaction)
async def update_transaction(transaction_id: int, transaction: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Get the current transaction data
    current_data = {
        "transaction_date": db_transaction.transaction_date,
        "amount": db_transaction.amount,
        "description": db_transaction.description,
        "type": db_transaction.type,
        "account_id": db_transaction.account_id,
        "order_id": db_transaction.order_id,
        "project_id": db_transaction.project_id
    }
    
    # Update only the fields that are provided
    update_data = transaction.dict(exclude_unset=True)
    current_data.update(update_data)
    
    # Validate account exists if account_id is being updated
    if "account_id" in update_data:
        account = db.query(models.Account).filter(models.Account.id == current_data["account_id"]).first()
        if account is None:
            raise HTTPException(status_code=404, detail="Account not found")
    else:
        account = db.query(models.Account).filter(models.Account.id == db_transaction.account_id).first()
    
    # Update transaction
    for key, value in current_data.items():
        setattr(db_transaction, key, value)
    
    # Update account balance
    if "amount" in update_data or "type" in update_data:
        # Reverse the old transaction effect
        if db_transaction.type == "credit":
            account.balance -= db_transaction.amount
        elif db_transaction.type == "debit":
            account.balance += db_transaction.amount
        
        # Apply the new transaction effect
        if current_data["type"] == "credit":
            account.balance += current_data["amount"]
        elif current_data["type"] == "debit":
            account.balance -= current_data["amount"]
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update account balance
    account = db.query(models.Account).filter(models.Account.id == db_transaction.account_id).first()
    if account is not None:
        if db_transaction.type == "credit":
            account.balance -= db_transaction.amount
        elif db_transaction.type == "debit":
            account.balance += db_transaction.amount
    
    db.delete(db_transaction)
    db.commit()
    return None

# Invoices endpoints
@router.post("/invoices", response_model=schemas.Invoice, status_code=status.HTTP_201_CREATED)
async def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    # Validate customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == invoice.customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Validate order if provided
    if invoice.order_id:
        order = db.query(models.Order).filter(models.Order.id == invoice.order_id).first()
        if order is None:
            raise HTTPException(status_code=404, detail="Order not found")
    
    db_invoice = models.Invoice(**invoice.dict())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.get("/invoices", response_model=List[schemas.Invoice])
async def get_invoices(
    skip: int = 0, 
    limit: int = 100, 
    customer_id: Optional[int] = None,
    order_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Invoice)
    
    if customer_id:
        query = query.filter(models.Invoice.customer_id == customer_id)
    if order_id:
        query = query.filter(models.Invoice.order_id == order_id)
    if status:
        query = query.filter(models.Invoice.status == status)
    if start_date:
        query = query.filter(models.Invoice.issue_date >= start_date)
    if end_date:
        query = query.filter(models.Invoice.issue_date <= end_date)
    
    invoices = query.offset(skip).limit(limit).all()
    return invoices

@router.put("/invoices/{invoice_id}/status", response_model=schemas.Invoice)
async def update_invoice_status(invoice_id: int, status_update: schemas.StatusUpdate, db: Session = Depends(get_db)):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")

    status = status_update.status
    valid_statuses = ["draft", "sent", "paid", "overdue"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    db_invoice.status = status
    
    # If status is paid, create a transaction
    if status == "paid":
        # Create a credit transaction for the invoice amount
        transaction = models.Transaction(
            transaction_date=datetime.now(),
            amount=db_invoice.total_amount,
            description=f"Payment for invoice #{db_invoice.invoice_number}",
            type="credit",
            account_id=1,  # Assuming account ID 1 is Accounts Receivable
            order_id=db_invoice.order_id
        )
        db.add(transaction)
    
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

# Financial reporting endpoints
@router.get("/reports/income-statement")
async def get_income_statement(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
):
    # Get revenue (credit transactions for revenue accounts)
    revenue_accounts = db.query(models.Account).filter(models.Account.type == "revenue").all()
    revenue_account_ids = [account.id for account in revenue_accounts]
    
    revenue_transactions = db.query(models.Transaction).filter(
        models.Transaction.account_id.in_(revenue_account_ids),
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date,
        models.Transaction.type == "credit"
    ).all()
    
    total_revenue = sum(transaction.amount for transaction in revenue_transactions)
    
    # Get expenses (debit transactions for expense accounts)
    expense_accounts = db.query(models.Account).filter(models.Account.type == "expense").all()
    expense_account_ids = [account.id for account in expense_accounts]
    
    expense_transactions = db.query(models.Transaction).filter(
        models.Transaction.account_id.in_(expense_account_ids),
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date,
        models.Transaction.type == "debit"
    ).all()
    
    total_expenses = sum(transaction.amount for transaction in expense_transactions)
    
    # Calculate net income
    net_income = total_revenue - total_expenses
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "net_income": net_income,
        "revenue_breakdown": [
            {"account_id": account.id, "account_name": account.name, "amount": sum(t.amount for t in revenue_transactions if t.account_id == account.id)}
            for account in revenue_accounts
        ],
        "expense_breakdown": [
            {"account_id": account.id, "account_name": account.name, "amount": sum(t.amount for t in expense_transactions if t.account_id == account.id)}
            for account in expense_accounts
        ]
    }

@router.get("/reports/balance-sheet")
async def get_balance_sheet(date: datetime = None, db: Session = Depends(get_db)):
    if date is None:
        date = datetime.now()
    
    # Get assets
    asset_accounts = db.query(models.Account).filter(models.Account.type == "asset").all()
    total_assets = sum(account.balance for account in asset_accounts)
    
    # Get liabilities
    liability_accounts = db.query(models.Account).filter(models.Account.type == "liability").all()
    total_liabilities = sum(account.balance for account in liability_accounts)
    
    # Get equity
    equity_accounts = db.query(models.Account).filter(models.Account.type == "equity").all()
    total_equity = sum(account.balance for account in equity_accounts)
    
    return {
        "date": date,
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "total_equity": total_equity,
        "assets": [
            {"account_id": account.id, "account_name": account.name, "balance": account.balance}
            for account in asset_accounts
        ],
        "liabilities": [
            {"account_id": account.id, "account_name": account.name, "balance": account.balance}
            for account in liability_accounts
        ],
        "equity": [
            {"account_id": account.id, "account_name": account.name, "balance": account.balance}
            for account in equity_accounts
        ]
    }

@router.get("/reports/cash-flow")
async def get_cash_flow(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
):
    # Get cash accounts
    cash_accounts = db.query(models.Account).filter(models.Account.type == "asset", models.Account.name.like("%cash%")).all()
    cash_account_ids = [account.id for account in cash_accounts]
    
    # Get all cash transactions
    cash_transactions = db.query(models.Transaction).filter(
        models.Transaction.account_id.in_(cash_account_ids),
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).all()
    
    # Calculate cash inflows and outflows
    cash_inflows = sum(t.amount for t in cash_transactions if t.type == "credit")
    cash_outflows = sum(t.amount for t in cash_transactions if t.type == "debit")
    net_cash_flow = cash_inflows - cash_outflows
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "cash_inflows": cash_inflows,
        "cash_outflows": cash_outflows,
        "net_cash_flow": net_cash_flow,
        "transactions": [
            {
                "id": t.id,
                "date": t.transaction_date,
                "amount": t.amount,
                "type": t.type,
                "description": t.description
            }
            for t in cash_transactions
        ]
    }
