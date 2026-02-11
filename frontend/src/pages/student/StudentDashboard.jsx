import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Utensils, TrendingDown, ChevronRight, MapPin } from 'lucide-react';
import {
    AnimatedCard,
    AnimatedButton,
    TokenRing,
    MiniToken,
    CrowdGauge,
    AnimatedCounter,
    CountdownTimer,
    StaggerContainer,
    StaggerItem,
    CrowdLevelBadge,
    useNotifications,
} from '../../components/ui';

const StudentDashboard = ({ user }) => {
    const { info } = useNotifications();
    const [activeBooking] = useState({
        id: 'BK-101',
        token: 45,
        slot: 'Lunch',
        time: '12:30 PM',
        items: ['Chicken Biryani', 'Coke'],
        status: 'active',
        waitTime: 12,
    });

    // Quick stats for the student
    const quickStats = [
        { label: 'Tokens Today', value: 2, trend: null },
        { label: 'Time Saved', value: 25, suffix: 'min', trend: 'up' },
        { label: 'This Month', value: 18, suffix: 'orders', trend: null },
    ];

    return (
        <div className="container">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <h1 style={{ marginBottom: '0.5rem' }}>
                    Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name || 'Student'}</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                    Here's what's happening with your cafeteria today
                </p>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.5rem' }}>
                {/* Active Token Card */}
                <StaggerContainer>
                    <StaggerItem>
                        <AnimatedCard
                            style={{
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                color: 'white',
                                textAlign: 'center',
                                padding: '2rem',
                            }}
                            glowColor="rgba(255, 184, 0, 0.5)"
                        >
                            <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem', fontWeight: 500 }}>
                                Your Active Token
                            </h3>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <TokenRing
                                    tokenNumber={activeBooking.token}
                                    status="active"
                                    size="lg"
                                />
                            </div>

                            <CountdownTimer
                                minutes={activeBooking.waitTime}
                                label="Estimated Wait"
                            />

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{
                                    marginTop: '1.5rem',
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '0.875rem',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                    <MapPin size={14} />
                                    <span>Counter 3 - Main Cafeteria</span>
                                </div>
                            </motion.div>
                        </AnimatedCard>
                    </StaggerItem>
                </StaggerContainer>

                {/* Right Side Content */}
                <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Crowd Status */}
                    <StaggerContainer delay={0.1}>
                        <StaggerItem>
                            <AnimatedCard>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0 }}>Current Crowd Status</h3>
                                    <CrowdLevelBadge level="medium" />
                                </div>
                                <CrowdGauge
                                    current={156}
                                    capacity={200}
                                    showTrend
                                    trend="stable"
                                    size="lg"
                                />
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem', marginBottom: 0 }}>
                                    Best time to visit: <strong style={{ color: 'var(--success)' }}>3:00 PM - 4:30 PM</strong>
                                </p>
                            </AnimatedCard>
                        </StaggerItem>
                    </StaggerContainer>

                    {/* Quick Stats */}
                    <StaggerContainer className="grid grid-cols-3" style={{ gap: '1rem' }} delay={0.2}>
                        {quickStats.map((stat) => (
                            <StaggerItem key={stat.label}>
                                <AnimatedCard style={{ textAlign: 'center', padding: '1rem' }}>
                                    <div style={{ 
                                        fontSize: '1.75rem', 
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-mono)',
                                        color: 'var(--primary)',
                                    }}>
                                        <AnimatedCounter value={stat.value} />
                                        {stat.suffix && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> {stat.suffix}</span>}
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                                        {stat.label}
                                    </p>
                                </AnimatedCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ marginTop: '2rem' }}
            >
                <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1rem' }}>
                    <Link to="/book-meal" style={{ textDecoration: 'none' }}>
                        <AnimatedCard 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                            }}
                            glowColor="rgba(16, 185, 129, 0.3)"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ 
                                    padding: '0.75rem', 
                                    borderRadius: 'var(--radius)', 
                                    background: 'var(--success-light)',
                                }}>
                                    <Utensils size={24} color="var(--success)" />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>Book a Meal</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                                        Pre-order your next meal
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </AnimatedCard>
                    </Link>

                    <Link to="/bookings" style={{ textDecoration: 'none' }}>
                        <AnimatedCard 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                            }}
                            glowColor="rgba(255, 184, 0, 0.3)"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ 
                                    padding: '0.75rem', 
                                    borderRadius: 'var(--radius)', 
                                    background: 'var(--primary-light)',
                                }}>
                                    <Calendar size={24} color="var(--primary)" />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>My Orders</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                                        View order history
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </AnimatedCard>
                    </Link>

                    <Link to="/menu" style={{ textDecoration: 'none' }}>
                        <AnimatedCard 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                            }}
                            glowColor="rgba(245, 158, 11, 0.3)"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ 
                                    padding: '0.75rem', 
                                    borderRadius: 'var(--radius)', 
                                    background: 'var(--warning-light)',
                                }}>
                                    <Clock size={24} color="var(--warning)" />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>Today's Menu</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                                        Browse available items
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </AnimatedCard>
                    </Link>
                </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginTop: '2rem' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Recent Orders</h3>
                    <Link to="/bookings" style={{ color: 'var(--primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        View all <ChevronRight size={16} />
                    </Link>
                </div>
                
                <AnimatedCard style={{ padding: 0, overflow: 'hidden' }}>
                    {[
                        { id: 'BK-101', date: 'Today', items: ['Chicken Biryani', 'Coke'], status: 'active', token: 45 },
                        { id: 'BK-098', date: 'Yesterday', items: ['Veg Sandwich', 'Coffee'], status: 'completed', token: 12 },
                        { id: 'BK-092', date: '2 days ago', items: ['Veg Thali'], status: 'completed', token: 88 },
                    ].map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.5rem',
                                borderBottom: index < 2 ? '1px solid var(--glass-border)' : 'none',
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                    <MiniToken tokenNumber={order.token} status={order.status} />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{order.date}</span>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {order.items.join(', ')}
                                </p>
                            </div>
                            <motion.span
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                    background: order.status === 'active' ? 'var(--primary-light)' : 'var(--success-light)',
                                    color: order.status === 'active' ? 'var(--primary)' : 'var(--success)',
                                }}
                            >
                                {order.status}
                            </motion.span>
                        </motion.div>
                    ))}
                </AnimatedCard>
            </motion.div>
        </div>
    );
};

export default StudentDashboard;
