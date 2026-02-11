import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, DollarSign, AlertTriangle, Download, RefreshCw, UserPlus, List, Clock } from 'lucide-react';
import { 
    AnimatedCard, 
    AnimatedButton, 
    AnimatedCounter,
    LiveCounter,
    StaggerContainer,
    StaggerItem,
    CircularGauge,
    StatusIndicator,
    CrowdLevelBadge,
    useNotifications 
} from '../../components/ui';

const AdminDashboard = () => {
    const { success, info } = useNotifications();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const revenueData = [
        { name: 'Mon', revenue: 4000, orders: 120 },
        { name: 'Tue', revenue: 3000, orders: 95 },
        { name: 'Wed', revenue: 2000, orders: 70 },
        { name: 'Thu', revenue: 2780, orders: 85 },
        { name: 'Fri', revenue: 1890, orders: 65 },
        { name: 'Sat', revenue: 2390, orders: 78 },
        { name: 'Sun', revenue: 3490, orders: 110 },
    ];

    const handleSync = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            success('Data Synced', 'All booking data has been synchronized');
        }, 1500);
    };

    const handleExport = () => {
        info('Export Started', 'Your report is being generated...');
    };

    const stats = [
        { label: 'Revenue', value: 12450, prefix: '₹', icon: DollarSign, color: '#16a34a', trend: 'up', trendValue: '+12%' },
        { label: 'Active Tokens', value: 24, icon: TrendingUp, color: '#2563eb', trend: 'up', trendValue: '+5' },
        { label: 'Total Users', value: 1204, icon: Users, color: '#f59e0b', trend: 'up', trendValue: '+48' },
        { label: 'Alerts', value: 3, icon: AlertTriangle, color: '#dc2626', trend: null, trendValue: null },
    ];

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius)',
                    padding: '0.75rem 1rem',
                    boxShadow: 'var(--shadow-lg)',
                }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color, fontSize: '0.875rem', margin: 0 }}>
                            {entry.name}: {entry.name === 'revenue' ? '₹' : ''}{entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}
            >
                <h1 style={{ margin: 0 }}>System Overview</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <AnimatedButton 
                        variant="secondary" 
                        onClick={handleSync}
                        icon={<RefreshCw size={18} className={isRefreshing ? 'spin' : ''} />}
                        loading={isRefreshing}
                    >
                        Sync
                    </AnimatedButton>
                    <AnimatedButton 
                        variant="primary" 
                        onClick={handleExport}
                        icon={<Download size={18} />}
                    >
                        Export Reports
                    </AnimatedButton>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-4" style={{ marginBottom: '2rem', gap: '1rem' }}>
                {stats.map((stat, index) => (
                    <StaggerItem key={stat.label}>
                        <LiveCounter
                            value={stat.value}
                            label={stat.label}
                            icon={<stat.icon size={20} />}
                            trend={stat.trend}
                            trendValue={stat.trendValue}
                        />
                    </StaggerItem>
                ))}
            </StaggerContainer>

            {/* Charts & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.5rem' }}>
                <AnimatedCard className="md:col-span-2">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Revenue Analytics</h3>
                        <CrowdLevelBadge level="medium" />
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                    tickFormatter={(value) => `₹${value/1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone"
                                    dataKey="revenue" 
                                    stroke="var(--primary)" 
                                    strokeWidth={2}
                                    fill="url(#revenueGradient)"
                                    animationDuration={2000}
                                    animationEasing="ease-out"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </AnimatedCard>

                <div className="flex flex-col" style={{ gap: '1.5rem' }}>
                    <AnimatedCard style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <AnimatedButton 
                                variant="secondary" 
                                fullWidth
                                icon={<UserPlus size={18} />}
                                style={{ justifyContent: 'flex-start' }}
                            >
                                Register Staff
                            </AnimatedButton>
                            <AnimatedButton 
                                variant="secondary" 
                                fullWidth
                                icon={<List size={18} />}
                                style={{ justifyContent: 'flex-start' }}
                            >
                                Manage Menu
                            </AnimatedButton>
                        </div>
                    </AnimatedCard>

                    <AnimatedCard>
                        <h3 style={{ marginBottom: '1rem' }}>Peak Hour Analysis</h3>
                        <motion.div
                            animate={{ 
                                boxShadow: ['0 0 10px rgba(245, 158, 11, 0.2)', '0 0 20px rgba(245, 158, 11, 0.4)', '0 0 10px rgba(245, 158, 11, 0.2)']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ 
                                padding: '1rem', 
                                background: 'var(--warning-light)', 
                                borderRadius: 'var(--radius)', 
                                border: '1px solid var(--warning)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Clock size={18} color="var(--warning)" />
                                <p style={{ margin: 0, fontWeight: 600, color: 'var(--warning)' }}>12:00 PM - 02:00 PM</p>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                Highest traffic recorded daily. Consider adding staff during this window.
                            </p>
                        </motion.div>
                    </AnimatedCard>
                </div>
            </div>

            {/* Additional Stats Row */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3" style={{ marginTop: '1.5rem', gap: '1.5rem' }}>
                <StaggerItem>
                    <AnimatedCard style={{ textAlign: 'center' }}>
                        <CircularGauge value={78} max={100} size={100} label="Avg Capacity" />
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            Daily average occupancy rate
                        </p>
                    </AnimatedCard>
                </StaggerItem>

                <StaggerItem>
                    <AnimatedCard style={{ textAlign: 'center' }}>
                        <CircularGauge value={92} max={100} size={100} label="Satisfaction" />
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            Student satisfaction score
                        </p>
                    </AnimatedCard>
                </StaggerItem>

                <StaggerItem>
                    <AnimatedCard style={{ textAlign: 'center' }}>
                        <CircularGauge value={45} max={100} size={100} label="Wait Time" />
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            45% reduction in wait times
                        </p>
                    </AnimatedCard>
                </StaggerItem>
            </StaggerContainer>
        </div>
    );
};

export default AdminDashboard;
