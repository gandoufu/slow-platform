from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings

# 使用 SQLite 内存数据库进行测试
# 注意：生产环境是 MySQL，如果用到 MySQL 特有功能，这里需要改为测试用的 MySQL 数据库
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db() -> Generator:
    # 创建表结构
    Base.metadata.create_all(bind=engine)
    yield TestingSessionLocal()
    # 清理表结构
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db) -> Generator:
    # 覆盖依赖注入，使用测试数据库 Session
    def override_get_db():
        try:
            # 使用一个新的 session，但绑定到同一个 engine
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
