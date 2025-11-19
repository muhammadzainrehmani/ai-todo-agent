from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    """
    SQLAlchemy Model for the 'users' table.
    Stores authentication details.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    # Relationship: A user can have multiple todo items
    todos = relationship("Todo", back_populates="owner")

class Todo(Base):
    """
    SQLAlchemy Model for the 'todos' table.
    Stores the actual task data.
    """
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Link the Todo to a specific User ID (Foreign Key)
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationship: A todo belongs to one user
    owner = relationship("User", back_populates="todos")