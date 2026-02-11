import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

/**
 * PageTransition - Smooth route-based transitions with fade + scale effects
 */

// Transition variants
const pageVariants = {
    initial: {
        opacity: 0,
        scale: 0.98,
        y: 10,
    },
    enter: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
            when: 'beforeChildren',
            staggerChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        y: -10,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

// Slide variants for direction-aware transitions
const slideVariants = {
    initial: (direction) => ({
        opacity: 0,
        x: direction > 0 ? 100 : -100,
    }),
    enter: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: (direction) => ({
        opacity: 0,
        x: direction > 0 ? -100 : 100,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    }),
};

// Child stagger animation
export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

export const staggerItem = {
    hidden: { 
        opacity: 0, 
        y: 20,
        scale: 0.95,
    },
    show: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const PageTransition = ({ children, variant = 'fade' }) => {
    const { reducedMotion } = useTheme();
    const location = useLocation();

    if (reducedMotion) {
        return <>{children}</>;
    }

    const variants = variant === 'slide' ? slideVariants : pageVariants;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={variants}
                style={{ width: '100%' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * FadeIn - Simple fade-in wrapper
 */
export const FadeIn = ({ children, delay = 0, duration = 0.5, className = '' }) => {
    const { reducedMotion } = useTheme();

    if (reducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * SlideUp - Slide up with fade
 */
export const SlideUp = ({ children, delay = 0, duration = 0.5, className = '' }) => {
    const { reducedMotion } = useTheme();

    if (reducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                duration, 
                delay, 
                ease: [0.25, 0.46, 0.45, 0.94] 
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * ScaleIn - Scale in with fade
 */
export const ScaleIn = ({ children, delay = 0, duration = 0.4, className = '' }) => {
    const { reducedMotion } = useTheme();

    if (reducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
                duration, 
                delay, 
                ease: [0.34, 1.56, 0.64, 1] // Spring-like
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * StaggerContainer - Container for staggered children animations
 */
export const StaggerContainer = ({ children, className = '', delay = 0 }) => {
    const { reducedMotion } = useTheme();

    if (reducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            transition={{ delayChildren: delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * StaggerItem - Individual stagger item
 */
export const StaggerItem = ({ children, className = '' }) => {
    const { reducedMotion } = useTheme();

    if (reducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div variants={staggerItem} className={className}>
            {children}
        </motion.div>
    );
};

export default PageTransition;
