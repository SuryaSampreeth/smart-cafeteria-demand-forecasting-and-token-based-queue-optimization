import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, BarChart2, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { StaggerContainer, StaggerItem, AnimatedCard, AnimatedButton } from '../components/ui';

const Landing = () => {
    return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'var(--primary-light)',
                        borderRadius: 'var(--radius-full)',
                        marginBottom: '1.5rem',
                    }}
                >
                    <Sparkles size={16} color="var(--primary)" />
                    <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                        AI-Powered Campus Dining
                    </span>
                </motion.div>

                <h1 style={{ 
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
                    marginBottom: '1.5rem',
                    lineHeight: 1.1,
                }}>
                    Smart{' '}
                    <span style={{ 
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Cafeteria
                    </span>
                </h1>
                
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ 
                        fontSize: '1.25rem', 
                        maxWidth: '600px', 
                        margin: '0 auto 2.5rem auto',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                    }}
                >
                    Experience seamless dining with our smart demand forecasting and 
                    queue optimization system. Skip the lines, save time.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                >
                    <AnimatedButton 
                        variant="primary" 
                        size="lg"
                        icon={<ArrowRight size={18} />}
                        iconPosition="right"
                    >
                        <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Get Started
                        </Link>
                    </AnimatedButton>
                    
                    <AnimatedButton variant="secondary" size="lg">
                        <Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Learn More
                        </Link>
                    </AnimatedButton>
                </motion.div>
            </motion.div>

            {/* Feature Cards */}
            <StaggerContainer 
                className="grid grid-cols-1 md:grid-cols-3" 
                style={{ marginTop: '5rem', gap: '1.5rem' }}
                delay={0.5}
            >
                <StaggerItem>
                    <AnimatedCard 
                        glowColor="rgba(245, 158, 11, 0.3)"
                        style={{ height: '100%', textAlign: 'center' }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            style={{ 
                                display: 'inline-flex',
                                padding: '1rem',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--warning-light)',
                                marginBottom: '1rem',
                            }}
                        >
                            <Zap size={32} color="var(--warning)" />
                        </motion.div>
                        <h3>Fast Ordering</h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Skip the line by pre-ordering your meals directly from your device.
                        </p>
                    </AnimatedCard>
                </StaggerItem>

                <StaggerItem>
                    <AnimatedCard 
                        glowColor="rgba(255, 140, 0, 0.3)"
                        style={{ height: '100%', textAlign: 'center' }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            style={{ 
                                display: 'inline-flex',
                                padding: '1rem',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--accent-light)',
                                marginBottom: '1rem',
                            }}
                        >
                            <BarChart2 size={32} color="var(--accent)" />
                        </motion.div>
                        <h3>AI Forecasting</h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            We predict crowd levels to help you choose the best time to visit.
                        </p>
                    </AnimatedCard>
                </StaggerItem>

                <StaggerItem>
                    <AnimatedCard 
                        glowColor="rgba(16, 185, 129, 0.3)"
                        style={{ height: '100%', textAlign: 'center' }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            style={{ 
                                display: 'inline-flex',
                                padding: '1rem',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--success-light)',
                                marginBottom: '1rem',
                            }}
                        >
                            <Clock size={32} color="var(--success)" />
                        </motion.div>
                        <h3>Real-time Updates</h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Live status tracking for your orders and queue positions.
                        </p>
                    </AnimatedCard>
                </StaggerItem>
            </StaggerContainer>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                    marginTop: '5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '3rem',
                    flexWrap: 'wrap',
                }}
            >
                {[
                    { value: '5000+', label: 'Students Served' },
                    { value: '15min', label: 'Avg Time Saved' },
                    { value: '98%', label: 'Satisfaction Rate' },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            {stat.value}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default Landing;
