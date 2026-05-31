from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, auth

router = APIRouter(prefix="/api/progress", tags=["Progress"])

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    total = db.query(models.StudyTask).filter(models.StudyTask.user_id == user.id).count()
    completed = db.query(models.StudyTask).filter(
        models.StudyTask.user_id == user.id,
        models.StudyTask.status == "completed"
    ).count()
    pending = total - completed
    productivity = round((completed / total * 100), 1) if total > 0 else 0

    courses = db.query(models.Course).filter(models.Course.user_id == user.id).all()
    course_stats = []
    for course in courses:
        c_total = db.query(models.StudyTask).filter(
            models.StudyTask.course_id == course.id
        ).count()
        c_done = db.query(models.StudyTask).filter(
            models.StudyTask.course_id == course.id,
            models.StudyTask.status == "completed"
        ).count()
        score = round((c_done / c_total * 100), 1) if c_total > 0 else 0
        course_stats.append({
            "course": course.title,
            "color": course.color,
            "total": c_total,
            "completed": c_done,
            "score": score
        })

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "productivity": productivity,
        "streak": user.streak,
        "badges": user.badges.split(",") if user.badges else [],
        "course_stats": course_stats
    }