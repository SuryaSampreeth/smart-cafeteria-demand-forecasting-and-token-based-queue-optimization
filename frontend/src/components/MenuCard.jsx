import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Leaf, Drumstick, Coffee, Cookie } from 'lucide-react';
import { AnimatedButton } from './ui';

const MenuCard = ({ item, onOrder }) => {
    const getCategoryTheme = (category) => {
        switch (category) {
            case 'veg': return { color: 'var(--success)', label: 'Veg', icon: Leaf, bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))' };
            case 'non-veg': return { color: 'var(--danger)', label: 'Non-Veg', icon: Drumstick, bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))' };
            case 'beverage': return { color: 'var(--primary)', label: 'Beverage', icon: Coffee, bgGradient: 'linear-gradient(135deg, rgba(255, 184, 0, 0.1), rgba(255, 184, 0, 0.05))' };
            case 'dessert': return { color: 'var(--warning)', label: 'Dessert', icon: Cookie, bgGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))' };
            default: return { color: 'var(--text-muted)', label: category, icon: Coffee, bgGradient: 'var(--bg-secondary)' };
        }
    };

    const theme = getCategoryTheme(item.category);
    const IconComponent = theme.icon;

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative gradient */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.color}, transparent)`,
            }} />

            {/* Category Image Placeholder */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                    height: '140px',
                    background: theme.bgGradient,
                    borderRadius: 'var(--radius)',
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${theme.color}30`,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <IconComponent size={48} color={theme.color} strokeWidth={1.5} />
                </motion.div>
                <span style={{
                    color: theme.color,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginTop: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                }}>
                    {theme.label}
                </span>
            </motion.div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', margin: 0, lineHeight: 1.3 }}>{item.name}</h3>
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            backgroundColor: item.isAvailable ? 'var(--success-light)' : 'var(--danger-light)',
                            color: item.isAvailable ? 'var(--success)' : 'var(--danger)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {item.isAvailable ? 'Available' : 'Sold Out'}
                    </motion.span>
                </div>

                <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                    lineHeight: 1.5,
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>
                    {item.description || "Freshly prepared item."}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <motion.span
                        style={{
                            fontSize: '1.35rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '0.15rem',
                        }}
                    >
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>₹</span>
                        {item.price}
                    </motion.span>
                    <AnimatedButton
                        variant="primary"
                        size="sm"
                        onClick={() => onOrder(item)}
                        disabled={!item.isAvailable}
                        icon={<ShoppingCart size={14} />}
                        style={{ opacity: item.isAvailable ? 1 : 0.5 }}
                    >
                        Add
                    </AnimatedButton>
                </div>
            </div>
        </motion.div>
    );
};

export default MenuCard;
