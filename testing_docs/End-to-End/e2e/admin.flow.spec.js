/**
 * Admin Flow End-to-End Tests
 * 
 * This test suite covers the complete admin user journey in the Smart Cafeteria system.
 * It tests admin login, menu management, staff management, analytics, and system administration.
 * 
 * Test Flow:
 * 1. Admin Login → Dashboard Navigation → System Overview
 * 2. Menu Management → Add/Edit Menu Items → Price Updates → Availability Control
 * 3. Staff Management → Add Staff → Role Assignment → Performance Monitoring
 * 4. Analytics Dashboard → Crowd Analytics → Demand Forecasting → Reports
 * 5. System Administration → Waste Tracking → Sustainability → Data Backup
 * 
 * Prerequisites:
 * - Backend server running on http://localhost:5000
 * - MongoDB database accessible
 * - Web app running on http://localhost:8081
 * - Admin user exists with proper permissions
 */

const { test, expect } = require('@playwright/test');

const FULL = process.env.E2E_FULL === '1';
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper function to create an admin user via API
 * Ensures we have a valid admin account for testing
 */
async function createAdminUser(request) {
  const timestamp = Date.now();
  const adminData = {
    name: `E2E Admin ${timestamp}`,
    email: `e2e.admin.${timestamp}@example.com`,
    password: 'adminpass123',
    registrationNumber: `ADMIN-${timestamp}`,
    role: 'admin',
    department: 'Cafeteria Management'
  };
  
  // Register admin user
  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: adminData
  });
  
  expect(registerResponse.ok()).toBeTruthy();
  return adminData;
}

/**
 * Helper function to create test staff for management testing
 */
async function createTestStaff(request, count = 2) {
  const staffMembers = [];
  
  for (let i = 0; i < count; i++) {
    const timestamp = Date.now() + i;
    const staffData = {
      name: `Test Staff ${i}`,
      email: `test.staff.${timestamp}@example.com`,
      password: 'staffpass123',
      registrationNumber: `STAFF-${timestamp}`,
      role: 'staff',
      department: 'Cafeteria Operations',
      phone: `98765432${i}`,
      joinDate: new Date().toISOString().split('T')[0]
    };
    
    // Register staff member
    const response = await request.post(`${API_BASE_URL}/auth/register`, {
      data: staffData
    });
    
    if (response.ok()) {
      staffMembers.push(staffData);
    }
  }
  
  return staffMembers;
}

/**
 * Helper function to create test menu items
 */
async function createTestMenuItems(request, count = 3) {
  const menuItems = [];
  
  for (let i = 0; i < count; i++) {
    const timestamp = Date.now() + i;
    const menuItem = {
      name: `Test Item ${i}`,
      description: `Test description for item ${i}`,
      price: 50 + (i * 10),
      category: i % 2 === 0 ? 'Main Course' : 'Side Dish',
      mealType: i % 3 === 0 ? 'Breakfast' : i % 3 === 1 ? 'Lunch' : 'Dinner',
      isAvailable: true,
      nutritionalInfo: {
        calories: 200 + (i * 50),
        protein: 10 + i,
        carbs: 30 + (i * 5),
        fat: 5 + i
      }
    };
    
    // Create menu item
    const response = await request.post(`${API_BASE_URL}/menu/items`, {
      data: menuItem
    });
    
    if (response.ok()) {
      menuItems.push(menuItem);
    }
  }
  
  return menuItems;
}

test.describe('Admin Login and Dashboard Flow @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Admin can login and access comprehensive dashboard', async ({ request, page }) => {
    // Step 1: Create admin user
    const adminData = await createAdminUser(request);
    
    // Step 2: Navigate to login page
    await page.goto('/');
    await expect(page.getByText('Welcome Back')).toBeVisible();
    
    // Step 3: Login with admin credentials
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 4: Verify successful login and admin-specific navigation
    await expect(page.getByText('Welcome Back')).toBeHidden({ timeout: 20000 });
    
    // Step 5: Verify admin-specific navigation tabs
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Manage Staff')).toBeVisible();
    await expect(page.getByText('Manage Menu')).toBeVisible();
    await expect(page.getByText('Analytics')).toBeVisible();
    await expect(page.getByText('Forecast')).toBeVisible();
    
    // Step 6: Verify admin dashboard content
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
    await expect(page.getByText('System Overview')).toBeVisible();
    await expect(page.getByText('Quick Stats')).toBeVisible();
  });

  test('Admin dashboard shows comprehensive metrics', async ({ request, page }) => {
    // Setup: Create admin user
    const adminData = await createAdminUser(request);
    
    // Step 1: Login as admin
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Verify dashboard metrics
    await expect(page.getByText('Total Students')).toBeVisible();
    await expect(page.getByText('Total Staff')).toBeVisible();
    await expect(page.getByText('Today\'s Bookings')).toBeVisible();
    await expect(page.getByText('Revenue')).toBeVisible();
    
    // Step 3: Verify system status indicators
    await expect(page.getByText('System Health')).toBeVisible();
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('Queue Status')).toBeVisible();
  });
});

