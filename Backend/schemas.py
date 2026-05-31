from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ─── AUTH ───────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# ─── LESSON ─────────────────────────────────────────
class LessonCreate(BaseModel):
    title: str
    description: str
    video_url: Optional[str] = None
    file_url: Optional[str] = None
    order: Optional[int] = 1
    course_id: int

class LessonOut(BaseModel):
    id: int
    title: str
    description: str
    video_url: Optional[str] = None
    file_url: Optional[str] = None
    order: int
    course_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# ─── COURSE ─────────────────────────────────────────
class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    color: Optional[str] = "#3b82f6"

class CourseOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    color: str
    teacher_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class CourseDetail(CourseOut):
    lessons: List[LessonOut] = []
    teacher: UserOut
    class Config:
        from_attributes = True

# ─── ENROLLMENT ─────────────────────────────────────
class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    enrolled_at: datetime
    progress: float
    course: CourseOut
    class Config:
        from_attributes = True

# ─── ASSIGNMENT ─────────────────────────────────────
class AssignmentCreate(BaseModel):
    title: str
    description: str
    deadline: datetime
    total_marks: int
    course_id: int

class AssignmentOut(BaseModel):
    id: int
    title: str
    description: str
    deadline: datetime
    total_marks: int
    course_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# ─── SUBMISSION ─────────────────────────────────────
class SubmissionCreate(BaseModel):
    assignment_id: int
    content: str

class SubmissionOut(BaseModel):
    id: int
    student_id: int
    assignment_id: int
    content: str
    marks_obtained: int
    status: str
    submitted_at: datetime
    student: UserOut
    class Config:
        from_attributes = True

class GradeSubmission(BaseModel):
    marks_obtained: int

# ─── STUDY TASK ─────────────────────────────────────
class StudyTaskCreate(BaseModel):
    title: str
    description: str
    deadline: datetime
    priority: str = "medium"
    duration_mins: int = 60
    subject: str

class StudyTaskOut(BaseModel):
    id: int
    title: str
    description: str
    deadline: datetime
    priority: str
    status: str
    duration_mins: int
    subject: str
    student_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# ─── STREAK ─────────────────────────────────────────
class StreakOut(BaseModel):
    id: int
    student_id: int
    current_streak: int
    longest_streak: int
    badges: str
    last_activity: datetime
    class Config:
        from_attributes = True