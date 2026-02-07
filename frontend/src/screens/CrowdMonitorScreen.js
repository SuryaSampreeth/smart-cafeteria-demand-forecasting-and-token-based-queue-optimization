import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import CrowdLevelIndicator from '../../components/CrowdLevelIndicator';
import api from '../../services/api';

/**
 * CrowdMonitorScreen Component
 * 
 * Provides real-time visualization of cafeteria crowd density.
 * Features:
 * 1. Live crowd levels for each slot (Low, Medium, High).
 * 2. Summary stats of occupancy.
 * 3. Auto-refreshing data every 30 seconds.
 * 4. Link to historical patterns view.
 */
const CrowdMonitorScreen = ({ navigation }) => {
    const [crowdLevels, setCrowdLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);

    // Auto-refresh interval (30 seconds)
    const AUTO_REFRESH_INTERVAL = 30000;

    /**
     * Fetches the latest crowd data.
     * @param {boolean} showLoading - Whether to show the full-screen loader (false for background updates).
     */
    const fetchCrowdLevels = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);

            const response = await api.getCrowdLevels();

            if (response.data && response.data.success) {
                setCrowdLevels(response.data.data);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error('Error fetching crowd levels:', err);
            setError(err.response?.data?.message || 'Failed to load crowd data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Pull-to-refresh handler.
     */
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCrowdLevels(false);
    }, []);

    // Set up auto-refresh on mount
    useEffect(() => {
        fetchCrowdLevels();

        const interval = setInterval(() => {
            fetchCrowdLevels(false);
        }, AUTO_REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    /**
     * Helper to display relative time since last update (e.g., "Just now" or "20s ago").
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

    /**
     * Calculates summary counts for each crowd level category.
     */
    const getCrowdSummary = () => {
        if (crowdLevels.length === 0) return null;

        const lowCount = crowdLevels.filter(l => l.crowdLevel === 'low').length;
        const mediumCount = crowdLevels.filter(l => l.crowdLevel === 'medium').length;
        const highCount = crowdLevels.filter(l => l.crowdLevel === 'high').length;

        return { lowCount, mediumCount, highCount };
    };

    const summary = getCrowdSummary();

    if (loading && crowdLevels.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.brownie} />
                <Text style={styles.loadingText}>Loading crowd data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Title and Refresh Button */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Crowd Monitor</Text>
                    <Text style={styles.subtitle}>Real-time cafeteria occupancy</Text>
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

            {/* Timeliness Indicator */}
            {lastUpdated && (
                <View style={styles.updateInfo}>
                    <MaterialCommunityIcons
                        name="clock-outline"
                        size={14}
                        color={colors.gray}
                    />
                    <Text style={styles.updateText}>
                        Updated {formatLastUpdated()}
                    </Text>
                </View>
            )}

            {/* Summary Cards Row */}
            {summary && (
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={styles.summaryNumber}>{summary.lowCount}</Text>
                        <Text style={[styles.summaryLabel, { color: colors.success }]}>
                            Low Crowd
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#FFF3E0' }]}>
                        <Text style={styles.summaryNumber}>{summary.mediumCount}</Text>
                        <Text style={[styles.summaryLabel, { color: colors.warning }]}>
                            Medium
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#FFEBEE' }]}>
                        <Text style={styles.summaryNumber}>{summary.highCount}</Text>
                        <Text style={[styles.summaryLabel, { color: colors.error }]}>
                            High Crowd
                        </Text>
                    </View>
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

            {/* Main Content: List of Crowd Levels by Slot */}
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
                {crowdLevels.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={48}
                            color={colors.gray}
                        />
                        <Text style={styles.emptyText}>No crowd data available</Text>
                    </View>
                ) : (
                    crowdLevels.map((level, index) => (
                        <CrowdLevelIndicator
                            key={index}
                            level={level.crowdLevel}
                            occupancyRate={level.occupancyRate}
                            slotName={level.slotName}
                            size="medium"
                        />
                    ))
                )}

                {/* Navigation Button to Historical Analytics */}
                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => navigation.navigate('CrowdPatterns')}
                >
                    <MaterialCommunityIcons
                        name="chart-line"
                        size={20}
                        color={colors.white}
                    />
                    <Text style={styles.historyButtonText}>
                        View Historical Patterns
                    </Text>
                </TouchableOpacity>

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
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.white,
        marginBottom: 8,
    },
    summaryCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        marginHorizontal: 4,
    },
    summaryNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.brownie,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
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
        paddingHorizontal: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: colors.gray,
        marginTop: 12,
    },
    historyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.brownie,
        borderRadius: 10,
        paddingVertical: 14,
        marginTop: 20,
    },
    historyButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default CrowdMonitorScreen;
