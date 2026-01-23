import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is already logged in (on page load)
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. LOGIN FUNCTION (Calls Backend API)
  const login = async (email, password) => {
    try {
      const response = await fetch("https://helpdesk-yida.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Success! Save user data
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      return data; // Return data so the Login page knows the Role
    } catch (error) {
      console.error("Login Error:", error);
      throw error; // Pass error back to Login page to show alert
    }
  };

  // 3. LOGOUT FUNCTION
  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    // Optional: Redirect to login page logic handles automatically if user is null
  };

  // 4. REGISTER FUNCTION (For Module 11)
  const register = async (name, email, password) => {
    try {
      const response = await fetch("https://helpdesk-yida.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Auto-login after register
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);