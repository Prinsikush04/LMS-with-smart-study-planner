from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from typing import List

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

# ─── TEACHER: Create Assignment ──────────────────────
@router.post("/", response_model=schemas.AssignmentOut)
def create_assignment(
    assignment: schemas.AssignmentCreate,
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user)
):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create assignments")
    course = db.query(models.Course).filter(
        models.Course.id == assignment.course_id,
        models.Course.teacher_id == user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    new_assignment = models.Assignment(**assignment.dict())
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

# ─── TEACHER: Get My Assignments ─────────────────────
@router.get("/my", response_model=List[schemas.AssignmentOut])
def get_my_assignments(
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user)
):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can access this")
    courses = db.query(models.Course).filter(
        models.Course.teacher_id == user.id
    ).all()
    course_ids = [c.id for c in courses]
    return db.query(models.Assignment).filter(
        models.Assignment.course_id.in_(course_ids)
    ).all()

# ─── TEACHER: Delete Assignment ──────────────────────
@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user)
):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can delete assignments")
    assignment = db.query(models.Assignment).filter(
        models.Assignment.id == assignment_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted"}

# ─── STUDENT: Get Assignments For Enrolled Courses ───
@router.get("/student", response_model=List[schemas.AssignmentOut])
def get_student_assignments(
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user)
):
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can access this")
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == user.id
    ).all()
    course_ids = [e.course_id for e in enrollments]
    return db.query(models.Assignment).filter(
        models.Assignment.course_id.in_(course_ids)
    ).all()

# ─── STUDENT: Submit Assignment ──────────────────────
@router.post("/submit", response_model=schemas.SubmissionOut)
def submit_assignment(
    submission: schemas.SubmissionCreate,
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user)
):
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can submit assignments")
    existing = db.query(models.Submission).filter(
        models.Submission.student_id == user.id,
        models.Submission.assignment_id == submission.assignment_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already submitted")
    new_submission = models.Submission(
        student_id=user.id,
        **submission.dict()
    )
    db.add(new_submission)

    # Update enrollment progress
    assignment = db.query(models.Assignment).filter(
        models.Assignment.id == submission.assignment_id
    ).first()
    if assignment:
        enrollment = db.query(models.Enrollment).filter(
            models.Enrollment.student_id == user.id,
            models.Enrollment.course_id == assignment.course_id
        ).first()
        if enrollment:
            total = db.query(models.Assignment).filter(
                models.Assignment.course_id == assignment.course_id
            ).count()
            submitted = db.query(models.Submission).filter(
                models.Submission.student_id == user.id,
                models.Submission.assignment_id.in_(
                    [a.id for a in db.query(models.Assignment).filter(
                        models.Assignment.course_id == assignment.course_id
                    ).all()]
                )
            ).count()
            enrollment.progress = round((submitted + 1) / total * 100, 1) if total > 0 else 0

    db.commit()
    db.refresh(new_submission)
    return new_submission

# ─── TEACHER: Get Submissions ────────────────────────
@router.get("/{assignment_id}/submissions", response_model=List[schemas.SubmissionOut])
def get_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user)
):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can access this")
    return db.query(models.Submission).filter(
        models.Submission.assignment_id == assignment_id
    ).all()

# ─── TEACHER: Grade Submission ───────────────────────
@router.patch("/submissions/{submission_id}/grade")
def grade_submission(
    submission_id: int,
    grade: schemas.GradeSubmission,
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user)
):
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can grade")
    submission = db.query(models.Submission).filter(
        models.Submission.id == submission_id
    ).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission.marks_obtained = grade.marks_obtained
    submission.status = "graded"
    db.commit()
    return {"message": "Graded successfully"}

    # ─── STUDENT: Get My Submissions ─────────────────────────────────────────
@router.get("/my-submissions")
def get_my_submissions(db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students")
    submissions = db.query(models.Submission).filter(
        models.Submission.student_id == user.id
    ).all()
    return [{
        "assignment_id": s.assignment_id,
        "status": s.status,
        "marks_obtained": s.marks_obtained,
        "submitted_at": s.submitted_at,
        "content": s.content
    } for s in submissions]