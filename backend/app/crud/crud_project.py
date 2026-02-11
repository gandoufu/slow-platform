from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.project import Project, Environment
from app.schemas.project import ProjectCreate, ProjectUpdate, EnvironmentCreate, EnvironmentUpdate

# Project CRUD
def get_project(db: Session, project_id: int) -> Optional[Project]:
    return db.query(Project).filter(Project.id == project_id).first()

def get_projects(db: Session, skip: int = 0, limit: int = 100) -> List[Project]:
    return db.query(Project).offset(skip).limit(limit).all()

def create_project(db: Session, project: ProjectCreate, owner_id: int) -> Project:
    db_project = Project(
        name=project.name,
        description=project.description,
        is_active=project.is_active,
        owner_id=owner_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, db_project: Project, project_update: ProjectUpdate) -> Project:
    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int) -> Project:
    db_project = db.query(Project).get(project_id)
    db.delete(db_project)
    db.commit()
    return db_project

# Environment CRUD
def get_environments(db: Session, project_id: int) -> List[Environment]:
    return db.query(Environment).filter(Environment.project_id == project_id).all()

def create_environment(db: Session, environment: EnvironmentCreate, project_id: int) -> Environment:
    db_env = Environment(
        **environment.model_dump(),
        project_id=project_id
    )
    db.add(db_env)
    db.commit()
    db.refresh(db_env)
    return db_env
