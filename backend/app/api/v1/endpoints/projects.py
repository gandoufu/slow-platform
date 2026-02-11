from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

from app.schemas.response import ApiResponse

@router.get("/", response_model=ApiResponse[List[schemas.Project]])
def read_projects(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取项目列表
    """
    projects = crud.crud_project.get_projects(db, skip=skip, limit=limit)
    return ApiResponse(data=projects)

@router.post("/", response_model=ApiResponse[schemas.Project])
def create_project(
    *,
    db: Session = Depends(deps.get_db),
    project_in: schemas.ProjectCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    创建新项目
    """
    project = crud.crud_project.create_project(db=db, project=project_in, owner_id=current_user.id)
    return ApiResponse(data=project)

@router.get("/{project_id}", response_model=ApiResponse[schemas.Project])
def read_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    根据 ID 获取项目
    """
    project = crud.crud_project.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="未找到该项目")
    return ApiResponse(data=project)

@router.post("/{project_id}/environments/", response_model=ApiResponse[schemas.Environment])
def create_environment(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    environment_in: schemas.EnvironmentCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    为项目创建新环境
    """
    project = crud.crud_project.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="未找到该项目")
    environment = crud.crud_project.create_environment(db=db, environment=environment_in, project_id=project_id)
    return ApiResponse(data=environment)
