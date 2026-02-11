import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * AnimatedCard - 3D parallax card with tilt effect on hover
 */
const AnimatedCard = ({ 
    children, 
    className = '', 
    style = {},
    glowColor = 'rgba(255, 184, 0, 0.3)',
    tiltAmount = 10,
    scaleAmount = 1.02,
    onClick,
    disabled = false,
}) => {
    const { reducedMotion } = useTheme();
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Motion values for smooth interpolation
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring physics for natural motion
    const springConfig = { stiffness: 300, damping: 30 };
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltAmount, -tiltAmount]), springConfig);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltAmount, tiltAmount]), springConfig);
    const scale = useSpring(1, springConfig);

    const handleMouseMove = (e) => {
        if (reducedMotion || disabled) return;
        
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = (e.clientX - centerX) / rect.width;
        const mouseY = (e.clientY - centerY) / rect.height;

        x.set(mouseX);
        y.set(mouseY);
    };

    const handleMouseEnter = () => {
        if (reducedMotion || disabled) return;
        setIsHovered(true);
        scale.set(scaleAmount);
    };

    const handleMouseLeave = () => {
        if (reducedMotion || disabled) return;
        setIsHovered(false);
        x.set(0);
        y.set(0);
        scale.set(1);
    };

    if (reducedMotion) {
        return (
            <div 
                className={`glass-card ${className}`} 
                style={style}
                onClick={onClick}
            >
                {children}
            </div>
        );
    }

    return (
        <motion.div
            ref={cardRef}
            className={`glass-card ${className}`}
            style={{
                ...style,
                perspective: 1000,
                transformStyle: 'preserve-3d',
                rotateX,
                rotateY,
                scale,
                cursor: onClick ? 'pointer' : 'default',
                boxShadow: isHovered 
                    ? `0 20px 40px rgba(0,0,0,0.15), 0 0 30px ${glowColor}`
                    : undefined,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            whileTap={onClick && !disabled ? { scale: 0.98 } : undefined}
        >
            {/* Shine effect layer */}
            <motion.div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    background: `radial-gradient(circle at ${useTransform(x, [-0.5, 0.5], [0, 100])}% ${useTransform(y, [-0.5, 0.5], [0, 100])}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                }}
            />
            
            {/* Content with subtle 3D lift */}
            <motion.div
                style={{
                    position: 'relative',
                    transform: isHovered ? 'translateZ(20px)' : 'translateZ(0)',
                    transition: 'transform 0.3s ease',
                }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

/**
 * FloatingCard - Card that gently floats up and down
 */
export const FloatingCard = ({ 
    children, 
    className = '', 
    style = {},
    floatAmount = 8,
    duration = 3,
}) => {
    const { reducedMotion } = useTheme();

    if (reducedMotion) {
        return (
            <div className={`glass-card ${className}`} style={style}>
                {children}
            </div>
        );
    }

    return (
        <motion.div
            className={`glass-card ${className}`}
            style={style}
            animate={{
                y: [0, -floatAmount, 0],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * GlassPanel - Glassmorphism panel with depth effect
 */
export const GlassPanel = ({ 
    children, 
    className = '', 
    style = {},
    blur = 12,
    opacity = 0.7,
}) => {
    const { isDark } = useTheme();

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
                ...style,
                background: isDark 
                    ? `rgba(30, 41, 59, ${opacity})`
                    : `rgba(255, 255, 255, ${opacity})`,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)'}`,
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--glass-shadow)',
            }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedCard;
