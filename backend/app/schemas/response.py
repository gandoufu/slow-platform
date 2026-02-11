from typing import Generic, TypeVar, Optional, List
from datetime import datetime
from pydantic import BaseModel
from enum import IntEnum

T = TypeVar('T')

class ErrorCode(IntEnum):
    """错误码枚举"""
    SUCCESS = 200
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    INTERNAL_ERROR = 500
    VALIDATION_ERROR = 422
    
    # 业务相关错误码
    TEST_EXECUTION_FAILED = 1001
    TEST_CASE_NOT_FOUND = 1002
    PROJECT_NOT_FOUND = 1003
    ENVIRONMENT_NOT_FOUND = 1004

class ApiResponse(BaseModel, Generic[T]):
    """统一API响应格式"""
    code: int = 200
    message: str = "success"
    data: Optional[T] = None
    timestamp: datetime = datetime.now()

class PaginatedResponse(BaseModel, Generic[T]):
    """分页数据响应"""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool
