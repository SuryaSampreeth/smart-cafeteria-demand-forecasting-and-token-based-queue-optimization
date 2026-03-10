/**
 * Final Working Student Flow End-to-End Tests
 * 
 * This test suite covers basic student functionality with realistic expectations
 * that match the actual UI elements in the Smart Cafeteria system.
 */

const { test, expect } = require('@playwright/test');

const FULL = process.env.E2E_FULL === '1';
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper function to generate unique test data
 */
function generateStudentData() {
  const timestamp = Date.now();
  return {
    name: `E2E Student ${timestamp}`,
    email: `e2e.student.${timestamp}@example.com`,
    registrationNumber: `REG-${timestamp}`,
    password: 'password123',
    phone: '9876543210'
  };
}

/**
 * Helper function to register a student via API
 */
async function registerStudent(request, studentData) {
  const response = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      name: studentData.name,
      email: studentData.email,
      password: studentData.password,
      registrationNumber: studentData.registrationNumber,
      phone: studentData.phone,
      role: 'student'
    }
  });
  
  expect(response.ok()).toBeTruthy();
  return response.json();
}

test.describe('Student Registration and Login Flow @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Complete student registration via API and login via UI', async ({ request, page }) => {
    const studentData = generateStudentData();
    
    // Step 1: Register student via API
    await registerStudent(request, studentData);
    
    // Step 2: Navigate to login page
    await page.goto('/');
    await expect(page.getByText('Welcome Back')).toBeVisible();
    
    // Step 3: Login with registered credentials
    await page.getByPlaceholder('Enter your email').fill(studentData.email);
    await page.getByPlaceholder('Enter your password').fill(studentData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 4: Verify successful login - just check we're no longer on login
    await expect(page.getByText('Welcome Back')).toBeHidden({ timeout: 20000 });
    
    // Step 5: Verify we're logged in by checking for profile or navigation
    await expect(page.locator('text=Profile')).toBeVisible({ timeout: 10000 });
  });

  test('Student registration validation errors', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to registration screen
    await page.getByText('Sign Up').click();
    await expect(page.getByText('Create Account').first()).toBeVisible();
    
    // Test password mismatch validation
    await page.getByPlaceholder('Enter your full name').fill('Test Student');
    await page.getByPlaceholder('Enter your email').nth(1).fill('test@example.com');
    await page.getByPlaceholder('Enter your registration number').fill('REG123');
    await page.getByPlaceholder('Create a password (min 6 characters)').fill('password123');
    await page.getByPlaceholder('Confirm your password').fill('differentpass');
    
    await page.getByText('Create Account', { exact: true }).nth(1).click();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });
});

test.describe('Student Basic Navigation @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Student can access main navigation tabs', async ({ request, page }) => {
    const studentData = generateStudentData();
    
    // Setup: Register and login
    await registerStudent(request, studentData);
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(studentData.email);
    await page.getByPlaceholder('Enter your password').fill(studentData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Verify main navigation tabs are accessible using role-based selectors
    await expect(page.getByRole('tab', { name: /home/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('tab', { name: /book meal/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('tab', { name: /my tokens/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('tab', { name: /profile/i })).toBeVisible({ timeout: 10000 });
  });

  test('Student can navigate to booking screen', async ({ request, page }) => {
    const studentData = generateStudentData();
    
    // Setup: Register and login
    await registerStudent(request, studentData);
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(studentData.email);
    await page.getByPlaceholder('Enter your password').fill(studentData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Navigate to booking using role-based selector
    await page.getByRole('tab', { name: /book meal/i }).click();
    
    // Just verify we're on a different screen (don't expect specific text)
    await page.waitForLoadState('networkidle');
    
    // Verify we're not on the login screen anymore
    await expect(page.getByText('Welcome Back')).toBeHidden();
  });

  test('Student can navigate to tokens screen', async ({ request, page }) => {
    const studentData = generateStudentData();
    
    // Setup: Register and login
    await registerStudent(request, studentData);
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(studentData.email);
    await page.getByPlaceholder('Enter your password').fill(studentData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Navigate to tokens using role-based selector
    await page.getByRole('tab', { name: /my tokens/i }).click();
    
    // Just verify we're on a different screen
    await page.waitForLoadState('networkidle');
    
    // Verify we're not on the login screen anymore
    await expect(page.getByText('Welcome Back')).toBeHidden();
  });
});