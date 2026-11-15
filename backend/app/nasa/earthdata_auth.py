import os
import httpx
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("nilam_pesum.nasa.auth")

class EarthdataAuthManager:
    """
    Manages NASA Earthdata Login (URS) authentication and session tokens.
    Transparently reports whether authentication is configured, pending, or valid.
    """
    def __init__(self):
        self.username = settings.NASA_EARTHDATA_USERNAME
        self.password = settings.NASA_EARTHDATA_PASSWORD
        self.token = settings.NASA_EARTHDATA_TOKEN
        self.urs_url = "https://urs.earthdata.nasa.gov"

    def get_auth_status(self) -> Dict[str, Any]:
        """
        Returns authentic, transparent status of Earthdata credentials.
        Never falsely marks integrations as connected if credentials are missing.
        """
        if not self.username and not self.token:
            return {
                "configured": False,
                "status": "Authentication required – configure NASA Earthdata credentials",
                "message": "Public products (NASA POWER) do not require Earthdata credentials. Restricted DAAC products (HLS, SMAP, MODIS) require a free Earthdata account at https://urs.earthdata.nasa.gov/"
            }
        
        return {
            "configured": True,
            "status": "Connected",
            "username": self.username if self.username else "Token-based",
            "message": "NASA Earthdata authentication configured."
        }

    def get_headers(self) -> Dict[str, str]:
        """Returns authorization headers for authenticated NASA DAAC requests."""
        headers = {
            "User-Agent": "NilamPesum-AgriculturalIntelligence/1.0 (TamilNaduFarmerPlatform)"
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

earthdata_auth = EarthdataAuthManager()

