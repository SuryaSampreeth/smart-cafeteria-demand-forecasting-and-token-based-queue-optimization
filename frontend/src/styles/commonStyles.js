import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.cream,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: colors.brownie,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.brownieLight,
    },
    button: {
        backgroundColor: colors.brownie,
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: colors.cream,
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.brownieLight,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    inputFocused: {
        borderColor: colors.brownie,
        borderWidth: 2,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.white,
    },
});
