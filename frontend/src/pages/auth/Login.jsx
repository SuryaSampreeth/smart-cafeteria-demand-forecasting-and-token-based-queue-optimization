import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Utensils, ArrowRight, ChefHat } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { AnimatedButton, AnimatedCard, SlideUp } from '../../components/ui';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper" style={{ 
            display: 'flex', 
            minHeight: 'calc(100vh - 5rem)',
            width: '100%',
        }}>
            {/* ===== LEFT SIDE - Branding ===== */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '4rem 3rem 4rem 5rem',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative background accent */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '80%',
                    height: '140%',
                    background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.06) 0%, rgba(255, 140, 0, 0.03) 100%)',
                    borderRadius: '0 40% 40% 0',
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Logo Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        style={{
                            display: 'inline-flex',
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-xl)',
                            background: 'var(--gradient-primary)',
                            marginBottom: '2rem',
                            boxShadow: '0 8px 30px rgba(255, 184, 0, 0.3)',
                        }}
                    >
                        <ChefHat size={48} color="#ffffff" strokeWidth={1.8} />
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                        style={{
                            fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                            fontWeight: 900,
                            lineHeight: 1.05,
                            letterSpacing: '-0.03em',
                            marginBottom: '0.5rem',
                            color: 'var(--text-primary)',
                        }}
                    >
                        Smart
                    </motion.h1>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.5 }}
                        style={{
                            fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                            fontWeight: 900,
                            lineHeight: 1.05,
                            letterSpacing: '-0.03em',
                            marginBottom: '1.5rem',
                            background: 'var(--gradient-primary)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Chef
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.5 }}
                        style={{
                            fontSize: '1.15rem',
                            color: 'var(--text-secondary)',
                            maxWidth: '400px',
                            lineHeight: 1.7,
                            margin: 0,
                        }}
                    >
                        AI-powered campus dining. Skip the queues, 
                        pre-order meals, and enjoy a smarter cafeteria experience.
                    </motion.p>

                    {/* Feature pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}
                    >
                        {['Token Queue', 'Live Crowd', 'Smart Forecast'].map((tag, i) => (
                            <span
                                key={tag}
                                style={{
                                    padding: '0.4rem 1rem',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* ===== RIGHT SIDE - Login Card ===== */}
            <div style={{
                width: '45%',
                minWidth: '420px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 4rem',
                borderLeft: '1px solid var(--glass-border)',
                background: 'var(--bg-secondary)',
            }}>
                <SlideUp>
                    <AnimatedCard 
                        style={{ width: '100%', maxWidth: '540px', padding: '2.5rem 3rem' }}
                        glowColor="rgba(255, 184, 0, 0.15)"
                    >
                        {/* Card Header */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ marginBottom: '0.4rem', fontSize: '1.5rem' }}>Welcome Back</h2>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
                                Sign in to your account
                            </p>
                        </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                backgroundColor: 'var(--danger-light)',
                                color: 'var(--danger)',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius)',
                                marginBottom: '1.5rem',
                                textAlign: 'center',
                                fontSize: '0.9rem',
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="form-group"
                        >
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail 
                                    size={18} 
                                    style={{ 
                                        position: 'absolute', 
                                        left: '1rem', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)',
                                    }} 
                                />
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    style={{ paddingLeft: '2.75rem' }}
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="form-group"
                        >
                            <label className="form-label" htmlFor="password">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock 
                                    size={18} 
                                    style={{ 
                                        position: 'absolute', 
                                        left: '1rem', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)',
                                    }} 
                                />
                                <input
                                    type="password"
                                    id="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    style={{ paddingLeft: '2.75rem' }}
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <AnimatedButton 
                                type="submit" 
                                variant="primary" 
                                fullWidth 
                                size="lg"
                                loading={isLoading}
                                icon={<ArrowRight size={18} />}
                                iconPosition="right"
                                style={{ marginTop: '0.5rem' }}
                            >
                                Sign In
                            </AnimatedButton>
                        </motion.div>
                    </form>

                    {/* Demo Credentials */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.8rem',
                        }}
                    >
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
                            Demo Credentials:
                        </p>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                            Student: <code>student@demo.com</code><br />
                            Staff: <code>staff@demo.com</code><br />
                            Admin: <code>admin@demo.com</code>
                        </p>
                    </motion.div>

                    {/* Register Link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                        Don't have an account?{' '}
                        <Link 
                            to="/register" 
                            style={{ 
                                color: 'var(--primary)', 
                                fontWeight: 600,
                                textDecoration: 'none',
                            }}
                        >
                            Register
                        </Link>
                    </motion.p>
                </AnimatedCard>
            </SlideUp>
            </div>

            {/* Mobile-responsive style override */}
            <style>{`
                @media (max-width: 900px) {
                    .login-page-wrapper > div:first-child {
                        display: none !important;
                    }
                    .login-page-wrapper > div:last-child {
                        width: 100% !important;
                        min-width: unset !important;
                        border-left: none !important;
                        background: var(--bg-primary) !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
