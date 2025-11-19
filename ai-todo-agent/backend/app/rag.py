import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

# Global variable to store our "Brain" (Vector Store)
# In a real app, this would be a persistent database like Pinecone.
vector_store = None

def process_document(file_path: str):
    global vector_store
    
    # 1. Load the File
    if file_path.endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    else:
        loader = TextLoader(file_path)
    
    documents = loader.load()

    # 2. Split text into chunks (AI can't read whole book at once)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_documents(documents)

    # 3. Create Vector Store (The "Memory")
    # We use a free local embedding model (HuggingFace)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    vector_store = Chroma.from_documents(
        documents=chunks, 
        embedding=embeddings,
        collection_name="user_docs"
    )
    
    return "Document processed successfully. You can now ask questions about it."

def query_rag(question: str):
    global vector_store
    if not vector_store:
        return "No document has been uploaded yet."
    
    # Search for the 3 most relevant chunks
    results = vector_store.similarity_search(question, k=3)
    
    # Combine them into one text
    context = "\n\n".join([doc.page_content for doc in results])
    return context