test.describe('Admin Menu Management Flow @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Admin can view and manage menu items', async ({ request, page }) => {
    // Setup: Create admin user and test menu items
    const adminData = await createAdminUser(request);
    await createTestMenuItems(request, 3);
    
    // Step 1: Login as admin
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to menu management
    await page.getByText('Manage Menu').click();
    await expect(page.getByText('Menu Management')).toBeVisible();
    
    // Step 3: Verify menu item list
    await expect(page.getByText('Menu Items')).toBeVisible();
    await expect(page.getByText('Add New Item')).toBeVisible();
    await expect(page.getByText('Category Filter')).toBeVisible();
    
    // Step 4: Verify menu item controls
    await expect(page.getByText('Edit')).toBeVisible();
    await expect(page.getByText('Delete')).toBeVisible();
    await expect(page.getByText('Availability')).toBeVisible();
  });

  test('Admin can add new menu item', async ({ request, page }) => {
    // Setup: Create admin user
    const adminData = await createAdminUser(request);
    
    // Step 1: Login as admin
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to menu management
    await page.getByText('Manage Menu').click();
    await expect(page.getByText('Menu Management')).toBeVisible();
    
    // Step 3: Click add new item
    await page.getByText('Add New Item').click();
    await expect(page.getByText('Add Menu Item')).toBeVisible();
    
    // Step 4: Fill menu item details
    await page.getByPlaceholder('Item Name').fill('Test Special Dish');
    await page.getByPlaceholder('Description').fill('A delicious test dish for E2E testing');
    await page.getByPlaceholder('Price').fill('75');
    
    // Step 5: Select category and meal type
    await page.getByText('Select Category').click();
    await page.getByText('Main Course').click();
    
    await page.getByText('Select Meal Type').click();
    await page.getByText('Lunch').click();
    
    // Step 6: Add nutritional information
    await page.getByPlaceholder('Calories').fill('350');
    await page.getByPlaceholder('Protein (g)').fill('15');
    await page.getByPlaceholder('Carbs (g)').fill('45');
    await page.getByPlaceholder('Fat (g)').fill('12');
    
    // Step 7: Save menu item
    await page.getByText('Save Item').click();
    
    // Step 8: Verify success message
    await expect(page.getByText('Menu item added successfully')).toBeVisible();
  });

  test('Admin can edit existing menu item', async ({ request, page }) => {
    // Setup: Create admin user and test menu items
    const adminData = await createAdminUser(request);
    await createTestMenuItems(request, 1);
    
    // Step 1: Login as admin
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to menu management
    await page.getByText('Manage Menu').click();
    await expect(page.getByText('Menu Management')).toBeVisible();
    
    // Step 3: Click edit on first menu item
    await page.getByText('Edit').first().click();
    await expect(page.getByText('Edit Menu Item')).toBeVisible();
    
    // Step 4: Update price
    await page.getByPlaceholder('Price').clear();
    await page.getByPlaceholder('Price').fill('85');
    
    // Step 5: Toggle availability
    await page.getByText('Available').click();
    
    // Step 6: Save changes
    await page.getByText('Update Item').click();
    
    // Step 7: Verify update success
    await expect(page.getByText('Menu item updated successfully')).toBeVisible();
  });
});

test.describe('Admin Staff Management Flow @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Admin can view and manage staff members', async ({ request, page }) => {
    // Setup: Create admin user and test staff
    const adminData = await createAdminUser(request);
    await createTestStaff(request, 2);
    
    // Step 1: Login as admin
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to staff management
    await page.getByText('Manage Staff').click();
    await expect(page.getByText('Staff Management')).toBeVisible();
    
    // Step 3: Verify staff list
    await expect(page.getByText('Staff Members')).toBeVisible();
    await expect(page.getByText('Add Staff')).toBeVisible();
    await expect(page.getByText('Department Filter')).toBeVisible();
    
    // Step 4: Verify staff controls
    await expect(page.getByText('View Details')).toBeVisible();
    await expect(page.getByText('Edit Role')).toBeVisible();
    await expect(page.getByText('Deactivate')).toBeVisible();
  });

  test('Admin can add new staff member', async ({ request, page }) => {
    // Setup: Create admin user
    const adminData = await createAdminUser(request);
    
    // Step 1: Login as admin
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to staff management
    await page.getByText('Manage Staff').click();
    await expect(page.getByText('Staff Management')).toBeVisible();
    
    // Step 3: Click add staff
    await page.getByText('Add Staff').click();
    await expect(page.getByText('Add Staff Member')).toBeVisible();
    
    // Step 4: Fill staff details
    const timestamp = Date.now();
    await page.getByPlaceholder('Full Name').fill(`New Staff ${timestamp}`);
    await page.getByPlaceholder('Email').fill(`new.staff.${timestamp}@example.com`);
    await page.getByPlaceholder('Registration Number').fill(`STAFF-${timestamp}`);
    await page.getByPlaceholder('Phone').fill('9876543210');
    
    // Step 5: Select department and role
    await page.getByText('Select Department').click();
    await page.getByText('Cafeteria Operations').click();
    
    await page.getByText('Select Role').click();
    await page.getByText('Staff').click();
    
    // Step 6: Save staff member
    await page.getByText('Add Staff').click();
    
    // Step 7: Verify success message
    await expect(page.getByText('Staff member added successfully')).toBeVisible();
  });
});

