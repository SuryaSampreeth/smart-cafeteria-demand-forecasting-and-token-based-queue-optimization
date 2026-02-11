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
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../services/api';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { BOOKING_STATUS } from '../../utils/constants';

const ProfileScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState('all'); // all, active, completed
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setError('');
            const response = await bookingAPI.getMyBookings();
            // Sort by date descending (newest first)
            const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBookings(sorted);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load bookings');
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleCancelBooking = async (bookingId, tokenNumber) => {
        const confirmMessage = `Are you sure you want to cancel token ${tokenNumber}?`;

        if (Platform.OS === 'web') {
            if (window.confirm(confirmMessage)) {
                try {
                    await bookingAPI.cancel(bookingId);
                    window.alert('Success! Booking cancelled successfully');
                    fetchBookings();
                } catch (err) {
                    window.alert('Error: ' + (err.response?.data?.message || 'Failed to cancel booking'));
                }
            }
        } else {
            Alert.alert(
                'Cancel Booking',
                confirmMessage,
                [
                    { text: 'No', style: 'cancel' },
                    {
                        text: 'Yes, Cancel',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await bookingAPI.cancel(bookingId);
                                Alert.alert('Success', 'Booking cancelled successfully');
                                fetchBookings();
                            } catch (err) {
                                Alert.alert('Error', err.response?.data?.message || 'Failed to cancel booking');
                            }
                        },
                    },
                ]
            );
        }
    };

    const handleModifyBooking = (booking) => {
        navigation.navigate('Book Meal', {
            modifyMode: true,
            bookingId: booking._id,
            existingSlot: booking.slotId,
            existingItems: booking.items,
            tokenNumber: booking.tokenNumber,
        });
    };

    const getFilteredBookings = () => {
        switch (filter) {
            case 'active':
                return bookings.filter(
                    (b) => b.status !== BOOKING_STATUS.SERVED && b.status !== BOOKING_STATUS.CANCELLED
                );
            case 'completed':
                return bookings.filter(
                    (b) => b.status === BOOKING_STATUS.SERVED || b.status === BOOKING_STATUS.CANCELLED
                );
            default:
                return bookings;
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
            case BOOKING_STATUS.CANCELLED:
                return colors.error;
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

    const filteredBookings = getFilteredBookings();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    {user?.registrationNumber && (
                        <Text style={styles.userReg}>Reg: {user.registrationNumber}</Text>
                    )}
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        All ({bookings.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
                    onPress={() => setFilter('active')}
                >
                    <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
                        Active
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
                    onPress={() => setFilter('completed')}
                >
                    <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
                        Completed
                    </Text>
                </TouchableOpacity>
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

                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <Card key={booking._id} style={styles.bookingCard}>
                            <View style={styles.bookingHeader}>
                                <View>
                                    <Text style={styles.tokenNumber}>{booking.tokenNumber}</Text>
                                    <Text style={styles.slotName}>{booking.slotId.name}</Text>
                                    <Text style={styles.bookingDate}>
                                        {new Date(booking.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                        {' at '}
                                        {new Date(booking.createdAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(booking.status) },
                                    ]}
                                >
                                    <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.itemsSection}>
                                {booking.items.map((item, index) => (
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
                                        {booking.items.reduce(
                                            (sum, item) => sum + item.menuItemId.price * item.quantity,
                                            0
                                        )}
                                    </Text>
                                </View>
                            </View>

                            {booking.status === BOOKING_STATUS.PENDING && (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.modifyButton}
                                        onPress={() => handleModifyBooking(booking)}
                                    >
                                        <Text style={styles.modifyButtonText}>Modify Booking</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => handleCancelBooking(booking._id, booking.tokenNumber)}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </Card>
                    ))
                ) : (
                    <Card>
                        <Text style={styles.noDataText}>
                            {filter === 'all' && 'No bookings yet'}
                            {filter === 'active' && 'No active bookings'}
                            {filter === 'completed' && 'No completed bookings'}
                        </Text>
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
        marginBottom: 12,
    },
    userInfo: {
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 8,
    },
    userName: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: '600',
        marginBottom: 4,
    },
    userEmail: {
        ...typography.caption,
        color: colors.gray,
        marginBottom: 2,
    },
    userReg: {
        ...typography.small,
        color: colors.gray,
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    filterTabActive: {
        borderBottomColor: colors.brownie,
    },
    filterText: {
        ...typography.caption,
        color: colors.gray,
    },
    filterTextActive: {
        color: colors.brownie,
        fontWeight: '600',
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
    bookingCard: {
        marginBottom: 12,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tokenNumber: {
        ...typography.h3,
        color: colors.brownie,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    slotName: {
        ...typography.caption,
        color: colors.gray,
        marginBottom: 2,
    },
    bookingDate: {
        ...typography.small,
        color: colors.gray,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
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
    itemsSection: {
        marginBottom: 12,
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
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    modifyButton: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: colors.brownie,
        borderRadius: 8,
        alignItems: 'center',
    },
    modifyButtonText: {
        color: colors.white,
        ...typography.button,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: colors.error,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
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

export default ProfileScreen;
