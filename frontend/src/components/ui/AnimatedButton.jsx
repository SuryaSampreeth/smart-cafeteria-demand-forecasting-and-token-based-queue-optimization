import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * AnimatedButton - Button with micro-animations (scale + glow on hover)
 */
const AnimatedButton = ({
    children,
    variant = 'primary', // primary, secondary, accent, ghost, danger
    size = 'md', // sm, md, lg
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    className = '',
    style = {},
    type = 'button',
    ...props
}) => {
    const { reducedMotion } = useTheme();

    // Size styles
    const sizeStyles = {
        sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
        md: { padding: '0.75rem 1.5rem', fontSize: '0.95rem' },
        lg: { padding: '1rem 2rem', fontSize: '1.1rem' },
    };

    // Variant styles
    const variantStyles = {
        primary: {
            background: 'var(--gradient-primary)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(255, 184, 0, 0.3)',
        },
        secondary: {
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
        },
        accent: {
            background: 'var(--gradient-accent)',
            color: 'white',
            boxShadow: '0 4px 14px rgba(255, 140, 0, 0.4)',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-secondary)',
        },
        danger: {
            background: 'var(--danger)',
            color: 'white',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
        },
        outline: {
            background: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
        },
    };

    // Hover glow colors
    const glowColors = {
        primary: 'rgba(255, 184, 0, 0.45)',
        secondary: 'rgba(255, 184, 0, 0.15)',
        accent: 'rgba(255, 140, 0, 0.45)',
        ghost: 'rgba(255, 184, 0, 0.1)',
        danger: 'rgba(239, 68, 68, 0.5)',
        outline: 'rgba(255, 184, 0, 0.15)',
    };

    const buttonStyle = {
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        borderRadius: 'var(--radius)',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        border: variantStyles[variant].border || 'none',
        position: 'relative',
        overflow: 'hidden',
    };

    // Animation variants
    const buttonVariants = {
        idle: { scale: 1 },
        hover: { 
            scale: 1.02,
            boxShadow: `0 6px 20px ${glowColors[variant]}`,
        },
        tap: { scale: 0.98 },
    };

    // Loading spinner
    const LoadingSpinner = () => (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
                width: '1em',
                height: '1em',
                border: '2px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
            }}
        />
    );

    // Ripple effect component
    const Ripple = ({ x, y }) => (
        <motion.span
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.3)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
            }}
        />
    );

    const [ripples, setRipples] = React.useState([]);

    const handleClick = (e) => {
        if (disabled || loading) return;
        
        // Add ripple effect
        if (!reducedMotion) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const newRipple = { x, y, id: Date.now() };
            setRipples(prev => [...prev, newRipple]);
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
            }, 600);
        }

        onClick?.(e);
    };

    if (reducedMotion) {
        return (
            <button
                type={type}
                className={`btn btn-${variant} ${className}`}
                style={buttonStyle}
                onClick={handleClick}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <LoadingSpinner />}
                {!loading && icon && iconPosition === 'left' && icon}
                {children}
                {!loading && icon && iconPosition === 'right' && icon}
            </button>
        );
    }

    return (
        <motion.button
            type={type}
            className={className}
            style={buttonStyle}
            onClick={handleClick}
            disabled={disabled || loading}
            variants={buttonVariants}
            initial="idle"
            whileHover={!disabled && !loading ? 'hover' : 'idle'}
            whileTap={!disabled && !loading ? 'tap' : 'idle'}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            {...props}
        >
            {/* Ripple effects */}
            {ripples.map(ripple => (
                <Ripple key={ripple.id} x={ripple.x} y={ripple.y} />
            ))}

            {loading && <LoadingSpinner />}
            {!loading && icon && iconPosition === 'left' && icon}
            <span>{children}</span>
            {!loading && icon && iconPosition === 'right' && icon}
        </motion.button>
    );
};

/**
 * IconButton - Circular icon button with hover effects
 */
export const IconButton = ({
    icon,
    variant = 'ghost',
    size = 'md',
    onClick,
    disabled = false,
    label,
    className = '',
    ...props
}) => {
    const { reducedMotion } = useTheme();

    const sizeMap = {
        sm: { size: 32, iconSize: 16 },
        md: { size: 40, iconSize: 20 },
        lg: { size: 48, iconSize: 24 },
    };

    const { size: btnSize, iconSize } = sizeMap[size];

    const baseStyle = {
        width: btnSize,
        height: btnSize,
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        background: variant === 'ghost' ? 'transparent' : 'var(--surface)',
        border: variant === 'ghost' ? 'none' : '1px solid var(--glass-border)',
        color: 'var(--text-secondary)',
    };

    if (reducedMotion) {
        return (
            <button
                className={`btn-icon ${className}`}
                style={baseStyle}
                onClick={onClick}
                disabled={disabled}
                title={label}
                aria-label={label}
                {...props}
            >
                {icon}
            </button>
        );
    }

    return (
        <motion.button
            className={className}
            style={baseStyle}
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            whileHover={{ 
                scale: 1.1, 
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            {...props}
        >
            {icon}
        </motion.button>
    );
};

export default AnimatedButton;
