import { createContext, useState, useContext, useEffect } from "react";
import { API_BASE_URL } from "../config";

const AuthContext = createContext();
const API_URL = `${API_BASE_URL}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("userInfo");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Session restoration failed", error);
      localStorage.removeItem("userInfo");
    } finally {
      // PRD Requirement: Ensure app renders after session check [cite: 38]
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      // Normalizing data structure for Module 1 [cite: 33, 41]
      const userToStore = data.user ? { ...data.user, token: data.token } : data;

      setUser(userToStore);
      localStorage.setItem("userInfo", JSON.stringify(userToStore));
      return userToStore;
    } catch (error) {
      console.error("Login Fetch Error:", error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      const userToStore = data.user ? { ...data.user, token: data.token } : data;
      setUser(userToStore);
      localStorage.setItem("userInfo", JSON.stringify(userToStore));
      return userToStore;
    } catch (error) {
      console.error("Register Fetch Error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// This NAMED EXPORT fixes the "Requested module does not provide an export" error
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};