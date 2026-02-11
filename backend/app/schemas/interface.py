from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- Request Template Schemas ---
class ApiRequestTemplateBase(BaseModel):
    path_params: Optional[Dict[str, Any]] = None
    query_params: Optional[Dict[str, Any]] = None
    headers: Optional[Dict[str, Any]] = None
    body: Optional[Any] = None
    body_type: str = "json"

class ApiRequestTemplateCreate(ApiRequestTemplateBase):
    pass

class ApiRequestTemplateUpdate(ApiRequestTemplateBase):
    pass

class ApiRequestTemplate(ApiRequestTemplateBase):
    id: int
    api_id: int

    class Config:
        from_attributes = True

# --- API Schemas ---
class ApiBase(BaseModel):
    name: str
    method: str
    url_path: str
    module_name: Optional[str] = None
    description: Optional[str] = None

class ApiCreate(ApiBase):
    project_id: int
    request_template: Optional[ApiRequestTemplateCreate] = None

class ApiUpdate(ApiBase):
    name: Optional[str] = None
    method: Optional[str] = None
    url_path: Optional[str] = None
    request_template: Optional[ApiRequestTemplateUpdate] = None

class Api(ApiBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    request_template: Optional[ApiRequestTemplate] = None

    class Config:
        from_attributes = True
