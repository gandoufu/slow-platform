from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.api import Api, ApiRequestTemplate
from app.schemas.interface import ApiCreate, ApiUpdate, ApiRequestTemplateCreate, ApiRequestTemplateUpdate

def get_api(db: Session, api_id: int) -> Optional[Api]:
    return db.query(Api).filter(Api.id == api_id).first()

def get_apis(
    db: Session, 
    project_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    module_name: Optional[str] = None
) -> List[Api]:
    query = db.query(Api).filter(Api.project_id == project_id)
    if module_name:
        query = query.filter(Api.module_name == module_name)
    return query.offset(skip).limit(limit).all()

def create_api(db: Session, api: ApiCreate) -> Api:
    # 1. Create API
    db_api = Api(
        project_id=api.project_id,
        name=api.name,
        method=api.method,
        url_path=api.url_path,
        module_name=api.module_name,
        description=api.description
    )
    db.add(db_api)
    db.commit()
    db.refresh(db_api)

    # 2. Create Request Template if provided
    if api.request_template:
        db_template = ApiRequestTemplate(
            api_id=db_api.id,
            **api.request_template.model_dump()
        )
        db.add(db_template)
        db.commit()
        db.refresh(db_api) # Refresh to load relationship
    
    return db_api

def update_api(db: Session, db_api: Api, api_update: ApiUpdate) -> Api:
    # 1. Update API fields
    update_data = api_update.model_dump(exclude={"request_template"}, exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_api, field, value)
    
    # 2. Update Request Template if provided
    if api_update.request_template:
        if db_api.request_template:
            # Update existing template
            template_data = api_update.request_template.model_dump(exclude_unset=True)
            for field, value in template_data.items():
                setattr(db_api.request_template, field, value)
        else:
            # Create new template if not exists
            db_template = ApiRequestTemplate(
                api_id=db_api.id,
                **api_update.request_template.model_dump()
            )
            db.add(db_template)
    
    db.add(db_api)
    db.commit()
    db.refresh(db_api)
    return db_api

def delete_api(db: Session, api_id: int) -> Api:
    db_api = db.query(Api).get(api_id)
    db.delete(db_api)
    db.commit()
    return db_api
