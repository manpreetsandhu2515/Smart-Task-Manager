from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models
from app.auth import get_current_user, get_db
from app.schemas import TaskCreate, TaskRead, TaskUpdate

router = APIRouter()


def get_task_or_404(task_id: int, user_id: int, db: Session) -> models.Task:
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == user_id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    task_create: TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = models.Task(
        title=task_create.title,
        description=task_create.description,
        completed=task_create.completed,
        priority=task_create.priority,
        due_date=task_create.due_date,
        user_id=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/", response_model=List[TaskRead])
def list_tasks(
    priority: Optional[str] = Query(None, regex="^(low|medium|high)$"),
    due_before: Optional[datetime] = Query(None),
    due_after: Optional[datetime] = Query(None),
    completed: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Task).filter(models.Task.user_id == current_user.id)
    if priority:
        query = query.filter(models.Task.priority == priority)
    if completed is not None:
        query = query.filter(models.Task.completed == completed)
    if due_before:
        query = query.filter(models.Task.due_date <= due_before)
    if due_after:
        query = query.filter(models.Task.due_date >= due_after)
    return query.order_by(models.Task.due_date.asc().nulls_last()).all()


@router.get("/{task_id}", response_model=TaskRead)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return get_task_or_404(task_id, current_user.id, db)


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = get_task_or_404(task_id, current_user.id, db)
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = get_task_or_404(task_id, current_user.id, db)
    db.delete(task)
    db.commit()
    return None
