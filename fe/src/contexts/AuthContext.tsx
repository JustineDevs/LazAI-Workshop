'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface User {
  id: string;
  address: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
  login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
  refreshToken: () => Promise<string>;
  checkUserExists: (address: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { account, isConnected } = useWeb3();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    if (!isConnected || !account) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token and get user data
      const userData = await authService.verifyToken(token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  // Register new user
  const register = useCallback(async (userData: Partial<User> & { password: string }) => {
    try {
      const response = await authService.register({
        username: userData.username || '',
        email: userData.email || '',
        address: account!,
        password: userData.password
      });

      if (response.success) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success('Account created successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  }, [account]);

  // Login user
  const login = useCallback(async (credentials: { username: string; password: string }) => {
    try {
      const response = await authService.login(credentials);

      if (response.success) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success('Login successful');
        return response.data;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Logout user
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    try {
      const response = await authService.updateProfile(profileData);

      if (response.success) {
        setUser(response.data);
        toast.success('Profile updated successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();

      if (response.success) {
        localStorage.setItem('authToken', response.data.token);
        return response.data.token;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  }, [logout]);

  // Check if user exists for current address
  const checkUserExists = useCallback(async (address: string) => {
    try {
      const response = await authService.checkUserExists(address);
      return response.exists;
    } catch (error) {
      console.error('Check user exists error:', error);
      return false;
    }
  }, []);

  // Auto-login if wallet is connected and user exists
  useEffect(() => {
    if (isConnected && account) {
      checkAuth();
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [isConnected, account, checkAuth]);

  // Set up token refresh interval
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshToken().catch(() => {
        // Silent fail - user will be logged out on next API call
      });
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  const value: AuthContextType = {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Methods
    register,
    login,
    logout,
    updateProfile,
    refreshToken,
    checkUserExists,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
