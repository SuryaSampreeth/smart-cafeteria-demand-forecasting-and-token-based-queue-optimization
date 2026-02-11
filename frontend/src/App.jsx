import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './components/ui/NotificationSystem';

// Layout Components
import Navbar from './components/Navbar';
import { PageTransition } from './components/ui';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import BookMeal from './pages/student/BookMeal';
import Bookings from './pages/student/Bookings';
import Menu from './pages/student/Menu';
import Profile from './pages/student/Profile';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMenu from './pages/admin/ManageMenu';

// Styles
import './index.css';
import './App.css';

// Animated Routes Component
const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route path="/" element={
                    <PageTransition>
                        <Login />
                    </PageTransition>
                } />
                <Route path="/login" element={
                    <PageTransition>
                        <Login />
                    </PageTransition>
                } />
                <Route path="/register" element={
                    <PageTransition>
                        <Register />
                    </PageTransition>
                } />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                    <PageTransition>
                        <Dashboard />
                    </PageTransition>
                } />

                {/* Student Routes */}
                <Route path="/book-meal" element={
                    <PageTransition>
                        <BookMeal />
                    </PageTransition>
                } />
                <Route path="/bookings" element={
                    <PageTransition>
                        <Bookings />
                    </PageTransition>
                } />
                <Route path="/menu" element={
                    <PageTransition>
                        <Menu />
                    </PageTransition>
                } />
                <Route path="/profile" element={
                    <PageTransition>
                        <Profile />
                    </PageTransition>
                } />

                {/* Staff Routes */}
                <Route path="/orders" element={
                    <PageTransition>
                        <StaffDashboard />
                    </PageTransition>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <PageTransition>
                        <AdminDashboard />
                    </PageTransition>
                } />
                <Route path="/manage/menu" element={
                    <PageTransition>
                        <ManageMenu />
                    </PageTransition>
                } />

                {/* Fallback */}
                <Route path="*" element={
                    <PageTransition>
                        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                            <h1>404</h1>
                            <p>Page not found</p>
                        </div>
                    </PageTransition>
                } />
            </Routes>
        </AnimatePresence>
    );
};

// Main App Component
const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <NotificationProvider>
                    <Router>
                        <div className="app-container">
                            {/* Navigation */}
                            <Navbar />
                            
                            {/* Main Content */}
                            <main className="main-content">
                                <AnimatedRoutes />
                            </main>
                        </div>
                    </Router>
                </NotificationProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
