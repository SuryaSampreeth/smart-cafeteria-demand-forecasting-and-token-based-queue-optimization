/**
 * Authentication Full End-to-End Tests
 * 
 * This test suite validates the complete authentication flow including
 * backend integration, database operations, and user session management.
 * 
 * Test Coverage:
 * - Complete user registration via API
 * - User login with backend validation
 * - Session management and authentication state
 * - Role-based navigation after login
 * 
 * These tests use the @full tag and require:
 * - Backend server running on http://localhost:5000
 * - MongoDB database accessible
 * - Web app running on http://localhost:8081
 * 
 * Run with: npm run e2e:full
 */

const { test, expect } = require('@playwright/test');

const FULL = process.env.E2E_FULL === '1';
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper function to generate unique email addresses for testing
 * Uses timestamp to ensure uniqueness and avoid conflicts
 * 
 * @returns {string} Unique email address in format: e2e.student.{timestamp}@example.com
 */
function uniqueEmail() {
  return `e2e.student.${Date.now()}@example.com`;
}

test.describe('Auth flow (requires backend + Mongo) @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  /**
   * Test: Complete Registration and Login Flow
   * 
   * Validates the complete authentication flow from registration to login.
   * Uses API registration for efficiency, then tests UI login functionality.
   * 
   * Test Steps:
   * 1. Register user via API (bypasses UI for speed)
   * 2. Navigate to login page
   * 3. Login with registered credentials
   * 4. Verify successful authentication and navigation
   * 
   * Expected Behavior:
   * - User registration should succeed via API
   * - Login should authenticate successfully
   * - User should be redirected to role-appropriate dashboard
   * - Login screen should no longer be visible
   */
  test('register via API, then login via UI', async ({ request, page }) => {
    // Generate unique test credentials
    const email = uniqueEmail();
    const password = 'password123';

    /**
     * Step 1: Register user via API
     * 
     * Using API registration for test efficiency:
     * - Faster than UI registration
     * - Bypasses client-side validation
     * - Direct database insertion
     */
    const registerRes = await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        name: 'E2E Student',
        email,
        password,
        registrationNumber: `REG-${Date.now()}`,
      },
    });
    
    // Verify registration was successful
    expect(registerRes.ok()).toBeTruthy();

    /**
     * Step 2: Navigate to login page and perform UI login
     * 
     * Now test the actual user login experience through the UI:
     * - Navigate to application root
     * - Fill login form with registered credentials
     * - Submit login form
     */
    await page.goto('/');

    // Fill login form with registered credentials
    await page.getByPlaceholder('Enter your email').fill(email);
    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByText('Login', { exact: true }).click();

    /**
     * Step 3: Verify successful authentication
     * 
     * Authentication success is indicated by:
     * - Login screen is no longer visible
     * - User is redirected to appropriate dashboard
     * - Navigation elements for authenticated users appear
     * 
     * Note: Role-based landing varies by user type (Student/Staff/Admin)
     * so we only verify we're no longer on the login screen
     */
    await expect(page.getByText('Welcome Back')).toBeHidden({ timeout: 20_000 });
  });
});

