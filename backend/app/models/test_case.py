from datetime import datetime
from typing import Optional, Any, List, Dict
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class TestCase(Base):
    __tablename__ = "test_case"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id"), nullable=False, index=True)
    api_id: Mapped[Optional[int]] = mapped_column(ForeignKey("api.id"), nullable=True, index=True)
    
    name: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Request Data (Snapshot or Override)
    # We store the full request info needed to run the test (except env base_url)
    method: Mapped[str] = mapped_column(String(16), nullable=False)
    url: Mapped[str] = mapped_column(String(1024), nullable=False) # Can be path or full url, usually path
    headers: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    params: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True) # Query params
    body: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    body_type: Mapped[str] = mapped_column(String(32), default="json")
    
    # Assertions
    # List of rules: [{"source": "status_code", "operator": "eq", "value": 200}, ...]
    assertions: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", backref="test_cases")
    api = relationship("Api", backref="test_cases")
