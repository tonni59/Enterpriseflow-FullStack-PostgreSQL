"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("ef_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => localStorage.removeItem("ef_token"))
      .finally(() => setLoading(false));
  }, []);
  const login = async (email, password) => {
    const result = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("ef_token", result.token);
    setUser(result.user);
    return result.user;
  };
  const register = async (name, email, password) => {
    const result = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem("ef_token", result.token);
    setUser(result.user);
    return result.user;
  };
  const logout = () => {
    localStorage.removeItem("ef_token");
    setUser(null);
    window.location.href = "/";
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
