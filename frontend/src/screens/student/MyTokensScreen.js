import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import Card from '../../components/common/Card';
import { bookingAPI } from '../../services/api';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { BOOKING_STATUS } from '../../utils/constants';

const MyTokensScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tokens, setTokens] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTokens();

        // Auto-refresh every 10 seconds for real-time updates
        const interval = setInterval(fetchTokens, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchTokens = async () => {
        try {
            setError('');
            const response = await bookingAPI.getMyBookings();
            // Filter only active tokens (not served or cancelled)
            const activeTokens = response.data.filter(
                (booking) => booking.status !== BOOKING_STATUS.SERVED && booking.status !== BOOKING_STATUS.CANCELLED
            );
            setTokens(activeTokens);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load tokens');
            console.error('Error fetching tokens:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTokens();
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

    const getStatusIcon = (status) => {
        switch (status) {
            case BOOKING_STATUS.PENDING:
                return '⏳';
            case BOOKING_STATUS.SERVING:
                return '🔔';
            case BOOKING_STATUS.SERVED:
                return '✅';
            default:
                return '📋';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.brownie} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Tokens</Text>
                <Text style={styles.subtitle}>Active bookings and queue status</Text>
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

                {tokens.length > 0 ? (
                    tokens.map((token) => (
                        <Card key={token._id} style={styles.tokenCard}>
                            <View style={styles.tokenHeader}>
                                <View>
                                    <Text style={styles.tokenNumber}>{token.tokenNumber}</Text>
                                    <Text style={styles.slotName}>{token.slotId.name}</Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(token.status) },
                                    ]}
                                >
                                    <Text style={styles.statusIcon}>{getStatusIcon(token.status)}</Text>
                                    <Text style={styles.statusText}>{token.status.toUpperCase()}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.tokenDetails}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Queue Position:</Text>
                                    <Text style={styles.detailValue}>#{token.queuePosition}</Text>
                                </View>

                                {token.estimatedWaitTime > 0 && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Estimated Wait:</Text>
                                        <Text style={styles.detailValue}>{token.estimatedWaitTime} mins</Text>
                                    </View>
                                )}

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Slot Time:</Text>
                                    <Text style={styles.detailValue}>
                                        {token.slotId.startTime} - {token.slotId.endTime}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Booked At:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(token.createdAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.itemsSection}>
                                <Text style={styles.itemsTitle}>Items Ordered:</Text>
                                {token.items.map((item, index) => (
                                    <View key={index} style={styles.itemRow}>
                                        <Text style={styles.itemName}>
                                            {item.menuItemId.name} × {item.quantity}
                                        </Text>
                                        <Text style={styles.itemPrice}>
                                            ₹{item.menuItemId.price * item.quantity}
                                        </Text>
                                    </View>
                                ))}
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total:</Text>
                                    <Text style={styles.totalValue}>
                                        ₹
                                        {token.items.reduce(
                                            (sum, item) => sum + item.menuItemId.price * item.quantity,
                                            0
                                        )}
                                    </Text>
                                </View>
                            </View>

                            {token.status === BOOKING_STATUS.SERVING && (
                                <View style={styles.alertBox}>
                                    <Text style={styles.alertText}>
                                        🔔 Your order is being prepared! Please proceed to the counter.
                                    </Text>
                                </View>
                            )}
                        </Card>
                    ))
                ) : (
                    <Card>
                        <Text style={styles.noDataText}>No active tokens</Text>
                        <Text style={styles.noDataSubtext}>
                            Book a meal to get started!
                        </Text>
                    </Card>
                )}

                <Card style={styles.infoCard}>
                    <Text style={styles.infoTitle}>ℹ️ Token Status Guide</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>⏳</Text>
                        <Text style={styles.infoText}>
                            <Text style={styles.infoBold}>Pending:</Text> Waiting in queue
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>🔔</Text>
                        <Text style={styles.infoText}>
                            <Text style={styles.infoBold}>Serving:</Text> Being prepared, go to counter
                        </Text>
                    </View>
                    <Text style={styles.infoNote}>
                        This screen auto-refreshes every 10 seconds
                    </Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: 4,
    },
    subtitle: {
        ...typography.caption,
        color: colors.gray,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    errorText: {
        color: colors.error,
        ...typography.body,
        textAlign: 'center',
    },
    tokenCard: {
        marginBottom: 16,
    },
    tokenHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    tokenNumber: {
        ...typography.h1,
        color: colors.brownie,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    slotName: {
        ...typography.body,
        color: colors.gray,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusIcon: {
        fontSize: 16,
        marginRight: 4,
    },
    statusText: {
        ...typography.small,
        color: colors.white,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: colors.lightGray,
        marginVertical: 12,
    },
    tokenDetails: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        ...typography.caption,
        color: colors.gray,
    },
    detailValue: {
        ...typography.caption,
        color: colors.brownie,
        fontWeight: '600',
    },
    itemsSection: {
        marginTop: 12,
    },
    itemsTitle: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: '600',
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    itemName: {
        ...typography.caption,
        color: colors.gray,
    },
    itemPrice: {
        ...typography.caption,
        color: colors.brownie,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    totalLabel: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: 'bold',
    },
    totalValue: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: 'bold',
    },
    alertBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: colors.info + '20',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.info,
    },
    alertText: {
        ...typography.caption,
        color: colors.brownie,
        fontWeight: '600',
    },
    noDataText: {
        ...typography.body,
        color: colors.gray,
        textAlign: 'center',
        marginBottom: 8,
    },
    noDataSubtext: {
        ...typography.caption,
        color: colors.gray,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    infoCard: {
        marginTop: 8,
        backgroundColor: colors.cream,
    },
    infoTitle: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    infoText: {
        ...typography.caption,
        color: colors.gray,
        flex: 1,
    },
    infoBold: {
        fontWeight: '600',
        color: colors.brownie,
    },
    infoNote: {
        ...typography.small,
        color: colors.gray,
        fontStyle: 'italic',
        marginTop: 8,
    },
});

export default MyTokensScreen;
