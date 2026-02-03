import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import config from '../config/config';

const API_URL = config.API_URL;

// Storage helper that works on both web and mobile
const getToken = async () => {
    if (Platform.OS === 'web') {
        return localStorage.getItem('token');
    }
    return await SecureStore.getItemAsync('token');
};

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Booking API
export const bookingAPI = {
    create: (data) => api.post('/bookings', data),
    getMyTokens: () => api.get('/bookings/my-tokens'),
    getAllMyBookings: () => api.get('/bookings/all'),
    getMyBookings: () => api.get('/bookings/all'), // Alias for getAllMyBookings
    getBooking: (id) => api.get(`/bookings/${id}`),
    modify: (id, data) => api.put(`/bookings/${id}`, data),
    cancel: (id) => api.delete(`/bookings/${id}`),
};

// Staff API
export const staffAPI = {
    getQueue: (slotId) => api.get(`/staff/queue/${slotId}`),
    callNext: (slotId) => api.post(`/staff/call-next/${slotId}`),
    markServing: (bookingId) => api.put(`/staff/mark-serving/${bookingId}`),
    markServed: (bookingId) => api.put(`/staff/mark-served/${bookingId}`),
};

// Admin API
export const adminAPI = {
    registerStaff: (data) => api.post('/admin/staff', data),
    getAllStaff: () => api.get('/admin/staff'),
    deleteStaff: (id) => api.delete(`/admin/staff/${id}`),
    getAnalytics: () => api.get('/admin/analytics'),
    getSlotWiseData: () => api.get('/admin/analytics/slot-wise'),
    getStaffPerformance: () => api.get('/admin/analytics/staff-performance'),
};

// Menu API
export const menuAPI = {
    getAllSlots: () => api.get('/menu/slots'),
    createSlot: (data) => api.post('/menu/slots', data),
    updateSlot: (id, data) => api.put(`/menu/slots/${id}`, data),
    getAllMenuItems: () => api.get('/menu/items'),
    addMenuItem: (data) => api.post('/menu/items', data),
    updateMenuItem: (id, data) => api.put(`/menu/items/${id}`, data),
    deleteMenuItem: (id) => api.delete(`/menu/items/${id}`),
    getMenuForSlot: (slotId) => api.get(`/menu/slot/${slotId}`),
    getMenuBySlot: (slotId) => api.get(`/menu/slot/${slotId}`), // Alias for getMenuForSlot
    assignMenuToSlot: (slotId, data) => api.post(`/menu/slot/${slotId}`, data),
};

export default api;
