from fastapi import APIRouter
from app.api.v1.endpoints import login, users, projects, apis, debug, test_cases

api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(apis.router, prefix="/projects/{project_id}/apis", tags=["apis"])
api_router.include_router(test_cases.router, prefix="/projects/{project_id}/test-cases", tags=["test_cases"])
api_router.include_router(debug.router, prefix="/debug", tags=["debug"])
