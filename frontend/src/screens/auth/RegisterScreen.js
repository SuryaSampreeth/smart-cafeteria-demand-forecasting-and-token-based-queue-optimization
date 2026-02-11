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

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register } = useAuth();

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword || !registrationNumber) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        const result = await register(name, email, password, registrationNumber);

        if (!result.success) {
            setError(result.error);
            setLoading(false);
        }
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
                        autoCapitalize="characters"
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
