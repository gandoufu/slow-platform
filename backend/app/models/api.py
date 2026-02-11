from datetime import datetime
from typing import Optional, Any
from sqlalchemy import String, Boolean, DateTime, ForeignKey, JSON, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Api(Base):
    __tablename__ = "api"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id"), nullable=False, index=True)
    module_name: Mapped[Optional[str]] = mapped_column(String(128), index=True, nullable=True)
    name: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    method: Mapped[str] = mapped_column(String(16), nullable=False)  # GET, POST, etc.
    url_path: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", backref="apis")
    request_template = relationship("ApiRequestTemplate", back_populates="api", uselist=False, cascade="all, delete-orphan")

class ApiRequestTemplate(Base):
    __tablename__ = "api_request_template"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    api_id: Mapped[int] = mapped_column(ForeignKey("api.id"), nullable=False, unique=True)
    path_params: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    query_params: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    headers: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    body: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True) # Stores JSON body or other types structure
    body_type: Mapped[str] = mapped_column(String(32), default="json") # json, form, raw, etc.
    
    # Relationships
    api = relationship("Api", back_populates="request_template")
