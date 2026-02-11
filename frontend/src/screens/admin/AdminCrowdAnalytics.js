import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../../styles/colors';
import AlertCard from '../../components/AlertCard';
import api from '../../services/api';

/**
 * AdminCrowdAnalytics Screen
 * --------------------------
 * This screen acts as the main dashboard for administrators to monitor crowd data.
 * It provides:
 * 1. High-level system overview (current status, alerts).
 * 2. Peak hour analysis to identify busy slots.
 * 3. Historical trends based on selected time periods (7, 14, 30 days).
 * 4. Data export functionality for offline processing.
 */
const AdminCrowdAnalytics = () => {
    // State to handle loading spinners and API status
    const [loading, setLoading] = useState(true);

    // Stores the main analytics data object from the backend
    const [analytics, setAnalytics] = useState(null);

    // Stores list of active crowd alerts (e.g., overcrowding events)
    const [alerts, setAlerts] = useState([]);

    // User selected filter: How many past days to analyze (default: 7)
    const [analyzeDays, setAnalyzeDays] = useState(7);

    // Error state to display friendly messages if API fails
    const [error, setError] = useState(null);

    // Loading state specifically for the CSV export process
    const [exportingData, setExportingData] = useState(false);

    /**
     * Effect Hook:
     * Triggered mainly when 'analyzeDays' changes.
     * This ensures the dashboard updates automatically when the admin changes the filter.
     */
    useEffect(() => {
        fetchAnalytics();
        fetchAlerts();
    }, [analyzeDays]);

    /**
     * Fetches comprehensive crowd statistics from the backend.
     * Uses the selected 'analyzeDays' to filter the dataset on the server.
     */
    const fetchAnalytics = async () => {
        try {
            setLoading(true); // Start loading spinner
            setError(null);   // Reset previous errors

            const response = await api.getAdminCrowdAnalytics(analyzeDays);

            if (response.data && response.data.success) {
                setAnalytics(response.data);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            // Graceful error handling: show backend message or default text
            setError(err.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false); // Stop loading spinner regardless of success/failure
        }
    };

    /**
     * Fetches separate list of unresolved alerts.
     * We only want active issues here to keep the dashboard focused.
     */
    const fetchAlerts = async () => {
        try {
            const response = await api.getAlertHistory({ resolved: false });

            if (response.data && response.data.success) {
                setAlerts(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching alerts:', err);
            // Note: We don't block the whole UI if alerts fail, just log it.
        }
    };

    /**
     * Handles manual resolution of an alert by the admin.
     * @param {string} alertId - The unique ID of the alert to resolve.
     */
    const handleResolveAlert = async (alertId) => {
        try {
            // Optimistic updates or waiting for completion: here we wait
            await api.resolveAlert(alertId, 'Resolved by admin');

            // Refresh the list immediately to show updated status
            fetchAlerts();

            Alert.alert('Success', 'Alert resolved successfully');
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to resolve alert');
        }
    };

    /**
     * Exports crowd data to a CSV file.
     * Steps:
     * 1. Calculate date range based on 'analyzeDays'.
     * 2. Request backend to generate CSV.
     * 3. Backend returns a temporary download URL.
     * 4. Open URL in mobile browser/system handler to download.
     */
    const handleExportData = async () => {
        try {
            setExportingData(true);

            // Calculate 'startDate' going back 'analyzeDays' from today
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - analyzeDays);

            const url = await api.exportCrowdData(
                startDate.toISOString(),
                endDate.toISOString()
            );

            // If we get a valid URL, open it (Deep linking)
            if (url) {
                Linking.openURL(url);
                Alert.alert('Success', 'Data export initiated. Check your downloads folder.');
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to export data');
        } finally {
            setExportingData(false);
        }
    };

    // Full screen loader to prevent UI flickering during initial fetch
    if (loading && !analytics) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.brownie} />
                <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
        );
    }

    // Safe destructuring with default values to avoid 'undefined' crashes
    const currentStatus = analytics?.currentStatus || {};
    const alertSummary = analytics?.alerts || {};
    const peakHours = analytics?.peakHours || [];
    const historicalPatterns = analytics?.historicalPatterns || [];

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Crowd Analytics</Text>
                    <Text style={styles.subtitle}>System performance insights</Text>
                </View>
            </View>

            {/* Global Error Banner */}
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

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* 
                 * Filter Control: 
                 * Allows changing the dataset scope (7, 14, 30 days).
                 * Updating this automatically triggers the useEffect.
                 */}
                <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Analysis Period</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={analyzeDays}
                            onValueChange={(value) => setAnalyzeDays(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Last 7 Days" value={7} />
                            <Picker.Item label="Last 14 Days" value={14} />
                            <Picker.Item label="Last 30 Days" value={30} />
                        </Picker>
                    </View>
                </View>

                {/* KPI Cards: High-level overview of alert counts */}
                <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>Alert Summary</Text>
                    <View style={styles.summaryGrid}>
                        {/* Total Alerts Card */}
                        <View style={[styles.summaryCard, { borderTopColor: colors.error }]}>
                            <Text style={styles.summaryValue}>{alertSummary.total || 0}</Text>
                            <Text style={styles.summaryLabel}>Total Alerts</Text>
                        </View>
                        {/* Active Alerts Card */}
                        <View style={[styles.summaryCard, { borderTopColor: colors.warning }]}>
                            <Text style={styles.summaryValue}>{alertSummary.active || 0}</Text>
                            <Text style={styles.summaryLabel}>Active</Text>
                        </View>
                        {/* Resolved Alerts Card */}
                        <View style={[styles.summaryCard, { borderTopColor: colors.success }]}>
                            <Text style={styles.summaryValue}>{alertSummary.resolved || 0}</Text>
                            <Text style={styles.summaryLabel}>Resolved</Text>
                        </View>
                    </View>
                </View>

                {/* 
                 * Active Alerts List:
                 * Only rendered if there are alerts to show. Uses reusable AlertCard.
                 */}
                {alerts.length > 0 && (
                    <View style={styles.alertsSection}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons
                                name="bell-alert"
                                size={20}
                                color={colors.brownie}
                            />
                            <Text style={styles.sectionTitle}>Active Alerts</Text>
                        </View>
                        {alerts.map((alert) => (
                            <AlertCard
                                key={alert._id}
                                alert={alert}
                                onResolve={handleResolveAlert}
                                showResolveButton={true}
                            />
                        ))}
                    </View>
                )}

                {/* 
                 * Peak Hours Analysis Logic:
                 * Identifies time slots where occupancy frequently exceeds thresholds.
                 * Includes a mini-visualization (badges) for specific hours.
                 */}
                {peakHours.length > 0 && (
                    <View style={styles.peakHoursSection}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons
                                name="chart-timeline-variant"
                                size={20}
                                color={colors.brownie}
                            />
                            <Text style={styles.sectionTitle}>Peak Hours by Slot</Text>
                        </View>
                        {peakHours.map((slotData, index) => (
                            <View key={index} style={styles.peakHourCard}>
                                <Text style={styles.peakHourSlot}>
                                    {slotData.slotId?.name || 'Unknown Slot'}
                                </Text>
                                <Text style={styles.peakHourInfo}>
                                    Analyzed {slotData.analyzedDays} days •
                                    Avg Occupancy: {slotData.averageOccupancy}%
                                </Text>
                                {/* Conditional rendering for specific peak hours */}
                                {slotData.peakHours && slotData.peakHours.length > 0 ? (
                                    <View style={styles.peakHoursList}>
                                        {slotData.peakHours.slice(0, 3).map((peak, idx) => (
                                            <View key={idx} style={styles.peakHourBadge}>
                                                <Text style={styles.peakHourTime}>
                                                    {peak.hour}:00
                                                </Text>
                                                <Text style={styles.peakHourFreq}>
                                                    {peak.percentage}%
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={styles.noPeakHours}>No peak hours identified</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}


                {/* 
                 * Occupancy Table:
                 * A detailed data table showing average occupancy per slot.
                 * Uses color-coded status icons (Red/Yellow/Green) for quick visual scanning.
                 */}
                {peakHours.length > 0 && (
                    <View style={styles.occupancySummarySection}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons
                                name="chart-bar"
                                size={20}
                                color={colors.brownie}
                            />
                            <Text style={styles.sectionTitle}>Occupancy Summary</Text>
                        </View>
                        <View style={styles.summaryTable}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Slot</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Days</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Avg %</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Status</Text>
                            </View>
                            {peakHours.map((slotData, index) => {
                                const occupancy = slotData.averageOccupancy || 0;
                                let statusIcon = '🟢';
                                let statusColor = colors.success;

                                // Threshold logic for status indicators
                                if (occupancy >= 70) {
                                    statusIcon = '🔴'; // High load
                                    statusColor = colors.error;
                                } else if (occupancy >= 40) {
                                    statusIcon = '🟡'; // Medium load
                                    statusColor = colors.warning;
                                }

                                return (
                                    <View key={index} style={styles.tableRow}>
                                        <View style={{ flex: 2 }}>
                                            <Text style={styles.tableCellSlot}>
                                                {slotData.slotId?.name || 'Unknown'}
                                            </Text>
                                            <Text style={styles.tableCellTime}>
                                                {slotData.slotId?.startTime} - {slotData.slotId?.endTime}
                                            </Text>
                                        </View>
                                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                                            {slotData.analyzedDays}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: '700' }]}>
                                            {occupancy}%
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontSize: 18 }]}>
                                            {statusIcon}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                        <Text style={styles.summaryNote}>
                            📊 Based on {analyzeDays}-day analysis period
                        </Text>
                    </View>
                )}

                {/* Export Action Button */}
                <TouchableOpacity
                    style={[styles.exportButton, exportingData && styles.exportButtonDisabled]}
                    onPress={handleExportData}
                    disabled={exportingData}
                >
                    <MaterialCommunityIcons
                        name={exportingData ? "loading" : "download"}
                        size={20}
                        color={colors.white}
                    />
                    <Text style={styles.exportButtonText}>
                        {exportingData ? 'Exporting...' : 'Export Data as CSV'}
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
    filterSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.brownie,
        marginBottom: 8,
    },
    pickerContainer: {
        backgroundColor: colors.cream,
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    summarySection: {
        paddingHorizontal: 20,
        paddingTop: 20,
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
    summaryGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderTopWidth: 3,
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.brownie,
    },
    summaryLabel: {
        fontSize: 12,
        color: colors.gray,
        marginTop: 4,
    },
    alertsSection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    peakHoursSection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    peakHourCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    peakHourSlot: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brownie,
        marginBottom: 4,
    },
    peakHourInfo: {
        fontSize: 13,
        color: colors.gray,
        marginBottom: 12,
    },
    peakHoursList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    peakHourBadge: {
        backgroundColor: colors.brownie,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    peakHourTime: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.white,
        marginRight: 6,
    },
    peakHourFreq: {
        fontSize: 11,
        color: colors.cream,
    },
    noPeakHours: {
        fontSize: 13,
        color: colors.gray,
        fontStyle: 'italic',
    },
    occupancySummarySection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    summaryTable: {
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.brownie,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    tableHeaderText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.white,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
        alignItems: 'center',
    },
    tableCellSlot: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.brownie,
    },
    tableCellTime: {
        fontSize: 11,
        color: colors.gray,
        marginTop: 2,
    },
    tableCell: {
        fontSize: 14,
        color: colors.brown,
    },
    summaryNote: {
        fontSize: 12,
        color: colors.gray,
        marginTop: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.brownie,
        marginHorizontal: 20,
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    exportButtonDisabled: {
        backgroundColor: colors.gray,
    },
    exportButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default AdminCrowdAnalytics;
