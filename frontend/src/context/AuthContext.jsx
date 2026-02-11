import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Try/Catch for token processing
                    try {
                        const storedUser = localStorage.getItem('user');
                        if (storedUser) {
                            setUser(JSON.parse(storedUser));
                        }
                    } catch (innerError) {
                        console.error("Token/User parsing failed:", innerError);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                }
            } catch (error) {
                console.error("Auth check failed completely:", error);
            } finally {
                // Always finish loading
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        // Mock login for UI development
        console.log("Mock logging in...");

        let role = 'student';
        let name = 'Demo Student';

        if (email?.includes('admin')) {
            role = 'admin';
            name = 'Demo Admin';
        } else if (email?.includes('staff')) {
            role = 'staff';
            name = 'Demo Staff';
        }

        const mockUser = {
            _id: '1',
            name: name,
            description: 'Mock User',
            email: email || 'student@demo.com',
            role: role,
        };

        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
    };

    const register = async (userData) => {
        try {
            // Mock register
            // const response = await api.post('/auth/register', userData);
            // return response.data;
            return { message: "Mock registration successful" };
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {/* Render children even usage if loading, to prevent blank screen, 
                or render a loader. For now, render children to ensure UI visibility */}
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc'
                }}>
                    Loading Smart Cafeteria...
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};
