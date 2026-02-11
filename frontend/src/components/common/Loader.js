import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';

const Loader = () => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.brownie} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});

export default Loader;