test.describe('Admin Analytics and Reporting Flow @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Admin can access comprehensive analytics dashboard', async ({ request, page }) => {
    // Setup: Create admin user
    const adminData = await createAdminUser(request);
    
    // Step 1: Login as admin
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to analytics
    await page.getByText('Analytics').click();
    await expect(page.getByText('Analytics Dashboard')).toBeVisible();
    
    // Step 3: Verify analytics sections
    await expect(page.getByText('Crowd Analytics')).toBeVisible();
    await expect(page.getByText('Booking Analytics')).toBeVisible();
    await expect(page.getByText('Revenue Analytics')).toBeVisible();
    await expect(page.getByText('User Analytics')).toBeVisible();
    
    // Step 4: Verify chart components
    await expect(page.getByText('Daily Trends')).toBeVisible();
    await expect(page.getByText('Weekly Comparison')).toBeVisible();
    await expect(page.getByText('Monthly Summary')).toBeVisible();
  });

  test('Admin can view demand forecasting', async ({ request, page }) => {
    // Setup: Create admin user
    const adminData = await createAdminUser(request);
    
    // Step 1: Login as admin
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to forecasting
    await page.getByText('Forecast').click();
    await expect(page.getByText('Demand Forecasting')).toBeVisible();
    
    // Step 3: Verify forecasting features
    await expect(page.getByText('Predicted Demand')).toBeVisible();
    await expect(page.getByText('Forecast Accuracy')).toBeVisible();
    await expect(page.getByText('Historical Comparison')).toBeVisible();
    
    // Step 4: Verify prediction models
    await expect(page.getByText('ML Model Performance')).toBeVisible();
    await expect(page.getByText('Prediction Confidence')).toBeVisible();
    await expect(page.getByText('Recommendation Engine')).toBeVisible();
  });
});

test.describe('Admin System Administration Flow @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Admin can access waste tracking', async ({ request, page }) => {
    // Setup: Create admin user
    const adminData = await createAdminUser(request);
    
    // Step 1: Login as admin
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to admin dashboard
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
    
    // Step 3: Navigate to waste tracking (through dashboard)
    await page.getByText('Waste Tracking').click();
    await expect(page.getByText('Waste Tracking')).toBeVisible();
    
    // Step 4: Verify waste tracking features
    await expect(page.getByText('Daily Waste')).toBeVisible();
    await expect(page.getByText('Waste Categories')).toBeVisible();
    await expect(page.getByText('Reduction Targets')).toBeVisible();
    await expect(page.getByText('Environmental Impact')).toBeVisible();
  });

  test('Admin can access sustainability dashboard', async ({ request, page }) => {
    // Setup: Create admin user
    const adminData = await createAdminUser(request);
    
    // Step 1: Login as admin
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to sustainability
    await page.getByText('Sustainability').click();
    await expect(page.getByText('Sustainability Dashboard')).toBeVisible();
    
    // Step 3: Verify sustainability metrics
    await expect(page.getByText('Carbon Footprint')).toBeVisible();
    await expect(page.getByText('Energy Consumption')).toBeVisible();
    await expect(page.getByText('Water Usage')).toBeVisible();
    await expect(page.getByText('Sustainability Score')).toBeVisible();
  });

  test('Admin can perform data backup operations', async ({ request, page }) => {
    // Setup: Create admin user
    const adminData = await createAdminUser(request);
    
    // Step 1: Login as admin
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill(adminData.email);
    await page.getByPlaceholder('Enter your password').fill(adminData.password);
    await page.getByText('Login', { exact: true }).click();
    
    // Step 2: Navigate to data backup
    await page.getByText('Data Backup').click();
    await expect(page.getByText('Data Backup & Recovery')).toBeVisible();
    
    // Step 3: Verify backup features
    await expect(page.getByText('Backup Now')).toBeVisible();
    await expect(page.getByText('Backup History')).toBeVisible();
    await expect(page.getByText('Restore Data')).toBeVisible();
    await expect(page.getByText('Backup Schedule')).toBeVisible();
  });
});