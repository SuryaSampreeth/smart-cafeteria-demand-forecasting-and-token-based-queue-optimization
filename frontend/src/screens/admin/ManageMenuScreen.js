import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import { menuAPI } from '../../services/api';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const ManageMenuScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [slots, setSlots] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'veg',
        price: '',
        imageUrl: '',
    });
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMenuItems();
        fetchSlots();
    }, []);

    const fetchMenuItems = async () => {
        try {
            setError('');
            const response = await menuAPI.getAllMenuItems();
            setMenuItems(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load menu items');
            console.error('Error fetching menu items:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchSlots = async () => {
        try {
            const response = await menuAPI.getAllSlots();
            setSlots(response.data);
        } catch (err) {
            console.error('Error fetching slots:', err);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchMenuItems();
    };

    const handleAddItem = async () => {
        if (!formData.name || !formData.description || !formData.price) {
            setError('Please fill in all required fields');
            return;
        }

        if (selectedSlots.length === 0) {
            setError('Please select at least one slot');
            return;
        }

        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) {
            setError('Please enter a valid price');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // First, create the menu item
            const itemResponse = await menuAPI.addMenuItem({
                ...formData,
                price,
                imageUrl: formData.imageUrl || 'https://via.placeholder.com/150?text=' + formData.name,
            });

            const newItemId = itemResponse.data._id;

            // Then, assign it to all selected slots
            for (const slotId of selectedSlots) {
                // Fetch existing menu for this slot
                const menuResponse = await menuAPI.getMenuBySlot(slotId);
                const existingItemIds = menuResponse.data.menuItems?.map(item => item._id) || [];

                // Add new item to the list (avoid duplicates)
                if (!existingItemIds.includes(newItemId)) {
                    existingItemIds.push(newItemId);
                }

                // Update the menu for this slot
                await menuAPI.assignMenuToSlot(slotId, { menuItems: existingItemIds });
            }

            setFormData({
                name: '',
                description: '',
                category: 'veg',
                price: '',
                imageUrl: '',
            });
            setSelectedSlots([]);
            setShowForm(false);
            Alert.alert('Success', 'Menu item added and assigned to selected slots');
            fetchMenuItems();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add menu item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (itemId, itemName) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete ${itemName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await menuAPI.deleteMenuItem(itemId);
                            Alert.alert('Success', 'Menu item deleted');
                            fetchMenuItems();
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to delete menu item');
                        }
                    },
                },
            ]
        );
    };

    const toggleSlotSelection = (slotId) => {
        setSelectedSlots(prev => {
            if (prev.includes(slotId)) {
                return prev.filter(id => id !== slotId);
            } else {
                return [...prev, slotId];
            }
        });
    };

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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.brownie} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brownie]} />
                }
            >
                <Text style={styles.title}>Manage Menu</Text>

                <Button
                    title={showForm ? 'Cancel' : '+ Add New Menu Item'}
                    onPress={() => {
                        setShowForm(!showForm);
                        setError('');
                        setFormData({
                            name: '',
                            description: '',
                            category: 'veg',
                            price: '',
                            imageUrl: '',
                        });
                        setSelectedSlots([]);
                    }}
                    variant={showForm ? 'outline' : 'primary'}
                    style={styles.toggleButton}
                />

                {showForm && (
                    <Card style={styles.formCard}>
                        <Text style={styles.formTitle}>Add Menu Item</Text>

                        <ErrorMessage message={error} />

                        <Text style={styles.label}>Item Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Masala Dosa"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            autoCapitalize="words"
                        />

                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Brief description"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={2}
                        />

                        <Text style={styles.label}>Category *</Text>
                        <View style={styles.categoryContainer}>
                            {['veg', 'non-veg', 'beverage', 'dessert'].map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryButton,
                                        formData.category === cat && styles.categoryButtonActive,
                                    ]}
                                    onPress={() => setFormData({ ...formData, category: cat })}
                                >
                                    <Text
                                        style={[
                                            styles.categoryButtonText,
                                            formData.category === cat && styles.categoryButtonTextActive,
                                        ]}
                                    >
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Price (₹) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 50"
                            value={formData.price}
                            onChangeText={(text) => setFormData({ ...formData, price: text })}
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Image URL (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="https://example.com/image.jpg"
                            value={formData.imageUrl}
                            onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Text style={styles.label}>Available in Slots *</Text>
                        <View style={styles.slotsContainer}>
                            {slots.map((slot) => (
                                <TouchableOpacity
                                    key={slot._id}
                                    style={styles.slotCheckbox}
                                    onPress={() => toggleSlotSelection(slot._id)}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        selectedSlots.includes(slot._id) && styles.checkboxChecked
                                    ]}>
                                        {selectedSlots.includes(slot._id) && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </View>
                                    <Text style={styles.slotLabel}>{slot.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Button
                            title="Add Menu Item"
                            onPress={handleAddItem}
                            loading={submitting}
                            style={styles.submitButton}
                        />
                    </Card>
                )}

                <Text style={styles.sectionTitle}>Menu Items ({menuItems.length})</Text>

                {menuItems.length > 0 ? (
                    menuItems.map((item) => (
                        <Card key={item._id} style={styles.menuCard}>
                            <View style={styles.menuInfo}>
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
                                            <Text style={styles.categoryBadgeText}>{item.category}</Text>
                                        </View>
                                        <Text style={styles.menuPrice}>₹{item.price}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(item._id, item.name)}
                                >
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <Text style={styles.noDataText}>No menu items available</Text>
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
    title: {
        ...typography.h2,
        color: colors.brownie,
        marginBottom: 16,
    },
    toggleButton: {
        marginBottom: 16,
    },
    formCard: {
        marginBottom: 20,
    },
    formTitle: {
        ...typography.h3,
        color: colors.brownie,
        marginBottom: 16,
    },
    label: {
        ...typography.body,
        color: colors.brownie,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.brownieLight,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.brownieLight,
        marginRight: 8,
        marginBottom: 8,
    },
    categoryButtonActive: {
        backgroundColor: colors.brownie,
        borderColor: colors.brownie,
    },
    categoryButtonText: {
        ...typography.caption,
        color: colors.brownie,
    },
    categoryButtonTextActive: {
        color: colors.cream,
    },
    submitButton: {
        marginTop: 8,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.brownie,
        marginBottom: 12,
    },
    menuCard: {
        marginBottom: 12,
    },
    menuInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    menuDetails: {
        flex: 1,
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
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 12,
    },
    categoryBadgeText: {
        ...typography.small,
        color: colors.white,
        fontWeight: '600',
    },
    menuPrice: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: colors.error,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginLeft: 8,
    },
    deleteButtonText: {
        color: colors.white,
        ...typography.caption,
        fontWeight: '600',
    },
    slotsContainer: {
        marginBottom: 16,
    },
    slotCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: colors.brownieLight,
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
    checkboxChecked: {
        backgroundColor: colors.brownie,
        borderColor: colors.brownie,
    },
    checkmark: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    slotLabel: {
        ...typography.body,
        color: colors.brownie,
    },
    noDataText: {
        ...typography.body,
        color: colors.gray,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default ManageMenuScreen;
