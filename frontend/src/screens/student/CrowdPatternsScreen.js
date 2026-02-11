import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../../styles/colors';
import CrowdPatternChart from '../../components/CrowdPatternChart';
import api from '../../services/api';

/**
 * CrowdPatternsScreen Component
 * 
 * Analyzes and displays historical crowd data to help students plan their meals.
 * Features:
 * 1. Historical crowd trends chart.
 * 2. Peak hour analysis (identifies busiest times).
 * 3. Average occupancy statistics.
 * 4. Filtering by Slot and Time Range (7, 14, 30 days).
 */
const CrowdPatternsScreen = () => {
    const [loading, setLoading] = useState(true);
    const [patterns, setPatterns] = useState([]);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [dateRange, setDateRange] = useState(7); // days to look back
    const [error, setError] = useState(null);

    // Initial load: Fetch available slots
    useEffect(() => {
        fetchSlots();
    }, []);

    // Fetch patterns whenever slot or date range changes
    useEffect(() => {
        if (selectedSlot) {
            fetchHistoricalPatterns();
        }
    }, [selectedSlot, dateRange]);

    /**
     * Fetches all available meal slots to populate the dropdown.
     */
    const fetchSlots = async () => {
        try {
            const response = await api.getSlots();
            if (response.data) {
                setSlots(response.data);
                // Default to the first slot if available
                if (response.data.length > 0) {
                    setSelectedSlot(response.data[0]._id);
                }
            }
        } catch (err) {
            console.error('Error fetching slots:', err);
            setError('Failed to load slots');
        }
    };

    /**
     * Fetches historical crowd data for the selected slot and date range.
     */
    const fetchHistoricalPatterns = async () => {
        try {
            setLoading(true);
            setError(null);

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - dateRange);

            const response = await api.getHistoricalPatterns(
                selectedSlot,
                startDate.toISOString(),
                endDate.toISOString()
            );

            if (response.data && response.data.success) {
                setPatterns(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching patterns:', err);
            setError(err.response?.data?.message || 'Failed to load historical data');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Analyzes pattern data to identify the top 3 busiest hours.
     * Returns an array of objects: { hour, frequency }.
     */
    const getPeakHoursSummary = () => {
        if (patterns.length === 0) return null;

        // Aggregate peak hours across all days
        const peakHoursMap = {};

        patterns.forEach(pattern => {
            pattern.peakHours.forEach(hour => {
                peakHoursMap[hour] = (peakHoursMap[hour] || 0) + 1;
            });
        });

        // Sort by frequency (descending)
        const sortedPeakHours = Object.entries(peakHoursMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3); // Top 3 peak hours

        return sortedPeakHours.map(([hour, count]) => ({
            hour: parseInt(hour),
            frequency: Math.round((count / patterns.length) * 100),
        }));
    };

    /**
     * Formats hour integer to AM/PM string (e.g., 13 -> "1:00 PM").
     */
    const formatHour = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${period}`;
    };

    /**
     * Calculates the average occupancy percentage across the selected date range.
     */
    const getAverageOccupancy = () => {
        if (patterns.length === 0) return 0;
        const sum = patterns.reduce((acc, p) => acc + p.averageOccupancy, 0);
        return Math.round(sum / patterns.length);
    };

    const peakHours = getPeakHoursSummary();
    const avgOccupancy = getAverageOccupancy();
    const selectedSlotName = slots.find(s => s._id === selectedSlot)?.name || '';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Historical Patterns</Text>
                <Text style={styles.subtitle}>Analyze peak hours and trends</Text>
            </View>

            {/* Filters Section */}
            <View style={styles.filtersContainer}>
                {/* Slot Picker */}
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Select Slot</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedSlot}
                            onValueChange={(value) => setSelectedSlot(value)}
                            style={styles.picker}
                        >
                            {slots.map(slot => (
                                <Picker.Item
                                    key={slot._id}
                                    label={`${slot.name} (${slot.startTime} - ${slot.endTime})`}
                                    value={slot._id}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Date Range Selection Buttons */}
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Time Period</Text>
                    <View style={styles.dateRangeButtons}>
                        {[7, 14, 30].map(days => (
                            <TouchableOpacity
                                key={days}
                                style={[
                                    styles.dateRangeButton,
                                    dateRange === days && styles.dateRangeButtonActive
                                ]}
                                onPress={() => setDateRange(days)}
                            >
                                <Text
                                    style={[
                                        styles.dateRangeText,
                                        dateRange === days && styles.dateRangeTextActive
                                    ]}
                                >
                                    {days} Days
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

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

            {/* Scrollable Content Area */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.brownie} />
                        <Text style={styles.loadingText}>Loading patterns...</Text>
                    </View>
                ) : patterns.length === 0 ? (
                    // Empty State
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                            name="chart-line-variant"
                            size={64}
                            color={colors.gray}
                        />
                        <Text style={styles.emptyText}>No historical data available</Text>
                        <Text style={styles.emptySubtext}>
                            Patterns will appear after the system collects data over time
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Summary Stats Cards */}
                        <View style={styles.summarySection}>
                            <Text style={styles.sectionTitle}>Summary</Text>
                            <View style={styles.summaryGrid}>
                                <View style={styles.summaryCard}>
                                    <MaterialCommunityIcons
                                        name="chart-areaspline"
                                        size={32}
                                        color={colors.brownie}
                                    />
                                    <Text style={styles.summaryValue}>{avgOccupancy}%</Text>
                                    <Text style={styles.summaryLabel}>Avg Occupancy</Text>
                                </View>
                                <View style={styles.summaryCard}>
                                    <MaterialCommunityIcons
                                        name="calendar-clock"
                                        size={32}
                                        color={colors.brownie}
                                    />
                                    <Text style={styles.summaryValue}>{patterns.length}</Text>
                                    <Text style={styles.summaryLabel}>Days Analyzed</Text>
                                </View>
                            </View>
                        </View>

                        {/* Peak Hours Section */}
                        {peakHours && peakHours.length > 0 && (
                            <View style={styles.peakHoursSection}>
                                <Text style={styles.sectionTitle}>Most Common Peak Hours</Text>
                                {peakHours.map((peak, index) => (
                                    <View key={index} style={styles.peakHourCard}>
                                        <View style={styles.peakHourRank}>
                                            <Text style={styles.peakHourRankText}>#{index + 1}</Text>
                                        </View>
                                        <View style={styles.peakHourInfo}>
                                            <Text style={styles.peakHourTime}>
                                                {formatHour(peak.hour)}
                                            </Text>
                                            <Text style={styles.peakHourFreq}>
                                                Peak {peak.frequency}% of the time
                                            </Text>
                                        </View>
                                        <MaterialCommunityIcons
                                            name="fire"
                                            size={24}
                                            color={colors.error}
                                        />
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Crowd Pattern Chart Component */}
                        <CrowdPatternChart
                            historicalData={patterns}
                            slotName={selectedSlotName}
                            title="Hourly Crowd Pattern"
                        />

                        <View style={{ height: 20 }} />
                    </>
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
    header: {
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
    filtersContainer: {
        backgroundColor: colors.white,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    filterGroup: {
        marginBottom: 16,
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
    dateRangeButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    dateRangeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: colors.cream,
        alignItems: 'center',
    },
    dateRangeButtonActive: {
        backgroundColor: colors.brownie,
    },
    dateRangeText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.brownie,
    },
    dateRangeTextActive: {
        color: colors.white,
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
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: colors.gray,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.gray,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    summarySection: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.brownie,
        marginBottom: 12,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    peakHoursSection: {
        marginTop: 24,
        marginBottom: 16,
    },
    peakHourCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    peakHourRank: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.brownie,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    peakHourRankText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    peakHourInfo: {
        flex: 1,
    },
    peakHourTime: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.brownie,
    },
    peakHourFreq: {
        fontSize: 13,
        color: colors.gray,
        marginTop: 2,
    },
});

export default CrowdPatternsScreen;
