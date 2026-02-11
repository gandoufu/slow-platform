import requests
import time
from typing import Any, Dict, Optional, Tuple, Union
from pydantic import BaseModel

class RequestResult(BaseModel):
    status_code: int
    headers: Dict[str, Any]
    body: Any
    duration: float  # seconds
    error: Optional[str] = None

def run_request(
    method: str,
    url: str,
    params: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, Any]] = None,
    json_body: Optional[Any] = None,
    data_body: Optional[Any] = None,
    timeout: float = 10.0
) -> RequestResult:
    """
    Core function to execute HTTP requests
    """
    start_time = time.time()
    try:
        response = requests.request(
            method=method,
            url=url,
            params=params,
            headers=headers,
            json=json_body,
            data=data_body,
            timeout=timeout
        )
        duration = time.time() - start_time
        
        # Try to parse JSON response
        try:
            body = response.json()
        except ValueError:
            body = response.text

        return RequestResult(
            status_code=response.status_code,
            headers=dict(response.headers),
            body=body,
            duration=duration
        )
    except Exception as e:
        duration = time.time() - start_time
        return RequestResult(
            status_code=0,
            headers={},
            body=None,
            duration=duration,
            error=str(e)
        )
