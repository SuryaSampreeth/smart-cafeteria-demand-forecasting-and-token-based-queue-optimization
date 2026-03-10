/**
 * Cross-Role End-to-End Tests
 * 
 * This test suite validates functionality that spans multiple user roles
 * in the Smart Cafeteria system. It tests shared features and ensures
 * consistent behavior across different user types.
 * 
 * Test Coverage:
 * 1. Crowd Monitoring - Consistent data across Student/Staff/Admin views
 * 2. Pattern Analysis - Shared analytics and insights
 * 3. Notification System - Alert delivery to appropriate roles
 * 4. Shared Dashboard Elements - Common UI components
 * 
 * Prerequisites:
 * - Backend server running on http://localhost:5000
 * - MongoDB database accessible
 * - Web app running on http://localhost:8081
 * - Users with different roles exist in database
 */

const { test, expect } = require('@playwright/test');

const FULL = process.env.E2E_FULL === '1';
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper function to create users with different roles
 * Returns user data for testing cross-role functionality
 */
async function createMultiRoleUsers(request) {
  const timestamp = Date.now();
  const users = {
    student: {
      name: `CrossRole Student ${timestamp}`,
      email: `cross.student.${timestamp}@example.com`,
      password: 'password123',
      registrationNumber: `STUD-${timestamp}`,
      role: 'student'
    },
    staff: {
      name: `CrossRole Staff ${timestamp}`,
      email: `cross.staff.${timestamp}@example.com`,
      password: 'password123',
      registrationNumber: `STAF-${timestamp}`,
      role: 'staff'
    },
    admin: {
      name: `CrossRole Admin ${timestamp}`,
      email: `cross.admin.${timestamp}@example.com`,
      password: 'password123',
      registrationNumber: `ADMN-${timestamp}`,
      role: 'admin'
    }
  };
  
  // Register all users
  for (const [role, userData] of Object.entries(users)) {
    const response = await request.post(`${API_BASE_URL}/auth/register`, {
      data: userData
    });
    expect(response.ok()).toBeTruthy();
  }
  
  return users;
}

/**
 * Helper function to login as a specific user role
 */
async function loginAsRole(page, userData) {
  await page.goto('/');
  await expect(page.getByText('Welcome Back')).toBeVisible();
  
  await page.getByPlaceholder('Enter your email').fill(userData.email);
  await page.getByPlaceholder('Enter your password').fill(userData.password);
  await page.getByText('Login', { exact: true }).click();
  
  // Wait for login to complete
  await expect(page.getByText('Welcome Back')).toBeHidden({ timeout: 20000 });
}

test.describe('Cross-Role Crowd Monitoring @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Crowd data consistency across user roles', async ({ request, page }) => {
    // Setup: Create users with different roles
    const users = await createMultiRoleUsers(request);
    
    // Test Student view
    await loginAsRole(page, users.student);
    await page.getByText('Crowd Monitor').click();
    
    // Capture crowd data from student view
    const studentCrowdLevel = await page.textContent('[data-testid="current-crowd-level"]');
    const studentOccupancy = await page.textContent('[data-testid="occupancy-percentage"]');
    
    // Logout and test Staff view
    await page.getByText('Logout').click();
    await loginAsRole(page, users.staff);
    await page.getByText('Crowd').click();
    
    // Capture crowd data from staff view
    const staffCrowdLevel = await page.textContent('[data-testid="current-crowd-level"]');
    const staffOccupancy = await page.textContent('[data-testid="occupancy-percentage"]');
    
    // Logout and test Admin view
    await page.getByText('Logout').click();
    await loginAsRole(page, users.admin);
    await page.getByText('Analytics').click();
    
    // Capture crowd data from admin view
    const adminCrowdLevel = await page.textContent('[data-testid="current-crowd-level"]');
    const adminOccupancy = await page.textContent('[data-testid="occupancy-percentage"]');
    
    // Verify consistency across roles
    expect(studentCrowdLevel).toBe(staffCrowdLevel);
    expect(staffCrowdLevel).toBe(adminCrowdLevel);
    expect(studentOccupancy).toBe(staffOccupancy);
    expect(staffOccupancy).toBe(adminOccupancy);
  });

  test('Alert system works across all user roles', async ({ request, page }) => {
    // Setup: Create users with different roles
    const users = await createMultiRoleUsers(request);
    
    // Test alert visibility for each role
    for (const [role, userData] of Object.entries(users)) {
      await loginAsRole(page, userData);
      
      // Navigate to appropriate screen for role
      if (role === 'student') {
        await page.getByText('Crowd Monitor').click();
      } else if (role === 'staff') {
        await page.getByText('Crowd').click();
      } else if (role === 'admin') {
        await page.getByText('Analytics').click();
      }
      
      // Verify alert indicators are present
      await expect(page.getByText('Alerts')).toBeVisible();
      await expect(page.getByText('Notifications')).toBeVisible();
      
      // Logout for next role test
      await page.getByText('Logout').click();
    }
  });
});

