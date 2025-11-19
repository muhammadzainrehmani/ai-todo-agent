import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import TodoList from "./TodoList";
import ChatInterface from "./ChatInterface";
import { LogOut, LayoutDashboard, Upload, ListTodo, MessageSquare } from "lucide-react";

export default function Dashboard() {
  const { token, logout, user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [uploading, setUploading] = useState(false); 
  
  // NEW: Mobile Tab State ("chat" or "tasks")
  const [activeTab, setActiveTab] = useState("chat");

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const fileInputRef = useRef(null);

  // 1. WebSocket Logic
  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws?token=${token}`);

    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "start") {
            setIsAIProcessing(true);
            setChatHistory((prev) => [...prev, { role: "ai", content: "" }]);
        } else if (data.type === "token") {
            setChatHistory((prev) => {
                const lastMsg = prev[prev.length - 1];
                const newMsg = { ...lastMsg, content: lastMsg.content + data.content };
                return [...prev.slice(0, -1), newMsg];
            });
        } else if (data.type === "end") {
            setIsAIProcessing(false);
            fetchTodos();
        } else if (data.type === "error") {
            setIsAIProcessing(false);
            setChatHistory((prev) => [...prev, { role: "ai", content: `Error: ${data.content}` }]);
        }
    };
    ws.onclose = () => { setIsConnected(false); setIsAIProcessing(false); };
    setSocket(ws);
    return () => ws.close();
  }, [token]);

  // 2. Fetch Logic
  const fetchTodos = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) setTodos(data);
      }
    } catch (error) { setTodos([]); }
  };
  useEffect(() => { fetchTodos(); }, []);

  // 3. Handlers
  const handleUserMessage = (text) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        setIsAIProcessing(true);
        setChatHistory((prev) => [...prev, { role: "user", content: text }]);
        socket.send(text);
    } else {
        alert("Chat is not connected.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); // LOCK INPUT
    const formData = new FormData();
    formData.append("file", file);
    try {
        await fetch("http://127.0.0.1:8000/upload", { method: "POST", body: formData });
        setChatHistory(prev => [...prev, { role: "system", content: `📄 File Uploaded: ${file.name}.` }]);
    } catch (error) {
        alert("Upload failed");
    } finally {
        setUploading(false); // UNLOCK INPUT
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white font-sans text-gray-900">
      
      {/* Professional Navbar */}
      <nav className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <LayoutDashboard size={18} />
          </div>
          <span className="text-lg font-semibold tracking-tight">AI Task Manager</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-medium text-gray-500 md:inline">{user?.email}</span>
          <button onClick={logout} className="text-gray-500 hover:text-red-600 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="relative flex flex-1 overflow-hidden">
        
        {/* MOBILE TABS (Visible only on small screens) */}
        <div className="absolute top-0 left-0 right-0 z-20 flex h-12 border-b border-gray-200 bg-gray-50 md:hidden">
            <button 
                onClick={() => setActiveTab("chat")}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "chat" ? "text-blue-600 bg-white border-b-2 border-blue-600" : "text-gray-500"}`}
            >
                <MessageSquare size={16} /> Chat
            </button>
            <button 
                onClick={() => setActiveTab("tasks")}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "tasks" ? "text-blue-600 bg-white border-b-2 border-blue-600" : "text-gray-500"}`}
            >
                <ListTodo size={16} /> Tasks ({todos.length})
            </button>
        </div>

        <main className="flex w-full h-full pt-12 md:pt-0">
          
          {/* LEFT: Chat Area */}
          <div className={`w-full md:w-1/2 lg:w-[45%] h-full flex flex-col border-r border-gray-200 bg-white transition-all ${activeTab === "chat" ? "flex" : "hidden md:flex"}`}>
            <div className="flex-1 overflow-hidden relative">
                <ChatInterface 
                    messages={chatHistory} 
                    sendMessage={handleUserMessage}
                    isConnecting={!isConnected}
                    isProcessing={isAIProcessing}
                    isUploading={uploading} // Pass uploading state
                />
                
                {/* Upload Button (Floating) */}
                <div className="absolute bottom-20 left-4 md:bottom-24 md:left-6 z-20">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.txt"/>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || isAIProcessing}
                        className="flex items-center gap-2 rounded-full bg-gray-100/90 backdrop-blur px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 shadow-sm border border-gray-200 transition-all disabled:opacity-50"
                    >
                        {uploading ? <span className="animate-pulse">Uploading...</span> : <><Upload size={14} /> Upload PDF</>}
                    </button>
                </div>
            </div>
          </div>

          {/* RIGHT: Tasks Area */}
          <div className={`w-full md:w-1/2 lg:w-[55%] h-full flex flex-col bg-gray-50/50 transition-all ${activeTab === "tasks" ? "flex" : "hidden md:flex"}`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/50 backdrop-blur shrink-0">
                <h2 className="font-semibold text-gray-800">My Tasks</h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{todos.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <TodoList todos={todos} />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}