from fastapi import APIRouter

from app.services.health import HealthStatus, get_health_status

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthStatus)
def health_check() -> HealthStatus:
    return get_health_status()
