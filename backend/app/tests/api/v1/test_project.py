from fastapi.testclient import TestClient
from app.core.config import settings

def test_create_project(client: TestClient) -> None:
    # 1. 登录
    login_data = {"username": "testuser", "password": "testpassword"}
    login_res = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. 创建项目
    project_data = {
        "name": "Test Project",
        "description": "A project for testing"
    }
    response = client.post(
        f"{settings.API_V1_STR}/projects/",
        headers=headers,
        json=project_data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["code"] == 200
    assert content["data"]["name"] == project_data["name"]
    assert content["data"]["owner_id"] is not None

def test_read_projects(client: TestClient) -> None:
    login_data = {"username": "testuser", "password": "testpassword"}
    login_res = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"{settings.API_V1_STR}/projects/", headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert content["code"] == 200
    assert isinstance(content["data"], list)
    assert len(content["data"]) >= 1

def test_create_environment(client: TestClient) -> None:
    login_data = {"username": "testuser", "password": "testpassword"}
    login_res = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 获取项目ID (假设 test_create_project 已执行)
    projects_res = client.get(f"{settings.API_V1_STR}/projects/", headers=headers)
    project_id = projects_res.json()["data"][0]["id"]

    env_data = {
        "name": "Dev Env",
        "code": "dev",
        "base_url": "http://localhost:8080"
    }
    response = client.post(
        f"{settings.API_V1_STR}/projects/{project_id}/environments/",
        headers=headers,
        json=env_data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["code"] == 200
    assert content["data"]["name"] == env_data["name"]
    assert content["data"]["project_id"] == project_id
