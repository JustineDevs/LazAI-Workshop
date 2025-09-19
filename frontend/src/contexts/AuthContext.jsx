import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useWeb3 } from './Web3Context';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const { account, isConnected } = useWeb3();
    const [user, setUser] = useState(null);
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
    const register = useCallback(async (userData) => {
        try {
            const response = await authService.register({
                ...userData,
                address: account
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
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Registration failed');
            throw error;
        }
    }, [account]);

    // Login user
    const login = useCallback(async (credentials) => {
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
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Login failed');
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
    const updateProfile = useCallback(async (profileData) => {
        try {
            const response = await authService.updateProfile(profileData);

            if (response.success) {
                setUser(response.data);
                toast.success('Profile updated successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Profile update failed');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.message || 'Profile update failed');
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
    const checkUserExists = useCallback(async (address) => {
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

    const value = {
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
