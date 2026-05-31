from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth_router, courses, admin, assignments, planner

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LMS API — Student, Teacher, Admin")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(courses.router)
app.include_router(assignments.router)
app.include_router(planner.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "LMS API Running ✅"}