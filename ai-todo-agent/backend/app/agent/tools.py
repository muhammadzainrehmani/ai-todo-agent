from typing import List, Optional, Type
from langchain.tools import BaseTool, tool
from pydantic import BaseModel, Field
from app.database import SessionLocal
from app.models import Todo
from app.rag import query_rag # Import the function we just wrote

# --- Tool Input Schemas ---

class CreateTodoInput(BaseModel):
    title: str = Field(..., description="The title of the task.")
    description: Optional[str] = Field(None, description="Optional details.")

class UpdateTodoInput(BaseModel):
    todo_id: int = Field(..., description="The numeric ID of the task to update.")
    title: Optional[str] = Field(None, description="New title.")
    description: Optional[str] = Field(None, description="New description.")
    is_completed: Optional[bool] = Field(None, description="True for done, False for pending.")

class DeleteTodoInput(BaseModel):
    todo_id: int = Field(..., description="The numeric ID of the task to delete.")

# ... (keep existing tool classes)

class SearchDocumentInput(BaseModel):
    question: str = Field(..., description="The specific question to ask the document.")


# --- Tool Generator ---

def get_user_tools(user_id: int):
    
    def get_db():
        return SessionLocal()

    @tool("create_todo", args_schema=CreateTodoInput)
    def create_todo(title: str, description: Optional[str] = None):
        """Use this to add a new task to the user's list."""
        print(f"🛠️ TOOL CALL: Create '{title}'") # Debug Print
        db = get_db()
        try:
            new_todo = Todo(title=title, description=description, owner_id=user_id)
            db.add(new_todo)
            db.commit()
            db.refresh(new_todo)
            return f"Success: Created task '{title}' with ID {new_todo.id}"
        except Exception as e:
            return f"Error: {str(e)}"
        finally:
            db.close()

    @tool("read_todos")
    def read_todos():
        """Use this to see all current tasks for the user."""
        print(f"🛠️ TOOL CALL: Read List") # Debug Print
        db = get_db()
        try:
            todos = db.query(Todo).filter(Todo.owner_id == user_id).all()
            if not todos:
                return "You have no tasks in your list."
            
            result = "Your Todo List:\n"
            for t in todos:
                status = "[x]" if t.is_completed else "[ ]"
                result += f"ID {t.id}: {status} {t.title} (Description: {t.description or 'None'})\n"
            return result
        finally:
            db.close()

    @tool("update_todo", args_schema=UpdateTodoInput)
    def update_todo(todo_id: int, title: str = None, description: str = None, is_completed: bool = None):
        """Use this to modify an existing task."""
        print(f"🛠️ TOOL CALL: Update ID {todo_id}") # Debug Print
        db = get_db()
        try:
            # Security check: Ensure user owns the task
            todo = db.query(Todo).filter(Todo.id == todo_id, Todo.owner_id == user_id).first()
            if not todo:
                return f"Error: Task with ID {todo_id} not found. Please use 'read_todos' to verify the ID."
            
            if title: todo.title = title
            if description: todo.description = description
            if is_completed is not None: todo.is_completed = is_completed
            
            db.commit()
            return f"Success: Updated task ID {todo_id}"
        except Exception as e:
            print(f"❌ Update Error: {e}")
            return f"Error updating task: {str(e)}"
        finally:
            db.close()

    @tool("delete_todo", args_schema=DeleteTodoInput)
    def delete_todo(todo_id: int):
        """Use this to permanently remove a task."""
        print(f"🛠️ TOOL CALL: Delete ID {todo_id}") # Debug Print
        db = get_db()
        try:
            # Security check
            todo = db.query(Todo).filter(Todo.id == todo_id, Todo.owner_id == user_id).first()
            if not todo:
                return f"Error: Task with ID {todo_id} not found. Read the list to check IDs."
            
            db.delete(todo)
            db.commit()
            return f"Success: Deleted task ID {todo_id}"
        except Exception as e:
            print(f"❌ Delete Error: {e}")
            return f"Error deleting task: {str(e)}"
        finally:
            db.close()

    @tool("search_document", args_schema=SearchDocumentInput)
    def search_document(question: str):
        """Use this tool to answer questions based on the uploaded document."""
        print(f"🔍 RAG SEARCH: {question}")
        context = query_rag(question)
        return f"Relevant info from document:\n{context}"

    return [create_todo, read_todos, update_todo, delete_todo, search_document]