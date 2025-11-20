import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Upload, Sparkles, AlertCircle, Loader2, Paperclip } from "lucide-react";

export default function ChatInterface({ messages, sendMessage, isConnecting, isProcessing, isUploading, onUploadClick }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || isUploading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    // Transparent background to let Dashboard gradient show through
    <div className="flex h-full flex-col relative">
      
      {/* Messages Area with custom scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"> 
        
        {/* Welcome Screen */}
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center pb-10 px-6 opacity-80 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-blue-500/30">
                <Sparkles size={40} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-50 mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Hello, Human
            </h1>
            <p className="text-lg text-gray-400 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-900">
              I'm ready to help organize your life. Upload a doc or just start chatting.
            </p>
          </div>
        )}

        {/* Message History */}
        {messages.map((msg, index) => {
          const isAi = msg.role === "ai" || msg.role === "system";
          const isError = msg.content.startsWith("Error:");
          
          return (
            <div key={index} className={`flex w-full ${isAi ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isAi ? "flex-row" : "flex-row-reverse"}`}>
                
                {/* AVATAR */}
                <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white shadow-md mt-1
                    ${isAi 
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30" // AI: Vibrant Gradient
                        : "bg-gray-700 shadow-gray-800/30" // User: Dark Gray
                    }`}>
                    {isAi ? <Bot size={18} /> : <User size={18} />}
                </div>

                {/* Message Bubble */}
                <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-lg 
                    ${isError 
                        ? "bg-red-700 text-red-100 border border-red-600" 
                        : isAi 
                            ? "bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-none shadow-black/20" // AI: Dark bubble
                            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-none shadow-blue-500/30" // User: Vibrant gradient
                    }`}>
                    
                    {isError && (
                        <div className="flex items-center gap-2 font-bold mb-1 text-xs uppercase tracking-wide opacity-80">
                            <AlertCircle size={12} /> Error
                        </div>
                    )}
                    {msg.content.replace("Error: ", "")}
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isProcessing && (
           <div className="flex w-full justify-start pl-12">
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-900/50 rounded-full text-xs font-medium text-indigo-300 animate-pulse border border-indigo-700 shadow-lg shadow-indigo-900/20">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Gemini is thinking...</span>
                </div>
           </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area: Dark Glass Effect */}
      <div className="shrink-0 p-4 md:p-6 pt-2 z-10 bg-gray-900/60 backdrop-blur-lg border-t border-gray-800 shadow-inner shadow-black/20">
        <div className="max-w-3xl mx-auto relative group">
            
            {/* Upload Chip */}
            <div className="flex justify-start mb-3 pl-1">
                 <button 
                    onClick={onUploadClick}
                    disabled={isUploading || isProcessing}
                    className="flex items-center gap-2 bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all border border-gray-700 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 backdrop-blur-md"
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={13} className="animate-spin" /> Uploading...
                        </>
                    ) : (
                        <>
                            <Paperclip size={14} /> Attach PDF
                        </>
                    )}
                </button>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="relative flex items-center rounded-2xl bg-gray-800 shadow-2xl shadow-black/30 border border-gray-700 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 transition-all">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isUploading ? "Uploading document..." : "Ask Gemini to create a task..."}
                    disabled={isConnecting || isProcessing || isUploading}
                    className="flex-1 bg-transparent px-5 py-4 text-base text-gray-100 placeholder:text-gray-500 focus:outline-none disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isConnecting || isProcessing || isUploading}
                    className="mr-2 p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                >
                    {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
            </form>
            
            <div className="text-center mt-3 text-[11px] text-gray-400">
                GeminiTask can make mistakes. Consider checking important information.
            </div>
        </div>
      </div>
    </div>
  );
}