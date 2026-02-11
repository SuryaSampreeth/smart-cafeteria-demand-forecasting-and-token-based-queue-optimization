import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

/*
 * AdminHomeScreen
 * ---------------
 * The main page for administrators.
 * It provides a quick view of the cafeteria's current state:
 * - Daily booking operational metrics (Today's bookings, active tokens, revenue).
 * - Staff and Student counts.
 * - Detailed breakdown of bookings per time slot to monitor load.
 */
const AdminHomeScreen = () => {
    const { logout, user } = useAuth(); // Auth context for user info and logout function

    // UI State Management
    const [loading, setLoading] = useState(true);        // Initial load spinner
    const [refreshing, setRefreshing] = useState(false); // Pull-to-refresh state

    // Data State
    const [analytics, setAnalytics] = useState(null);    // General stats (revenue, counts)
    const [slotWiseData, setSlotWiseData] = useState([]); // Array of slot performance data
    const [error, setError] = useState('');              // Error message holding

    /**
     * Initial Data Fetch
     */
    useEffect(() => {
        fetchData();
    }, []);

    /**
     * Fetches all dashboard data in parallel.
     * We use Promise.all to ensure both analytics and slot data are ready
     * before rendering, preventing UI layout shifts.
     */
    const fetchData = async () => {
        try {
            setError('');
            // Parallel API calls for efficiency
            const [analyticsRes, slotWiseRes] = await Promise.all([
                adminAPI.getAnalytics(),
                adminAPI.getSlotWiseData(),
            ]);

            setAnalytics(analyticsRes.data);
            setSlotWiseData(slotWiseRes.data);
        } catch (err) {
            // Robust error handling needed for dashboard reliability
            setError(err.response?.data?.message || 'Failed to load analytics');
            console.error('Error fetching analytics:', err);
        } finally {
            // Stop all loading indicators
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Handles pull-to-refresh action.
     * Does NOT set 'loading' to true to avoid full screen spinner,
     * instead relies on scroll view's refresh control.
     */
    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Header title="Admin Dashboard" onLogout={logout} showLogout={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.brownie} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title="Admin Dashboard" onLogout={logout} showLogout={true} />
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brownie]} />
                }
            >
                <Text style={styles.welcome}>Welcome, {user?.name}!</Text>

                {error ? (
                    <Card>
                        <Text style={styles.errorText}>{error}</Text>
                    </Card>
                ) : null}

                {/* 
                 * Row 1: Key Operational Metrics 
                 * Focuses on immediate daily activity.
                 */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{analytics?.totalBookingsToday || 0}</Text>
                        <Text style={styles.statLabel}>Bookings Today</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{analytics?.activeTokens || 0}</Text>
                        <Text style={styles.statLabel}>Active Tokens</Text>
                    </View>
                </View>

                {/* 
                 * Row 2: Service Efficiency Metrics 
                 * Tracks throughput and cancellations.
                 */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{analytics?.servedToday || 0}</Text>
                        <Text style={styles.statLabel}>Served Today</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{analytics?.cancelledToday || 0}</Text>
                        <Text style={styles.statLabel}>Cancelled</Text>
                    </View>
                </View>

                {/* 
                 * Row 3: User Base Overview 
                 * Helps admin keep track of system adoption.
                 */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{analytics?.totalStaff || 0}</Text>
                        <Text style={styles.statLabel}>Total Staff</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{analytics?.totalStudents || 0}</Text>
                        <Text style={styles.statLabel}>Total Students</Text>
                    </View>
                </View>

                {/* 
                 * Revenue Card - Highlighted
                 * Full width to emphasize financial performance.
                 */}
                <View style={styles.revenueContainer}>
                    <Text style={styles.revenueNumber}>₹{analytics?.totalRevenue || 0}</Text>
                    <Text style={styles.revenueLabel}>Total Revenue (Completed Orders)</Text>
                </View>

                {/* 
                 * Slot-wise Breakdown
                 * -------------------
                 * This section is critical for capacity planning.
                 * It breaks down the booking funnel (Total -> Pending -> Serving -> Served)
                 * for each time slot individually.
                 */}
                <Text style={styles.sectionTitle}>Slot-wise Bookings Today</Text>
                {slotWiseData.length > 0 ? (
                    slotWiseData.map((slot, index) => (
                        <Card key={index} style={styles.slotCard}>
                            <Text style={styles.slotName}>{slot.slotName}</Text>
                            <View style={styles.slotStats}>
                                <View style={styles.slotStat}>
                                    <Text style={styles.slotStatNumber}>{slot.totalBookings}</Text>
                                    <Text style={styles.slotStatLabel}>Total</Text>
                                </View>
                                <View style={styles.slotStat}>
                                    <Text style={[styles.slotStatNumber, { color: colors.warning }]}>
                                        {slot.pending}
                                    </Text>
                                    <Text style={styles.slotStatLabel}>Pending</Text>
                                </View>
                                <View style={styles.slotStat}>
                                    <Text style={[styles.slotStatNumber, { color: colors.info }]}>
                                        {slot.serving}
                                    </Text>
                                    <Text style={styles.slotStatLabel}>Serving</Text>
                                </View>
                                <View style={styles.slotStat}>
                                    <Text style={[styles.slotStatNumber, { color: colors.success }]}>
                                        {slot.served}
                                    </Text>
                                    <Text style={styles.slotStatLabel}>Served</Text>
                                </View>
                            </View>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <Text style={styles.noDataText}>No bookings today</Text>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcome: {
        ...typography.h2,
        color: colors.brownie,
        marginBottom: 20,
    },
    errorText: {
        color: colors.error,
        ...typography.body,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.cream,
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.brownieLight + '30',
        shadowColor: colors.brownie,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statCardEmpty: {
        opacity: 0,
    },
    statNumber: {
        ...typography.h1,
        color: colors.brownie,
        fontWeight: 'bold',
    },
    statLabel: {
        ...typography.caption,
        color: colors.gray,
        marginTop: 4,
        textAlign: 'center',
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.brownie,
        marginTop: 8,
        marginBottom: 12,
    },
    slotCard: {
        marginBottom: 12,
    },
    slotName: {
        ...typography.h3,
        color: colors.brownie,
        marginBottom: 12,
    },
    slotStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    slotStat: {
        alignItems: 'center',
    },
    slotStatNumber: {
        ...typography.h2,
        color: colors.brownie,
        fontWeight: 'bold',
    },
    slotStatLabel: {
        ...typography.small,
        color: colors.gray,
        marginTop: 4,
    },
    revenueContainer: {
        backgroundColor: colors.brownie,
        borderRadius: 12,
        padding: 24,
        marginHorizontal: 4,
        marginBottom: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.brownieLight,
        shadowColor: colors.brownie,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    revenueNumber: {
        ...typography.h1,
        fontSize: 36,
        color: colors.white,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    revenueLabel: {
        ...typography.body,
        color: colors.cream,
        textAlign: 'center',
    },
    noDataText: {
        ...typography.body,
        color: colors.gray,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default AdminHomeScreen;
