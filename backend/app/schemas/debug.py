from typing import Any, Optional, Dict
from pydantic import BaseModel

class DebugRequest(BaseModel):
    method: str
    url: str
    params: Optional[Dict[str, Any]] = None
    headers: Optional[Dict[str, Any]] = None
    body: Optional[Any] = None
    body_type: str = "json"  # json, form
    environment_id: Optional[int] = None # If provided, base_url will be prepended

class DebugResponse(BaseModel):
    status_code: int
    headers: Dict[str, Any]
    body: Any
    duration: float
    error: Optional[str] = None
