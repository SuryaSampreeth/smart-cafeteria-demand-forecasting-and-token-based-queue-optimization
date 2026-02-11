import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const Button = ({ title, onPress, variant = 'primary', disabled = false, loading = false, style }) => {
    const buttonStyle = [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'outline' && styles.buttonOutline,
        disabled && styles.buttonDisabled,
        style,
    ];

    const textStyle = [
        styles.buttonText,
        variant === 'secondary' && styles.buttonTextSecondary,
        variant === 'outline' && styles.buttonTextOutline,
        disabled && styles.buttonTextDisabled,
    ];

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.brownie : colors.cream} />
            ) : (
                <Text style={textStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.brownie,
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    buttonSecondary: {
        backgroundColor: colors.brownieLight,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.brownie,
    },
    buttonDisabled: {
        backgroundColor: colors.gray,
        opacity: 0.6,
    },
    buttonText: {
        color: colors.cream,
        ...typography.button,
    },
    buttonTextSecondary: {
        color: colors.cream,
    },
    buttonTextOutline: {
        color: colors.brownie,
    },
    buttonTextDisabled: {
        color: colors.lightGray,
    },
});

export default Button;
