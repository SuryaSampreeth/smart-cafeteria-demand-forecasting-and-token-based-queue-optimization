/**
 * Staff Flow End-to-End Tests
 * 
 * This test suite covers the complete staff user journey in the Smart Cafeteria system.
 * It tests staff login, queue management, crowd monitoring, and operational features.
 * 
 * Test Flow:
 * 1. Staff Login → Dashboard Navigation → Queue Management
 * 2. Queue Operations → Token Processing → Status Updates
 * 3. Crowd Monitoring → Real-time Updates → Capacity Management
 * 4. Staff-specific Features → Reports → Operational Tools
 * 
 * Prerequisites:
 * - Backend server running on http://localhost:5000
 * - MongoDB database accessible
 * - Web app running on http://localhost:8081
 * - Staff user exists in database
 */

const { test, expect } = require('@playwright/test');

const FULL = process.env.E2E_FULL === '1';
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper function to create a staff user via API
 * This ensures we have a valid staff account for testing
 */
async function createStaffUser(request) {
  const timestamp = Date.now();
  const staffData = {
    name: `E2E Staff ${timestamp}`,
    email: `e2e.staff.${timestamp}@example.com`,
    password: 'staffpass123',
    registrationNumber: `STAFF-${timestamp}`,
    role: 'staff',
    department: 'Cafeteria Operations'
  };
  
  // Register staff user
  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: staffData
  });
  
  expect(registerResponse.ok()).toBeTruthy();
  return staffData;
}

/**
 * Helper function to create test bookings for queue management
 * This simulates students booking meals for staff to manage
 */
async function createTestBookings(request, count = 3) {
  const bookings = [];
  
  for (let i = 0; i < count; i++) {
    const timestamp = Date.now() + i;
    const studentData = {
      name: `Test Student ${i}`,
      email: `test.student.${timestamp}@example.com`,
      password: 'password123',
      registrationNumber: `REG-${timestamp}`,
      role: 'student'
    };
    
    // Register student
    await request.post(`${API_BASE_URL}/auth/register`, {
      data: studentData
    });
    
    // Create booking (simplified - in real scenario would need more data)
    const bookingResponse = await request.post(`${API_BASE_URL}/bookings`, {
      data: {
        studentId: studentData.registrationNumber,
        mealType: 'Lunch',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '12:00 PM - 1:00 PM',
        status: 'confirmed'
      }
    });
    
    if (bookingResponse.ok()) {
      bookings.push(await bookingResponse.json());
    }
  }
  
  return bookings;
}

