import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('lg_token');
        const stored = await SecureStore.getItemAsync('lg_user');
        if (token && stored) {
          setUser(JSON.parse(stored));
          const res = await authAPI.me();
          setUser(res.data.user);
          await SecureStore.setItemAsync('lg_user', JSON.stringify(res.data.user));
        }
      } catch { await logout(); }
      // Final stabilization delay
      setTimeout(() => {
        setLoading(false);
      }, 500);
    })();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    await SecureStore.setItemAsync('lg_token', res.data.token);
    await SecureStore.setItemAsync('lg_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    await SecureStore.setItemAsync('lg_token', res.data.token);
    await SecureStore.setItemAsync('lg_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('lg_token');
    await SecureStore.deleteItemAsync('lg_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
