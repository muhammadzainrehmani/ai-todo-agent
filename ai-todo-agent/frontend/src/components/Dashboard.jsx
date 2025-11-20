import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import TodoList from "./TodoList";
import ChatInterface from "./ChatInterface";
import { LogOut, ListTodo, MessageSquare, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { token, logout, user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [uploading, setUploading] = useState(false); 
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
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
        await fetch("http://127.0.0.1:8000/upload", { method: "POST", body: formData });
        setChatHistory(prev => [...prev, { role: "system", content: `📄 File Uploaded: ${file.name}.` }]);
    } catch (error) {
        alert("Upload failed");
    } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    // DARK THEME BACKGROUND: Soft Gradient from very dark gray to dark indigo
    <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 font-sans text-gray-100 overflow-hidden">
      
      {/* Navbar: Dark Glass Effect */}
      <nav className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900/80 backdrop-blur-md px-4 md:px-8 z-30 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30 animate-in fade-in zoom-in duration-500">
            <Sparkles size={22} />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
            GeminiTask
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-medium text-gray-400 md:inline">{user?.email}</span>
          <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-gray-800 rounded-full">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="relative flex flex-1 overflow-hidden p-0 md:p-6 lg:p-8 gap-6">
        
        {/* Mobile Tabs: Dark Glass Effect */}
        <div className="absolute top-0 left-0 right-0 z-20 flex h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 md:hidden px-4 items-center gap-3 shadow-lg shadow-black/20">
            <button 
                onClick={() => setActiveTab("chat")} 
                className={`flex-1 flex items-center justify-center gap-2 text-base font-semibold py-2.5 rounded-full transition-all ${activeTab === "chat" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-gray-400 hover:bg-gray-800"}`}
            >
                <MessageSquare size={20} /> Chat
            </button>
            <button 
                onClick={() => setActiveTab("tasks")} 
                className={`flex-1 flex items-center justify-center gap-2 text-base font-semibold py-2.5 rounded-full transition-all ${activeTab === "tasks" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-gray-400 hover:bg-gray-800"}`}
            >
                <ListTodo size={20} /> Tasks ({todos.length})
            </button>
        </div>

        <main className="flex w-full h-full pt-16 md:pt-0 gap-6 max-w-7xl mx-auto animate-in fade-in duration-500">
          
          {/* LEFT: Chat Area (Dark Glass Panel) */}
          <div className={`w-full md:w-1/2 lg:w-[45%] h-full flex flex-col md:rounded-3xl md:border border-gray-700 md:shadow-2xl md:shadow-black/30 bg-white/5 backdrop-blur-xl overflow-hidden transition-all duration-300 ${activeTab === "chat" ? "flex" : "hidden md:flex"}`}>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.txt"/>
            <ChatInterface 
                messages={chatHistory} 
                sendMessage={handleUserMessage}
                isConnecting={!isConnected}
                isProcessing={isAIProcessing}
                isUploading={uploading}
                onUploadClick={() => fileInputRef.current?.click()}
            />
          </div>

          {/* RIGHT: Tasks Area (Dark Glass Panel) */}
          <div className={`w-full md:w-1/2 lg:w-[55%] h-full flex flex-col md:rounded-3xl md:border border-gray-700 md:shadow-2xl md:shadow-black/30 bg-white/5 backdrop-blur-xl overflow-hidden transition-all duration-300 ${activeTab === "tasks" ? "flex" : "hidden md:flex"}`}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-gray-900/50 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-600/20 text-orange-400 rounded-lg shadow-lg shadow-orange-500/10">
                        <ListTodo size={22} />
                    </div>
                    <h2 className="font-bold text-gray-200 text-xl">My Tasks</h2>
                </div>
                <span className="bg-gray-800 text-gray-100 text-sm font-bold px-3 py-1.5 rounded-full shadow-md shadow-black/20">
                    {todos.length} Tasks
                </span>
            </div>
            {/* Added scrollbar-thumb-gray-700 to scrollbar */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                <TodoList todos={todos} />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}