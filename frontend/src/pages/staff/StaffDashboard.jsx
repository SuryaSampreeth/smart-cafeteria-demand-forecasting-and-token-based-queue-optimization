import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, List, ArrowRight, Zap, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import { 
    TokenRing, 
    MiniToken, 
    CrowdGauge, 
    AnimatedButton, 
    AnimatedCard,
    StaggerContainer,
    StaggerItem,
    AnimatedCounter,
    StatusIndicator,
    useNotifications 
} from '../../components/ui';

const mockOrders = [
    { id: 'ORD-001', token: 45, items: ['Veg Thali', 'Coke'], status: 'pending', time: '12:30 PM' },
    { id: 'ORD-002', token: 46, items: ['Chicken Biryani'], status: 'preparing', time: '12:32 PM' },
    { id: 'ORD-003', token: 47, items: ['Samosa', 'Tea'], status: 'ready', time: '12:35 PM' },
    { id: 'ORD-004', token: 48, items: ['Burger'], status: 'pending', time: '12:36 PM' },
];

const StaffDashboard = () => {
    const [orders, setOrders] = useState(mockOrders);
    const [currentToken, setCurrentToken] = useState(45);
    const { success, warning } = useNotifications();

    const handleStatusChange = (id, newStatus) => {
        setOrders(orders.map(order => {
            if (order.id === id) {
                if (newStatus === 'ready') {
                    success('Order Ready', `Token #${order.token} is ready for pickup!`);
                }
                return { ...order, status: newStatus };
            }
            return order;
        }));
    };

    const callNext = () => {
        setCurrentToken(prev => prev + 1);
        const nextPending = orders.find(o => o.status === 'pending');
        if (nextPending) {
            handleStatusChange(nextPending.id, 'preparing');
            success('Next Token Called', `Now serving Token #${nextPending.token}`);
        }
    };

    const statusColors = {
        pending: { bg: 'var(--warning-light)', color: 'var(--warning)' },
        preparing: { bg: 'var(--primary-light)', color: 'var(--primary)' },
        ready: { bg: 'var(--success-light)', color: 'var(--success)' },
    };

    return (
        <div className="container">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}
            >
                <h1 style={{ margin: 0 }}>Staff Operations</h1>
                <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ 
                        background: 'var(--danger-light)', 
                        color: 'var(--danger)', 
                        padding: '0.5rem 1rem', 
                        borderRadius: 'var(--radius-full)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        fontWeight: 600 
                    }}
                >
                    <StatusIndicator status="danger" pulse size="sm" />
                    High Crowd Alert
                </motion.div>
            </motion.div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.5rem' }}>
                {/* Token Management Card */}
                <StaggerItem>
                    <AnimatedCard 
                        style={{ 
                            textAlign: 'center', 
                            border: '2px solid var(--primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '2rem',
                        }}
                        glowColor="rgba(255, 184, 0, 0.3)"
                    >
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                            Current Serving Token
                        </h3>
                        
                        <TokenRing 
                            tokenNumber={currentToken} 
                            status="active" 
                            size="lg"
                        />

                        <AnimatedButton 
                            variant="primary" 
                            fullWidth 
                            size="lg"
                            onClick={callNext}
                            icon={<ArrowRight size={18} />}
                            iconPosition="right"
                            style={{ marginTop: '2.5rem' }}
                        >
                            Call Next Token
                        </AnimatedButton>
                    </AnimatedCard>
                </StaggerItem>

                {/* Capacity & Insights */}
                <StaggerItem className="md:col-span-2">
                    <AnimatedCard style={{ height: '100%' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Live Insights</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
                                <CrowdGauge 
                                    current={170}
                                    capacity={200}
                                    showTrend
                                    trend="increasing"
                                />
                            </div>
                            
                            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                                    <Zap size={16} /> <span>Rec. Service Speed</span>
                                </div>
                                <motion.h2
                                    animate={{ color: ['var(--accent)', 'var(--warning)', 'var(--accent)'] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    style={{ margin: 0 }}
                                >
                                    Fast Pace
                                </motion.h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Queue building up - increase prep speed
                                </p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ 
                                padding: '1rem', 
                                background: 'var(--danger-light)', 
                                border: '1px solid var(--danger)',
                                borderRadius: 'var(--radius-lg)' 
                            }}
                        >
                            <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--danger)' }}>
                                <StatusIndicator status="danger" pulse size="sm" />
                                Crowd Alert
                            </p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Dining area reaching capacity. Prioritize takeaway orders and clear tables immediately.
                            </p>
                        </motion.div>
                    </AnimatedCard>
                </StaggerItem>
            </StaggerContainer>

            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ margin: '2rem 0 1rem 0' }}
            >
                Active Order Queue
            </motion.h3>
            
            <AnimatedCard style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Token</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Items</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Time</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {orders.map((order, index) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={{ borderBottom: '1px solid var(--glass-border)' }}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            <MiniToken tokenNumber={order.token} status={order.status} />
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {order.items.join(', ')}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {order.time}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <motion.span
                                                key={order.status}
                                                initial={{ scale: 0.8 }}
                                                animate={{ scale: 1 }}
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize',
                                                    backgroundColor: statusColors[order.status]?.bg,
                                                    color: statusColors[order.status]?.color,
                                                }}
                                            >
                                                {order.status}
                                            </motion.span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            {order.status === 'pending' && (
                                                <AnimatedButton 
                                                    variant="secondary" 
                                                    size="sm"
                                                    onClick={() => handleStatusChange(order.id, 'preparing')}
                                                >
                                                    Prepare
                                                </AnimatedButton>
                                            )}
                                            {order.status === 'preparing' && (
                                                <AnimatedButton 
                                                    variant="primary" 
                                                    size="sm"
                                                    onClick={() => handleStatusChange(order.id, 'ready')}
                                                >
                                                    Ready
                                                </AnimatedButton>
                                            )}
                                            {order.status === 'ready' && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 500 }}
                                                >
                                                    <CheckCircle size={24} color="var(--success)" />
                                                </motion.div>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </AnimatedCard>
        </div>
    );
};

export default StaffDashboard;
