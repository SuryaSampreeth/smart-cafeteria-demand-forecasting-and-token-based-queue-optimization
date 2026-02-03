import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Student Screens (placeholders - will be created)
import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import BookingScreen from '../screens/student/BookingScreen';
import MyTokensScreen from '../screens/student/MyTokensScreen';
import ProfileScreen from '../screens/student/ProfileScreen';

// Staff Screens (placeholders)
import StaffHomeScreen from '../screens/staff/StaffHomeScreen';
import QueueManagementScreen from '../screens/staff/QueueManagementScreen';

// Admin Screens (placeholders)
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import ManageStaffScreen from '../screens/admin/ManageStaffScreen';
import ManageMenuScreen from '../screens/admin/ManageMenuScreen';

import { colors } from '../styles/colors';
import { USER_ROLES } from '../utils/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

// Student Tab Navigator
const StudentTabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.brownie,
            tabBarInactiveTintColor: colors.gray,
            tabBarStyle: {
                backgroundColor: colors.cream,
                borderTopColor: colors.brownieLight,
            },
        }}
    >
        <Tab.Screen name="Home" component={StudentHomeScreen} />
        <Tab.Screen name="Book Meal" component={BookingScreen} />
        <Tab.Screen name="My Tokens" component={MyTokensScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
);

// Staff Tab Navigator
const StaffTabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.brownie,
            tabBarInactiveTintColor: colors.gray,
            tabBarStyle: {
                backgroundColor: colors.cream,
                borderTopColor: colors.brownieLight,
            },
        }}
    >
        <Tab.Screen name="Dashboard" component={StaffHomeScreen} />
        <Tab.Screen name="Queue" component={QueueManagementScreen} />
    </Tab.Navigator>
);

// Admin Tab Navigator
const AdminTabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.brownie,
            tabBarInactiveTintColor: colors.gray,
            tabBarStyle: {
                backgroundColor: colors.cream,
                borderTopColor: colors.brownieLight,
            },
        }}
    >
        <Tab.Screen name="Dashboard" component={AdminHomeScreen} />
        <Tab.Screen name="Manage Staff" component={ManageStaffScreen} />
        <Tab.Screen name="Manage Menu" component={ManageMenuScreen} />
    </Tab.Navigator>
);

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (!user) {
        return (
            <NavigationContainer>
                <AuthStack />
            </NavigationContainer>
        );
    }

    // Route based on user role
    let MainComponent;
    switch (user.role) {
        case USER_ROLES.STUDENT:
            MainComponent = StudentTabs;
            break;
        case USER_ROLES.STAFF:
            MainComponent = StaffTabs;
            break;
        case USER_ROLES.ADMIN:
            MainComponent = AdminTabs;
            break;
        default:
            MainComponent = AuthStack;
    }

    return (
        <NavigationContainer>
            <MainComponent />
        </NavigationContainer>
    );
};

export default AppNavigator;
