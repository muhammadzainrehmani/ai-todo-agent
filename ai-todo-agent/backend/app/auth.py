from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt 
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import schemas, models, database
import os
from dotenv import load_dotenv

load_dotenv()

# 1. CONFIGURATION
SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key_if_none_set")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 2. PASSWORD HASHING
# This helper handles encrypting passwords so we never store them as plain text.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 3. TOKEN AUTH SCHEME
# This tells FastAPI that the client should send the token in the "Authorization" header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Helper Functions ---

def verify_password(plain_password, hashed_password):
    """Checks if the typed password matches the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Converts a plain password into a secure hash."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Generates a JWT token that expires after a set time."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Dependency: Get Current User ---

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    """
    Decodes the token to find out WHICH user is making the request.
    If the token is invalid or expired, it throws an error.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user