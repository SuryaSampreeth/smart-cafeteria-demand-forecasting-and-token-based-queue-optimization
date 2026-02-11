import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../services/api';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

/**
 * StudentHomeScreen Component
 * 
 * This is the main dashboard for students. It provides:
 * 1. A welcome message with the user's name.
 * 2. Key statistics: Number of active tokens and total bookings.
 * 3. Quick navigation buttons to Book Meal, My Tokens, and Booking History.
 * 4. A brief "How it works" guide.
 * 
 * It serves as the central hub for all student-related activities in the app.
 */
const StudentHomeScreen = () => {
    // Access auth context for logout and user details
    const { logout, user } = useAuth();
    const navigation = useNavigation();

    // State for pull-to-refresh functionality
    const [refreshing, setRefreshing] = useState(false);

    // State for dashboard statistics
    const [stats, setStats] = useState({ activeTokens: 0, totalBookings: 0 });

    // Fetch stats on component mount
    useEffect(() => {
        fetchStats();
    }, []);

    /**
     * Fetches booking statistics from the backend.
     * Calculates active tokens (not served or cancelled) and total bookings.
     */
    const fetchStats = async () => {
        try {
            // Get all bookings for the current user
            const response = await bookingAPI.getMyBookings();
            const bookings = response.data;

            // Filter for active bookings (Pending or Serving)
            const active = bookings.filter(b => b.status !== 'served' && b.status !== 'cancelled').length;

            // Update state
            setStats({ activeTokens: active, totalBookings: bookings.length });
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setRefreshing(false);
        }
    };

    /**
     * Handles pull-to-refresh action.
     */
    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    return (
        <View style={styles.container}>
            {/* Standard Header with Logout button */}
            <Header title="Student Dashboard" onLogout={logout} showLogout={true} />

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brownie]} />
                }
            >
                <Text style={styles.welcome}>Welcome, {user?.name}!</Text>
                <Text style={styles.subtitle}>Manage your cafeteria bookings</Text>

                {/* Dashboard Statistics Cards */}
                <View style={styles.statsContainer}>
                    {/* Active Tokens Card */}
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{stats.activeTokens}</Text>
                        <Text style={styles.statLabel}>Active Tokens</Text>
                    </View>

                    {/* Total Bookings Card */}
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{stats.totalBookings}</Text>
                        <Text style={styles.statLabel}>Total Bookings</Text>
                    </View>
                </View>

                {/* Quick Action Buttons */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                {/* Navigate to Booking Screen */}
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('Book Meal')}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionEmoji}>🍽️</Text>
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Book a Meal</Text>
                        <Text style={styles.actionDescription}>Select slot and order food</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                {/* Navigate to My Tokens Screen */}
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('My Tokens')}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionEmoji}>🎫</Text>
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>My Tokens</Text>
                        <Text style={styles.actionDescription}>View active tokens and queue status</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                {/* Navigate to Booking History (Profile) */}
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionEmoji}>📜</Text>
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Booking History</Text>
                        <Text style={styles.actionDescription}>View and manage your bookings</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                {/* Informational Card explaining the process */}
                <Card style={styles.infoCard}>
                    <Text style={styles.infoTitle}>ℹ️ How it works</Text>
                    <Text style={styles.infoText}>1. Book a meal slot and select items</Text>
                    <Text style={styles.infoText}>2. Get a token number (e.g., B001)</Text>
                    <Text style={styles.infoText}>3. Track your queue position in real-time</Text>
                    <Text style={styles.infoText}>4. Collect your food when called</Text>
                </Card>
            </ScrollView>
        </View>
    );
};

// Styles...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    welcome: {
        ...typography.h2,
        color: colors.brownie,
        marginBottom: 4,
    },
    subtitle: {
        ...typography.body,
        color: colors.gray,
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
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
        marginBottom: 12,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.brownieLight + '30',
        shadowColor: colors.brownie,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.cream,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionEmoji: {
        fontSize: 24,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: '600',
        marginBottom: 4,
    },
    actionDescription: {
        ...typography.caption,
        color: colors.gray,
    },
    actionArrow: {
        ...typography.h2,
        color: colors.brownieLight,
    },
    infoCard: {
        marginTop: 8,
        backgroundColor: colors.info + '10',
        borderLeftWidth: 4,
        borderLeftColor: colors.info,
    },
    infoTitle: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    infoText: {
        ...typography.caption,
        color: colors.gray,
        marginBottom: 4,
    },
});

export default StudentHomeScreen;
