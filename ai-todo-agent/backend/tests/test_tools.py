import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch
from app.database import Base
from app.models import User, Todo
from app.agent.tools import get_user_tools

# 1. Setup a Mock Database (In-Memory SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 2. Fixture: Create/Destroy DB for each test
@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    
    # CRITICAL FIX: Prevent the tool from closing the session during tests
    # We overwrite the .close() method to do nothing.
    session.close = lambda: None
    
    try:
        yield session
    finally:
        # Restore real close functionality for cleanup
        del session.close 
        session.close()
        Base.metadata.drop_all(bind=engine)

# 3. Fixture: Create a Mock User
@pytest.fixture
def test_user(db_session):
    user = User(email="test@test.com", hashed_password="fake_hash")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

# --- THE FIXED TESTS ---

def test_create_todo(db_session, test_user):
    """Test if the Create Tool actually adds data to the DB"""
    
    user_id = test_user.id # Store ID before running tool
    
    with patch("app.agent.tools.SessionLocal", return_value=db_session):
        tools = get_user_tools(user_id)
        create_tool = next(t for t in tools if t.name == "create_todo")

        # Run tool
        result = create_tool.invoke({"title": "Test Task", "description": "Unit Test"})

        # Verify
        assert "Success" in result
        
        # Check DB
        todo = db_session.query(Todo).first()
        assert todo is not None
        assert todo.title == "Test Task"
        assert todo.owner_id == user_id

def test_read_todos(db_session, test_user):
    """Test if Read Tool can fetch the list"""
    
    # Add task manually
    task = Todo(title="Buy Milk", owner_id=test_user.id)
    db_session.add(task)
    db_session.commit()

    with patch("app.agent.tools.SessionLocal", return_value=db_session):
        tools = get_user_tools(test_user.id)
        read_tool = next(t for t in tools if t.name == "read_todos")

        result = read_tool.invoke({})

        # Check if the task title appears in the output
        assert "Buy Milk" in result
        # We check for "ID" to ensure some ID format is present
        assert "ID" in result

def test_delete_todo_security(db_session, test_user):
    """Test that User A cannot delete User B's task"""
    
    task_a = Todo(title="User A Task", owner_id=test_user.id)
    db_session.add(task_a)
    
    task_b = Todo(title="User B Task", owner_id=999) # Different Owner
    db_session.add(task_b)
    db_session.commit()

    with patch("app.agent.tools.SessionLocal", return_value=db_session):
        tools = get_user_tools(test_user.id)
        delete_tool = next(t for t in tools if t.name == "delete_todo")

        # Try to delete User B's task
        result = delete_tool.invoke({"todo_id": task_b.id})

        # Assert it failed
        assert "Error" in result
        
        # Verify Task B still exists
        exists = db_session.query(Todo).filter(Todo.id == task_b.id).first()
        assert exists is not None
