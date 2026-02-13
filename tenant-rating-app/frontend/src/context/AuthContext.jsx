import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://tenant-rating-app.onrender.com';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    axios
      .get(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
