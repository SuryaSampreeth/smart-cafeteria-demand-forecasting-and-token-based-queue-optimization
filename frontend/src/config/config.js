import Constants from 'expo-constants';

/*
 * App Configuration File
 * ----------------------
 * This file stores global configuration values used across the app.
 * Centralizing config values makes the app easier to maintain
 * and avoids hardcoding URLs in multiple files.
 *
 * API_URL:
 * - Represents the base URL of the backend server.
 * - First tries to read the value from Expo configuration
 *   (app.json or app.config.js under `extra.apiUrl`).
 * - If not found, it falls back to a default localhost URL.
 *
 * This approach helps:
 * - Use different backend URLs for development and production
 * - Avoid changing source code when switching environments
 */
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';

export default {
    API_URL,
};
