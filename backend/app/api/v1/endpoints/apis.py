from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.schemas.response import ApiResponse

router = APIRouter()

@router.get("/", response_model=ApiResponse[List[schemas.Api]])
def read_apis(
    project_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    module_name: Optional[str] = Query(None, description="按模块筛选"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取指定项目的接口列表
    """
    # Verify project exists
    project = crud.crud_project.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="未找到该项目")
        
    apis = crud.crud_api.get_apis(db, project_id=project_id, skip=skip, limit=limit, module_name=module_name)
    return ApiResponse(data=apis)

@router.post("/", response_model=ApiResponse[schemas.Api])
def create_api(
    project_id: int,
    api_in: schemas.ApiCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    创建新接口
    """
    # Verify project exists
    project = crud.crud_project.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="未找到该项目")
    
    # Force project_id from path param
    api_in.project_id = project_id
    
    api = crud.crud_api.create_api(db=db, api=api_in)
    return ApiResponse(data=api)

@router.get("/{api_id}", response_model=ApiResponse[schemas.Api])
def read_api(
    project_id: int,
    api_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取接口详情
    """
    api = crud.crud_api.get_api(db=db, api_id=api_id)
    if not api or api.project_id != project_id:
        raise HTTPException(status_code=404, detail="未找到该接口")
    return ApiResponse(data=api)

@router.put("/{api_id}", response_model=ApiResponse[schemas.Api])
def update_api(
    project_id: int,
    api_id: int,
    api_in: schemas.ApiUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    更新接口
    """
    api = crud.crud_api.get_api(db=db, api_id=api_id)
    if not api or api.project_id != project_id:
        raise HTTPException(status_code=404, detail="未找到该接口")
        
    api = crud.crud_api.update_api(db=db, db_api=api, api_update=api_in)
    return ApiResponse(data=api)

@router.delete("/{api_id}", response_model=ApiResponse[schemas.Api])
def delete_api(
    project_id: int,
    api_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    删除接口
    """
    api = crud.crud_api.get_api(db=db, api_id=api_id)
    if not api or api.project_id != project_id:
        raise HTTPException(status_code=404, detail="未找到该接口")
        
    api = crud.crud_api.delete_api(db=db, api_id=api_id)
    return ApiResponse(data=api)
