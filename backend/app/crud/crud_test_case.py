from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.test_case import TestCase
from app.schemas.test_case import TestCaseCreate, TestCaseUpdate

def get_test_case(db: Session, test_case_id: int) -> Optional[TestCase]:
    return db.query(TestCase).filter(TestCase.id == test_case_id).first()

def get_test_cases(db: Session, project_id: int, skip: int = 0, limit: int = 100) -> List[TestCase]:
    return db.query(TestCase).filter(TestCase.project_id == project_id).offset(skip).limit(limit).all()

def create_test_case(db: Session, test_case: TestCaseCreate, project_id: int) -> TestCase:
    db_obj = TestCase(
        project_id=project_id,
        api_id=test_case.api_id,
        name=test_case.name,
        description=test_case.description,
        method=test_case.method,
        url=test_case.url,
        headers=test_case.headers,
        params=test_case.params,
        body=test_case.body,
        body_type=test_case.body_type,
        assertions=test_case.assertions
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_test_case(db: Session, db_obj: TestCase, obj_in: TestCaseUpdate) -> TestCase:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_test_case(db: Session, test_case_id: int) -> TestCase:
    obj = db.query(TestCase).get(test_case_id)
    db.delete(obj)
    db.commit()
    return obj
