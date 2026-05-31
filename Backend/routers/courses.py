from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from typing import List

router = APIRouter(prefix="/api/courses", tags=["Courses"])

# ─── TEACHER: Create Course ──────────────────────────
@router.post("/", response_model=schemas.CourseOut)
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create courses")
    new_course = models.Course(**course.dict(), teacher_id=user.id)
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

# ─── TEACHER: Get My Courses ─────────────────────────
@router.get("/my", response_model=List[schemas.CourseOut])
def get_my_courses(db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can access this")
    return db.query(models.Course).filter(models.Course.teacher_id == user.id).all()

# ─── TEACHER: Update Course ──────────────────────────
@router.put("/{course_id}", response_model=schemas.CourseOut)
def update_course(course_id: int, course: schemas.CourseCreate, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can update courses")
    db_course = db.query(models.Course).filter(
        models.Course.id == course_id,
        models.Course.teacher_id == user.id
    ).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    for key, value in course.dict().items():
        setattr(db_course, key, value)
    db.commit()
    db.refresh(db_course)
    return db_course

# ─── TEACHER: Delete Course ──────────────────────────
@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can delete courses")
    db_course = db.query(models.Course).filter(
        models.Course.id == course_id,
        models.Course.teacher_id == user.id
    ).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(db_course)
    db.commit()
    return {"message": "Course deleted"}

# ─── ALL: Get All Courses (Student browse kare) ──────
@router.get("/all", response_model=List[schemas.CourseOut])
def get_all_courses(db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    return db.query(models.Course).all()

# ─── ALL: Get Course Detail with Lessons ─────────────
@router.get("/{course_id}/detail", response_model=schemas.CourseDetail)
def get_course_detail(course_id: int, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

# ─── STUDENT: Enroll ─────────────────────────────────
@router.post("/{course_id}/enroll")
def enroll_course(course_id: int, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can enroll")
    existing = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == user.id,
        models.Enrollment.course_id == course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")
    enrollment = models.Enrollment(student_id=user.id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    return {"message": "Enrolled successfully"}

# ─── STUDENT: Get Enrolled Courses ───────────────────
@router.get("/enrolled", response_model=List[schemas.EnrollmentOut])
def get_enrolled_courses(db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can access this")
    return db.query(models.Enrollment).filter(
        models.Enrollment.student_id == user.id
    ).all()

# ─── TEACHER: Add Lesson to Course ───────────────────
@router.post("/{course_id}/lessons", response_model=schemas.LessonOut)
def add_lesson(course_id: int, lesson: schemas.LessonCreate, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can add lessons")
    course = db.query(models.Course).filter(
        models.Course.id == course_id,
        models.Course.teacher_id == user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    new_lesson = models.Lesson(**lesson.dict())
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson

# ─── TEACHER: Delete Lesson ───────────────────────────
@router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can delete lessons")
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
    return {"message": "Lesson deleted"}

# ─── TEACHER: Get Course Students ────────────────────
@router.get("/{course_id}/students")
def get_course_students(course_id: int, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can access this")
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id
    ).all()
    return [{
        "student_id": e.student_id,
        "student_name": e.student.name,
        "student_email": e.student.email,
        "progress": e.progress,
        "enrolled_at": e.enrolled_at
    } for e in enrollments]