import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

/**
 * NotificationProvider - Manages notification state and animations
 */
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback(({
        type = 'info', // 'success' | 'warning' | 'danger' | 'info'
        title,
        message,
        duration = 5000, // 0 for persistent
        action,
        actionLabel,
    }) => {
        const id = Date.now() + Math.random();
        
        const notification = {
            id,
            type,
            title,
            message,
            action,
            actionLabel,
        };

        setNotifications(prev => [...prev, notification]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Convenience methods
    const success = useCallback((title, message, options = {}) => {
        return addNotification({ type: 'success', title, message, ...options });
    }, [addNotification]);

    const warning = useCallback((title, message, options = {}) => {
        return addNotification({ type: 'warning', title, message, ...options });
    }, [addNotification]);

    const error = useCallback((title, message, options = {}) => {
        return addNotification({ type: 'danger', title, message, ...options });
    }, [addNotification]);

    const info = useCallback((title, message, options = {}) => {
        return addNotification({ type: 'info', title, message, ...options });
    }, [addNotification]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            removeNotification,
            clearAll,
            success,
            warning,
            error,
            info,
        }}>
            {children}
            <NotificationContainer 
                notifications={notifications} 
                onDismiss={removeNotification} 
            />
        </NotificationContext.Provider>
    );
};

/**
 * NotificationContainer - Renders notification stack
 */
const NotificationContainer = ({ notifications, onDismiss }) => {
    const { reducedMotion } = useTheme();

    return (
        <div
            style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                pointerEvents: 'none',
                maxWidth: '400px',
                width: '100%',
            }}
        >
            <AnimatePresence>
                {notifications.map((notification, index) => (
                    <NotificationToast
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => onDismiss(notification.id)}
                        index={index}
                        reducedMotion={reducedMotion}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

/**
 * NotificationToast - Individual notification component
 */
const NotificationToast = ({ notification, onDismiss, index, reducedMotion }) => {
    const { isDark } = useTheme();
    const { type, title, message, action, actionLabel } = notification;

    const typeConfig = {
        success: {
            icon: CheckCircle,
            color: 'var(--success)',
            bgColor: 'var(--success-light)',
        },
        warning: {
            icon: AlertTriangle,
            color: 'var(--warning)',
            bgColor: 'var(--warning-light)',
        },
        danger: {
            icon: AlertCircle,
            color: 'var(--danger)',
            bgColor: 'var(--danger-light)',
        },
        info: {
            icon: Info,
            color: 'var(--primary)',
            bgColor: 'var(--primary-light)',
        },
    };

    const config = typeConfig[type] || typeConfig.info;
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 100, scale: 0.9 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 100, scale: 0.9 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
            }}
            style={{
                background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                borderLeft: `4px solid ${config.color}`,
                pointerEvents: 'auto',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
            }}
        >
            {/* Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
                style={{
                    padding: '0.375rem',
                    borderRadius: 'var(--radius)',
                    background: config.bgColor,
                    color: config.color,
                    flexShrink: 0,
                }}
            >
                <Icon size={18} />
            </motion.div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {title && (
                    <p style={{
                        fontWeight: 600,
                        marginBottom: message ? '0.25rem' : 0,
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                    }}>
                        {title}
                    </p>
                )}
                {message && (
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        margin: 0,
                        lineHeight: 1.4,
                    }}>
                        {message}
                    </p>
                )}

                {action && actionLabel && (
                    <button
                        onClick={action}
                        style={{
                            marginTop: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            background: config.bgColor,
                            color: config.color,
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>

            {/* Dismiss button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDismiss}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <X size={16} />
            </motion.button>
        </motion.div>
    );
};

/**
 * PeakLoadAlert - Special alert for peak load warnings
 */
export const PeakLoadAlert = ({ isVisible, onDismiss, currentLoad, threshold }) => {
    const { reducedMotion, isDark } = useTheme();

    if (!isVisible) return null;

    return (
        <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
            style={{
                position: 'fixed',
                top: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10000,
                background: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
            }}
        >
            {/* Pulsing icon */}
            <motion.div
                animate={!reducedMotion ? {
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1],
                } : {}}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                <Bell size={24} color="var(--danger)" />
            </motion.div>

            <div>
                <p style={{ fontWeight: 600, color: 'var(--danger)', margin: 0 }}>
                    Peak Load Warning
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Cafeteria at {currentLoad}% capacity. Consider visiting during off-peak hours.
                </p>
            </div>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDismiss}
                style={{
                    background: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    padding: '0.5rem 1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                }}
            >
                Got it
            </motion.button>
        </motion.div>
    );
};

export default NotificationProvider;
