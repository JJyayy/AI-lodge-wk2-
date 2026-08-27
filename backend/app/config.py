import os
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def allowed_origins_list(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return ["http://localhost:5173", "http://127.0.0.1:5173"]
        # Split by comma and strip whitespace
        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        return origins


settings = Settings()
