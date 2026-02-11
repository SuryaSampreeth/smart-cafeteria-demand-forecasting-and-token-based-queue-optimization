import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
    Image,
} from 'react-native';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { menuAPI, bookingAPI } from '../../services/api';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

// Local image mapping to ensure we have a fallback if URL is missing
const foodImages = {
    'idli.jpg': require('../../../assets/images/food/idli.jpg'),
    'dosa.jpg': require('../../../assets/images/food/dosa.jpg'),
    'dal.jpg': require('../../../assets/images/food/dal.jpg'),
    'rice.jpg': require('../../../assets/images/food/rice.jpg'),
    'roti.jpg': require('../../../assets/images/food/roti.jpg'),
    'poha.jpg': require('../../../assets/images/food/poha.jpg'),
    'samosa.jpg': require('../../../assets/images/food/samosa.jpg'),
    'pakora.jpg': require('../../../assets/images/food/pakora.jpg'),
    'sandwich.jpg': require('../../../assets/images/food/sandwich.jpg'),
    'pancake.jpg': require('../../../assets/images/food/pancake.jpg'),
    'paneer_curry.jpg': require('../../../assets/images/food/paneer_curry.jpg'),
    'veg_biryani.jpg': require('../../../assets/images/food/veg_biryani.jpg'),
    'biryani.jpg': require('../../../assets/images/food/biryani.jpg'),
    'chicken_curry.jpg': require('../../../assets/images/food/chicken_curry.jpg'),
    'tea.jpg': require('../../../assets/images/food/tea.jpg'),
    'coffee.jpg': require('../../../assets/images/food/coffee.jpg'),
    'gulab_jamun.jpg': require('../../../assets/images/food/gulab_jamun.jpg'),
    'ice_cream.jpg': require('../../../assets/images/food/ice_cream.jpg'),
};

/**
 * Helper function to safely resolve image sources.
 * Returns a mapped local image if available, otherwise defaults to Idli.
 */
const getImageSource = (imageUrl) => {
    // If it's a local filename, use the mapped image
    if (imageUrl && foodImages[imageUrl]) {
        return foodImages[imageUrl];
    }
    // Fallback to a default image if key not found
    return foodImages['idli.jpg'];
};

/**
 * BookingScreen Component
 * 
 * Handles the complete flow for booking a meal:
 * 1. Step 1: Select a time slot (Breakfast, Lunch, etc.).
 * 2. Step 2: Select menu items for that slot and quantity.
 * 3. Submit the booking (Create or Modify).
 * 
 * It supports both creating a new booking and modifying an existing one (via route params).
 */
