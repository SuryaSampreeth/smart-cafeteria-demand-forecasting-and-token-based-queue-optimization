import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, Ticket, AlertCircle, Star } from 'lucide-react';
import { 
    AnimatedCard, 
    AnimatedButton, 
    SlideUp, 
    StaggerContainer, 
    StaggerItem,
    MiniToken,
    useNotifications 
} from '../../components/ui';

const mockBookings = [
    { id: 'BK-101', date: '2023-11-20', slot: 'Lunch', items: ['Chicken Biryani', 'Coke'], total: 220, status: 'active', token: 45, waitTime: 12 },
    { id: 'BK-098', date: '2023-11-19', slot: 'Breakfast', items: ['Veg Sandwich', 'Coffee'], total: 130, status: 'completed', token: 12, waitTime: 0 },
    { id: 'BK-092', date: '2023-11-18', slot: 'Dinner', items: ['Veg Thali'], total: 120, status: 'completed', token: 88, waitTime: 0 },
    { id: 'BK-085', date: '2023-11-15', slot: 'Lunch', items: ['Mini Meal'], total: 90, status: 'cancelled', token: null, waitTime: 0 },
];

const StatusBadge = ({ status }) => {
    const config = {
        active: { bg: 'var(--primary-light)', color: 'var(--primary)', icon: Ticket },
        completed: { bg: 'var(--success-light)', color: 'var(--success)', icon: CheckCircle },
        cancelled: { bg: 'var(--danger-light)', color: 'var(--danger)', icon: XCircle },
    };
    
    const { bg, color, icon: Icon } = config[status] || config.active;
    
    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                backgroundColor: bg,
                color: color,
            }}
        >
            <Icon size={12} />
            {status}
        </motion.span>
    );
};

const Bookings = () => {
    const { addNotification } = useNotifications();
    const [filter, setFilter] = useState('all');

    const filteredBookings = filter === 'all' 
        ? mockBookings 
        : mockBookings.filter(b => b.status === filter);

    const handleCancel = (id) => {
        addNotification({
            type: 'info',
            title: 'Booking Cancelled',
            message: `Booking ${id} has been cancelled`,
        });
    };

    const handleRate = (id) => {
        addNotification({
            type: 'success',
            title: 'Thank You!',
            message: 'Your rating has been submitted',
        });
    };

    const filters = [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="container">
            <SlideUp>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ margin: 0 }}>My Bookings</h1>
                    
                    {/* Filter Pills */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {filters.map((f) => (
                            <motion.button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    background: filter === f.value ? 'var(--primary)' : 'var(--bg-secondary)',
                                    color: filter === f.value ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {f.label}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </SlideUp>

            <StaggerContainer>
                <AnimatePresence mode="popLayout">
                    {filteredBookings.map((booking) => (
                        <StaggerItem key={booking.id}>
                            <AnimatedCard style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Header Row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                                <Calendar size={16} color="var(--text-muted)" />
                                                <span style={{ fontWeight: 600 }}>{booking.date}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({booking.id})</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                <Clock size={16} />
                                                {booking.slot}
                                            </div>
                                        </div>
                                        <StatusBadge status={booking.status} />
                                    </div>

                                    {/* Items & Total */}
                                    <div style={{ 
                                        padding: '1rem', 
                                        background: 'var(--bg-secondary)', 
                                        borderRadius: 'var(--radius)',
                                    }}>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            Items: {booking.items.join(', ')}
                                        </p>
                                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 700, fontSize: '1.1rem' }}>
                                            Total: <span style={{ color: 'var(--primary)' }}>₹{booking.total}</span>
                                        </p>
                                    </div>

                                    {/* Footer Row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            {booking.status === 'active' && booking.token && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <MiniToken number={booking.token} status="waiting" />
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Wait</p>
                                                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--warning)' }}>
                                                            {booking.waitTime} mins
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {booking.status === 'completed' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                                                    <CheckCircle size={18} />
                                                    <span style={{ fontSize: '0.9rem' }}>Order completed successfully</span>
                                                </div>
                                            )}
                                            {booking.status === 'cancelled' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                                    <AlertCircle size={18} />
                                                    <span style={{ fontSize: '0.9rem' }}>This booking was cancelled</span>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {booking.status === 'active' && (
                                                <AnimatedButton 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleCancel(booking.id)}
                                                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                                >
                                                    Cancel Booking
                                                </AnimatedButton>
                                            )}
                                            {booking.status === 'completed' && (
                                                <AnimatedButton 
                                                    variant="outline" 
                                                    size="sm"
                                                    icon={<Star size={14} />}
                                                    onClick={() => handleRate(booking.id)}
                                                >
                                                    Rate Meal
                                                </AnimatedButton>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </AnimatedCard>
                        </StaggerItem>
                    ))}
                </AnimatePresence>
            </StaggerContainer>

            {filteredBookings.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ 
                        textAlign: 'center', 
                        padding: '3rem',
                        color: 'var(--text-muted)',
                    }}
                >
                    <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No bookings found for this filter</p>
                </motion.div>
            )}
        </div>
    );
};

export default Bookings;
