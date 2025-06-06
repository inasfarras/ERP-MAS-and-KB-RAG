from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
import models
import schemas

router = APIRouter()

# Project endpoints
@router.post("/projects", response_model=schemas.Project)
async def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    # Validate customer if provided
    if project.customer_id:
        customer = db.query(models.Customer).filter(models.Customer.id == project.customer_id).first()
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer not found")
    
    # Create project
    project_data = project.dict(exclude={"tasks"})
    db_project = models.Project(**project_data)
    db.add(db_project)
    db.flush()  # Get the project ID without committing
    
    # Create tasks if provided
    if project.tasks:
        for task in project.tasks:
            # Validate assigned user if provided
            if task.assigned_to:
                user = db.query(models.User).filter(models.User.id == task.assigned_to).first()
                if user is None:
                    db.rollback()
                    raise HTTPException(status_code=404, detail=f"User with ID {task.assigned_to} not found")
            
            # Create task
            db_task = models.Task(
                project_id=db_project.id,
                **task.dict()
            )
            db.add(db_task)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[schemas.Project])
async def get_projects(
    skip: int = 0, 
    limit: int = 100, 
    customer_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Project)
    
    if customer_id:
        query = query.filter(models.Project.customer_id == customer_id)
    if status:
        query = query.filter(models.Project.status == status)
    if start_date:
        query = query.filter(models.Project.start_date >= start_date)
    if end_date:
        query = query.filter(models.Project.end_date <= end_date)
    
    projects = query.offset(skip).limit(limit).all()
    return projects

