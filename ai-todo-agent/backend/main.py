from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi import File, UploadFile
from app.rag import process_document
from sqlalchemy.orm import Session
from typing import List
import shutil
import json
import os

# Import our internal modules
from app import models, schemas, auth, database
from app.agent.graph import create_user_graph
from langchain_core.messages import HumanMessage

# 1. Initialize Database Tables
# This automatically creates 'users' and 'todos' tables if they don't exist.
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AI Todo Agent")

# 2. CORS Setup (Crucial for React)
# Allows the frontend (running on port 5173) to talk to this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependency to get DB ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and save
    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # verify user
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate Token
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ==========================================
# DATA ENDPOINTS (For Initial UI Load)
# ==========================================

@app.get("/todos", response_model=List[schemas.TodoResponse])
def get_todos(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    Fetch all todos for the logged-in user. 
    Used to populate the UI before the user starts chatting.
    """
    return current_user.todos

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Save file temporarily
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process it
    try:
        msg = process_document(file_location)
        # Cleanup
        os.remove(file_location)
        return {"message": msg}
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# WEBSOCKET CHAT ENDPOINT (The Core)
# ==========================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None, db: Session = Depends(get_db)):
    await websocket.accept()

    # 1. Auth Check (Same as before)
    user = None
    try:
        if token is None:
            raise Exception("Authentication token missing.")
        try:
            payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        except auth.JWTError:
             raise Exception("Session expired.")
        email = payload.get("sub")
        user = db.query(models.User).filter(models.User.email == email).first()
        if user is None:
            raise Exception("User account not found.")
    except Exception as e:
        await websocket.send_json({"type": "error", "content": str(e)})
        await websocket.close(code=1008)
        return

    # 2. Initialize AI
    try:
        agent_graph = create_user_graph(user.id)
    except Exception as e:
        await websocket.send_json({"type": "error", "content": "AI Init Failed"})
        await websocket.close()
        return

    # 3. Streaming Chat Loop
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                inputs = {"messages": [HumanMessage(content=data)]}
                
                # Signal start of stream
                await websocket.send_json({"type": "start"})

                # ASTREAM EVENTS: This is where the magic happens
                # We listen to every event in the AI's brain
                async for event in agent_graph.astream_events(inputs, version="v1"):
                    kind = event["event"]
                    
                    # Filter 1: Only look for the LLM generating text
                    if kind == "on_chat_model_stream":
                        content = event["data"]["chunk"].content
                        if content:
                            # Send just this tiny piece of text
                            await websocket.send_json({"type": "token", "content": content})
                
                # Signal end of stream (so Frontend knows to refresh Todo List)
                await websocket.send_json({"type": "end"})
                
            except Exception as e:
                print(f"Streaming Error: {e}")
                await websocket.send_json({"type": "error", "content": str(e)})
            
    except WebSocketDisconnect:
        print(f"User {user.email} disconnected")