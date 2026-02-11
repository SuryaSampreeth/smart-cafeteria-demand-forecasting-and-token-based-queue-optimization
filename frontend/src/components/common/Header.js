import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const Header = ({ title, onLogout, showLogout = false }) => {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {showLogout && (
                <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: colors.brownie,
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...Platform.select({
            web: {
                paddingTop: 16,
            },
        }),
    },
    title: {
        color: colors.cream,
        ...typography.h2,
    },
    logoutButton: {
        backgroundColor: colors.error,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    logoutText: {
        color: colors.white,
        ...typography.button,
    },
});

export default Header;
