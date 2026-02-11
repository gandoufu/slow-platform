from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings

router = APIRouter()

from app.schemas.response import ApiResponse

@router.post("/access-token", response_model=ApiResponse[schemas.Token])
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 兼容的 Token 登录，获取 Access Token 用于后续请求
    """
    user = crud.crud_user.authenticate(
        db, username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="用户未激活")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "access_token": security.create_access_token(
            user.username, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
    return ApiResponse(data=token_data)

@router.post("/register", response_model=ApiResponse[schemas.User])
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserRegister,
) -> Any:
    """
    注册新用户
    """
    user = crud.crud_user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="该用户名的用户已存在",
        )
    user_by_email = crud.crud_user.get_by_email(db, email=user_in.email)
    if user_by_email:
        raise HTTPException(
            status_code=400,
            detail="该邮箱的用户已存在",
        )
    
    user_create = schemas.UserCreate(
        username=user_in.username,
        email=user_in.email,
        display_name=user_in.display_name,
        password=user_in.password,
        role="TESTER", # Default role for self-registration
        is_active=True
    )
    user = crud.crud_user.create(db, obj_in=user_create)
    return ApiResponse(data=user)
