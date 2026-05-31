from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from typing import List

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("/", response_model=List[schemas.TaskOut])
def get_tasks(db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    return db.query(models.StudyTask).filter(models.StudyTask.user_id == user.id).all()

@router.post("/", response_model=schemas.TaskOut)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    new_task = models.StudyTask(**task.dict(), user_id=user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.patch("/{task_id}/complete")
def complete_task(task_id: int, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    task = db.query(models.StudyTask).filter(models.StudyTask.id == task_id, models.StudyTask.user_id == user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "completed"
    user.streak += 1
    if user.streak % 7 == 0:
        user.badges += f"🏆7-Day Streak,"
    db.commit()
    return {"message": "Task completed", "streak": user.streak}

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    task = db.query(models.StudyTask).filter(models.StudyTask.id == task_id, models.StudyTask.user_id == user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}