const BookingScreen = ({ navigation, route }) => {
    // Extract parameters if modifying an existing booking
    const { modifyMode = false, bookingId, existingSlot, existingItems, tokenNumber } = route?.params || {};

    // State tracks which step of the wizard we are on
    const [step, setStep] = useState(modifyMode ? 2 : 1); // Skip to menu selection if modifying
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Data containers
    const [slots, setSlots] = useState([]);
    const [menuItems, setMenuItems] = useState([]);

    // User selections
    const [selectedSlot, setSelectedSlot] = useState(existingSlot || null);
    const [cart, setCart] = useState({}); // Object map: { itemId: quantity }
    const [error, setError] = useState('');

    // Fetch initial data based on mode
    useEffect(() => {
        // Reset state when route params change to avoid stale data
        setStep(modifyMode ? 2 : 1);
        setSelectedSlot(existingSlot || null);
        setCart({});
        setMenuItems([]);
        setError('');
        setLoading(true);

        if (modifyMode && existingSlot) {
            // If modifying, directly load the menu for the pre-selected slot
            loadMenuForModification();
        } else {
            // If creating new, first load a list of available slots
            fetchSlots();
        }
    }, [modifyMode, bookingId]);

    /**
     * Loads menu items for a specific slot when in 'Modify' mode.
     * Also pre-populates the cart with the items already on the booking.
     */
    const loadMenuForModification = async () => {
        try {
            const response = await menuAPI.getMenuBySlot(existingSlot._id);
            setMenuItems(response.data.menuItems || []);

            // Pre-populate cart with existing booking items
            const initialCart = {};
            existingItems.forEach(item => {
                initialCart[item.menuItemId._id] = item.quantity;
            });
            setCart(initialCart);
        } catch (err) {
            setError('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetches all available and active meal slots from the backend.
     */
    const fetchSlots = async () => {
        try {
            const response = await menuAPI.getAllSlots();
            // Only show slots that are marked as active
            setSlots(response.data.filter(slot => slot.isActive));
        } catch (err) {
            setError('Failed to load slots');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles selection of a slot in Step 1.
     * Fetches the menu for that slot and moves to Step 2.
     */
    const handleSlotSelect = async (slot) => {
        setSelectedSlot(slot);
        setLoading(true);
        setError('');

        try {
            const response = await menuAPI.getMenuBySlot(slot._id);
            setMenuItems(response.data.menuItems || []);
            setStep(2); // Move to next step
        } catch (err) {
            setError('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Updates the quantity of a specific item in the cart.
     * Removes the item if quantity drops to 0.
     */
    const updateQuantity = (itemId, change) => {
        setCart(prev => {
            const current = prev[itemId] || 0;
            const newQty = Math.max(0, current + change);

            // If quantity is 0, remove the key from the object
            if (newQty === 0) {
                const { [itemId]: removed, ...rest } = prev;
                return rest;
            }

            return { ...prev, [itemId]: newQty };
        });
    };

    /**
     * Calculates the total number of items in the cart.
     */
    const getTotalItems = () => {
        return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    };

    /**
     * Calculates the total price of the order.
     */
    const getTotalPrice = () => {
        return Object.entries(cart).reduce((sum, [itemId, qty]) => {
            const item = menuItems.find(i => i._id === itemId);
            return sum + (item ? item.price * qty : 0);
        }, 0);
    };

    /**
     * Submits the booking request (Create or Modify).
     * Validates that the cart is not empty before submitting.
     * Handles platform-specific alerts (Web vs Native).
     */
    const handleConfirmBooking = async () => {
        if (getTotalItems() === 0) {
            const msg = 'Please select at least one item';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Format cart items for API payload
            const items = Object.entries(cart).map(([menuItemId, quantity]) => ({
                menuItemId,
                quantity,
            }));

            if (modifyMode) {
                // Update existing booking
                await bookingAPI.modify(bookingId, {
                    slotId: selectedSlot._id,
                    items,
                });

                // Success Message handling
                const successMsg = `Success! 🎉\n\nYour booking (${tokenNumber}) has been updated!`;

                if (Platform.OS === 'web') {
                    if (window.confirm(`${successMsg} Click OK to view your tokens.`)) {
                        navigation.navigate('MyTokensScreen');
                    } else {
                        navigation.navigate('Profile');
                    }
                } else {
                    Alert.alert('Success! 🎉', successMsg, [
                        { text: 'View Tokens', onPress: () => navigation.navigate('MyTokensScreen') },
                        { text: 'OK', onPress: () => navigation.navigate('Profile') },
                    ]);
                }
            } else {
                // Create new booking
                await bookingAPI.create({
                    slotId: selectedSlot._id,
                    items,
                });

                const successMsg = 'Success! 🎉\n\nYour booking has been confirmed! Click OK to view your tokens.';

                if (Platform.OS === 'web') {
                    if (window.confirm(successMsg)) {
                        navigation.navigate('MyTokensScreen');
                    } else {
                        navigation.goBack();
                    }
                } else {
                    Alert.alert('Success! 🎉', 'Your booking has been confirmed!', [
                        { text: 'View Tokens', onPress: () => navigation.navigate('MyTokensScreen') },
                        { text: 'OK', onPress: () => navigation.goBack() },
                    ]);
                }
            }
        } catch (err) {
            console.error('Booking Error:', err);
            let msg = err.response?.data?.message;

            // Fallback error message generation
            if (!msg) {
                if (err.response) {
                    msg = `Server Error (${err.response.status})`;
                } else if (err.request) {
                    msg = 'Network Error - No response received';
                } else {
                    msg = err.message || `Failed to ${modifyMode ? 'update' : 'create'} booking`;
                }
            }

            setError(msg);
            Platform.OS === 'web' ? window.alert('Error: ' + msg) : Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.brownie} />
            </View>
        );
    }

    // Step 1: Select Slot UI
    if (step === 1) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select Meal Slot</Text>
                    <Text style={styles.subtitle}>Choose when you want to eat</Text>
                </View>

                <ScrollView style={styles.content}>
                    {error ? (
                        <Card>
                            <Text style={styles.errorText}>{error}</Text>
                        </Card>
                    ) : null}

                    {slots.map((slot) => (
                        <TouchableOpacity
                            key={slot._id}
                            style={styles.slotCard}
                            onPress={() => handleSlotSelect(slot)}
                        >
                            <View style={styles.slotHeader}>
                                <Text style={styles.slotName}>{slot.name}</Text>
                                <Text style={styles.slotTime}>
                                    {slot.startTime} - {slot.endTime}
                                </Text>
                            </View>
                            <View style={styles.slotFooter}>
                                <Text style={styles.slotCapacity}>
                                    {slot.currentBookings}/{slot.capacity} booked
                                </Text>
                                <Text style={styles.slotArrow}>›</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    }

    // Step 2: Select Menu Items UI
    if (step === 2) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => modifyMode ? navigation.navigate('Profile') : setStep(1)} style={styles.backButton}>
                        <Text style={styles.backText}>‹ Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{modifyMode ? `Modify Booking (${tokenNumber})` : 'Select Items'}</Text>
                    <Text style={styles.subtitle}>{selectedSlot.name}</Text>
                </View>

                <ScrollView style={styles.content}>
                    {menuItems.length > 0 ? (
                        menuItems.map((item) => (
                            <Card key={item._id} style={styles.menuCard}>
                                <View style={styles.menuInfo}>
                                    {/* Food Image */}
                                    <Image
                                        source={getImageSource(item.imageUrl)}
                                        style={styles.foodImage}
                                        resizeMode="cover"
                                    />

                                    <View style={styles.menuDetails}>
                                        <Text style={styles.menuName}>{item.name}</Text>
                                        <Text style={styles.menuDescription}>{item.description}</Text>
                                        <View style={styles.menuMeta}>
                                            <View
                                                style={[
                                                    styles.categoryBadge,
                                                    { backgroundColor: getCategoryColor(item.category) },
                                                ]}
                                            >
                                                <Text style={styles.categoryText}>{item.category}</Text>
                                            </View>
                                            <Text style={styles.menuPrice}>₹{item.price}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.quantityControl}>
                                        {/* Quantity Stepper */}
                                        {cart[item._id] > 0 ? (
                                            <>
                                                <TouchableOpacity
                                                    style={styles.quantityButton}
                                                    onPress={() => updateQuantity(item._id, -1)}
                                                >
                                                    <Text style={styles.quantityButtonText}>−</Text>
                                                </TouchableOpacity>
                                                <Text style={styles.quantityText}>{cart[item._id]}</Text>
                                                <TouchableOpacity
                                                    style={styles.quantityButton}
                                                    onPress={() => updateQuantity(item._id, 1)}
                                                >
                                                    <Text style={styles.quantityButtonText}>+</Text>
                                                </TouchableOpacity>
                                            </>
                                        ) : (
                                            /* Add Button */
                                            <TouchableOpacity
                                                style={styles.addButton}
                                                onPress={() => updateQuantity(item._id, 1)}
                                            >
                                                <Text style={styles.addButtonText}>Add</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <Text style={styles.noDataText}>No menu items available for this slot</Text>
                        </Card>
                    )}
                </ScrollView>

                {/* Footer with Total and Confirm Button */}
                {getTotalItems() > 0 && (
                    <View style={styles.footer}>
                        <View style={styles.footerInfo}>
                            <Text style={styles.footerText}>{getTotalItems()} items</Text>
                            <Text style={styles.footerPrice}>₹{getTotalPrice()}</Text>
                        </View>
                        <Button
                            title={modifyMode ? "Update Booking" : "Confirm Booking"}
                            onPress={handleConfirmBooking}
                            loading={submitting}
                        />
                    </View>
                )}
            </View>
        );
    }

    return null;
};

/**
 * Returns color code based on food category
 */
const getCategoryColor = (category) => {
    switch (category) {
        case 'veg':
            return colors.success;
        case 'non-veg':
            return colors.error;
        case 'beverage':
            return colors.info;
        case 'dessert':
            return colors.warning;
        default:
            return colors.gray;
    }
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
    backButton: {
        marginBottom: 8,
    },
    backText: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: '600',
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
    slotCard: {
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
    slotHeader: {
        marginBottom: 12,
    },
    slotName: {
        ...typography.h3,
        color: colors.brownie,
        marginBottom: 4,
    },
    slotTime: {
        ...typography.body,
        color: colors.gray,
    },
    slotFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    slotCapacity: {
        ...typography.caption,
        color: colors.gray,
    },
    slotArrow: {
        ...typography.h2,
        color: colors.brownieLight,
    },
    menuCard: {
        marginBottom: 12,
    },
    menuInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    foodImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: colors.lightGray,
    },
    menuDetails: {
        flex: 1,
        marginRight: 8,
    },
    menuName: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: '600',
        marginBottom: 4,
    },
    menuDescription: {
        ...typography.caption,
        color: colors.gray,
        marginBottom: 8,
    },
    menuMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 12,
    },
    categoryText: {
        ...typography.small,
        color: colors.white,
        fontWeight: '600',
    },
    menuPrice: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: 'bold',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.brownie,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityText: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: 'bold',
        marginHorizontal: 12,
        minWidth: 24,
        textAlign: 'center',
    },
    addButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.brownie,
    },
    addButtonText: {
        color: colors.white,
        ...typography.button,
    },
    footer: {
        backgroundColor: colors.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    footerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    footerText: {
        ...typography.body,
        color: colors.gray,
    },
    footerPrice: {
        ...typography.h3,
        color: colors.brownie,
        fontWeight: 'bold',
    },
    noDataText: {
        ...typography.body,
        color: colors.gray,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default BookingScreen;
