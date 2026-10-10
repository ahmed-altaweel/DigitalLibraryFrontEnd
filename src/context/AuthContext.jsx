import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate user session on mount
  const checkAuth = useCallback(async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch {
      // User is a guest or token expired
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials) => {
    const loggedInUser = await authApi.login(credentials);
    // After login, fetch me to get full user with roles
    try {
      const fullUser = await authApi.getCurrentUser();
      setUser(fullUser);
      return fullUser;
    } catch {
      setUser(loggedInUser);
      return loggedInUser;
    }
  }, []);

  const register = useCallback(async (data) => {
    const registeredUser = await authApi.register(data);
    try {
      const fullUser = await authApi.getCurrentUser();
      setUser(fullUser);
      return fullUser;
    } catch {
      setUser(registeredUser);
      return registeredUser;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors and clear state
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    const updated = await authApi.updateProfile(profileData);
    setUser((prev) => ({ ...prev, ...updated }));
    return updated;
  }, []);

  const roles = useMemo(() => {
    if (!user || !user.roles) return [];
    return user.roles.map((r) => (typeof r === 'string' ? r : r.name));
  }, [user]);

  const hasRole = useCallback((requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const roleList = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roleList.some((r) => roles.includes(r));
  }, [roles]);

  const isEditor = useMemo(() => hasRole(['editor', 'admin']), [hasRole]);
  const isAdmin = useMemo(() => hasRole('admin'), [hasRole]);

  const value = useMemo(() => ({
    user,
    roles,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isEditor,
    isAdmin,
    refreshUser: checkAuth,
  }), [user, roles, isLoading, login, register, logout, updateProfile, hasRole, isEditor, isAdmin, checkAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
