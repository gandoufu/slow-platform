from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class TestCaseBase(BaseModel):
    name: str
    description: Optional[str] = None
    method: str
    url: str
    headers: Optional[Dict[str, Any]] = None
    params: Optional[Dict[str, Any]] = None
    body: Optional[Any] = None
    body_type: str = "json"
    assertions: Optional[List[Dict[str, Any]]] = None
    api_id: Optional[int] = None

# Properties to receive on item creation
class TestCaseCreate(TestCaseBase):
    pass

# Properties to receive on item update
class TestCaseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    method: Optional[str] = None
    url: Optional[str] = None
    headers: Optional[Dict[str, Any]] = None
    params: Optional[Dict[str, Any]] = None
    body: Optional[Any] = None
    body_type: Optional[str] = None
    assertions: Optional[List[Dict[str, Any]]] = None
    api_id: Optional[int] = None

# Properties shared by models stored in DB
class TestCaseInDBBase(TestCaseBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class TestCase(TestCaseInDBBase):
    pass
