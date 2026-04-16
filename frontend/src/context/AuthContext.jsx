// ✅ DONE — Phase 6: Real AuthContext (connects to backend API)
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('labeval_token'));
  const [loading, setLoading] = useState(true); // true on mount to check stored token

  // On mount: if we have a stored token, verify it by calling /auth/me
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('labeval_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await axiosInstance.get('/auth/me');
        setUser(res.data.user);
        setToken(storedToken);
      } catch {
        // Token is invalid or expired
        localStorage.removeItem('labeval_token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const { user: userData, token: newToken } = res.data;
      localStorage.setItem('labeval_token', newToken);
      setUser(userData);
      setToken(newToken);
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/signup', { name, email, password, role });
      const { user: userData, token: newToken } = res.data;
      localStorage.setItem('labeval_token', newToken);
      setUser(userData);
      setToken(newToken);
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Signup failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('labeval_token');
    setUser(null);
    setToken(null);
  }, []);

  const value = { user, token, loading, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
