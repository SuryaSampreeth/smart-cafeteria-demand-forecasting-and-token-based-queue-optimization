import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * CrowdGauge - Animated occupancy meter with status indicators
 */
const CrowdGauge = ({
    current,
    capacity,
    showLabel = true,
    showTrend = false,
    trend = null, // 'increasing' | 'decreasing' | 'stable'
    size = 'md', // 'sm' | 'md' | 'lg'
    className = '',
}) => {
    const { reducedMotion, isDark } = useTheme();
    
    const percentage = Math.min((current / capacity) * 100, 100);
    
    const getStatus = () => {
        if (percentage < 50) return { level: 'low', color: 'var(--success)', label: 'Low Traffic' };
        if (percentage < 80) return { level: 'medium', color: 'var(--warning)', label: 'Moderate' };
        return { level: 'high', color: 'var(--danger)', label: 'High Traffic' };
    };

    const status = getStatus();

    const sizeConfig = {
        sm: { height: 6, fontSize: '0.75rem', padding: '0.5rem' },
        md: { height: 10, fontSize: '0.875rem', padding: '1rem' },
        lg: { height: 14, fontSize: '1rem', padding: '1.5rem' },
    };

    const config = sizeConfig[size];

    const TrendIcon = trend === 'increasing' ? TrendingUp : trend === 'decreasing' ? TrendingDown : Minus;

    return (
        <div className={className}>
            {showLabel && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: config.fontSize }}>
                            Occupancy
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                            color: status.color, 
                            fontWeight: 600,
                            fontSize: config.fontSize,
                        }}>
                            {status.label}
                        </span>
                        {showTrend && trend && (
                            <TrendIcon 
                                size={14} 
                                style={{ 
                                    color: trend === 'increasing' ? 'var(--danger)' : 
                                           trend === 'decreasing' ? 'var(--success)' : 'var(--text-muted)' 
                                }} 
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Progress Bar Container */}
            <div
                style={{
                    height: config.height,
                    width: '100%',
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ 
                        duration: reducedMotion ? 0 : 1.5, 
                        ease: [0.25, 0.46, 0.45, 0.94] 
                    }}
                    style={{
                        height: '100%',
                        background: status.level === 'low' 
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : status.level === 'medium'
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                        borderRadius: 'var(--radius-full)',
                        position: 'relative',
                    }}
                >
                    {/* Shimmer effect */}
                    {!reducedMotion && status.level !== 'low' && (
                        <motion.div
                            animate={{
                                x: ['-100%', '200%'],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            }}
                        />
                    )}
                </motion.div>

                {/* Threshold markers */}
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }} />
                <div style={{ position: 'absolute', left: '80%', top: 0, bottom: 0, width: 1, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }} />
            </div>

            {/* Numbers */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '0.5rem',
                fontSize: config.fontSize,
            }}>
                <span style={{ color: 'var(--text-muted)' }}>
                    {current} / {capacity}
                </span>
                <motion.span
                    key={percentage}
                    initial={{ scale: 1.2, color: status.color }}
                    animate={{ scale: 1, color: status.color }}
                    style={{ fontWeight: 600 }}
                >
                    {Math.round(percentage)}%
                </motion.span>
            </div>
        </div>
    );
};

/**
 * CircularGauge - Circular progress gauge for dashboards
 */
export const CircularGauge = ({
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    label,
    className = '',
}) => {
    const { reducedMotion, isDark } = useTheme();
    
    const percentage = (value / max) * 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
        if (percentage < 50) return 'var(--success)';
        if (percentage < 80) return 'var(--warning)';
        return 'var(--danger)';
    };

    return (
        <div className={className} style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                    strokeWidth={strokeWidth}
                />
                
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ 
                        duration: reducedMotion ? 0 : 1.5, 
                        ease: [0.25, 0.46, 0.45, 0.94] 
                    }}
                    style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                    }}
                />
            </svg>
            
            {/* Center text */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <motion.span
                    key={value}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    style={{
                        fontSize: size * 0.22,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: getColor(),
                    }}
                >
                    {Math.round(percentage)}%
                </motion.span>
                {label && (
                    <span style={{ 
                        fontSize: size * 0.1, 
                        color: 'var(--text-muted)',
                        marginTop: 2,
                    }}>
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
};

/**
 * StatusIndicator - Animated status dot with glow
 */
export const StatusIndicator = ({
    status, // 'success' | 'warning' | 'danger' | 'info'
    label,
    pulse = true,
    size = 'md',
    className = '',
}) => {
    const { reducedMotion } = useTheme();

    const colors = {
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--primary)',
    };

    const sizeMap = {
        sm: 6,
        md: 8,
        lg: 12,
    };

    const dotSize = sizeMap[size];
    const color = colors[status] || colors.info;

    return (
        <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
                {/* Pulse ring */}
                {pulse && !reducedMotion && (
                    <motion.div
                        animate={{
                            scale: [1, 1.8, 1],
                            opacity: [0.6, 0, 0.6],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            background: color,
                        }}
                    />
                )}
                
                {/* Main dot */}
                <div
                    style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 ${dotSize}px ${color}`,
                        position: 'relative',
                    }}
                />
            </div>
            
            {label && (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {label}
                </span>
            )}
        </div>
    );
};

/**
 * CrowdLevelBadge - Compact crowd level indicator
 */
export const CrowdLevelBadge = ({ level, className = '' }) => {
    const { reducedMotion } = useTheme();

    const config = {
        low: { color: 'var(--success)', bg: 'var(--success-light)', label: 'Low' },
        medium: { color: 'var(--warning)', bg: 'var(--warning-light)', label: 'Moderate' },
        high: { color: 'var(--danger)', bg: 'var(--danger-light)', label: 'High' },
    };

    const { color, bg, label } = config[level] || config.low;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: bg,
                color: color,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
            }}
        >
            <StatusIndicator status={level === 'low' ? 'success' : level === 'medium' ? 'warning' : 'danger'} size="sm" pulse={level === 'high'} />
            {label}
        </motion.div>
    );
};

export default CrowdGauge;
