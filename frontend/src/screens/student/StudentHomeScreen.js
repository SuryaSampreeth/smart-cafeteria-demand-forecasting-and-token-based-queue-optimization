import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../services/api';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const StudentHomeScreen = () => {
    const { logout, user } = useAuth();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ activeTokens: 0, totalBookings: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await bookingAPI.getMyBookings();
            const bookings = response.data;
            const active = bookings.filter(b => b.status !== 'served' && b.status !== 'cancelled').length;
            setStats({ activeTokens: active, totalBookings: bookings.length });
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    return (
        <View style={styles.container}>
            <Header title="Student Dashboard" onLogout={logout} showLogout={true} />
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brownie]} />
                }
            >
                <Text style={styles.welcome}>Welcome, {user?.name}!</Text>
                <Text style={styles.subtitle}>Manage your cafeteria bookings</Text>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{stats.activeTokens}</Text>
                        <Text style={styles.statLabel}>Active Tokens</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{stats.totalBookings}</Text>
                        <Text style={styles.statLabel}>Total Bookings</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>

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

                {/* Info Card */}
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