test.describe('Staff Login and Navigation Flow @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Staff can login and access dashboard', async ({ request, page }) => {
    // Step 1: Create staff user
    const staffData = await createStaffUser(request);
    
    // Step 2: Navigate to login page
    await page.goto('/');
    await expect(page.getByText('Welcome Back')).toBeVisible();
    
    // Step 3: Login with staff credentials
    await page.getByPlaceholder('Enter your email').fill(staffData.email);
    await page.getByPlaceholder('Enter your password').fill(staffData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 4: Verify successful login and staff-specific navigation
    await expect(page.getByText('Welcome Back')).toBeHidden({ timeout: 20000 });
    
    // Step 5: Verify staff-specific navigation tabs
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Queue')).toBeVisible();
    await expect(page.getByText('Crowd')).toBeVisible();
    
    // Step 6: Verify staff dashboard content
    await expect(page.getByText('Staff Dashboard')).toBeVisible();
    await expect(page.getByText('Queue Status')).toBeVisible();
  });

  test('Staff login validation', async ({ page }) => {
    await page.goto('/');
    
    // Test invalid credentials
    await page.getByPlaceholder('Enter your email').fill('invalid@example.com');
    await page.getByPlaceholder('Enter your password').fill('wrongpassword');
    await page.getByText('Login', { exact: true }).click();
    
    // Verify error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});

test.describe('Staff Queue Management Flow @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Staff can view and manage queue', async ({ request, page }) => {
    // Setup: Create staff user and test bookings
    const staffData = await createStaffUser(request);
    await createTestBookings(request, 3);
    
    // Step 1: Login as staff
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(staffData.email);
    await page.getByPlaceholder('Enter your password').fill(staffData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to queue management
    await page.getByText('Queue').click();
    await expect(page.getByText('Queue Management')).toBeVisible();
    
    // Step 3: Verify queue information is displayed
    await expect(page.getByText('Current Queue')).toBeVisible();
    await expect(page.getByText('Waiting Students')).toBeVisible();
    await expect(page.getByText('Token Numbers')).toBeVisible();
    
    // Step 4: Test queue operations
    await expect(page.getByText('Next Student')).toBeVisible();
    await expect(page.getByText('Mark as Served')).toBeVisible();
    await expect(page.getByText('Skip Student')).toBeVisible();
  });

  test('Staff can process tokens and update queue status', async ({ request, page }) => {
    // Setup: Create staff user
    const staffData = await createStaffUser(request);
    
    // Step 1: Login as staff
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(staffData.email);
    await page.getByPlaceholder('Enter your password').fill(staffData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to queue management
    await page.getByText('Queue').click();
    await expect(page.getByText('Queue Management')).toBeVisible();
    
    // Step 3: Test token processing buttons
    await expect(page.getByRole('button', { name: 'Call Next' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Served' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Skip' })).toBeVisible();
    
    // Step 4: Verify queue statistics
    await expect(page.getByText('Queue Length')).toBeVisible();
    await expect(page.getByText('Average Wait Time')).toBeVisible();
    await expect(page.getByText('Served Today')).toBeVisible();
  });
});

test.describe('Staff Crowd Monitoring Flow @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Staff can monitor real-time crowd levels', async ({ request, page }) => {
    // Setup: Create staff user
    const staffData = await createStaffUser(request);
    
    // Step 1: Login as staff
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(staffData.email);
    await page.getByPlaceholder('Enter your password').fill(staffData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to crowd monitoring
    await page.getByText('Crowd').click();
    await expect(page.getByText('Crowd Dashboard')).toBeVisible();
    
    // Step 3: Verify real-time crowd indicators
    await expect(page.getByText('Current Occupancy')).toBeVisible();
    await expect(page.getByText('Capacity Status')).toBeVisible();
    await expect(page.getByText('Live Updates')).toBeVisible();
    
    // Step 4: Verify crowd level indicators
    await expect(page.getByText('Low')).toBeVisible();
    await expect(page.getByText('Medium')).toBeVisible();
    await expect(page.getByText('High')).toBeVisible();
    
    // Step 5: Verify crowd management tools
    await expect(page.getByText('Alert Thresholds')).toBeVisible();
    await expect(page.getByText('Capacity Settings')).toBeVisible();
  });

  test('Staff can view crowd analytics and trends', async ({ request, page }) => {
    // Setup: Create staff user
    const staffData = await createStaffUser(request);
    
    // Step 1: Login as staff
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(staffData.email);
    await page.getByPlaceholder('Enter your password').fill(staffData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to crowd dashboard
    await page.getByText('Crowd').click();
    await expect(page.getByText('Crowd Dashboard')).toBeVisible();
    
    // Step 3: Verify analytics charts
    await expect(page.getByText('Hourly Trends')).toBeVisible();
    await expect(page.getByText('Daily Patterns')).toBeVisible();
    await expect(page.getByText('Peak Hours')).toBeVisible();
    
    // Step 4: Verify prediction features
    await expect(page.getByText('Predicted Crowd')).toBeVisible();
    await expect(page.getByText('Forecast Accuracy')).toBeVisible();
  });
});

test.describe('Staff Operational Features @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Staff can access operational reports', async ({ request, page }) => {
    // Setup: Create staff user
    const staffData = await createStaffUser(request);
    
    // Step 1: Login as staff
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(staffData.email);
    await page.getByPlaceholder('Enter your password').fill(staffData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to dashboard
    await expect(page.getByText('Staff Dashboard')).toBeVisible();
    
    // Step 3: Verify operational metrics
    await expect(page.getByText('Daily Statistics')).toBeVisible();
    await expect(page.getByText('Meal Service Status')).toBeVisible();
    await expect(page.getByText('Staff Performance')).toBeVisible();
    
    // Step 4: Verify report generation options
    await expect(page.getByText('Generate Report')).toBeVisible();
    await expect(page.getByText('Export Data')).toBeVisible();
  });

  test('Staff can manage alerts and notifications', async ({ request, page }) => {
    // Setup: Create staff user
    const staffData = await createStaffUser(request);
    
    // Step 1: Login as staff
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(staffData.email);
    await page.getByPlaceholder('Enter your password').fill(staffData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to crowd dashboard for alert settings
    await page.getByText('Crowd').click();
    await expect(page.getByText('Crowd Dashboard')).toBeVisible();
    
    // Step 3: Verify alert management features
    await expect(page.getByText('Alert Settings')).toBeVisible();
    await expect(page.getByText('Notification Preferences')).toBeVisible();
    await expect(page.getByText('Threshold Configuration')).toBeVisible();
    
    // Step 4: Test alert controls
    await expect(page.getByRole('button', { name: 'Enable Alerts' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Test Alert' })).toBeVisible();
  });
});