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

const QueueManagementScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [queue, setQueue] = useState([]);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchSlots();
    }, []);

    useEffect(() => {
        if (selectedSlot) {
            fetchQueue();
        }
    }, [selectedSlot]);

    const fetchSlots = async () => {
        try {
            const response = await menuAPI.getAllSlots();
            setSlots(response.data);
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

    const handleCallNext = async () => {
        if (!selectedSlot) return;

        setActionLoading('callNext');
        try {
            const response = await staffAPI.callNext(selectedSlot);
            const message = `Token ${response.data.tokenNumber} for ${response.data.studentId.name} is now being served.`;

            if (Platform.OS === 'web') {
                window.alert('Token Called\n\n' + message);
            } else {
                Alert.alert('Token Called', message, [{ text: 'OK' }]);
            }
            fetchQueue();
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

    const handleMarkServed = async (bookingId, tokenNumber) => {
        const confirmMessage = `Mark token ${tokenNumber} as completed?`;

        if (Platform.OS === 'web') {
            if (window.confirm(confirmMessage)) {
                setActionLoading(bookingId);
                try {
                    await staffAPI.markServed(bookingId);
                    window.alert(`Success! Token ${tokenNumber} marked as completed`);
                    fetchQueue();
                } catch (err) {
                    window.alert('Error: ' + (err.response?.data?.message || 'Failed to mark as completed'));
                } finally {
                    setActionLoading(null);
                }
            }
        } else {
            Alert.alert(
                'Confirm',
                confirmMessage,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Mark Completed',
                        onPress: async () => {
                            setActionLoading(bookingId);
                            try {
                                await staffAPI.markServed(bookingId);
                                Alert.alert('Success', `Token ${tokenNumber} marked as completed`);
                                fetchQueue();
                            } catch (err) {
                                Alert.alert('Error', err.response?.data?.message || 'Failed to mark as completed');
                            } finally {
                                setActionLoading(null);
                            }
                        },
                    },
                ]
            );
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case BOOKING_STATUS.PENDING:
                return colors.warning;
            case BOOKING_STATUS.SERVING:
                return colors.info;
            case BOOKING_STATUS.SERVED:
                return colors.success;
            default:
                return colors.gray;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.brownie} />
            </View>
        );
    }

    const pendingCount = queue.filter((t) => t.status === BOOKING_STATUS.PENDING).length;
    const servingCount = queue.filter((t) => t.status === BOOKING_STATUS.SERVING).length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Queue Management</Text>

                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Select Slot:</Text>
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

                {pendingCount > 0 && (
                    <Button
                        title="📢 Call Next Token"
                        onPress={handleCallNext}
                        loading={actionLoading === 'callNext'}
                        style={styles.callNextButton}
                    />
                )}
            </View>

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

                            {/* Only show Mark as Completed button for SERVING status */}
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
