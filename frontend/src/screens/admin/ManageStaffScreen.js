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
import { adminAPI } from '../../services/api';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

/*
 * ManageStaffScreen
 * -----------------
 * This screen allows administrators to manage the cafeteria staff.
 * Key Features:
 * 1. View all registered staff members.
 * 2. Register new staff members (Name, Email, Password).
 * 3. Delete existing staff profiles.
 * 4. Input validation for the registration form.
 */
const ManageStaffScreen = () => {
    // Data Loading State
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Staff Data State
    const [staff, setStaff] = useState([]);

    // Form Visibility State (Toggles the registration form)
    const [showForm, setShowForm] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    // Error & Submission Handling
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    /**
     * Initial fetch of staff list on component mount.
     */
    useEffect(() => {
        fetchStaff();
    }, []);

    /**
     * Calls backend API to get all users with 'staff' role.
     */
    const fetchStaff = async () => {
        try {
            setError('');
            const response = await adminAPI.getAllStaff();
            setStaff(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load staff');
            console.error('Error fetching staff:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStaff();
    };

    /**
     * Validates input and submits new staff registration.
     */
    const handleRegister = async () => {
        // 1. Basic Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        // 2. Password Length Check (Security best practice)
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // 3. API Call to register
            await adminAPI.registerStaff(formData);

            // 4. Reset form and refresh list on success
            setFormData({ name: '', email: '', password: '' });
            setShowForm(false);
            Alert.alert('Success', 'Staff member registered successfully');
            fetchStaff();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register staff');
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Deletes a staff member after confirmation.
     * Uses an alert dialog to prevent accidental deletions.
     */
    const handleDelete = (staffId, staffName) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete ${staffName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive', // Highlights button in red on iOS
                    onPress: async () => {
                        try {
                            await adminAPI.deleteStaff(staffId);
                            Alert.alert('Success', 'Staff member deleted');
                            fetchStaff();
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to delete staff');
                        }
                    },
                },
            ]
        );
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
                <Text style={styles.title}>Manage Staff</Text>

                {/* Toggle Button for Registration Form */}
                <Button
                    title={showForm ? 'Cancel' : '+ Register New Staff'}
                    onPress={() => {
                        setShowForm(!showForm);
                        setError('');
                        setFormData({ name: '', email: '', password: '' });
                    }}
                    variant={showForm ? 'outline' : 'primary'}
                    style={styles.toggleButton}
                />

                {/* Conditional Rendering: Registration Form */}
                {showForm && (
                    <Card style={styles.formCard}>
                        <Text style={styles.formTitle}>Register Staff Member</Text>

                        <ErrorMessage message={error} />

                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter staff name"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            autoCapitalize="words"
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter password (min 6 characters)"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            secureTextEntry={true} // Hides text for security
                            autoCapitalize="none"
                        />

                        <Button
                            title="Register Staff"
                            onPress={handleRegister}
                            loading={submitting}
                            style={styles.submitButton}
                        />
                    </Card>
                )}

                {/* Staff List Section */}
                <Text style={styles.sectionTitle}>Staff Members ({staff.length})</Text>

                {staff.length > 0 ? (
                    staff.map((member) => (
                        <Card key={member._id} style={styles.staffCard}>
                            <View style={styles.staffInfo}>
                                <View style={styles.staffDetails}>
                                    <Text style={styles.staffName}>{member.name}</Text>
                                    <Text style={styles.staffEmail}>{member.email}</Text>
                                </View>
                                {/* Delete Action */}
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(member._id, member.name)}
                                >
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <Text style={styles.noDataText}>No staff members registered</Text>
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
    submitButton: {
        marginTop: 8,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.brownie,
        marginBottom: 12,
    },
    staffCard: {
        marginBottom: 12,
    },
    staffInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    staffDetails: {
        flex: 1,
    },
    staffName: {
        ...typography.body,
        color: colors.brownie,
        fontWeight: '600',
        marginBottom: 4,
    },
    staffEmail: {
        ...typography.caption,
        color: colors.gray,
    },
    deleteButton: {
        backgroundColor: colors.error,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    deleteButtonText: {
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

export default ManageStaffScreen;
