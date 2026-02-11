from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

# --- Environment Schemas ---
class EnvironmentBase(BaseModel):
    name: str
    code: str
    base_url: str
    description: Optional[str] = None
    headers: Optional[Dict[str, Any]] = None
    is_default: bool = False

class EnvironmentCreate(EnvironmentBase):
    pass

class EnvironmentUpdate(EnvironmentBase):
    pass

class EnvironmentInDBBase(EnvironmentBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Environment(EnvironmentInDBBase):
    pass

# --- Project Schemas ---
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: Optional[bool] = True

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    pass

class ProjectInDBBase(ProjectBase):
    id: int
    owner_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Project(ProjectInDBBase):
    environments: List[Environment] = []
