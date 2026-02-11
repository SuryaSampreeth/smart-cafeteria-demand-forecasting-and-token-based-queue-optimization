import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * AnimatedBackground - Low-motion animated background with gradient mesh,
 * floating particles, and dynamic glow based on crowd load
 */
const AnimatedBackground = ({ crowdLevel = 0, variant = 'default' }) => {
    const { isDark, reducedMotion } = useTheme();
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);

    // Particle configuration
    const particleCount = reducedMotion ? 0 : 30;
    
    // Color based on crowd level (0-100)
    const getGlowColor = useMemo(() => {
        if (crowdLevel < 50) return isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)';
        if (crowdLevel < 80) return isDark ? 'rgba(255, 184, 0, 0.15)' : 'rgba(255, 184, 0, 0.1)';
        return isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)';
    }, [crowdLevel, isDark]);

    const glowIntensity = useMemo(() => {
        return 0.3 + (crowdLevel / 100) * 0.4;
    }, [crowdLevel]);

    // Initialize particles
    useEffect(() => {
        if (reducedMotion) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = window.innerWidth;
        const height = canvas.height = window.innerHeight;

        // Create particles representing "crowd flow"
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.1,
        }));

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            particlesRef.current.forEach((particle, i) => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Wrap around edges
                if (particle.x < 0) particle.x = width;
                if (particle.x > width) particle.x = 0;
                if (particle.y < 0) particle.y = height;
                if (particle.y > height) particle.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = isDark 
                    ? `rgba(255, 184, 0, ${particle.alpha})`
                    : `rgba(255, 184, 0, ${particle.alpha * 0.4})`;
                ctx.fill();

                // Draw connections to nearby particles
                particlesRef.current.slice(i + 1).forEach(other => {
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.strokeStyle = isDark
                            ? `rgba(255, 184, 0, ${0.1 * (1 - dist / 150)})`
                            : `rgba(255, 184, 0, ${0.04 * (1 - dist / 150)})`;
                        ctx.stroke();
                    }
                });
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [isDark, reducedMotion, particleCount]);

    return (
        <div className="animated-bg" style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden' }}>
            {/* Gradient Mesh Layer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: isDark
                        ? `radial-gradient(circle at 20% 80%, rgba(255, 184, 0, 0.12) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.08) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, ${getGlowColor} 0%, transparent 70%)`
                        : `radial-gradient(circle at 20% 80%, rgba(255, 184, 0, 0.06) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.04) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, ${getGlowColor} 0%, transparent 70%)`,
                }}
            />

            {/* Animated Gradient Orbs */}
            {!reducedMotion && (
                <>
                    <motion.div
                        animate={{
                            x: [0, 100, 50, 0],
                            y: [0, 50, 100, 0],
                            scale: [1, 1.1, 0.9, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        style={{
                            position: 'absolute',
                            top: '10%',
                            left: '10%',
                            width: '40vw',
                            height: '40vw',
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${isDark ? 'rgba(255, 184, 0, 0.08)' : 'rgba(255, 184, 0, 0.04)'} 0%, transparent 70%)`,
                            filter: 'blur(40px)',
                        }}
                    />
                    <motion.div
                        animate={{
                            x: [0, -80, -40, 0],
                            y: [0, 80, 40, 0],
                            scale: [1, 0.9, 1.1, 1],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        style={{
                            position: 'absolute',
                            bottom: '10%',
                            right: '10%',
                            width: '35vw',
                            height: '35vw',
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${isDark ? 'rgba(255, 107, 53, 0.08)' : 'rgba(255, 107, 53, 0.04)'} 0%, transparent 70%)`,
                            filter: 'blur(40px)',
                        }}
                    />
                </>
            )}

            {/* Dynamic Crowd Glow (for dashboards) */}
            {variant === 'dashboard' && (
                <motion.div
                    animate={{
                        opacity: [glowIntensity * 0.8, glowIntensity, glowIntensity * 0.8],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80vw',
                        height: '80vh',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${getGlowColor} 0%, transparent 70%)`,
                        filter: 'blur(60px)',
                        pointerEvents: 'none',
                    }}
                />
            )}

            {/* Particle Canvas */}
            {!reducedMotion && (
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                    }}
                />
            )}

            {/* Noise Texture Overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: isDark ? 0.03 : 0.02,
                    pointerEvents: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
