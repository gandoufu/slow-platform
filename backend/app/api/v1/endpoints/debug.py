from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.schemas.response import ApiResponse
from app.core.runner import run_request

router = APIRouter()

@router.post("/run", response_model=ApiResponse[schemas.DebugResponse])
def debug_run(
    *,
    db: Session = Depends(deps.get_db),
    debug_in: schemas.DebugRequest,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    调试执行接口
    """
    url = debug_in.url
    
    # Prepend Base URL if environment_id is provided
    if debug_in.environment_id:
        env = crud.crud_project.get_environment(db=db, environment_id=debug_in.environment_id)
        if not env:
            raise HTTPException(status_code=404, detail="未找到该环境")
        
        # Simple URL join, can be improved
        base_url = env.base_url.rstrip("/")
        path = url.lstrip("/")
        url = f"{base_url}/{path}"
        
        # Merge headers (Environment headers + Request headers)
        # Request headers overwrite Environment headers
        if env.headers:
            headers = env.headers.copy()
            if debug_in.headers:
                headers.update(debug_in.headers)
            debug_in.headers = headers

    # Prepare body
    json_body = None
    data_body = None
    if debug_in.body:
        if debug_in.body_type == "json":
            json_body = debug_in.body
        elif debug_in.body_type == "form":
            data_body = debug_in.body
        else:
            data_body = debug_in.body # raw string

    result = run_request(
        method=debug_in.method,
        url=url,
        params=debug_in.params,
        headers=debug_in.headers,
        json_body=json_body,
        data_body=data_body
    )
    
    return ApiResponse(data=result)
