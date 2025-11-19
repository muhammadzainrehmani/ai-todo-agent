import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { Loader2 } from "lucide-react";

// Internal component to handle routing logic
// We need this split because 'useAuth' can only be used INSIDE <AuthProvider>
function AppContent() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p>Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return token ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
