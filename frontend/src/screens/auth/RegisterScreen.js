import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

/*
 * RegisterScreen
 * --------------
 * Handles the registration of new student accounts.
 * Note: Staff registration is handled separately by admins (see ManageStaffScreen.js)
 * to prevent unauthorized staff access.
 * 
 * Logic Flow:
 * 1. Capture user details (Name, Email, Reg. Number, Password).
 * 2. Validate inputs client-side (e.g., matching passwords).
 * 3. Send data to backend via AuthContext.
 */
const RegisterScreen = ({ navigation }) => {
    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');

    // UI Feedback State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register } = useAuth();

    /**
     * core registration Logic.
     * Performs sequential checks before making the API call.
     */
    const handleRegister = async () => {
        // 1. Check for empty fields
        if (!name || !email || !password || !confirmPassword || !registrationNumber) {
            setError('Please fill in all fields');
            return;
        }

        // 2. Validate password match (common UX requirement)
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // 3. Check password strength (minimum length)
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        // 4. API Call
        const result = await register(name, email, password, registrationNumber);

        if (!result.success) {
            setError(result.error);
            setLoading(false);
        }
        // Success case is handled globally by AuthContext + AppNavigator
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Student Registration</Text>
                    <Text style={styles.subtitle}>Create your account</Text>
                </View>

                <View style={styles.form}>
                    <ErrorMessage message={error} />

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>Registration Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your registration number"
                        value={registrationNumber}
                        onChangeText={setRegistrationNumber}
                        autoCapitalize="characters" // Registrations nums are usually auto-capped
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password (min 6 characters)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Button
                        title="Register"
                        onPress={handleRegister}
                        loading={loading}
                        style={styles.registerButton}
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        style={styles.loginLink}
                    >
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginTextBold}>Login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        ...typography.h1,
        color: colors.brownie,
        marginBottom: 8,
    },
    subtitle: {
        ...typography.body,
        color: colors.gray,
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
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
    registerButton: {
        marginTop: 8,
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        ...typography.body,
        color: colors.gray,
    },
    loginTextBold: {
        color: colors.brownie,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
