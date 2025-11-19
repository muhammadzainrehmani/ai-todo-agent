# AI Agent Todo List Application

This is a full-stack AI Agent application that empowers users to manage their Todo list using natural language commands. It features a modern **React Frontend**, a robust **FastAPI Backend**, and an intelligent **LangGraph AI Agent** powered by Google Gemini.

## 🚀 Features

* **Natural Language Task Management:** Interact with your Todo list using everyday language (e.g., "Create a task to buy milk", "Delete the first task", "Update the 'read book' task to 'finish chapter 3'").
* **Real-Time Interactions:** Leverages WebSockets for instant, streaming AI responses, making the application feel responsive and dynamic.
* **Secure Authentication:** Implements JWT (JSON Web Token) based authentication for user login and registration, with secure password hashing (Bcrypt).
* **RAG (Retrieval-Augmented Generation) Implementation:** Users can upload PDF or text documents (e.g., project briefs, syllabi). The AI can then read these documents to answer questions or extract tasks from their content.
* **User Data Isolation:** Ensures that each user can only access and manage their own Todo list and uploaded documents.
* **Industry-Standard Error Handling:** Provides specific and user-friendly error messages for common issues like authentication failures, AI quota limits, or invalid commands.
* **Responsive & Modern UI:** A sleek, "Gemini-style" user interface with mobile-friendly navigation (tabs for Chat/Tasks) and a polished chat experience.
* **Unit Tests (Backend Tools):** Includes unit tests for critical AI tools, ensuring their functionality and data integrity.

## 🏗️ Architecture

The application follows a clean, layered architecture to ensure scalability, maintainability, and clear separation of concerns.
