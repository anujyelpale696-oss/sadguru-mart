import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

const safeParse = (str) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return safeParse(localStorage.getItem('sadguru_user'));
  });

  const [shop, setShop] = useState(() => {
    return safeParse(localStorage.getItem('sadguru_shop'));
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sadguru_token') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            if (res.data.shop) {
              setShop(res.data.shop);
              localStorage.setItem('sadguru_shop', JSON.stringify(res.data.shop));
            }
            localStorage.setItem('sadguru_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification warning:', err.message);
          // Only clear session if explicitly rejected as unauthorized by backend
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      setShop(res.data.shop);
      localStorage.setItem('sadguru_token', res.data.token);
      localStorage.setItem('sadguru_user', JSON.stringify(res.data.user));
      if (res.data.shop) {
        localStorage.setItem('sadguru_shop', JSON.stringify(res.data.shop));
      }
      return res.data;
    }
  };

  const adminLogin = async (email, password) => {
    const res = await authService.adminLogin({ email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      setShop(null);
      localStorage.setItem('sadguru_token', res.data.token);
      localStorage.setItem('sadguru_user', JSON.stringify(res.data.user));
      localStorage.removeItem('sadguru_shop');
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      setShop(res.data.shop);
      localStorage.setItem('sadguru_token', res.data.token);
      localStorage.setItem('sadguru_user', JSON.stringify(res.data.user));
      localStorage.setItem('sadguru_shop', JSON.stringify(res.data.shop));
      return res.data;
    }
  };

  const logout = () => {
    const role = user?.role;
    setUser(null);
    setShop(null);
    setToken(null);
    localStorage.removeItem('sadguru_token');
    localStorage.removeItem('sadguru_user');
    localStorage.removeItem('sadguru_shop');
    return role === 'admin' ? '/admin/login' : '/login';
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res.data.success) {
      setUser(res.data.user);
      if (res.data.shop) {
        setShop(res.data.shop);
        localStorage.setItem('sadguru_shop', JSON.stringify(res.data.shop));
      }
      localStorage.setItem('sadguru_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        shop,
        token,
        role: user?.role,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isShopkeeper: user?.role === 'shopkeeper',
        loading,
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
