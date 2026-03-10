/**
 * Test Runner Configuration and Utilities
 * 
 * This file provides additional configuration and utility functions
 * for running the end-to-end tests with different configurations.
 */

const { defineConfig, devices } = require('@playwright/test');

// Base configuration for all test environments
const baseConfig = {
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [
    ['list'], 
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },
};

// Environment-specific configurations
const environments = {
  development: {
    webServer: {
      command: 'npm run web -- --non-interactive --port 8081',
      url: 'http://localhost:8081',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    use: {
      baseURL: 'http://localhost:8081',
    },
  },
  staging: {
    use: {
      baseURL: process.env.STAGING_URL || 'https://staging.smart-cafeteria.com',
    },
  },
  production: {
    use: {
      baseURL: process.env.PRODUCTION_URL || 'https://smart-cafeteria.com',
    },
  },
};

// Device configurations for cross-browser testing
const deviceConfigurations = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 12'] },
  },
];

/**
 * Generate test configuration based on environment and requirements
 */
function generateConfig(environment = 'development', devices = ['chromium']) {
  const envConfig = environments[environment] || environments.development;
  const selectedDevices = deviceConfigurations.filter(device => 
    devices.includes(device.name)
  );
  
  return defineConfig({
    ...baseConfig,
    ...envConfig,
    projects: selectedDevices,
  });
}

/**
 * Test data generators for consistent test data
 */
const testDataGenerators = {
  /**
   * Generate unique user data for registration tests
   */
  generateUserData: (role = 'student') => {
    const timestamp = Date.now();
    return {
      name: `E2E Test ${role} ${timestamp}`,
      email: `e2e.${role}.${timestamp}@example.com`,
      password: 'password123',
      registrationNumber: `${role.toUpperCase()}-${timestamp}`,
      phone: '9876543210',
      role: role
    };
  },
  
  /**
   * Generate menu item data for testing
   */
  generateMenuItem: () => {
    const timestamp = Date.now();
    return {
      name: `Test Dish ${timestamp}`,
      description: 'A test dish for E2E validation',
      price: Math.floor(Math.random() * 100) + 50,
      category: ['Main Course', 'Side Dish', 'Beverage'][Math.floor(Math.random() * 3)],
      mealType: ['Breakfast', 'Lunch', 'Dinner'][Math.floor(Math.random() * 3)],
      isAvailable: true,
      nutritionalInfo: {
        calories: Math.floor(Math.random() * 500) + 200,
        protein: Math.floor(Math.random() * 30) + 10,
        carbs: Math.floor(Math.random() * 60) + 20,
        fat: Math.floor(Math.random() * 20) + 5
      }
    };
  },
  
  /**
   * Generate booking data for testing
   */
  generateBookingData: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      date: tomorrow.toISOString().split('T')[0],
      mealType: ['Breakfast', 'Lunch', 'Dinner'][Math.floor(Math.random() * 3)],
      timeSlot: ['8:00 AM - 9:00 AM', '12:00 PM - 1:00 PM', '7:00 PM - 8:00 PM'][Math.floor(Math.random() * 3)],
      status: 'confirmed'
    };
  }
};

/**
 * API helper functions for test setup
 */
const apiHelpers = {
  /**
   * Register a user via API for test setup
   */
  async registerUser(request, userData) {
    const response = await request.post(`${process.env.E2E_API_BASE_URL || 'http://localhost:5000/api'}/auth/register`, {
      data: userData
    });
    
    if (!response.ok()) {
      throw new Error(`Registration failed: ${response.status()}`);
    }
    
    return response.json();
  },
  
  /**
   * Create a menu item via API
   */
  async createMenuItem(request, menuItemData) {
    const response = await request.post(`${process.env.E2E_API_BASE_URL || 'http://localhost:5000/api'}/menu/items`, {
      data: menuItemData
    });
    
    if (!response.ok()) {
      throw new Error(`Menu item creation failed: ${response.status()}`);
    }
    
    return response.json();
  },
  
  /**
   * Create a booking via API
   */
  async createBooking(request, bookingData) {
    const response = await request.post(`${process.env.E2E_API_BASE_URL || 'http://localhost:5000/api'}/bookings`, {
      data: bookingData
    });
    
    if (!response.ok()) {
      throw new Error(`Booking creation failed: ${response.status()}`);
    }
    
    return response.json();
  }
};

/**
 * Test utilities and assertions
 */
const testUtils = {
  /**
   * Wait for element to be visible with timeout
   */
  async waitForVisible(page, selector, timeout = 10000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return page.locator(selector);
  },
  
  /**
   * Take screenshot with descriptive name
   */
  async takeScreenshot(page, name) {
    await page.screenshot({ path: `test-results/screenshots/${name}-${Date.now()}.png`, fullPage: true });
  },
  
  /**
   * Verify page loaded successfully
   */
  async verifyPageLoaded(page, expectedText) {
    await expect(page.getByText(expectedText)).toBeVisible({ timeout: 30000 });
  },
  
  /**
   * Generate test report data
   */
  generateTestReport(testResults) {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: testResults.length,
      passed: testResults.filter(r => r.status === 'passed').length,
      failed: testResults.filter(r => r.status === 'failed').length,
      skipped: testResults.filter(r => r.status === 'skipped').length,
      duration: testResults.reduce((sum, r) => sum + (r.duration || 0), 0),
      tests: testResults
    };
    
    return report;
  }
};

module.exports = {
  generateConfig,
  testDataGenerators,
  apiHelpers,
  testUtils,
  environments,
  deviceConfigurations
};