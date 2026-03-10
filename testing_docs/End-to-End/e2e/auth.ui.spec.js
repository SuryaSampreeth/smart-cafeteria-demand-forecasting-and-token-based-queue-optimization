/**
 * Authentication UI Component Tests
 * 
 * This test suite validates the user interface and basic functionality of the
 * authentication screens without requiring backend connectivity.
 * 
 * Test Coverage:
 * - Login form validation and error handling
 * - Registration form validation and navigation
 * - Password confirmation validation
 * - UI element visibility and accessibility
 * 
 * These tests use the @ui tag and can be run independently of the backend
 * using: npm run e2e:ui
 * 
 * Test Environment:
 * - Web app running on http://localhost:8081
 * - No backend connectivity required
 * - Tests UI components and client-side validation only
 */

const { test, expect } = require('@playwright/test');

test.describe('Auth screens (UI smoke) @ui', () => {
  /**
   * Test: Login Form Validation - Empty Fields
   * 
   * Validates that the login form shows appropriate validation errors
   * when submitted with empty fields.
   * 
   * Expected Behavior:
   * - Form should not submit with empty fields
   * - Validation error message should be displayed
   * - User remains on login screen
   */
  test('login shows validation error for empty submit', async ({ page }) => {
    // Navigate to the application root (login page)
    await page.goto('/');

    // Verify we're on the login screen
    await expect(page.getByText('Welcome Back')).toBeVisible();
    
    // Attempt to submit login form without filling any fields
    await page.getByText('Login', { exact: true }).click();

    // Verify validation error is displayed
    await expect(page.getByText('Please fill in all fields')).toBeVisible();
  });

  /**
   * Test: Navigation - Login to Registration Screen
   * 
   * Validates that users can navigate from the login screen
   * to the registration screen using the Sign Up button.
   * 
   * Expected Behavior:
   * - Sign Up button should be visible and clickable
   * - Navigation to registration screen should be smooth
   * - Registration form elements should be visible
   */
  test('can navigate from login to register screen', async ({ page }) => {
    // Navigate to the application root (login page)
    await page.goto('/');

    // Verify we're on the login screen
    await expect(page.getByText('Welcome Back')).toBeVisible();
    
    // Click the Sign Up button to navigate to registration
    await page.getByText('Sign Up', { exact: true }).click();

    // Verify navigation to registration screen
    await expect(page.getByText('Create Account').first()).toBeVisible();
    await expect(page.getByPlaceholder('Enter your full name')).toBeVisible();
  });

  /**
   * Test: Registration Form Validation - Password Mismatch
   * 
   * Validates that the registration form properly validates
   * password confirmation and shows error when passwords don't match.
   * 
   * Expected Behavior:
   * - Form should validate password confirmation
   * - Error message should appear for mismatched passwords
   * - Form should not submit with validation errors
   */
  test('register shows password mismatch error', async ({ page }) => {
    // Navigate to the application root (login page)
    await page.goto('/');
    
    // Navigate to registration screen
    await page.getByText('Sign Up').click();

    // Fill registration form with mismatched passwords
    await page.getByPlaceholder('Enter your full name').fill('E2E Student');
    await page.getByPlaceholder('Enter your email').nth(1).fill('student@example.com'); // Use nth(1) for registration form
    await page.getByPlaceholder('Enter your registration number').fill('REG001');
    await page.getByPlaceholder('Create a password (min 6 characters)').fill('password123');
    await page.getByPlaceholder('Confirm your password').fill('password124'); // Different password

    // Attempt to submit registration form
    await page.getByText('Create Account').nth(1).click(); // Use nth(1) for the button, not the header
    
    // Verify password mismatch validation error
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });
});

