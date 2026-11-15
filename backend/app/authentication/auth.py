import os
import hmac
import hashlib
import base64
import json
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.models import Profile

SECRET_KEY = getattr(settings, "APP_SECRET_KEY", "nilam-pesum-secret-key-tamil-nadu-2026-nasa")
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a unique salt."""
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"{salt.hex()}${dk.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored salt$hash string."""
    try:
        if not hashed_password or "$" not in hashed_password:
            return False
        salt_hex, hash_hex = hashed_password.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
        return secrets.compare_digest(dk.hex(), hash_hex)
    except Exception:
        return False

def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

def _b64decode(s: str) -> bytes:
    padding = 4 - (len(s) % 4)
    if padding and padding < 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s)

def create_access_token(data: Dict[str, Any], expires_delta_hours: int = 168) -> str:
    """Creates a signed JWT-compatible token valid for 7 days."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(hours=expires_delta_hours)
    payload["exp"] = int(expire.timestamp())

    header_json = json.dumps(header, separators=(",", ":")).encode("utf-8")
    payload_json = json.dumps(payload, separators=(",", ":")).encode("utf-8")

    unsigned_token = f"{_b64encode(header_json)}.{_b64encode(payload_json)}"
    signature = hmac.new(SECRET_KEY.encode("utf-8"), unsigned_token.encode("utf-8"), hashlib.sha256).digest()

    return f"{unsigned_token}.{_b64encode(signature)}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and cryptographically verifies an access token."""
    try:
        parts = token.strip().split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts

        unsigned_token = f"{header_b64}.{payload_b64}"
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), unsigned_token.encode("utf-8"), hashlib.sha256).digest()
        provided_sig = _b64decode(signature_b64)

        if not secrets.compare_digest(expected_sig, provided_sig):
            return None

        payload_bytes = _b64decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        # Verify expiration
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            return None

        return payload
    except Exception:
        return None

def generate_random_token() -> str:
    """Generates an unguessable URL-safe token for email verification and password resets."""
    return secrets.token_urlsafe(32)

def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[Profile]:
    """Returns the authenticated Profile if a valid Bearer token is provided, else None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    user_id = payload["sub"]
    return db.query(Profile).filter(Profile.id == user_id).first()

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Profile:
    """FastAPI dependency requiring authentication."""
    user = get_current_user_optional(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required / உள்நுழைவு தேவை",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

def require_role(allowed_roles: list[str]):
    """FastAPI dependency requiring a specific role."""
    def role_checker(user: Profile = Depends(get_current_user)) -> Profile:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied for role '{user.role}' / அணுகல் மறுக்கப்பட்டது"
            )
        return user
    return role_checker

