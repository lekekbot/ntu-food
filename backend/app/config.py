from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database Configuration (supports both SQLite and PostgreSQL/Supabase)
    DATABASE_URL: str = "sqlite:///./ntu_food.db"

    # Supabase Configuration (optional, for future Supabase Auth integration)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    # Email Configuration
    EMAIL_TESTING_MODE: bool = True  # Set to False to send real emails

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()