from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.schemas.response import ApiResponse, ErrorCode

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=ApiResponse(
            code=ErrorCode.VALIDATION_ERROR,
            message="请求参数验证失败",
            data={"errors": exc.errors()}
        ).model_dump(mode='json')
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ApiResponse(
            code=exc.status_code,
            message=exc.detail,
            data=None
        ).model_dump(mode='json')
    )
