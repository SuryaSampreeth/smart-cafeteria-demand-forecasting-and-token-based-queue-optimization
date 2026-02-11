import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, UserCircle, Hash, Utensils, UserPlus } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { AnimatedButton, AnimatedCard, SlideUp } from '../../components/ui';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        registrationNumber: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: 0.1 + i * 0.1 },
        }),
    };

    const roleOptions = [
        { value: 'student', label: 'Student', icon: User },
        { value: 'staff', label: 'Staff', icon: UserCircle },
        { value: 'admin', label: 'Admin', icon: UserCircle },
    ];

    return (
        <div className="container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 'calc(100vh - 5rem)',
            padding: '2rem 1rem',
        }}>
            <SlideUp>
                <AnimatedCard 
                    style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}
                    glowColor="rgba(255, 184, 0, 0.2)"
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                        style={{ textAlign: 'center', marginBottom: '2rem' }}
                    >
                        <motion.div
                            whileHover={{ rotate: -15 }}
                            style={{
                                display: 'inline-flex',
                                padding: '1rem',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--success-light)',
                                marginBottom: '1rem',
                            }}
                        >
                            <Utensils size={32} color="var(--success)" />
                        </motion.div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Create Account</h2>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                            Join our cafeteria system
                        </p>
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
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
                    </AnimatePresence>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit}>
                        <motion.div
                            custom={0}
                            variants={inputVariants}
                            initial="hidden"
                            animate="visible"
                            className="form-group"
                        >
                            <label className="form-label" htmlFor="name">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User 
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
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    style={{ paddingLeft: '2.75rem' }}
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            custom={1}
                            variants={inputVariants}
                            initial="hidden"
                            animate="visible"
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
                                    name="email"
                                    id="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    style={{ paddingLeft: '2.75rem' }}
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            custom={2}
                            variants={inputVariants}
                            initial="hidden"
                            animate="visible"
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
                                    name="password"
                                    id="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    style={{ paddingLeft: '2.75rem' }}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <p style={{ 
                                fontSize: '0.75rem', 
                                color: 'var(--text-muted)', 
                                marginTop: '0.25rem',
                                marginBottom: 0,
                            }}>
                                Minimum 6 characters
                            </p>
                        </motion.div>

                        <motion.div
                            custom={3}
                            variants={inputVariants}
                            initial="hidden"
                            animate="visible"
                            className="form-group"
                        >
                            <label className="form-label">Account Type</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {roleOptions.map((option) => {
                                    const IconComponent = option.icon;
                                    return (
                                        <motion.button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: option.value })}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                borderRadius: 'var(--radius)',
                                                border: formData.role === option.value 
                                                    ? '2px solid var(--primary)' 
                                                    : '2px solid var(--border-color)',
                                                background: formData.role === option.value 
                                                    ? 'var(--primary-light)' 
                                                    : 'var(--bg-secondary)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <IconComponent 
                                                size={20} 
                                                color={formData.role === option.value ? 'var(--primary)' : 'var(--text-muted)'} 
                                            />
                                            <span style={{ 
                                                fontSize: '0.85rem',
                                                fontWeight: formData.role === option.value ? 600 : 400,
                                                color: formData.role === option.value ? 'var(--primary)' : 'var(--text-secondary)',
                                            }}>
                                                {option.label}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {formData.role === 'student' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="form-group"
                                >
                                    <label className="form-label" htmlFor="registrationNumber">Registration Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Hash 
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
                                            type="text"
                                            name="registrationNumber"
                                            id="registrationNumber"
                                            className="form-input"
                                            value={formData.registrationNumber}
                                            onChange={handleChange}
                                            placeholder="e.g. 123456"
                                            style={{ paddingLeft: '2.75rem' }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <AnimatedButton 
                                type="submit" 
                                variant="primary" 
                                fullWidth 
                                size="lg"
                                loading={isLoading}
                                icon={<UserPlus size={18} />}
                                iconPosition="right"
                                style={{ marginTop: '0.5rem' }}
                            >
                                Create Account
                            </AnimatedButton>
                        </motion.div>
                    </form>

                    {/* Login Link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                        Already have an account?{' '}
                        <Link 
                            to="/login" 
                            style={{ 
                                color: 'var(--primary)', 
                                fontWeight: 600,
                                textDecoration: 'none',
                            }}
                        >
                            Sign In
                        </Link>
                    </motion.p>
                </AnimatedCard>
            </SlideUp>
        </div>
    );
};

export default Register;
