from dataclasses import dataclass
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def _get_cors_origins() -> list[str]:
    configured_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    return [
        origin.strip()
        for origin in configured_origins.split(",")
        if origin.strip()
    ]


@dataclass(frozen=True)
class Settings:
    app_name: str
    environment: str
    gemini_api_key: str | None
    gemini_model: str
    cors_origins: list[str]


settings = Settings(
    app_name=os.getenv("APP_NAME", "Project Language API"),
    environment=os.getenv("ENVIRONMENT", "development"),
    gemini_api_key=os.getenv("GEMINI_API_KEY") or None,
    gemini_model=os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite"),
    cors_origins=_get_cors_origins(),
)
