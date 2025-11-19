import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle, Loader2 } from "lucide-react";

export default function ChatInterface({ messages, sendMessage, isConnecting, isProcessing, isUploading }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleSend = (e) => {
    e.preventDefault();
    // BLOCK SENDING IF UPLOADING
    if (!input.trim() || isProcessing || isUploading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col relative bg-white">
      
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-32"> 
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-40 mt-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Welcome, Human</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
                I can help you manage tasks. Try saying "Plan a project" or upload a PDF.
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isAi = msg.role === "ai" || msg.role === "system";
          const isError = msg.content.startsWith("Error:");
          
          return (
            <div key={index} className={`flex w-full ${isAi ? "justify-start" : "justify-end"}`}>
              <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isAi ? "flex-row" : "flex-row-reverse"}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white shadow-sm mt-1
                    ${isAi ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gray-800"}`}>
                    {isAi ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Message Bubble */}
                <div className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm
                    ${isError ? "bg-red-50 text-red-800 border border-red-100" : 
                      isAi ? "bg-gray-100 text-gray-800 rounded-tl-none" : 
                      "bg-blue-600 text-white rounded-tr-none"}`}>
                    
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

        {/* Processing Indicator */}
        {isProcessing && (
           <div className="flex w-full justify-start">
              <div className="flex max-w-[75%] gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mt-1 animate-pulse">
                    <Bot size={16} />
                </div>
                <div className="px-5 py-3 rounded-2xl rounded-tl-none bg-gray-50 text-gray-500 text-sm flex items-center gap-2">
                    <span className="flex space-x-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    </span>
                </div>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent px-4 pb-6 pt-10">
        <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSend} className="relative flex items-center shadow-lg rounded-full border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    // DISABLE WHEN UPLOADING OR PROCESSING
                    placeholder={isUploading ? "Uploading document..." : isProcessing ? "AI is thinking..." : "Message GeminiTask..."}
                    disabled={isConnecting || isProcessing || isUploading}
                    className="flex-1 bg-transparent px-6 py-4 text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isConnecting || isProcessing || isUploading}
                    className="mr-2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all"
                >
                    {isProcessing || isUploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
            </form>
            <div className="text-center mt-2 text-[10px] text-gray-400 font-medium">
                AI Task Manager can make mistakes. Please check important info.
            </div>
        </div>
      </div>
    </div>
  );
}