import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
    Platform,
} from 'react-native';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { staffAPI, menuAPI } from '../../services/api';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { BOOKING_STATUS } from '../../utils/constants';

/*
 * QueueManagementScreen
 * ---------------------
 * The operational hub for staff members.
 * 
 * Core Functions:
 * 1. View live queue for a specific slot (filtered by selector).
 * 2. Call Next: Auto-assigns the next pending token to the staff member.
 * 3. Mark Served: Completes the order workflow.
 * 
 * Note: Handles platform differences for Alerts (Web vs Native).
 */
const QueueManagementScreen = () => {
    // Component State
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data State
    const [slots, setSlots] = useState([]);          // List of available slots
    const [selectedSlot, setSelectedSlot] = useState(''); // Currently viewed slot ID
    const [queue, setQueue] = useState([]);          // List of booking objects (tokens) in the queue

    // UI Feedback
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null); // Track which specific action is loading (ID or 'callNext')

    /**
     * Load slots on mount
     */
    useEffect(() => {
        fetchSlots();
    }, []);

    /**
     * Reload queue whenever the selected slot changes
     */
    useEffect(() => {
        if (selectedSlot) {
            fetchQueue();
        }
    }, [selectedSlot]);

    const fetchSlots = async () => {
        try {
            const response = await menuAPI.getAllSlots();
            setSlots(response.data);
            // Auto-select the first slot if none selected
            if (response.data.length > 0 && !selectedSlot) {
                setSelectedSlot(response.data[0]._id);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load slots');
            console.error('Error fetching slots:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchQueue = async () => {
        if (!selectedSlot) return;

        try {
            setError('');
            const response = await staffAPI.getQueue(selectedSlot);
            setQueue(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load queue');
            console.error('Error fetching queue:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchQueue();
    };

    /**
     * Calls the next student in the FIFO queue.
     * Updates the booking status from PENDING -> SERVING.
     */
    const handleCallNext = async () => {
        if (!selectedSlot) return;

        // Set actionLoading to 'callNext' to show spinner on the big button
        setActionLoading('callNext');
        try {
            const response = await staffAPI.callNext(selectedSlot);
            const message = `Token ${response.data.tokenNumber} for ${response.data.studentId.name} is now being served.`;

            // Platform-specific alert handling
            if (Platform.OS === 'web') {
                window.alert('Token Called\n\n' + message);
            } else {
                Alert.alert('Token Called', message, [{ text: 'OK' }]);
            }
            fetchQueue(); // Refresh list to show new status
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to call next token';
            if (Platform.OS === 'web') {
                window.alert('Error: ' + errorMsg);
            } else {
                Alert.alert('Error', errorMsg);
            }
        } finally {
            setActionLoading(null);
        }
    };

    /**
     * Marks a specific token as completed.
     * Updates status from SERVING -> SERVED.
     */
    const handleMarkServed = async (bookingId, tokenNumber) => {
        const confirmMessage = `Mark token ${tokenNumber} as completed?`;

        // Wrapper function to execute the API call
        const executeMarkServed = async () => {
            setActionLoading(bookingId); // Show spinner only on this specific button
            try {
                await staffAPI.markServed(bookingId);
                // Success feedback
                const msg = `Success! Token ${tokenNumber} marked as completed`;
                Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Success', msg);
                fetchQueue();
            } catch (err) {
                const msg = 'Error: ' + (err.response?.data?.message || 'Failed to mark as completed');
                Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
            } finally {
                setActionLoading(null);
            }
        };

        // Confirmation Dialog
        if (Platform.OS === 'web') {
            if (window.confirm(confirmMessage)) {
                executeMarkServed();
            }
        } else {
            Alert.alert(
                'Confirm',
                confirmMessage,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Mark Completed', onPress: executeMarkServed },
                ]
            );
        }
    };

    /**
     * Helper: Maps booking status to UI colors
     */
    const getStatusColor = (status) => {
        switch (status) {
            case BOOKING_STATUS.PENDING: return colors.warning; // Yellow/Orange
            case BOOKING_STATUS.SERVING: return colors.info;    // Blue
            case BOOKING_STATUS.SERVED: return colors.success;  // Green
            default: return colors.gray;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.brownie} />
            </View>
        );
    }

    // Client-side calculation of queue stats
    const pendingCount = queue.filter((t) => t.status === BOOKING_STATUS.PENDING).length;
    const servingCount = queue.filter((t) => t.status === BOOKING_STATUS.SERVING).length;

    return (
        <View style={styles.container}>
            {/* Fixed Header with Slot Selector and Stats */}
            <View style={styles.header}>
                <Text style={styles.title}>Queue Management</Text>

                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Select Slot:</Text>
                    {/* Using HTML select for web compatibility - in React Native native, use Picker */}
                    <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        style={{
                            width: '100%',
                            padding: 12,
                            fontSize: 16,
                            borderRadius: 8,
                            border: `1px solid ${colors.brownieLight}`,
                            backgroundColor: colors.white,
                            color: colors.brownie,
                        }}
                    >
                        {slots.map((slot) => (
                            <option key={slot._id} value={slot._id}>
                                {slot.name} ({slot.startTime} - {slot.endTime})
                            </option>
                        ))}
                    </select>
                </View>

                {/* Queue Summary Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{pendingCount}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: colors.info }]}>{servingCount}</Text>
                        <Text style={styles.statLabel}>Serving</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{queue.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                </View>

                {/* Main Action: Call Next Token */}
                {pendingCount > 0 && (
                    <Button
                        title="📢 Call Next Token"
                        onPress={handleCallNext}
                        loading={actionLoading === 'callNext'}
                        style={styles.callNextButton}
                    />
                )}
            </View>

            {/* Scrollable Queue List */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brownie]} />
                }
            >
                {error ? (
                    <Card>
                        <Text style={styles.errorText}>{error}</Text>
                    </Card>
                ) : null}

                {queue.length > 0 ? (
                    queue.map((token) => (
                        <Card key={token._id} style={styles.tokenCard}>
                            {/* Token Header: ID, Name, Status */}
                            <View style={styles.tokenHeader}>
                                <View>
                                    <Text style={styles.tokenNumber}>{token.tokenNumber}</Text>
                                    <Text style={styles.studentName}>{token.studentId.name}</Text>
                                    <Text style={styles.studentEmail}>{token.studentId.email}</Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(token.status) },
                                    ]}
                                >
                                    <Text style={styles.statusText}>
                                        {token.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            {/* Token Metadata */}
                            <View style={styles.tokenDetails}>
                                <Text style={styles.detailLabel}>Queue Position: {token.queuePosition}</Text>
                                <Text style={styles.detailLabel}>
                                    Items: {token.items.map((item) => `${item.menuItemId.name} (${item.quantity})`).join(', ')}
                                </Text>
                                {token.estimatedWaitTime > 0 && (
                                    <Text style={styles.detailLabel}>
                                        Est. Wait: {token.estimatedWaitTime} mins
                                    </Text>
                                )}
                            </View>

                            {/* 
                             * Completion Action:
                             * Only show this button if the token is currently being served.
                             * (Workflow: Pending -> Call Next (Serving) -> Mark Served (Done))
                             */}
                            {token.status === BOOKING_STATUS.SERVING && (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.servedButton]}
                                        onPress={() => handleMarkServed(token._id, token.tokenNumber)}
                                        disabled={actionLoading === token._id}
                                    >
                                        {actionLoading === token._id ? (
                                            <ActivityIndicator size="small" color={colors.white} />
                                        ) : (
                                            <Text style={styles.actionButtonText}>✓ Mark as Completed</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </Card>
                    ))
                ) : (
                    <Card>
                        <Text style={styles.noDataText}>No tokens in queue for this slot</Text>
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
    header: {
        backgroundColor: colors.cream,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.brownieLight + '30',
        zIndex: 10, // Ensure header shadow renders over content
    },
    title: {
        ...typography.h2,
        color: colors.brownie,
        marginBottom: 16,
    },
    pickerContainer: {
        marginBottom: 16,
    },
    pickerLabel: {
        ...typography.body,
        color: colors.brownie,
        marginBottom: 8,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    statBox: {
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
    callNextButton: {
        backgroundColor: colors.success,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorText: {
        color: colors.error,
        ...typography.body,
        textAlign: 'center',
    },
    tokenCard: {
        marginBottom: 12,
    },
    tokenHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tokenNumber: {
        ...typography.h2,
        color: colors.brownie,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    studentName: {
        ...typography.body,
        color: colors.brownie,
        marginBottom: 2,
    },
    studentEmail: {
        ...typography.caption,
        color: colors.gray,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        ...typography.small,
        color: colors.white,
        fontWeight: 'bold',
    },
    tokenDetails: {
        marginBottom: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    detailLabel: {
        ...typography.caption,
        color: colors.gray,
        marginBottom: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
    },
    servingButton: {
        backgroundColor: colors.info,
    },
    servedButton: {
        backgroundColor: colors.success,
    },
    actionButtonText: {
        color: colors.white,
        ...typography.button,
    },
    noDataText: {
        ...typography.body,
        color: colors.gray,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default QueueManagementScreen;
