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

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (!result.success) {
            setError(result.error);
            setLoading(false);
        }
        // Navigation is handled by AppNavigator based on auth state
    };

    return (
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
                    <ErrorMessage message={error} />

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

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Button
                        title="Login"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />

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
