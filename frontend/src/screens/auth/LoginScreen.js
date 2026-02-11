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
 * LoginScreen
 * -----------
 * This screen handles user authentication.
 * It's the entry point for existing users (students, staff, admin).
 * 
 * Key Features:
 * 1. Simple form with Email & Password inputs.
 * 2. Integration with AuthContext to managing global session state.
 * 3. Input validation to prevent empty submissions.
 * 4. User-friendly error messages if login fails.
 */
const LoginScreen = ({ navigation }) => {
    // Local state for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // UI state for loading indicator and error display
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Accessing the global 'login' function from our Auth Context
    const { login } = useAuth();

    /**
     * Handles the login logic.
     * 1. Validates inputs.
     * 2. Calls the backend API via AuthContext.
     * 3. Navigation is handled automatically by AppNavigator based on the 'user' state update.
     */
    const handleLogin = async () => {
        // Validation: Ensure fields aren't empty
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        // Attempt login
        const result = await login(email, password);

        if (!result.success) {
            // If login fails, show the error message from backend
            setError(result.error);
            setLoading(false);
        }
        // If success, 'user' state in AuthContext changes to a valid object,
        // causing AppNavigator to switch from AuthStack to the Main Tab Navigator.
    };

    return (
        /* 
         * KeyboardAvoidingView:
         * Essential for form screens. It pushes the content up when the 
         * virtual keyboard opens, so the input fields aren't hidden.
         */
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Smart Cafeteria</Text>
                    <Text style={styles.subtitle}>Login to your account</Text>
                </View>

                <View style={styles.form}>
                    {/* Reusable ErrorMessage component for consistent styling */}
                    <ErrorMessage message={error} />

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none" // Important for emails
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry // Hides characters
                        autoCapitalize="none"
                    />

                    {/* Custom Button component that handles loading state internally */}
                    <Button
                        title="Login"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />

                    {/* Navigation Link to Registration Screen */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Register')}
                        style={styles.registerLink}
                    >
                        <Text style={styles.registerText}>
                            Don't have an account? <Text style={styles.registerTextBold}>Register</Text>
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
        marginBottom: 40,
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
    loginButton: {
        marginTop: 8,
    },
    registerLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    registerText: {
        ...typography.body,
        color: colors.gray,
    },
    registerTextBold: {
        color: colors.brownie,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
