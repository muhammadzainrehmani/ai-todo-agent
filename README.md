# AI Agent Todo List Application

A full-stack AI-powered Todo management app that lets users control their tasks through natural language. Built using **React**, **FastAPI**, and **LangGraph**, with **Google Gemini** as the LLM.

The system meets assessment requirements by supporting real-time streaming, CRUD operations, user authentication, database integration, and RAG-based document processing.

---

## 📋 Requirements & Tech Stack

### Core Technologies
- **Frontend:** React (Vite), Tailwind CSS, Lucide React, WebSockets  
- **Backend:** FastAPI, Python 3.10+, Uvicorn  
- **AI Layer:** LangChain, LangGraph, Google Gemini 1.5 Flash  
- **Databases:** PostgreSQL (relational), ChromaDB (vector store)  
- **Testing:** Pytest  

### Prerequisites
Make sure the following are installed:
- Python 3.10+
- Node.js & npm
- PostgreSQL (local or cloud)

---

## 🚀 Setup & Installation

### 1. Database Setup
Create the PostgreSQL database:

```bash
createdb -U postgres todo_db
```

---

### 2. Backend Setup

Go to the backend directory and set up the environment:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables**

Create a `.env` file inside `/backend`:

```ini
DATABASE_URL=postgresql://postgres:your_password@localhost/todo_db
GOOGLE_API_KEY=your_actual_gemini_api_key
SECRET_KEY=your_random_secret_key_for_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Start the API server:**

```bash
uvicorn main:app --reload
```

Backend URL: `http://127.0.0.1:8000`

---

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend

npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## 💡 Example Prompts

Once logged in, try these in the chat:

### Task Management
- "Add a task to finish the project documentation by Friday."
- "What tasks do I have on my list?"
- "Update the documentation task to say 'Submit final report'."
- "Delete the task about buying milk."
- "I have a meeting on Monday. Add a task to prepare slides for it."

### RAG (Document Analysis)
1. Click **Upload PDF**
2. Select a file  
3. Ask:
   - "Read the uploaded document and create tasks based on it."
   - "Summarize the important deadlines."

---

## ✅ Features

- Real-time token-streaming AI responses via WebSockets  
- Secure authentication (JWT + hashing)  
- AI agent powered by LangGraph for tool-based decision-making  
- Per-user data isolation  
- PDF upload + RAG querying  
- Unit tests for backend tools (`backend/tests/`)  

---

## 🧪 Running Tests

```bash
cd backend
pytest
```

---

## 🏗️ Architecture Diagram

The frontend communicates with the backend through WebSockets. The backend handles AI orchestration, tool routing, and data persistence in PostgreSQL.

![Architecture Diagram](architecture_diagram.png)
