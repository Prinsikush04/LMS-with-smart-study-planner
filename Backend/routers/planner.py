from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from typing import List
from datetime import datetime, date

router = APIRouter(prefix="/api/planner", tags=["Planner"])

def get_or_create_streak(db, student_id):
    streak = db.query(models.Streak).filter(models.Streak.student_id == student_id).first()
    if not streak:
        streak = models.Streak(student_id=student_id)
        db.add(streak)
        db.commit()
        db.refresh(streak)
    return streak

# ─── Create Task ─────────────────────────────────────
@router.post("/tasks", response_model=schemas.StudyTaskOut)
def create_task(task: schemas.StudyTaskCreate, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can create tasks")
    new_task = models.StudyTask(**task.dict(), student_id=user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

# ─── Get All Tasks ────────────────────────────────────
@router.get("/tasks", response_model=List[schemas.StudyTaskOut])
def get_tasks(db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students")
    return db.query(models.StudyTask).filter(
        models.StudyTask.student_id == user.id
    ).order_by(models.StudyTask.deadline).all()

# ─── Complete Task ────────────────────────────────────
@router.patch("/tasks/{task_id}/complete")
def complete_task(task_id: int, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    task = db.query(models.StudyTask).filter(
        models.StudyTask.id == task_id,
        models.StudyTask.student_id == user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "completed"

    # Update streak
    streak = get_or_create_streak(db, user.id)
    today = date.today()
    last = streak.last_activity.date() if streak.last_activity else None

    if last != today:
        if last and (today - last).days == 1:
            streak.current_streak += 1
        else:
            streak.current_streak = 1
        streak.last_activity = datetime.utcnow()
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak

    # Badges
    badges = streak.badges.split(",") if streak.badges else []
    if streak.current_streak >= 7 and "🔥 7-Day Streak" not in badges:
        badges.append("🔥 7-Day Streak")
    if streak.current_streak >= 30 and "⚡ 30-Day Streak" not in badges:
        badges.append("⚡ 30-Day Streak")

    # Count completed tasks for badges
    total_completed = db.query(models.StudyTask).filter(
        models.StudyTask.student_id == user.id,
        models.StudyTask.status == "completed"
    ).count() + 1
    if total_completed >= 10 and "🏆 10 Tasks Done" not in badges:
        badges.append("🏆 10 Tasks Done")
    if total_completed >= 50 and "🌟 50 Tasks Done" not in badges:
        badges.append("🌟 50 Tasks Done")

    streak.badges = ",".join(filter(None, badges))
    db.commit()
    return {"message": "Task completed!", "streak": streak.current_streak, "badges": badges}

# ─── Delete Task ──────────────────────────────────────
@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    task = db.query(models.StudyTask).filter(
        models.StudyTask.id == task_id,
        models.StudyTask.student_id == user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

# ─── Progress Stats ───────────────────────────────────
@router.get("/progress")
def get_progress(db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students")

    total = db.query(models.StudyTask).filter(models.StudyTask.student_id == user.id).count()
    completed = db.query(models.StudyTask).filter(
        models.StudyTask.student_id == user.id,
        models.StudyTask.status == "completed"
    ).count()
    pending = total - completed
    productivity = round((completed / total * 100), 1) if total > 0 else 0

    # Subject wise stats
    tasks = db.query(models.StudyTask).filter(models.StudyTask.student_id == user.id).all()
    subject_map = {}
    for task in tasks:
        s = task.subject
        if s not in subject_map:
            subject_map[s] = {"total": 0, "completed": 0}
        subject_map[s]["total"] += 1
        if task.status == "completed":
            subject_map[s]["completed"] += 1

    subject_stats = []
    for subject, data in subject_map.items():
        score = round((data["completed"] / data["total"] * 100), 1) if data["total"] > 0 else 0
        subject_stats.append({
            "subject": subject,
            "total": data["total"],
            "completed": data["completed"],
            "score": score,
            "weak": score < 50 and data["total"] > 0
        })

    # Streak
    streak = get_or_create_streak(db, user.id)

    # Upcoming deadlines
    upcoming = db.query(models.StudyTask).filter(
        models.StudyTask.student_id == user.id,
        models.StudyTask.status == "pending",
        models.StudyTask.deadline >= datetime.utcnow()
    ).order_by(models.StudyTask.deadline).limit(5).all()

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "productivity": productivity,
        "subject_stats": subject_stats,
        "streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
        "badges": [b for b in streak.badges.split(",") if b] if streak.badges else [],
        "upcoming_deadlines": [
            {
                "id": t.id,
                "title": t.title,
                "subject": t.subject,
                "deadline": t.deadline,
                "priority": t.priority
            } for t in upcoming
        ]
    }