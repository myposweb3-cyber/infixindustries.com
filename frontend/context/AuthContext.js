import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const { user, token, refreshToken } = JSON.parse(stored);
        setUser(user);
        setToken(token);
        setRefreshToken(refreshToken);
      } catch (e) {
        console.error('Failed to load auth:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = (user, token, refreshToken) => {
    setUser(user);
    setToken(token);
    setRefreshToken(refreshToken);
    localStorage.setItem('auth', JSON.stringify({ user, token, refreshToken }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
