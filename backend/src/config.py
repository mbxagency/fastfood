import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/fastfood")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fastfood-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Admin Authentication
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # CORS - Use string and convert to list when needed
    CORS_ALLOW_ORIGINS_STR: str = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000")
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    
    # API
    API_TITLE: str = "FastFood API"
    API_DESCRIPTION: str = "API para sistema de autoatendimento de fast food"
    API_VERSION: str = "1.0.0"
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Validate DATABASE_URL
        self._validate_database_url()
    
    def _validate_database_url(self):
        """Validate DATABASE_URL format"""
        if self.DATABASE_URL.startswith("DATABASE_URL="):
            raise ValueError(
                f"Invalid DATABASE_URL format. Got: {self.DATABASE_URL}\n"
                "Expected: postgresql://user:pass@host:port/db\n"
                "Make sure the environment variable is set correctly in Render."
            )
        
        if not self.DATABASE_URL.startswith("postgresql://"):
            raise ValueError(
                f"Invalid DATABASE_URL. Must start with 'postgresql://'. Got: {self.DATABASE_URL}"
            )
    
    @property
    def CORS_ALLOW_ORIGINS(self) -> List[str]:
        """Convert CORS_ALLOW_ORIGINS_STR to list"""
        if not self.CORS_ALLOW_ORIGINS_STR:
            return ["http://localhost:3000"]
        
        origins = []
        for origin in self.CORS_ALLOW_ORIGINS_STR.split(","):
            origin = origin.strip()
            if origin:
                origins.append(origin)
        
        return origins if origins else ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Create settings instance
settings = Settings() 