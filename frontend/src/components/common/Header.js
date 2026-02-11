import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

/*
 * This component is used as the top header of the screen.
 * It shows the page title and an optional logout button.
 * Spacing is adjusted based on the platform (Android, iOS, Web).
 */
const Header = ({ title, onLogout, showLogout = false }) => {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {/* Show logout button only when enabled */}
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
        // Add extra padding for status bar on mobile devices
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // Adjust for web platform
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
