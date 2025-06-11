from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import models
import schemas

router = APIRouter()

# Agent Configuration Endpoints
@router.post("/agents", response_model=schemas.AgentConfig, status_code=status.HTTP_201_CREATED)
async def create_agent_config(agent_config: schemas.AgentConfigCreate, db: Session = Depends(get_db)):
    db_agent_config = models.AgentConfig(
        agent_name=agent_config.agent_name,
        agent_type=agent_config.agent_type,
        configuration=agent_config.configuration.model_dump_json(),
        is_active=agent_config.is_active
    )
    db.add(db_agent_config)
    db.commit()
    db.refresh(db_agent_config)
    return db_agent_config

@router.get("/agents", response_model=List[schemas.AgentConfig])
async def get_agent_configs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    agent_configs = db.query(models.AgentConfig).offset(skip).limit(limit).all()
    return agent_configs

@router.get("/agents/{agent_config_id}", response_model=schemas.AgentConfig)
async def get_agent_config(agent_config_id: int, db: Session = Depends(get_db)):
    agent_config = db.query(models.AgentConfig).filter(models.AgentConfig.id == agent_config_id).first()
    if agent_config is None:
        raise HTTPException(status_code=404, detail="Agent configuration not found")
    return agent_config

@router.put("/agents/{agent_config_id}", response_model=schemas.AgentConfig)
async def update_agent_config(agent_config_id: int, agent_config: schemas.AgentConfigUpdate, db: Session = Depends(get_db)):
    db_agent_config = db.query(models.AgentConfig).filter(models.AgentConfig.id == agent_config_id).first()
    if db_agent_config is None:
        raise HTTPException(status_code=404, detail="Agent configuration not found")
    
    update_data = agent_config.model_dump(exclude_unset=True)
    if 'configuration' in update_data:
        update_data['configuration'] = agent_config.configuration.model_dump_json()

    for key, value in update_data.items():
        setattr(db_agent_config, key, value)
    
    db.commit()
    db.refresh(db_agent_config)
    return db_agent_config

@router.delete("/agents/{agent_config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent_config(agent_config_id: int, db: Session = Depends(get_db)):
    db_agent_config = db.query(models.AgentConfig).filter(models.AgentConfig.id == agent_config_id).first()
    if db_agent_config is None:
        raise HTTPException(status_code=404, detail="Agent configuration not found")
    
    db.delete(db_agent_config)
    db.commit()
    return None 