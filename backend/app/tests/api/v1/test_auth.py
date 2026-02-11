from fastapi.testclient import TestClient
from app.core.config import settings

def test_create_user(client: TestClient) -> None:
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword",
        "display_name": "Test User"
    }
    # 注册接口
    response = client.post(f"{settings.API_V1_STR}/login/register", json=data)
    assert response.status_code == 200
    content = response.json()
    assert content["code"] == 200
    assert content["data"]["username"] == data["username"]
    assert content["data"]["email"] == data["email"]
    assert "id" in content["data"]

def test_login_access_token(client: TestClient) -> None:
    login_data = {
        "username": "testuser",
        "password": "testpassword"
    }
    response = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    assert response.status_code == 200
    content = response.json()
    assert content["code"] == 200
    assert "access_token" in content["data"]
    assert content["data"]["token_type"] == "bearer"

def test_read_user_me(client: TestClient) -> None:
    # 先登录获取 token
    login_data = {
        "username": "testuser",
        "password": "testpassword"
    }
    login_response = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    token = login_response.json()["data"]["access_token"]
    
    # 使用 token 获取用户信息
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(f"{settings.API_V1_STR}/users/me", headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert content["code"] == 200
    assert content["data"]["username"] == "testuser"
