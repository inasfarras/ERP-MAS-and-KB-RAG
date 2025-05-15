from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, timedelta
import jwt
from pydantic import BaseModel

from database import get_db, engine
import models
import schemas
from services import (
    finance_service,
    sales_service,
    inventory_service,
    process_service,
    project_service,
    mrp_service,
    analytics_service,
    integration_service
)

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Modular ERP System API",
    description="API for a modular ERP system with future MAS and KG-RAG integration capabilities",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Authentication
SECRET_KEY = "your-secret-key"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Authentication models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# User authentication functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=payload.get("role"))
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Role-based access control
def has_role(required_roles: List[str]):
    async def role_checker(current_user = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

# Authentication endpoints
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not user.verify_password(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Modular ERP System API",
        "version": "1.0.0",
        "modules": [
            "Finance & Accounting",
            "Sales & Order Management",
            "Inventory & Supply Chain",
            "Business Process Controls",
            "Project & Job Management",
            "Material Requirements Planning",
            "Business Intelligence",
            "Integration Layer"
        ]
    }

# Include module routers
app.include_router(
    finance_service.router,
    prefix="/api/finance",
    tags=["Finance & Accounting"]
)

app.include_router(
    sales_service.router,
    prefix="/api/sales",
    tags=["Sales & Order Management"]
)

app.include_router(
    inventory_service.router,
    prefix="/api/inventory",
    tags=["Inventory & Supply Chain"]
)

app.include_router(
    process_service.router,
    prefix="/api/processes",
    tags=["Business Process Controls"]
)

app.include_router(
    project_service.router,
    prefix="/api/projects",
    tags=["Project & Job Management"]
)

app.include_router(
    mrp_service.router,
    prefix="/api/mrp",
    tags=["Material Requirements Planning"]
)

app.include_router(
    analytics_service.router,
    prefix="/api/analytics",
    tags=["Business Intelligence"]
)

app.include_router(
    integration_service.router,
    prefix="/api/integration",
    tags=["Integration Layer"]
)

# Extension points for future MAS and KG-RAG integration
@app.get("/api/extension/mas/status")
async def mas_status():
    """
    Placeholder endpoint for Multi-Agent System status
    This will be implemented in future phases
    """
    return {
        "status": "not_implemented",
        "message": "Multi-Agent System integration is prepared but not yet implemented",
        "extension_points": [
            "/api/extension/mas/agents",
            "/api/extension/mas/tasks",
            "/api/extension/mas/coordination"
        ]
    }

@app.get("/api/extension/kg-rag/status")
async def kg_rag_status():
    """
    Placeholder endpoint for Knowledge Graph RAG status
    This will be implemented in future phases
    """
    return {
        "status": "not_implemented",
        "message": "Knowledge Graph RAG integration is prepared but not yet implemented",
        "extension_points": [
            "/api/extension/kg-rag/query",
            "/api/extension/kg-rag/entities",
            "/api/extension/kg-rag/relationships"
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
