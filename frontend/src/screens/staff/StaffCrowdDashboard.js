import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import CrowdLevelIndicator from '../../components/CrowdLevelIndicator';
import AlertCard from '../../components/AlertCard';
import api from '../../services/api';

/*
 * StaffCrowdDashboard
 * -------------------
 * A real-time monitoring tool for staff to track cafeteria crowd levels.
 * 
 * Key Features:
 * 1. Auto-refreshing data (polling every 20s).
 * 2. Visual indicators for crowd density (Red/Yellow/Green).
 * 3. AI-driven/Logic-driven recommendations (e.g., "Speed up service").
 * 4. Active alert display for critical situations.
 */
const StaffCrowdDashboard = () => {
    // State for dashboard metrics
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null); // Timestamp of last successful fetch
    const [error, setError] = useState(null);

    // Auto-refresh interval (20 seconds)
    const AUTO_REFRESH_INTERVAL = 20000;

    /**
     * Fetches the latest crowd statistics.
     */
    const fetchDashboardData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);

            const response = await api.getStaffCrowdDashboard();

            if (response.data && response.data.success) {
                setDashboardData(response.data);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Manual refresh handler
     */
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDashboardData(false);
    }, []);

    // Effect: Initial fetch + Interval setup
    useEffect(() => {
        fetchDashboardData();

        // Set up auto-refresh polling
        const interval = setInterval(() => {
            fetchDashboardData(false);
        }, AUTO_REFRESH_INTERVAL);

        // Cleanup interval on unmount to prevent memory leaks
        return () => clearInterval(interval);
    }, []);

    /**
     * Helper to show relative time
     */
    const formatLastUpdated = () => {
        if (!lastUpdated) return '';

        const now = new Date();
        const diffSeconds = Math.floor((now - lastUpdated) / 1000);

        if (diffSeconds < 10) return 'Just now';
        if (diffSeconds < 60) return `${diffSeconds}s ago`;

        const diffMinutes = Math.floor(diffSeconds / 60);
        return `${diffMinutes}m ago`;
    };

    if (loading && !dashboardData) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.brownie} />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
        );
    }

    // Destructure data safely
    const summary = dashboardData?.summary || {};
    const slots = dashboardData?.slots || [];
    const activeAlerts = dashboardData?.activeAlerts || [];

    // Determine color based on average occupancy
    const getOccupancyColor = (occupancy) => {
        if (occupancy >= 70) return colors.error;   // Critical
        if (occupancy >= 40) return colors.warning; // High
        return colors.success;                      // Normal
    };

    return (
        <View style={styles.container}>
            {/* Header: Title + Refresh Button */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Live Crowd Dashboard</Text>
                    <Text style={styles.subtitle}>Monitor cafeteria occupancy</Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    disabled={refreshing}
                >
                    <MaterialCommunityIcons
                        name="refresh"
                        size={24}
                        color={colors.brownie}
                    />
                </TouchableOpacity>
            </View>

            {/* Last Updated Indicator */}
            {lastUpdated && (
                <View style={styles.updateInfo}>
                    <MaterialCommunityIcons
                        name="clock-outline"
                        size={14}
                        color={colors.gray}
                    />
                    <Text style={styles.updateText}>
                        Updated {formatLastUpdated()} • Auto-refreshes every 20s
                    </Text>
                </View>
            )}

            {/* Error Message */}
            {error && (
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={20}
                        color={colors.error}
                    />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.brownie]}
                        tintColor={colors.brownie}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Cards Grid */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryCard, { borderLeftColor: colors.info }]}>
                            <MaterialCommunityIcons
                                name="account-group"
                                size={32}
                                color={colors.info}
                            />
                            <Text style={styles.summaryValue}>{summary.totalActiveBookings || 0}</Text>
                            <Text style={styles.summaryLabel}>Active Tokens</Text>
                        </View>
                        <View style={[styles.summaryCard, { borderLeftColor: getOccupancyColor(summary.averageOccupancy || 0) }]}>
                            <MaterialCommunityIcons
                                name="chart-donut"
                                size={32}
                                color={getOccupancyColor(summary.averageOccupancy || 0)}
                            />
                            <Text style={styles.summaryValue}>{summary.averageOccupancy || 0}%</Text>
                            <Text style={styles.summaryLabel}>Avg Occupancy</Text>
                        </View>
                    </View>
                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryCard, { borderLeftColor: colors.error }]}>
                            <MaterialCommunityIcons
                                name="alert-circle"
                                size={32}
                                color={colors.error}
                            />
                            <Text style={styles.summaryValue}>{summary.highCrowdSlotCount || 0}</Text>
                            <Text style={styles.summaryLabel}>High Crowd Slots</Text>
                        </View>
                        <View style={[styles.summaryCard, { borderLeftColor: colors.warning }]}>
                            <MaterialCommunityIcons
                                name="bell-alert"
                                size={32}
                                color={colors.warning}
                            />
                            <Text style={styles.summaryValue}>{summary.activeAlertCount || 0}</Text>
                            <Text style={styles.summaryLabel}>Active Alerts</Text>
                        </View>
                    </View>
                </View>

                {/* Active Alerts List */}
                {activeAlerts.length > 0 && (
                    <View style={styles.alertsSection}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons
                                name="bell-alert-outline"
                                size={20}
                                color={colors.brownie}
                            />
                            <Text style={styles.sectionTitle}>Active Alerts</Text>
                        </View>
                        {activeAlerts.map((alert, index) => (
                            <View key={index} style={styles.alertItem}>
                                <MaterialCommunityIcons
                                    name="alert-circle"
                                    size={20}
                                    color={colors.error}
                                />
                                <View style={styles.alertContent}>
                                    <Text style={styles.alertSlot}>{alert.slotName}</Text>
                                    <Text style={styles.alertMessage}>{alert.message}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Slot-Specific Serving Recommendations */}
                <View style={styles.recommendationsSection}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons
                            name="lightbulb-on-outline"
                            size={20}
                            color={colors.brownie}
                        />
                        <Text style={styles.sectionTitle}>Serving Recommendations</Text>
                    </View>
                    {slots.map((slot, index) => {
                        // Dynamic recommendation logic based on occupancy
                        let recommendation = '';
                        let icon = '';
                        let bgColor = '';

                        if (slot.occupancyRate >= 90) {
                            icon = '🚨';
                            bgColor = '#FFEBEE';
                            recommendation = `Critical! Urgently increase ${slot.slotName} serving speed and consider opening additional counters.`;
                        } else if (slot.occupancyRate >= 70) {
                            icon = '⚡';
                            bgColor = '#FFF3E0';
                            recommendation = `High demand at ${slot.slotName}. Speed up service to reduce ${slot.avgWaitTime} min wait time.`;
                        } else if (slot.occupancyRate >= 40) {
                            icon = '👍';
                            bgColor = '#E8F5E9';
                            recommendation = `${slot.slotName} running smoothly. Maintain current pace.`;
                        } else {
                            icon = '✅';
                            bgColor = '#E3F2FD';
                            recommendation = `Low crowd at ${slot.slotName}. Normal speed sufficient.`;
                        }

                        return (
                            <View key={index} style={[styles.recommendationCard, { backgroundColor: bgColor }]}>
                                <Text style={styles.recommendationIcon}>{icon}</Text>
                                <View style={styles.recommendationTextContainer}>
                                    <Text style={styles.slotRecommendationTitle}>{slot.slotName}</Text>
                                    <Text style={styles.slotRecommendationText}>{recommendation}</Text>
                                    <View style={styles.recommendationStats}>
                                        <Text style={styles.recommendationStat}>
                                            {slot.activeBookings} active • {slot.occupancyRate}% capacity
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Live Crowd Levels by Slot */}
                <View style={styles.slotsSection}>
                    <Text style={styles.sectionTitle}>Live Crowd Levels by Slot</Text>
                    {slots.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No active slots</Text>
                        </View>
                    ) : (
                        slots.map((slot, index) => (
                            <View key={index}>
                                {/* Visual Gauge Component */}
                                <CrowdLevelIndicator
                                    level={slot.crowdLevel}
                                    occupancyRate={slot.occupancyRate}
                                    slotName={slot.slotName}
                                    size="medium"
                                />
                                <View style={styles.slotMetrics}>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Active Tokens:</Text>
                                        <Text style={styles.metricValue}>{slot.activeBookings}</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Capacity:</Text>
                                        <Text style={styles.metricValue}>{slot.totalCapacity}</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Avg Wait:</Text>
                                        <Text style={styles.metricValue}>{slot.avgWaitTime} min</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: colors.gray,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.brownie,
    },
    subtitle: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 2,
    },
    refreshButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: colors.cream,
    },
    updateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: colors.white,
    },
    updateText: {
        fontSize: 12,
        color: colors.gray,
        marginLeft: 6,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginTop: 12,
        borderRadius: 8,
    },
    errorText: {
        fontSize: 13,
        color: colors.error,
        marginLeft: 8,
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    summarySection: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.brownie,
        marginTop: 8,
    },
    summaryLabel: {
        fontSize: 12,
        color: colors.gray,
        marginTop: 4,
        textAlign: 'center',
    },
    alertsSection: {
        paddingHorizontal: 20,
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.brownie,
        marginLeft: 8,
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    alertContent: {
        flex: 1,
        marginLeft: 12,
    },
    alertSlot: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.brownie,
        marginBottom: 2,
    },
    alertMessage: {
        fontSize: 13,
        color: colors.gray,
    },
    recommendationBox: {
        flexDirection: 'row',
        backgroundColor: colors.cream,
        marginHorizontal: 20,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.brownie,
    },
    recommendationContent: {
        flex: 1,
        marginLeft: 12,
    },
    recommendationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.brownie,
        marginBottom: 6,
    },
    recommendationText: {
        fontSize: 14,
        color: colors.brown,
        lineHeight: 20,
    },
    recommendationsSection: {
        paddingHorizontal: 20,
        marginTop: 16,
    },
    recommendationCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: colors.brownie,
    },
    recommendationIcon: {
        fontSize: 24,
        marginRight: 12,
        marginTop: 2,
    },
    recommendationTextContainer: {
        flex: 1,
    },
    slotRecommendationTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.brownie,
        marginBottom: 4,
    },
    slotRecommendationText: {
        fontSize: 13,
        color: colors.brown,
        lineHeight: 18,
        marginBottom: 6,
    },
    recommendationStats: {
        marginTop: 2,
    },
    recommendationStat: {
        fontSize: 11,
        color: colors.gray,
        fontWeight: '500',
    },
    slotsSection: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: colors.gray,
    },
    slotMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.white,
        marginTop: -6,
        marginBottom: 12,
        padding: 12,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    metricItem: {
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 11,
        color: colors.gray,
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.brownie,
    },
});

export default StaffCrowdDashboard;
