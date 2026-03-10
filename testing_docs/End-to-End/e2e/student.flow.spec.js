/**
 * Student Flow End-to-End Tests
 * 
 * This test suite covers the complete student user journey in the Smart Cafeteria system.
 * It tests registration, login, meal booking, token management, and crowd monitoring features.
 * 
 * Test Flow:
 * 1. Student Registration → Login → Dashboard Navigation
 * 2. Meal Booking Process → Token Generation → Booking Confirmation
 * 3. Token Management → View Active Tokens → Cancel Booking
 * 4. Crowd Monitoring → Real-time Updates → Pattern Analysis
 * 
 * Prerequisites:
 * - Backend server running on http://localhost:5000
 * - MongoDB database accessible
 * - Web app running on http://localhost:8081
 */

const { test, expect } = require('@playwright/test');

const FULL = process.env.E2E_FULL === '1';
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper function to generate unique test data
 * Uses timestamp to ensure unique emails and registration numbers
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
 * This bypasses the UI for faster test setup
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
    
    // Step 1: Register student via API for faster test execution
    await registerStudent(request, studentData);
    
    // Step 2: Navigate to login page
    await page.goto('/');
    await expect(page.getByText('Welcome Back')).toBeVisible();
    
    // Step 3: Login with registered credentials
    await page.getByPlaceholder('Enter your email').fill(studentData.email);
    await page.getByPlaceholder('Enter your password').fill(studentData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 4: Verify successful login by checking navigation to student dashboard
    await expect(page.getByText('Welcome Back')).toBeHidden({ timeout: 20000 });
    
    // Step 5: Verify student-specific navigation tabs are visible
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Book Meal')).toBeVisible();
    await expect(page.getByText('My Tokens')).toBeVisible();
    await expect(page.getByText('Crowd Monitor')).toBeVisible();
  });

  test('Student registration validation errors', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to registration screen
    await page.getByText('Sign Up').click();
    await expect(page.getByText('Create Account')).toBeVisible();
    
    // Test password mismatch validation
    await page.getByPlaceholder('Enter your full name').fill('Test Student');
    await page.getByPlaceholder('Enter your email').fill('test@example.com');
    await page.getByPlaceholder('Enter your registration number').fill('REG123');
    await page.getByPlaceholder('Create a password (min 6 characters)').fill('password123');
    await page.getByPlaceholder('Confirm your password').fill('differentpass');
    
    await page.getByText('Create Account', { exact: true }).click();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
    
    // Test empty fields validation
    await page.getByPlaceholder('Enter your full name').clear();
    await page.getByText('Create Account', { exact: true }).click();
    await expect(page.getByText('Please fill in all fields')).toBeVisible();
  });
});

test.describe('Student Meal Booking Flow @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Student can book a meal slot successfully', async ({ request, page }) => {
    const studentData = generateStudentData();
    
    // Setup: Register and login
    await registerStudent(request, studentData);
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(studentData.email);
    await page.getByPlaceholder('Enter your password').fill(studentData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 1: Navigate to booking screen
    await page.getByText('Book Meal').click();
    await expect(page.getByText('Book Your Meal')).toBeVisible();
    
    // Step 2: Select meal type
    await page.getByText('Breakfast').click();
    
    // Step 3: Select date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    // Step 4: Select time slot
    await page.getByText('Select Time Slot').click();
    await page.getByText('8:00 AM - 9:00 AM').click();
    
    // Step 5: Confirm booking
    await page.getByText('Confirm Booking').click();
    
    // Step 6: Verify booking confirmation
    await expect(page.getByText('Booking Confirmed')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Your token number is')).toBeVisible();
  });

  test('Student can view and manage their tokens', async ({ request, page }) => {
    const studentData = generateStudentData();
    
    // Setup: Register, login, and create a booking
    await registerStudent(request, studentData);
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(studentData.email);
    await page.getByPlaceholder('Enter your password').fill(studentData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Create a booking first
    await page.getByText('Book Meal').click();
    await page.getByText('Lunch').click();
    await page.getByText('Select Time Slot').click();
    await page.getByText('12:00 PM - 1:00 PM').click();
    await page.getByText('Confirm Booking').click();
    await expect(page.getByText('Booking Confirmed')).toBeVisible();
    
    // Navigate to My Tokens
    await page.getByText('My Tokens').click();
    await expect(page.getByText('My Meal Tokens')).toBeVisible();
    
    // Verify token details are displayed
    await expect(page.getByText('Lunch')).toBeVisible();
    await expect(page.getByText('Token #')).toBeVisible();
    await expect(page.getByText('12:00 PM - 1:00 PM')).toBeVisible();
  });
});

test.describe('Student Crowd Monitoring @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Student can view real-time crowd levels', async ({ request, page }) => {
    const studentData = generateStudentData();
    
    // Setup: Register and login
    await registerStudent(request, studentData);
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(studentData.email);
    await page.getByPlaceholder('Enter your password').fill(studentData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Navigate to crowd monitor
    await page.getByText('Crowd Monitor').click();
    await expect(page.getByText('Live Crowd Levels')).toBeVisible();
    
    // Verify crowd level indicators are present
    await expect(page.getByText('Current Occupancy')).toBeVisible();
    await expect(page.getByText('Low')).toBeVisible();
    await expect(page.getByText('Medium')).toBeVisible();
    await expect(page.getByText('High')).toBeVisible();
  });

  test('Student can view crowd patterns and predictions', async ({ request, page }) => {
    const studentData = generateStudentData();
    
    // Setup: Register and login
    await registerStudent(request, studentData);
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(studentData.email);
    await page.getByPlaceholder('Enter your password').fill(studentData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Navigate to crowd patterns
    await page.getByText('Patterns').click();
    await expect(page.getByText('Crowd Patterns')).toBeVisible();
    
    // Verify chart is loaded
    await expect(page.getByText('Historical Crowd Data')).toBeVisible();
    
    // Verify time period selectors
    await expect(page.getByText('Today')).toBeVisible();
    await expect(page.getByText('This Week')).toBeVisible();
    await expect(page.getByText('This Month')).toBeVisible();
  });
});

test.describe('Student Profile Management @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Student can view and update profile information', async ({ request, page }) => {
    const studentData = generateStudentData();
    
    // Setup: Register and login
    await registerStudent(request, studentData);
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(studentData.email);
    await page.getByPlaceholder('Enter your password').fill(studentData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Navigate to profile
    await page.getByText('Profile').click();
    await expect(page.getByText('My Profile')).toBeVisible();
    
    // Verify profile information is displayed
    await expect(page.getByText(studentData.name)).toBeVisible();
    await expect(page.getByText(studentData.email)).toBeVisible();
    await expect(page.getByText(studentData.registrationNumber)).toBeVisible();
    
    // Test profile update functionality
    await page.getByText('Edit Profile').click();
    await page.getByPlaceholder('Phone Number').clear();
    await page.getByPlaceholder('Phone Number').fill('9123456789');
    await page.getByText('Save Changes').click();
    
    // Verify update success
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
  });
});