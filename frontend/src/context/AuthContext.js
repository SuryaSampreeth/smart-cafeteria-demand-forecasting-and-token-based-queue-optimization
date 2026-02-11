import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Storage helper that works on both web and mobile
const storage = {
    async getItem(key) {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    },
    async setItem(key, value) {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    async removeItem(key) {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    },
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await storage.getItem('token');
            if (token) {
                const response = await authAPI.getMe();
                setUser(response.data);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            await storage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authAPI.login({ email, password });
            const { token, ...userData } = response.data;

            await storage.setItem('token', token);
            setUser(userData);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const register = async (name, email, password, registrationNumber) => {
        try {
            setError(null);
            const response = await authAPI.register({
                name,
                email,
                password,
                registrationNumber
            });
            const { token, ...userData } = response.data;

            await storage.setItem('token', token);
            setUser(userData);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await storage.removeItem('token');
            setUser(null);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
