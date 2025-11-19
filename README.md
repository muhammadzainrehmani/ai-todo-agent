````markdown
# AI Agent Todo List Application

A full-stack AI Agent application that allows users to manage tasks and query documents using natural language. Built with **React**, **FastAPI**, and **LangGraph**, utilizing **Google Gemini** as the LLM.

This project fulfills the technical assessment requirements by implementing a real-time, streaming AI agent capable of CRUD operations, database management, and RAG (Retrieval-Augmented Generation) for document analysis.

---

## 📋 Requirements & Tech Stack

### Core Technologies
* [cite_start]**Frontend:** React (Vite), Tailwind CSS, Lucide React, WebSockets [cite: 14, 16, 17]
* [cite_start]**Backend:** FastAPI, Uvicorn, Python 3.10+ [cite: 21, 33]
* [cite_start]**AI & Orchestration:** LangChain, LangGraph, Google Gemini 1.5 Flash [cite: 27, 28, 29]
* [cite_start]**Database:** PostgreSQL (Relational Data), ChromaDB (Vector Data) [cite: 31, 59]
* [cite_start]**Testing:** Pytest (Unit testing for tools) [cite: 75]

### Prerequisites
Before running the project, ensure you have the following installed:
* **Python 3.10+**
* **Node.js & npm**
* **PostgreSQL** (Running locally or via a cloud provider)

---

## 🏗️ Architecture Diagram

[cite_start]Below is the high-level architecture showing the flow of data between the React UI, FastAPI Backend, and the AI Agent logic. [cite: 70]

```mermaid
graph TD
    User[User (React UI)] <-->|WebSocket Stream| API[FastAPI Backend]
    API <-->|Auth Check| DB[(PostgreSQL)]
    API <-->|Process PDF| VectorDB[(ChromaDB)]
    
    API -->|Pass Message| Agent[LangGraph Agent]
    
    subgraph AI_Logic
        Agent <-->|Reasoning| LLM[Google Gemini 1.5]
        Agent -->|Decision| Router{Tool Router}
        Router -->|Manage Tasks| Tools[CRUD Tools]
        Router -->|Search Docs| RAG[RAG Search Tool]
    end
    
    Tools -->|Read/Write| DB
    RAG -->|Query| VectorDB
````

*(Note: If the diagram above does not render on GitHub, please refer to the `architecture_diagram.png` included in this repository.)*

-----

## [cite\_start]🚀 Setup & Installation Steps [cite: 68]

### 1\. Database Setup

Ensure PostgreSQL is running and create a database named `todo_db`.

```bash
# Command line example (Windows/Linux/Mac)
createdb -U postgres todo_db
```

### 2\. Backend Setup

Navigate to the backend folder and set up the Python environment.

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configure Environment Variables:**
Create a `.env` file inside the `/backend` folder with the following keys:

```ini
DATABASE_URL=postgresql://postgres:your_password@localhost/todo_db
GOOGLE_API_KEY=your_actual_gemini_api_key
SECRET_KEY=your_random_secret_key_for_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Run the Server:**

```bash
uvicorn main:app --reload
```

*The backend will start at `http://127.0.0.1:8000`*

### 3\. Frontend Setup

Open a new terminal and navigate to the frontend folder.

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

*The frontend will start at `http://localhost:5173`*

-----

## [cite\_start]💡 Example Prompts [cite: 69]

Once the app is running, register a user and try these natural language commands in the chat interface:

### Task Management

  * **Create:** "Add a task to finish the project documentation by Friday."
  * **Read:** "What tasks do I have on my list?"
  * **Update:** "Update the documentation task to say 'Submit final report'."
  * **Delete:** "Delete the task about buying milk."
  * **Complex Logic:** "I have a meeting on Monday. Add a task to prepare slides for it."

### [cite\_start]RAG (Document Analysis) [cite: 73]

1.  Click the **"Upload PDF"** button above the chat bar.
2.  Select a PDF (e.g., a course syllabus or project brief).
3.  Ask questions like:
      * "Read the uploaded document and create tasks based on the requirements."
      * "Summarize the key deadlines from the file."

-----

## ✅ Features Implemented

  * [cite\_start]**Real-Time Streaming:** AI responses are streamed token-by-token using WebSockets[cite: 35, 74].
  * [cite\_start]**Authentication:** Secure User Login/Signup with JWT & Password Hashing[cite: 76].
  * [cite\_start]**LangGraph Agent:** Intelligent workflow that dynamically selects tools based on user intent[cite: 39].
  * **User Isolation:** Users can only access and modify their own data.
  * [cite\_start]**Unit Tests:** Automated tests for AI tools included in `backend/tests/`[cite: 75].

## 🧪 Running Tests

To verify the integrity of the AI tools:

```bash
cd backend
pytest
```

```
```
