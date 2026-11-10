
from typing import Any

import requests

from config.settings import (
    API_BASE_URL,
    REQUEST_TIMEOUT_SECONDS
)


class MeterApiClient:

    def __init__(
        self,
        base_url: str = API_BASE_URL,
        timeout: int = REQUEST_TIMEOUT_SECONDS
    ):

        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

        self.session = requests.Session()

        self.session.headers.update({
            "Accept": "application/json"
        })

    def _request(
        self,
        method: str,
        path: str,
        **kwargs: Any
    ) -> requests.Response:

        try:
            response = self.session.request(
                method,
                f"{self.base_url}{path}",
                timeout=self.timeout,
                **kwargs
            )

            response.raise_for_status()

            return response

        except requests.RequestException as exc:

            details = ""

            if exc.response is not None:
                details = (
                    f" | API response: "
                    f"{exc.response.text[:1000]}"
                )

            raise RuntimeError(
                f"Backend request {method} {path} failed: "
                f"{exc}{details}"
            ) from exc

    def get_buildings(self) -> list[dict[str, Any]]:

        data = self._request(
            "GET",
            "/buildings"
        ).json()

        if not isinstance(data, list):
            raise RuntimeError(
                "Buildings API did not return a list"
            )

        return data

    def get_meter_readings(self) -> list[dict[str, Any]]:

        data = self._request(
            "GET",
            "/meter-readings"
        ).json()

        if not isinstance(data, list):
            raise RuntimeError(
                "Meter readings API did not return a list"
            )

        return data

    def submit_meter_reading(
        self,
        reading: dict[str, Any]
    ) -> dict[str, Any] | None:

        response = self._request(
            "POST",
            "/meter-readings",
            json=reading
        )

        if not response.content:
            return None

        try:
            return response.json()

        except ValueError:
            return None
