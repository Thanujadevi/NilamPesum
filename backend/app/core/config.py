import os
from pathlib import Path
from typing import List
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "NILAM PESUM (நிலம் பேசும்)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./nilam_pesum.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nilam_pesum_super_secret_jwt_key_2026_dev")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # NASA Endpoints
    NASA_POWER_BASE_URL: str = os.getenv("NASA_POWER_BASE_URL", "https://power.larc.nasa.gov/api/temporal/daily/point")
    NASA_CMR_BASE_URL: str = os.getenv("NASA_CMR_BASE_URL", "https://cmr.earthdata.nasa.gov/search")
    NASA_GIBS_WMTS_URL: str = os.getenv("NASA_GIBS_WMTS_URL", "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best")
    
    # NASA Earthdata Credentials
    NASA_EARTHDATA_USERNAME: str = os.getenv("NASA_EARTHDATA_USERNAME", "")
    NASA_EARTHDATA_PASSWORD: str = os.getenv("NASA_EARTHDATA_PASSWORD", "")
    NASA_EARTHDATA_TOKEN: str = os.getenv("NASA_EARTHDATA_TOKEN", "")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # Optional LLM API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
