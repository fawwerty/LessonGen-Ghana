import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('lg_user');
    const token = localStorage.getItem('lg_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
      authAPI.me().then(res => {
        setUser(res.data.user);
        localStorage.setItem('lg_user', JSON.stringify(res.data.user));
      }).catch(() => logout());
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('lg_token', res.data.token);
    localStorage.setItem('lg_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('lg_token', res.data.token);
    localStorage.setItem('lg_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('lg_token');
    localStorage.removeItem('lg_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await authAPI.me();
    setUser(res.data.user);
    localStorage.setItem('lg_user', JSON.stringify(res.data.user));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
