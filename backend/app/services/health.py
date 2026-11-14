from typing import Literal

from pydantic import BaseModel


class HealthStatus(BaseModel):
    status: Literal["ok"]
    service: str


def get_health_status() -> HealthStatus:
    return HealthStatus(status="ok", service="project-language-backend")
