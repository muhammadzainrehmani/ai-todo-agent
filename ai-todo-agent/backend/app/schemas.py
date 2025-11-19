from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Token Schemas (For Auth Bonus) ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Todo Schemas ---
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_completed: Optional[bool] = False

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None

class TodoResponse(TodoBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    todos: List[TodoResponse] = []

    class Config:
        from_attributes = True