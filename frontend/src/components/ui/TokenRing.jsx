import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * TokenRing - 3D token ring visualization for queue display
 */
const TokenRing = ({
    tokenNumber,
    status = 'active', // 'pending' | 'active' | 'ready' | 'completed'
    size = 'lg', // 'sm' | 'md' | 'lg' | 'xl'
    showPulse = true,
    className = '',
}) => {
    const { reducedMotion, isDark } = useTheme();

    const sizeMap = {
        sm: { ring: 80, font: '1.5rem', border: 3 },
        md: { ring: 100, font: '2rem', border: 4 },
        lg: { ring: 140, font: '3rem', border: 5 },
        xl: { ring: 180, font: '4rem', border: 6 },
    };

    const statusColors = {
        pending: {
            primary: 'var(--warning)',
            glow: 'rgba(245, 158, 11, 0.4)',
            bg: 'rgba(245, 158, 11, 0.1)',
        },
        active: {
            primary: 'var(--primary)',
            glow: 'rgba(255, 184, 0, 0.4)',
            bg: 'rgba(255, 184, 0, 0.1)',
        },
        ready: {
            primary: 'var(--success)',
            glow: 'rgba(16, 185, 129, 0.4)',
            bg: 'rgba(16, 185, 129, 0.1)',
        },
        completed: {
            primary: 'var(--text-muted)',
            glow: 'rgba(148, 163, 184, 0.2)',
            bg: 'rgba(148, 163, 184, 0.1)',
        },
    };

    const { ring, font, border } = sizeMap[size];
    const colors = statusColors[status];

    return (
        <div 
            className={className}
            style={{
                position: 'relative',
                width: ring,
                height: ring,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Outer glow ring */}
            {showPulse && !reducedMotion && status !== 'completed' && (
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'absolute',
                        inset: -8,
                        borderRadius: '50%',
                        border: `2px solid ${colors.primary}`,
                        opacity: 0.5,
                    }}
                />
            )}

            {/* Secondary pulse ring */}
            {showPulse && !reducedMotion && status === 'active' && (
                <motion.div
                    animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                    }}
                    style={{
                        position: 'absolute',
                        inset: -16,
                        borderRadius: '50%',
                        border: `1px solid ${colors.primary}`,
                        opacity: 0.3,
                    }}
                />
            )}

            {/* Main token ring */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                }}
                style={{
                    width: ring,
                    height: ring,
                    borderRadius: '50%',
                    border: `${border}px solid ${colors.primary}`,
                    background: colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 30px ${colors.glow}`,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Rotating gradient border effect */}
                {!reducedMotion && status === 'active' && (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{
                            position: 'absolute',
                            inset: -2,
                            borderRadius: '50%',
                            background: `conic-gradient(from 0deg, transparent, ${colors.primary}, transparent)`,
                            opacity: 0.3,
                        }}
                    />
                )}

                {/* Token number */}
                <motion.span
                    key={tokenNumber}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: font,
                        fontWeight: 700,
                        color: colors.primary,
                        zIndex: 1,
                    }}
                >
                    #{tokenNumber}
                </motion.span>
            </motion.div>

            {/* Status label */}
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                    position: 'absolute',
                    bottom: -30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: colors.bg,
                    color: colors.primary,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                }}
            >
                {status}
            </motion.div>
        </div>
    );
};

/**
 * TokenStatusTransition - Animated token status change
 */
export const TokenStatusTransition = ({
    tokenNumber,
    fromStatus,
    toStatus,
    onComplete,
}) => {
    const { reducedMotion } = useTheme();

    const statusSequence = ['pending', 'active', 'ready', 'completed'];
    const [currentStatus, setCurrentStatus] = React.useState(fromStatus);

    React.useEffect(() => {
        if (reducedMotion) {
            setCurrentStatus(toStatus);
            onComplete?.();
            return;
        }

        const fromIndex = statusSequence.indexOf(fromStatus);
        const toIndex = statusSequence.indexOf(toStatus);
        
        if (fromIndex < toIndex) {
            let index = fromIndex;
            const interval = setInterval(() => {
                index++;
                setCurrentStatus(statusSequence[index]);
                if (index >= toIndex) {
                    clearInterval(interval);
                    onComplete?.();
                }
            }, 500);
            return () => clearInterval(interval);
        } else {
            setCurrentStatus(toStatus);
            onComplete?.();
        }
    }, [fromStatus, toStatus, reducedMotion, onComplete]);

    return (
        <TokenRing
            tokenNumber={tokenNumber}
            status={currentStatus}
            showPulse={currentStatus !== 'completed'}
        />
    );
};

/**
 * MiniToken - Compact token display for lists
 */
export const MiniToken = ({
    tokenNumber,
    status = 'active',
    className = '',
}) => {
    const statusColors = {
        pending: 'var(--warning)',
        active: 'var(--primary)',
        preparing: 'var(--accent)',
        ready: 'var(--success)',
        completed: 'var(--text-muted)',
    };

    return (
        <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius)',
                background: `${statusColors[status]}15`,
                border: `1px solid ${statusColors[status]}40`,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: statusColors[status],
            }}
        >
            <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: statusColors[status],
            }} />
            #{tokenNumber}
        </motion.span>
    );
};

export default TokenRing;