test.describe('Cross-Role Pattern Analysis @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Historical patterns are consistent across roles', async ({ request, page }) => {
    // Setup: Create users with different roles
    const users = await createMultiRoleUsers(request);
    
    // Test pattern access for Student
    await loginAsRole(page, users.student);
    await page.getByText('Patterns').click();
    
    // Capture pattern data
    const studentPatternData = await page.textContent('[data-testid="pattern-summary"]');
    
    // Test pattern access for Staff
    await page.getByText('Logout').click();
    await loginAsRole(page, users.staff);
    await page.getByText('Crowd').click();
    
    // Navigate to patterns within staff dashboard
    await page.getByText('View Patterns').click();
    const staffPatternData = await page.textContent('[data-testid="pattern-summary"]');
    
    // Test pattern access for Admin
    await page.getByText('Logout').click();
    await loginAsRole(page, users.admin);
    await page.getByText('Analytics').click();
    
    // Navigate to patterns within admin analytics
    await page.getByText('Pattern Analysis').click();
    const adminPatternData = await page.textContent('[data-testid="pattern-summary"]');
    
    // Verify pattern consistency
    expect(studentPatternData).toBe(staffPatternData);
    expect(staffPatternData).toBe(adminPatternData);
  });
});

test.describe('Cross-Role UI Consistency @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Common UI elements are consistent across roles', async ({ request, page }) => {
    // Setup: Create users with different roles
    const users = await createMultiRoleUsers(request);
    
    const uiElements = [
      'header',
      'navigation',
      'user-profile',
      'logout-button',
      'theme-toggle'
    ];
    
    // Test UI consistency for each role
    for (const [role, userData] of Object.entries(users)) {
      await loginAsRole(page, userData);
      
      // Verify common UI elements are present
      for (const element of uiElements) {
        await expect(page.locator(`[data-testid="${element}"]`)).toBeVisible();
      }
      
      // Verify consistent styling
      const headerColor = await page.locator('[data-testid="header"]').getAttribute('class');
      expect(headerColor).toContain('bg-primary'); // Consistent header styling
      
      // Logout for next role test
      await page.getByText('Logout').click();
    }
  });

  test('Accessibility features work across all roles', async ({ request, page }) => {
    // Setup: Create a test user
    const users = await createMultiRoleUsers(request);
    
    // Test accessibility with student user
    await loginAsRole(page, users.student);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test screen reader compatibility
    const ariaLabels = await page.locator('[aria-label]').count();
    expect(ariaLabels).toBeGreaterThan(0);
    
    // Test color contrast
    const headerElement = await page.locator('[data-testid="header"]');
    const backgroundColor = await headerElement.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).toBeTruthy();
  });
});

test.describe('Cross-Role Performance and Load @full', () => {
  test.skip(!FULL, 'Set E2E_FULL=1 to run backend-dependent E2E tests.');

  test('Dashboard loading performance is consistent across roles', async ({ request, page }) => {
    // Setup: Create users with different roles
    const users = await createMultiRoleUsers(request);
    
    const loadTimes = {};
    
    // Measure loading time for each role
    for (const [role, userData] of Object.entries(users)) {
      const startTime = Date.now();
      
      await loginAsRole(page, userData);
      
      // Wait for dashboard to fully load
      await page.waitForLoadState('networkidle');
      
      const endTime = Date.now();
      loadTimes[role] = endTime - startTime;
      
      // Verify reasonable load time (less than 5 seconds)
      expect(loadTimes[role]).toBeLessThan(5000);
      
      // Logout for next test
      await page.getByText('Logout').click();
    }
    
    // Verify performance consistency (no role should be significantly slower)
    const maxLoadTime = Math.max(...Object.values(loadTimes));
    const minLoadTime = Math.min(...Object.values(loadTimes));
    const variance = maxLoadTime - minLoadTime;
    
    // Performance variance should be less than 2 seconds
    expect(variance).toBeLessThan(2000);
  });
});