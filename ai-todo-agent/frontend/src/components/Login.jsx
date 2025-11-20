import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sparkles } from "lucide-react";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    // Dark background gradient for the whole page
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 p-4 font-sans text-gray-100">
      <div className="w-full max-w-md rounded-3xl border border-gray-700 bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-black/30 animate-in fade-in duration-500">
        
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-500/30">
                <Sparkles size={32} />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent mb-2">
                GeminiTask
            </h2>
            <p className="text-gray-400 text-sm">{isRegister ? "Create your account" : "Sign in to your account"}</p>
        </div>
        
        {error && (
          <div className="mb-4 rounded-lg bg-red-800/50 p-3 text-center text-sm text-red-100 border border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              id="email"
              name="email"
              autoComplete="email" 
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800/70 p-3 text-gray-100 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-indigo-600 focus:outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              id="password"
              name="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              type="password"
              required
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800/70 p-3 text-gray-100 placeholder:text-gray-500 focus:border-indigo-600 focus:ring-indigo-600 focus:outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-lg font-semibold text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all active:scale-98"
          >
            {isRegister ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-indigo-400 hover:underline hover:text-indigo-300 transition-colors"
          >
            {isRegister
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}