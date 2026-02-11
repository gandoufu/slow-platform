from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.schemas.response import ApiResponse
from app.core.runner import run_request
from app.core.assertions import check_assertions

router = APIRouter()

@router.get("/", response_model=ApiResponse[List[schemas.TestCase]])
def read_test_cases(
    project_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取项目下的用例列表
    """
    project = crud.crud_project.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="未找到该项目")
        
    test_cases = crud.crud_test_case.get_test_cases(db, project_id=project_id, skip=skip, limit=limit)
    return ApiResponse(data=test_cases)

@router.post("/", response_model=ApiResponse[schemas.TestCase])
def create_test_case(
    project_id: int,
    test_case_in: schemas.TestCaseCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    创建新用例
    """
    project = crud.crud_project.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="未找到该项目")
        
    test_case = crud.crud_test_case.create_test_case(db=db, test_case=test_case_in, project_id=project_id)
    return ApiResponse(data=test_case)

@router.get("/{test_case_id}", response_model=ApiResponse[schemas.TestCase])
def read_test_case(
    project_id: int,
    test_case_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取用例详情
    """
    test_case = crud.crud_test_case.get_test_case(db=db, test_case_id=test_case_id)
    if not test_case or test_case.project_id != project_id:
        raise HTTPException(status_code=404, detail="未找到该用例")
    return ApiResponse(data=test_case)

@router.put("/{test_case_id}", response_model=ApiResponse[schemas.TestCase])
def update_test_case(
    project_id: int,
    test_case_id: int,
    test_case_in: schemas.TestCaseUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    更新用例
    """
    test_case = crud.crud_test_case.get_test_case(db=db, test_case_id=test_case_id)
    if not test_case or test_case.project_id != project_id:
        raise HTTPException(status_code=404, detail="未找到该用例")
        
    test_case = crud.crud_test_case.update_test_case(db=db, db_obj=test_case, obj_in=test_case_in)
    return ApiResponse(data=test_case)

@router.delete("/{test_case_id}", response_model=ApiResponse[schemas.TestCase])
def delete_test_case(
    project_id: int,
    test_case_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    删除用例
    """
    test_case = crud.crud_test_case.get_test_case(db=db, test_case_id=test_case_id)
    if not test_case or test_case.project_id != project_id:
        raise HTTPException(status_code=404, detail="未找到该用例")
        
    test_case = crud.crud_test_case.delete_test_case(db=db, test_case_id=test_case_id)
    return ApiResponse(data=test_case)

@router.post("/{test_case_id}/run", response_model=ApiResponse[Any])
def run_test_case(
    project_id: int,
    test_case_id: int,
    environment_id: int = Query(..., description="环境ID"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    执行用例
    """
    test_case = crud.crud_test_case.get_test_case(db=db, test_case_id=test_case_id)
    if not test_case or test_case.project_id != project_id:
        raise HTTPException(status_code=404, detail="未找到该用例")
    
    # Get Environment
    env = crud.crud_project.get_environment(db=db, environment_id=environment_id)
    if not env:
        raise HTTPException(status_code=404, detail="未找到该环境")
    
    # Prepare Request
    base_url = env.base_url.rstrip("/")
    path = test_case.url.lstrip("/")
    url = f"{base_url}/{path}"
    
    headers = env.headers.copy() if env.headers else {}
    if test_case.headers:
        headers.update(test_case.headers)
    
    # Prepare body
    json_body = None
    data_body = None
    if test_case.body:
        if test_case.body_type == "json":
            json_body = test_case.body
        elif test_case.body_type == "form":
            data_body = test_case.body
        else:
            data_body = test_case.body

    # Run Request
    try:
        result = run_request(
            method=test_case.method,
            url=url,
            params=test_case.params,
            headers=headers,
            json_body=json_body,
            data_body=data_body
        )
    except Exception as e:
        return ApiResponse(code=500, message=f"Execution failed: {str(e)}")

    # Check Assertions
    assertion_results = []
    if test_case.assertions:
        # Convert result to dict for checking
        response_data = {
            "status_code": result.status_code,
            "headers": result.headers,
            "body": result.body,
            "duration": result.duration
        }
        assertion_results = check_assertions(response_data, test_case.assertions)
    
    # Determine overall status
    passed = all(r.get("passed", False) for r in assertion_results) if assertion_results else True
    
    return ApiResponse(data={
        "result": result,
        "assertions": assertion_results,
        "passed": passed
    })
