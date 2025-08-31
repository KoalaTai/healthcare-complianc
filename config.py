"""
Configuration management for VirtualBackroom.ai
Uses Pydantic settings for type safety and validation
"""
import os
from typing import List, Optional
from pydantic import BaseSettings, Field
from pydantic_settings import BaseSettings as PydanticBaseSettings


class SecuritySettings(BaseSettings):
    """Security-related configuration"""
    secret_key: str = Field(..., env="SECURITY_SECRET_KEY")
    debug: bool = Field(False, env="SECURITY_DEBUG")
    testing: bool = Field(False, env="SECURITY_TESTING")
    csrf_enabled: bool = Field(True, env="SECURITY_CSRF_ENABLED")
    
    class Config:
        env_prefix = "SECURITY_"


class DatabaseSettings(BaseSettings):
    """Database configuration"""
    url: str = Field(..., env="DATABASE_URL")
    
    class Config:
        env_prefix = "DATABASE_"


class AIProviderSettings(BaseSettings):
    """AI Provider configuration"""
    default_provider: str = Field("gemini", env="AI_PROVIDERS_DEFAULT_PROVIDER")
    fallback_chain: List[str] = Field(
        default=["gemini", "openai", "anthropic", "perplexity", "local"],
        env="AI_PROVIDERS_FALLBACK_CHAIN"
    )
    gemini_api_key: Optional[str] = Field(None, env="AI_PROVIDERS_GEMINI_API_KEY")
    openai_api_key: Optional[str] = Field(None, env="AI_PROVIDERS_OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(None, env="AI_PROVIDERS_ANTHROPIC_API_KEY")
    perplexity_api_key: Optional[str] = Field(None, env="AI_PROVIDERS_PERPLEXITY_API_KEY")
    
    class Config:
        env_prefix = "AI_PROVIDERS_"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse comma-separated fallback chain if it's a string
        if isinstance(self.fallback_chain, str):
            self.fallback_chain = [s.strip() for s in self.fallback_chain.split(",")]


class FirebaseSettings(BaseSettings):
    """Firebase configuration"""
    api_key: Optional[str] = Field(None, env="FIREBASE_API_KEY")
    auth_domain: Optional[str] = Field(None, env="FIREBASE_AUTH_DOMAIN")
    project_id: Optional[str] = Field(None, env="FIREBASE_PROJECT_ID")
    storage_bucket: Optional[str] = Field(None, env="FIREBASE_STORAGE_BUCKET")
    messaging_sender_id: Optional[str] = Field(None, env="FIREBASE_MESSAGING_SENDER_ID")
    app_id: Optional[str] = Field(None, env="FIREBASE_APP_ID")
    
    class Config:
        env_prefix = "FIREBASE_"


class AWSSettings(BaseSettings):
    """AWS configuration for production deployment"""
    region: str = Field("us-west-2", env="AWS_REGION")
    cognito_user_pool_id: Optional[str] = Field(None, env="AWS_COGNITO_USER_POOL_ID")
    s3_bucket_name: Optional[str] = Field(None, env="AWS_S3_BUCKET_NAME")
    
    class Config:
        env_prefix = "AWS_"


class CelerySettings(BaseSettings):
    """Celery configuration for async tasks"""
    broker_url: str = Field("redis://localhost:6379", env="CELERY_BROKER_URL")
    result_backend: str = Field("redis://localhost:6379", env="CELERY_RESULT_BACKEND")
    
    class Config:
        env_prefix = "CELERY_"


class Config:
    """Main configuration class that combines all settings"""
    
    def __init__(self):
        # Load environment variables from .env file
        from dotenv import load_dotenv
        load_dotenv()
        
        # Initialize all setting groups
        self.security = SecuritySettings()
        self.database = DatabaseSettings()
        self.ai_providers = AIProviderSettings()
        self.firebase = FirebaseSettings()
        self.aws = AWSSettings()
        self.celery = CelerySettings()
        
        # Application settings
        self.app_host = os.getenv("APP_HOST", "0.0.0.0")
        self.app_port = int(os.getenv("APP_PORT", 5000))
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    @property
    def flask_config(self) -> dict:
        """Generate Flask configuration dictionary"""
        return {
            "SECRET_KEY": self.security.secret_key,
            "DEBUG": self.security.debug,
            "TESTING": self.security.testing,
            "WTF_CSRF_ENABLED": self.security.csrf_enabled,
            "SQLALCHEMY_DATABASE_URI": self.database.url,
            "SQLALCHEMY_TRACK_MODIFICATIONS": False,
            "SQLALCHEMY_ENGINE_OPTIONS": {
                "pool_pre_ping": True,
                "pool_recycle": 300,
            }
        }


# Create global config instance
config = Config()