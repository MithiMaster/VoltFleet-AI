import os
from dotenv import load_dotenv

# Load environment variables from .env file in the backend directory
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

class Settings:
    # SMTP Settings for Gmail
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "")

    # PostgreSQL configuration
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "voltgrid")

    @property
    def DATABASE_URL(self) -> str:
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            return env_url
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    JWT_SECRET: str = os.getenv("JWT_SECRET", "voltgrid_super_secret_signing_key_2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Simulation settings
    SIMULATION_ACTIVE: bool = os.getenv("SIMULATION_ACTIVE", "True").lower() == "true"
    SIMULATION_INTERVAL_SECONDS: int = int(os.getenv("SIMULATION_INTERVAL_SECONDS", "10"))

settings = Settings()

