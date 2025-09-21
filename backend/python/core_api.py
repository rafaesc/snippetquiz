import os
from typing import Any, Dict, Optional

import requests


class CoreApiClient:
    def __init__(self):
        # Get environment variables for core service
        core_host = os.getenv("CORE_SERVICE_HOST", "localhost")
        core_port = os.getenv("CORE_SERVICE_PORT", "3000")
        self.base_url = f"http://{core_host}:{core_port}/api"

    def _make_request(
        self, endpoint: str, user_id: str, method: str = "GET"
    ) -> Optional[Dict[Any, Any]]:
        """Make HTTP request with X-User-Id header"""
        try:
            headers = {"X-User-Id": user_id, "Content-Type": "application/json"}

            url = f"{self.base_url}/{endpoint}"

            if method == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            else:
                response = requests.request(method, url, headers=headers, timeout=30)

            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            print(f"❌ Core API request failed: {e}")
            return None
        except Exception as e:
            print(f"❌ Unexpected error in Core API request: {e}")
            return None

    def get_content_entry(
        self, content_entry_id: int, user_id: str
    ) -> Optional[Dict[Any, Any]]:
        """Get content entry by ID"""
        endpoint = f"content-entry/{str(content_entry_id)}"
        return self._make_request(endpoint, user_id)

    def get_quiz(self, quiz_id: str, user_id: str) -> Optional[Dict[Any, Any]]:
        """Get quiz by ID"""
        endpoint = f"quiz/{quiz_id}"
        return self._make_request(endpoint, user_id)
