from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import task, user

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Task Manager API",
    description="Production-style FastAPI backend for task management with JWT auth and PostgreSQL.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(task.router, prefix="/tasks", tags=["tasks"])

@app.get("/")
def root():
    return {"message": "Smart Task Manager API Running"}
