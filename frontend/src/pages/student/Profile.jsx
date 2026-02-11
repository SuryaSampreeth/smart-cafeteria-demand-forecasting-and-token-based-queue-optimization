import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Hash, Save, Camera, Utensils, CheckCircle } from 'lucide-react';
import { 
    AnimatedCard, 
    AnimatedButton, 
    SlideUp,
    useNotifications 
} from '../../components/ui';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const { addNotification } = useNotifications();
    const [formData, setFormData] = useState({
        name: user?.name || 'John Doe',
        email: user?.email || 'john@example.com',
        dietary: 'non-veg',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        addNotification({
            type: 'success',
            title: 'Profile Updated',
            message: 'Your changes have been saved successfully',
        });
    };

    const dietaryOptions = [
        { value: 'veg', label: 'Vegetarian', color: 'var(--success)' },
        { value: 'non-veg', label: 'Non-Vegetarian', color: 'var(--danger)' },
        { value: 'vegan', label: 'Vegan', color: 'var(--primary)' },
    ];

    const inputVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: 0.2 + i * 0.1 },
        }),
    };

    return (
        <div className="container">
            <SlideUp>
                <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>
            </SlideUp>
            
            <AnimatedCard style={{ maxWidth: '600px' }}>
                {/* Avatar Section */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    style={{ textAlign: 'center', marginBottom: '2rem' }}
                >
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            style={{ 
                                width: '120px', 
                                height: '120px', 
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '3rem',
                                fontWeight: 700,
                                color: 'white',
                                boxShadow: '0 8px 32px rgba(255, 184, 0, 0.3)',
                            }}
                        >
                            {formData.name.charAt(0).toUpperCase()}
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'var(--bg-primary)',
                                border: '2px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <Camera size={16} color="var(--text-secondary)" />
                        </motion.button>
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ marginTop: '1rem', marginBottom: '0.25rem' }}
                    >
                        {formData.name}
                    </motion.h2>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                        }}
                    >
                        {user?.role || 'Student'}
                    </motion.span>
                </motion.div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit}>
                    <motion.div
                        custom={0}
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        className="form-group"
                    >
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} color="var(--text-muted)" /> Full Name
                        </label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            className="form-input" 
                        />
                    </motion.div>

                    <motion.div
                        custom={1}
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        className="form-group"
                    >
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} color="var(--text-muted)" /> Email Address
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            className="form-input" 
                            disabled 
                            style={{ opacity: 0.7 }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Email cannot be changed
                        </p>
                    </motion.div>

                    <motion.div
                        custom={2}
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        className="form-group"
                    >
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Hash size={16} color="var(--text-muted)" /> Registration ID
                        </label>
                        <input 
                            type="text" 
                            value={user?._id || 'STU-2024-001'} 
                            className="form-input" 
                            disabled 
                            style={{ opacity: 0.7 }}
                        />
                    </motion.div>

                    <motion.div
                        custom={3}
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        className="form-group"
                    >
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Utensils size={16} color="var(--text-muted)" /> Dietary Preference
                        </label>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {dietaryOptions.map((option) => {
                                const isSelected = formData.dietary === option.value;
                                return (
                                    <motion.button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, dietary: option.value })}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            flex: 1,
                                            minWidth: '120px',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius)',
                                            border: isSelected 
                                                ? `2px solid ${option.color}` 
                                                : '2px solid var(--border-color)',
                                            background: isSelected 
                                                ? `${option.color}15` 
                                                : 'var(--bg-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 500 }}
                                            >
                                                <CheckCircle size={16} color={option.color} />
                                            </motion.div>
                                        )}
                                        <span style={{ 
                                            fontSize: '0.9rem',
                                            fontWeight: isSelected ? 600 : 400,
                                            color: isSelected ? option.color : 'var(--text-secondary)',
                                        }}>
                                            {option.label}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <AnimatedButton 
                            type="submit" 
                            variant="primary" 
                            fullWidth 
                            size="lg"
                            loading={isSaving}
                            icon={<Save size={18} />}
                            style={{ marginTop: '1rem' }}
                        >
                            Update Profile
                        </AnimatedButton>
                    </motion.div>
                </form>
            </AnimatedCard>
        </div>
    );
};

export default Profile;
