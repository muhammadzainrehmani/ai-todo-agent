graph TD
    %% Styles
    classDef frontend fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:black;
    classDef backend fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:black;
    classDef database fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:black;
    classDef ai fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:black;

    subgraph Client_Side [Frontend - React + Vite]
        UI[User Interface <br/> Chat & Todo List]:::frontend
    end

    subgraph Server_Side [Backend - FastAPI]
        API[FastAPI Server]:::backend
        Auth[Auth Handler <br/> JWT + Bcrypt]:::backend
        WS[WebSocket Endpoint]:::backend
        RAG_Upload[Document Processor]:::backend
    end

    subgraph AI_Logic [AI Agent - LangGraph]
        Agent[LangGraph Agent]:::ai
        Tools[Custom Tools <br/> Create, Read, Update, Delete, Search]:::ai
    end

    subgraph External_Services [External & Storage]
        DB[(PostgreSQL <br/> Users & Todos)]:::database
        VectorDB[(ChromaDB <br/> RAG Vectors)]:::database
        Gemini[Google Gemini 1.5 Flash]:::ai
    end

    %% Connections
    UI <-->|WebSocket Stream| WS
    UI <-->|REST API / Upload| API
    
    WS -->|Pass Message| Agent
    API -->|Auth Check| Auth
    API -->|Process PDF| RAG_Upload
    
    Agent <-->|Reasoning| Gemini
    Agent -->|Call Tool| Tools
    
    Tools -->|CRUD Operations| DB
    Tools -->|RAG Search| VectorDB
    RAG_Upload -->|Store Vectors| VectorDB
    Auth -->|Verify User| DB

    %% Link Styles
    linkStyle default stroke:#333,stroke-width:1.5px;
