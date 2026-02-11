import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { menuAPI } from '../../services/api';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const StaffHomeScreen = () => {
    const { logout, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [slots, setSlots] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            setError('');
            const response = await menuAPI.getAllSlots();
            setSlots(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load slots');
            console.error('Error fetching slots:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSlots();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Header title="Staff Dashboard" onLogout={logout} showLogout={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.brownie} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title="Staff Dashboard" onLogout={logout} showLogout={true} />
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brownie]} />
                }
            >
                <Text style={styles.welcome}>Welcome, {user?.name}!</Text>
                <Text style={styles.subtitle}>Manage token queues for each meal slot</Text>

                {error ? (
                    <Card>
                        <Text style={styles.errorText}>{error}</Text>
                    </Card>
                ) : null}

                <Text style={styles.sectionTitle}>Available Slots</Text>

                {slots.map((slot) => (
                    <Card key={slot._id} style={styles.slotCard}>
                        <View style={styles.slotHeader}>
                            <Text style={styles.slotName}>{slot.name}</Text>
                            <Text style={styles.slotTime}>
                                {slot.startTime} - {slot.endTime}
                            </Text>
                        </View>
                        <View style={styles.slotStats}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{slot.currentBookings}</Text>
                                <Text style={styles.statLabel}>Current</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{slot.capacity}</Text>
                                <Text style={styles.statLabel}>Capacity</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statNumber, { color: slot.isActive ? colors.success : colors.error }]}>
                                    {slot.isActive ? 'Active' : 'Inactive'}
                                </Text>
                                <Text style={styles.statLabel}>Status</Text>
                            </View>
                        </View>
                    </Card>
                ))}

                <Card style={styles.infoCard}>
                    <Text style={styles.infoTitle}>📋 Instructions</Text>
                    <Text style={styles.infoText}>• Go to the "Queue" tab to manage tokens</Text>
                    <Text style={styles.infoText}>• Select a slot to view pending tokens</Text>
                    <Text style={styles.infoText}>• Call next token in FIFO order</Text>
                    <Text style={styles.infoText}>• Mark tokens as served when complete</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcome: {
        ...typography.h2,
        color: colors.brownie,
        marginBottom: 8,
    },
    subtitle: {
        ...typography.body,
        color: colors.gray,
        marginBottom: 20,
    },
    errorText: {
        color: colors.error,
        ...typography.body,
        textAlign: 'center',
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.brownie,
        marginBottom: 12,
    },
    slotCard: {
        marginBottom: 12,
    },
    slotHeader: {
        marginBottom: 12,
    },
    slotName: {
        ...typography.h3,
        color: colors.brownie,
        marginBottom: 4,
    },
    slotTime: {
        ...typography.caption,
        color: colors.gray,
    },
    slotStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        ...typography.h2,
        color: colors.brownie,
        fontWeight: 'bold',
    },
    statLabel: {
        ...typography.small,
        color: colors.gray,
        marginTop: 4,
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

export default StaffHomeScreen;
