from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import models
import schemas

router = APIRouter()

# Knowledge Entity Endpoints
@router.post("/entities", response_model=schemas.KnowledgeEntity, status_code=status.HTTP_201_CREATED)
async def create_knowledge_entity(entity: schemas.KnowledgeEntityCreate, db: Session = Depends(get_db)):
    db_entity = models.KnowledgeEntity(
        entity_type=entity.entity_type,
        entity_id=entity.entity_id,
        properties=entity.properties.model_dump_json(), # Use model_dump_json for JSONB
        embedding=entity.embedding # Store the vector embedding
    )
    db.add(db_entity)
    db.commit()
    db.refresh(db_entity)
    return db_entity

@router.get("/entities", response_model=List[schemas.KnowledgeEntity])
async def get_knowledge_entities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    entities = db.query(models.KnowledgeEntity).offset(skip).limit(limit).all()
    return entities

@router.get("/entities/{entity_id}", response_model=schemas.KnowledgeEntity)
async def get_knowledge_entity(entity_id: int, db: Session = Depends(get_db)):
    entity = db.query(models.KnowledgeEntity).filter(models.KnowledgeEntity.id == entity_id).first()
    if entity is None:
        raise HTTPException(status_code=404, detail="Knowledge entity not found")
    return entity

@router.put("/entities/{entity_id}", response_model=schemas.KnowledgeEntity)
async def update_knowledge_entity(entity_id: int, entity: schemas.KnowledgeEntityUpdate, db: Session = Depends(get_db)):
    db_entity = db.query(models.KnowledgeEntity).filter(models.KnowledgeEntity.id == entity_id).first()
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Knowledge entity not found")
    
    update_data = entity.model_dump(exclude_unset=True)
    if 'properties' in update_data:
        update_data['properties'] = entity.properties.model_dump_json()

    for key, value in update_data.items():
        setattr(db_entity, key, value)
    
    db.commit()
    db.refresh(db_entity)
    return db_entity

@router.delete("/entities/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge_entity(entity_id: int, db: Session = Depends(get_db)):
    db_entity = db.query(models.KnowledgeEntity).filter(models.KnowledgeEntity.id == entity_id).first()
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Knowledge entity not found")
    
    db.delete(db_entity)
    db.commit()
    return None

@router.get("/entities/search", response_model=List[schemas.KnowledgeEntity])
async def search_knowledge_entities(
    query_text: str,
    db: Session = Depends(get_db),
    top_k: int = 5
):
    # Placeholder for generating embedding from query_text
    # In a real application, you would use an embedding model (e.g., from Hugging Face, OpenAI, Cohere)
    # You will need to replace this with actual embedding generation.
    # Example: query_embedding = embedding_model.encode(query_text).tolist()

    # For now, we'll use a dummy embedding or raise an error if no embedding model is configured
    # For a proper RAG, this would be a high-dimensional vector (e.g., 768, 1024, etc.)
    dummy_embedding = [0.1] * 768 # Replace 768 with your actual embedding dimension

    # Perform similarity search using pgvector
    # Note: For pgvector to work, the 'vector' extension must be enabled in PostgreSQL
    # (e.g., by running 'CREATE EXTENSION IF NOT EXISTS vector;' in your PostgreSQL DB)
    # This assumes a cosine similarity operator '<=>' is available and indexed
    # The order_by clause will retrieve the most similar entities first
    results = (
        db.query(models.KnowledgeEntity)
        .order_by(models.KnowledgeEntity.embedding.cosine_distance(dummy_embedding))
        .limit(top_k)
        .all()
    )

    # You might want to filter results based on a similarity threshold
    # For example: .filter(models.KnowledgeEntity.embedding.cosine_distance(query_embedding) < threshold)

    return results 