@router.get("/projects/{project_id}", response_model=schemas.Project)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/projects/{project_id}", response_model=schemas.Project)
async def update_project(project_id: int, project: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate customer if provided
    if project.customer_id:
        customer = db.query(models.Customer).filter(models.Customer.id == project.customer_id).first()
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update project
    update_data = project.dict(exclude_unset=True)
    update_data.pop("tasks", None)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@router.put("/projects/{project_id}/status", response_model=schemas.Project)
async def update_project_status(project_id: int, status_update: schemas.StatusUpdate, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    status = status_update.status
    valid_statuses = ["planning", "active", "on-hold", "completed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    db_project.status = status
    db.commit()
    db.refresh(db_project)
    return db_project

# Task endpoints
@router.post("/tasks", response_model=schemas.Task)
async def create_task(task: schemas.TaskCreate, project_id: int, db: Session = Depends(get_db)):
    # Validate project exists
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate assigned user if provided
    if task.assigned_to:
        user = db.query(models.User).filter(models.User.id == task.assigned_to).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
    
    # Create task
    db_task = models.Task(
        project_id=project_id,
        **task.dict()
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/tasks", response_model=List[schemas.Task])
async def get_tasks(
    skip: int = 0, 
    limit: int = 100, 
    project_id: Optional[int] = None,
    assigned_to: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Task)
    
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    if assigned_to:
        query = query.filter(models.Task.assigned_to == assigned_to)
    if status:
        query = query.filter(models.Task.status == status)
    if start_date:
        query = query.filter(models.Task.start_date >= start_date)
    if end_date:
        query = query.filter(models.Task.end_date <= end_date)
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.get("/tasks/{task_id}", response_model=schemas.Task)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}", response_model=schemas.Task)
async def update_task(task_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Validate assigned user if provided
    if task.assigned_to:
        user = db.query(models.User).filter(models.User.id == task.assigned_to).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
    
    # Update task
    for key, value in task.dict().items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/tasks/{task_id}/status", response_model=schemas.Task)
async def update_task_status(task_id: int, status_update: schemas.StatusUpdate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    status = status_update.status
    progress = status_update.progress
    valid_statuses = ["not-started", "in-progress", "completed", "delayed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    db_task.status = status

    if progress is not None:
        if progress < 0 or progress > 100:
            raise HTTPException(status_code=400, detail="Progress must be between 0 and 100")
        db_task.progress = progress
    
    # If task is completed, set progress to 100
    if status == "completed":
        db_task.progress = 100
    
    db.commit()
    db.refresh(db_task)
    return db_task

# Project reporting endpoints
@router.get("/reports/project-performance")
async def get_project_performance(
    project_id: int,
    db: Session = Depends(get_db)
):
    # Validate project exists
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get all tasks for the project
    tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
    
    # Calculate task statistics
    total_tasks = len(tasks)
    completed_tasks = sum(1 for task in tasks if task.status == "completed")
    in_progress_tasks = sum(1 for task in tasks if task.status == "in-progress")
    not_started_tasks = sum(1 for task in tasks if task.status == "not-started")
    delayed_tasks = sum(1 for task in tasks if task.status == "delayed")
    
    # Calculate overall progress
    overall_progress = sum(task.progress for task in tasks) / total_tasks if total_tasks > 0 else 0
    
    # Get financial transactions for the project
    transactions = db.query(models.Transaction).filter(models.Transaction.project_id == project_id).all()
    
    # Calculate financial statistics
    total_expenses = sum(t.amount for t in transactions if t.type == "debit")
    total_revenue = sum(t.amount for t in transactions if t.type == "credit")
    
    # Calculate budget utilization
    budget_utilization = (total_expenses / project.budget) * 100 if project.budget > 0 else 0
    
    # Calculate timeline
    today = datetime.now()
    project_duration = (project.end_date - project.start_date).days
    elapsed_days = (today - project.start_date).days if today > project.start_date else 0
    remaining_days = (project.end_date - today).days if today < project.end_date else 0
    
    timeline_progress = (elapsed_days / project_duration) * 100 if project_duration > 0 else 0
    
    # Check if project is on track
    on_track = overall_progress >= timeline_progress and budget_utilization <= timeline_progress
    
    return {
        "project_id": project.id,
        "project_name": project.name,
        "status": project.status,
        "start_date": project.start_date,
        "end_date": project.end_date,
        "budget": project.budget,
        "task_statistics": {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "not_started_tasks": not_started_tasks,
            "delayed_tasks": delayed_tasks,
            "completion_rate": completed_tasks / total_tasks if total_tasks > 0 else 0,
        },
        "overall_progress": overall_progress,
        "financial_statistics": {
            "total_expenses": total_expenses,
            "total_revenue": total_revenue,
            "budget_utilization": budget_utilization,
            "profit_loss": total_revenue - total_expenses,
        },
        "timeline": {
            "total_days": project_duration,
            "elapsed_days": elapsed_days,
            "remaining_days": remaining_days,
        },
    }

@router.get("/reports/resource-allocation")
async def get_resource_allocation(db: Session = Depends(get_db)):
    active_tasks = db.query(models.Task).filter(
        models.Task.status.in_(["not-started", "in-progress"]),
        models.Task.assigned_to.isnot(None)
    ).all()

    user_allocations = {}
    for task in active_tasks:
        user_id = task.assigned_to
        if user_id not in user_allocations:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            user_allocations[user_id] = {
                "user_id": user_id,
                "user_name": user.full_name if user else "Unknown",
                "task_count": 0,
                "projects": set(),
                "tasks": []
            }

        project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
        if project:
            user_allocations[user_id]["projects"].add(project.name)

        user_allocations[user_id]["task_count"] += 1
        user_allocations[user_id]["tasks"].append(task.name)

    resource_allocations = []
    total_tasks = 0
    for alloc in user_allocations.values():
        alloc["projects"] = list(alloc["projects"])
        total_tasks += alloc["task_count"]
        resource_allocations.append(alloc)

    workload_summary = {
        "total_users": len(resource_allocations),
        "total_tasks": total_tasks,
    }

    return {
        "resource_allocations": resource_allocations,
        "workload_summary": workload_summary,
    }
