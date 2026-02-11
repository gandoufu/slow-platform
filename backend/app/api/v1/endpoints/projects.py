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

@router.put("/{project_id}", response_model=ApiResponse[schemas.Project])
def update_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    project_in: schemas.ProjectUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    更新项目
    """
    project = crud.crud_project.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="未找到该项目")
    project = crud.crud_project.update_project(db=db, db_project=project, project_update=project_in)
    return ApiResponse(data=project)

@router.delete("/{project_id}", response_model=ApiResponse[schemas.Project])
def delete_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    删除项目
    """
    project = crud.crud_project.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="未找到该项目")
    project = crud.crud_project.delete_project(db=db, project_id=project_id)
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

@router.put("/{project_id}/environments/{environment_id}", response_model=ApiResponse[schemas.Environment])
def update_environment(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    environment_id: int,
    environment_in: schemas.EnvironmentUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    更新环境
    """
    project = crud.crud_project.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="未找到该项目")
    
    environment = crud.crud_project.get_environment(db=db, environment_id=environment_id)
    if not environment:
        raise HTTPException(status_code=404, detail="未找到该环境")
        
    environment = crud.crud_project.update_environment(db=db, db_environment=environment, environment_update=environment_in)
    return ApiResponse(data=environment)

@router.delete("/{project_id}/environments/{environment_id}", response_model=ApiResponse[schemas.Environment])
def delete_environment(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    environment_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    删除环境
    """
    project = crud.crud_project.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="未找到该项目")
        
    environment = crud.crud_project.get_environment(db=db, environment_id=environment_id)
    if not environment:
        raise HTTPException(status_code=404, detail="未找到该环境")
        
    environment = crud.crud_project.delete_environment(db=db, environment_id=environment_id)
    return ApiResponse(data=environment)
