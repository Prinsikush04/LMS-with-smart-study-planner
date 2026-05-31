from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, auth, schemas
from typing import List

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def require_admin(user=Depends(auth.get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ─── Get All Users ────────────────────────────────────
@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    return db.query(models.User).all()

# ─── Delete User ──────────────────────────────────────
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(target)
    db.commit()
    return {"message": "User deleted"}

# ─── Update User Role ─────────────────────────────────
@router.patch("/users/{user_id}/role")
def update_role(
    user_id: int,
    role: dict,
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if role.get("role") not in ["student", "teacher", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    target.role = role.get("role")
    db.commit()
    return {"message": "Role updated"}

# ─── Get All Courses ──────────────────────────────────
@router.get("/courses", response_model=List[schemas.CourseOut])
def get_all_courses(
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    return db.query(models.Course).all()

# ─── Delete Course ────────────────────────────────────
@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"message": "Course deleted"}

# ─── Platform Stats ───────────────────────────────────
@router.get("/stats")
def admin_stats(
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    return {
        "total_users": db.query(models.User).count(),
        "total_students": db.query(models.User).filter(models.User.role == "student").count(),
        "total_teachers": db.query(models.User).filter(models.User.role == "teacher").count(),
        "total_courses": db.query(models.Course).count(),
        "total_assignments": db.query(models.Assignment).count(),
        "total_submissions": db.query(models.Submission).count(),
        "total_enrollments": db.query(models.Enrollment).count(),
    }