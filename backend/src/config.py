from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # API
    API_TITLE: str = "Postech Fast Food API"
    API_DESCRIPTION: str = "API para sistema de autoatendimento de fast food"
    API_VERSION: str = "2.0.0"
    
    # CORS
    CORS_ALLOW_ORIGINS: List[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    
    # Database - Supabase
    DATABASE_URL: str = "postgresql://postgres.cpntprlstlhubeivkpzq:postech_fiap_2025@aws-0-us-east-2.pooler.supabase.com:6543/postgres"
    
    # Security
    SECRET_KEY: str = "fastfood-secret-key-2025-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"


# Override settings for production
if os.getenv("ENVIRONMENT") == "production":
    settings = Settings(
        CORS_ALLOW_ORIGINS=["https://fastfood.vercel.app", "https://fastfood-frontend.vercel.app"],
        DEBUG=False,
        ENVIRONMENT="production"
    )
else:
    settings = Settings() 