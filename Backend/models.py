from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    role = Column(String(20), default="student")
    created_at = Column(DateTime, default=datetime.utcnow)
    enrollments = relationship("Enrollment", back_populates="student", foreign_keys="Enrollment.student_id")
    courses_taught = relationship("Course", back_populates="teacher")
    submissions = relationship("Submission", back_populates="student")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    description = Column(Text)
    category = Column(String(100))
    color = Column(String(20), default="#3b82f6")
    teacher_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    teacher = relationship("User", back_populates="courses_taught")
    assignments = relationship("Assignment", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")
    lessons = relationship("Lesson", back_populates="course")

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    description = Column(Text)
    video_url = Column(String(500), nullable=True)
    file_url = Column(String(500), nullable=True)
    order = Column(Integer, default=1)
    course_id = Column(Integer, ForeignKey("courses.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    course = relationship("Course", back_populates="lessons")

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    progress = Column(Float, default=0.0)
    student = relationship("User", back_populates="enrollments", foreign_keys=[student_id])
    course = relationship("Course", back_populates="enrollments")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    description = Column(Text)
    deadline = Column(DateTime)
    total_marks = Column(Integer, default=100)
    course_id = Column(Integer, ForeignKey("courses.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    course = relationship("Course", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    content = Column(Text)
    marks_obtained = Column(Integer, default=0)
    status = Column(String(20), default="submitted")
    submitted_at = Column(DateTime, default=datetime.utcnow)
    student = relationship("User", back_populates="submissions")
    assignment = relationship("Assignment", back_populates="submissions")

class StudyTask(Base):
    __tablename__ = "study_tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    description = Column(Text)
    deadline = Column(DateTime)
    priority = Column(String(20), default="medium")
    status = Column(String(20), default="pending")
    duration_mins = Column(Integer, default=60)
    subject = Column(String(100))
    student_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    student = relationship("User", foreign_keys=[student_id])

class Streak(Base):
    __tablename__ = "streaks"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    badges = Column(String(500), default="")
    last_activity = Column(DateTime, default=datetime.utcnow)
    student = relationship("User", foreign_keys=[student_id])