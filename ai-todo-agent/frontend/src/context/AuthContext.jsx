import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("http://127.0.0.1:8000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch("http://127.0.0.1:8000/token", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      // INDUSTRY STANDARD: Throw the specific message from backend
      throw new Error(data.detail || "Authentication failed. Please check your credentials.");
    }

    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    
    const userResponse = await fetch("http://127.0.0.1:8000/users/me", {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      setUser(userData);
    }
  };

  const register = async (email, password) => {
    const response = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        // INDUSTRY STANDARD: Show specific registration errors (e.g., "Email already exists")
        throw new Error(data.detail || "Registration failed");
    }
    
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);