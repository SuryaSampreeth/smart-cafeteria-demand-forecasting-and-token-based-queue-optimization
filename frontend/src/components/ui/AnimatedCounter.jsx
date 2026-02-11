import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * AnimatedCounter - Smooth number increment animation
 */
const AnimatedCounter = ({
    value,
    duration = 1,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = '',
    style = {},
    size = 'md', // sm, md, lg, xl
}) => {
    const { reducedMotion } = useTheme();
    const [displayValue, setDisplayValue] = useState(0);
    const prevValueRef = useRef(value);

    const sizeStyles = {
        sm: { fontSize: '1.25rem', fontWeight: 600 },
        md: { fontSize: '1.75rem', fontWeight: 700 },
        lg: { fontSize: '2.5rem', fontWeight: 700 },
        xl: { fontSize: '4rem', fontWeight: 700 },
    };

    useEffect(() => {
        if (reducedMotion) {
            setDisplayValue(value);
            return;
        }

        const controls = animate(prevValueRef.current, value, {
            duration,
            ease: 'easeOut',
            onUpdate: (v) => setDisplayValue(v),
        });

        prevValueRef.current = value;

        return () => controls.stop();
    }, [value, duration, reducedMotion]);

    const formattedValue = decimals > 0 
        ? displayValue.toFixed(decimals)
        : Math.round(displayValue).toLocaleString();

    return (
        <motion.span
            className={className}
            style={{
                ...sizeStyles[size],
                ...style,
                fontFamily: 'var(--font-mono)',
                display: 'inline-block',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            {prefix}{formattedValue}{suffix}
        </motion.span>
    );
};

/**
 * AnimatedPercentage - Animated percentage with optional color coding
 */
export const AnimatedPercentage = ({
    value,
    showBar = true,
    colorCode = true, // green < 50%, yellow 50-80%, red > 80%
    className = '',
    barHeight = 8,
}) => {
    const { reducedMotion } = useTheme();
    
    const getColor = () => {
        if (!colorCode) return 'var(--primary)';
        if (value < 50) return 'var(--success)';
        if (value < 80) return 'var(--warning)';
        return 'var(--danger)';
    };

    const color = getColor();

    return (
        <div className={className}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: showBar ? '0.5rem' : 0 }}>
                <AnimatedCounter 
                    value={value} 
                    size="md" 
                    style={{ color }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>%</span>
            </div>
            
            {showBar && (
                <div 
                    style={{
                        height: barHeight,
                        width: '100%',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                    }}
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(value, 100)}%` }}
                        transition={{ 
                            duration: reducedMotion ? 0 : 1, 
                            ease: 'easeOut' 
                        }}
                        style={{
                            height: '100%',
                            background: color,
                            borderRadius: 'var(--radius-full)',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

/**
 * LiveCounter - Counter that updates when value changes with subtle animation
 */
export const LiveCounter = ({
    value,
    label,
    icon,
    trend, // 'up' | 'down' | null
    trendValue,
    className = '',
}) => {
    const { reducedMotion } = useTheme();
    const [prevValue, setPrevValue] = useState(value);
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        if (prevValue !== value) {
            setFlash(true);
            setTimeout(() => setFlash(false), 300);
            setPrevValue(value);
        }
    }, [value, prevValue]);

    const trendColor = trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--danger)' : 'var(--text-muted)';
    const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';

    return (
        <motion.div
            className={`glass-card ${className}`}
            animate={flash && !reducedMotion ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.3 }}
            style={{ padding: '1.25rem' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {icon && (
                    <div style={{ 
                        padding: '0.5rem', 
                        borderRadius: 'var(--radius)', 
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                    }}>
                        {icon}
                    </div>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{label}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <AnimatedCounter value={value} size="lg" />
                
                {trend && trendValue && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ 
                            color: trendColor, 
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                        }}
                    >
                        {trendIcon} {trendValue}
                    </motion.span>
                )}
            </div>
        </motion.div>
    );
};

/**
 * CountdownTimer - Animated countdown display
 */
export const CountdownTimer = ({
    minutes,
    seconds = 0,
    onComplete,
    label = 'Estimated Wait',
    className = '',
}) => {
    const { reducedMotion } = useTheme();
    const [timeLeft, setTimeLeft] = useState(minutes * 60 + seconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onComplete]);

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    const urgency = timeLeft < 60 ? 'var(--danger)' : timeLeft < 180 ? 'var(--warning)' : 'var(--text-primary)';

    return (
        <div className={className} style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {label}
            </p>
            <motion.div
                animate={timeLeft < 60 && !reducedMotion ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 1, repeat: timeLeft < 60 ? Infinity : 0 }}
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: urgency,
                }}
            >
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </motion.div>
        </div>
    );
};

export default AnimatedCounter;
