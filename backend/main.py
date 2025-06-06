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
    dashboard_service,
)
from docs import (
    API_TITLE,
    API_DESCRIPTION,
    API_VERSION,
    API_TAGS_METADATA,
    custom_openapi
)

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    openapi_tags=API_TAGS_METADATA,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Set custom OpenAPI schema
app.openapi = custom_openapi

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
@app.post("/token", response_model=Token, tags=["Authentication"])
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    
    - **username**: Your username
    - **password**: Your password
    
    Returns a JWT token that can be used for authenticated requests.
    """
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
@app.get("/", tags=["System"], dependencies=[Depends(get_current_user)])
async def root():
    """
    Root endpoint that provides basic API information and available modules.
    Requires authentication.
    
    Returns:
        Dict containing API version and available modules
    """
    return {
        "message": "Modular ERP System API",
        "version": API_VERSION,
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
    dashboard_service.router,
    prefix="/api/dashboard",
    tags=["Business Intelligence"]
)

# Extension points for future MAS and KG-RAG integration
@app.get("/api/extension/mas/status", tags=["AI Integration"])
async def mas_status():
    """
    Get the current status of the Multi-Agent System integration.
    
    Returns:
        Dict containing the current status and available extension points
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

@app.get("/api/extension/kg-rag/status", tags=["AI Integration"])
async def kg_rag_status():
    """
    Get the current status of the Knowledge Graph RAG integration.
    
    Returns:
        Dict containing the current status and available extension points
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
