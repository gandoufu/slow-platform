from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

from app.schemas.response import ApiResponse

@router.post("/", response_model=ApiResponse[schemas.User])
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    创建新用户
    """
    user = crud.crud_user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="该用户名的用户已存在",
        )
    user = crud.crud_user.create(db, obj_in=user_in)
    return ApiResponse(data=user)

@router.get("/me", response_model=ApiResponse[schemas.User])
def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取当前用户信息
    """
    return ApiResponse(data=current_user)
