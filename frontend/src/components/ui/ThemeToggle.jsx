import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeToggle - Animated dark/light mode toggle button
 */
const ThemeToggle = ({ showLabel = false, className = '' }) => {
    const { theme, toggleTheme, isDark, reducedMotion } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            className={className}
            whileHover={!reducedMotion ? { scale: 1.05 } : {}}
            whileTap={!reducedMotion ? { scale: 0.95 } : {}}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                position: 'relative',
                overflow: 'hidden',
            }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Icon Container */}
            <div style={{ position: 'relative', width: 20, height: 20 }}>
                {/* Sun Icon */}
                <motion.div
                    initial={false}
                    animate={{
                        rotate: isDark ? 90 : 0,
                        scale: isDark ? 0 : 1,
                        opacity: isDark ? 0 : 1,
                    }}
                    transition={{
                        duration: reducedMotion ? 0 : 0.3,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Sun size={18} color="var(--warning)" />
                </motion.div>

                {/* Moon Icon */}
                <motion.div
                    initial={false}
                    animate={{
                        rotate: isDark ? 0 : -90,
                        scale: isDark ? 1 : 0,
                        opacity: isDark ? 1 : 0,
                    }}
                    transition={{
                        duration: reducedMotion ? 0 : 0.3,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Moon size={18} color="var(--primary)" />
                </motion.div>
            </div>

            {showLabel && (
                <span style={{ fontSize: '0.875rem' }}>
                    {isDark ? 'Dark' : 'Light'}
                </span>
            )}
        </motion.button>
    );
};

/**
 * ThemeSwitch - Toggle switch style theme control
 */
export const ThemeSwitch = ({ className = '' }) => {
    const { isDark, toggleTheme, reducedMotion } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={className}
            style={{
                width: 56,
                height: 28,
                borderRadius: 'var(--radius-full)',
                background: isDark ? 'var(--primary)' : 'var(--bg-tertiary)',
                border: 'none',
                padding: 2,
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.3s ease',
            }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <motion.div
                animate={{
                    x: isDark ? 28 : 0,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                }}
                style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
            >
                {isDark ? (
                    <Moon size={14} color="var(--primary)" />
                ) : (
                    <Sun size={14} color="var(--warning)" />
                )}
            </motion.div>
        </button>
    );
};

/**
 * MotionToggle - Toggle for reduced motion preference
 */
export const MotionToggle = ({ className = '' }) => {
    const { reducedMotion, toggleReducedMotion } = useTheme();

    return (
        <button
            onClick={toggleReducedMotion}
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: reducedMotion ? 'var(--primary-light)' : 'transparent',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                color: reducedMotion ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '0.875rem',
            }}
            title={reducedMotion ? 'Enable animations' : 'Reduce motion'}
            aria-label={reducedMotion ? 'Enable animations' : 'Reduce motion'}
        >
            <Monitor size={16} />
            {reducedMotion ? 'Motion Off' : 'Motion On'}
        </button>
    );
};

export default ThemeToggle;
