import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Menu, User, LogOut, LayoutDashboard, Calendar, Utensils, Users, Settings, PlusCircle } from 'lucide-react';
import ThemeToggle from './ui/ThemeToggle';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, children, icon: Icon }) => (
        <Link
            to={to}
            className="nav-link"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: isActive(to) ? 'var(--primary-light)' : 'transparent',
                color: isActive(to) ? 'var(--primary)' : 'var(--text-secondary)',
            }}
        >
            {Icon && <Icon size={18} />}
            {children}
        </Link>
    );

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="glass navbar"
        >
            <Link to="/" style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                >
                    <Utensils size={24} color="var(--primary)" />
                </motion.div>
                <span style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                }}>
                    Smart Cafeteria
                </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {user ? (
                    <>
                        <NavLink to="/dashboard" icon={LayoutDashboard}>
                            Dashboard
                        </NavLink>

                        {user.role === 'student' && (
                            <>
                                <NavLink to="/book-meal" icon={PlusCircle}>
                                    Book Meal
                                </NavLink>
                                <NavLink to="/bookings" icon={Calendar}>
                                    My Orders
                                </NavLink>
                            </>
                        )}

                        {user.role === 'staff' && (
                            <NavLink to="/orders" icon={Menu}>
                                Queue
                            </NavLink>
                        )}

                        {user.role === 'admin' && (
                            <NavLink to="/manage/menu" icon={Settings}>
                                Manage Menu
                            </NavLink>
                        )}

                        <NavLink to="/profile" icon={User}>
                            <span className="sr-only">Profile</span>
                        </NavLink>

                        <ThemeToggle />

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="btn btn-secondary"
                            style={{
                                marginLeft: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem'
                            }}
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </motion.button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login">Login</NavLink>
                        
                        <ThemeToggle />
                        
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link
                                to="/register"
                                className="btn btn-primary"
                                style={{ marginLeft: '0.5rem', textDecoration: 'none' }}
                            >
                                Register
                            </Link>
                        </motion.div>
                    </>
                )}
            </div>
        </motion.nav>
    );
};

export default Navbar;
