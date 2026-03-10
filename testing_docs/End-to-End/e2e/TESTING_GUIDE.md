# End-to-End Testing Documentation

## Overview

This comprehensive end-to-end testing suite validates the complete functionality of the Smart Cafeteria web application using Playwright. The tests cover all user roles, critical workflows, and cross-role functionality to ensure a robust and reliable system.

## Test Structure

### Test Files Organization

```
frontend/e2e/
├── auth.ui.spec.js          # Authentication UI tests (no backend required)
├── auth.full.spec.js        # Complete authentication flow tests
├── student.flow.spec.js     # Student user journey tests
├── staff.flow.spec.js       # Staff user journey tests
├── admin.flow.spec.js       # Admin user journey tests
├── crossrole.flow.spec.js   # Cross-role functionality tests
├── test-utils.js           # Test utilities and helpers
└── README.md               # Basic setup instructions
```

### Test Categories

#### 1. Authentication Tests (`auth.*.spec.js`)
- **UI Tests**: Client-side validation, form interactions, navigation
- **Full Tests**: Complete registration/login flow with backend integration

#### 2. Role-Based Flow Tests (`*.flow.spec.js`)
- **Student Flow**: Registration → Login → Booking → Token Management
- **Staff Flow**: Login → Queue Management → Crowd Monitoring
- **Admin Flow**: Login → Menu Management → Staff Management → Analytics

#### 3. Cross-Role Tests (`crossrole.flow.spec.js`)
- Consistency across user roles
- Shared functionality validation
- Performance and accessibility testing

## Test Execution

### Prerequisites

1. **Backend Server**: Running on `http://localhost:5000`
2. **Database**: MongoDB accessible and configured
3. **Web Application**: Running on `http://localhost:8081`
4. **Node.js**: Version 16+ recommended

### Environment Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

#### Quick Smoke Tests (UI Only)
Tests authentication UI without backend:
```bash
npm run e2e:ui
```

#### Full End-to-End Tests
Complete tests with backend integration:
```bash
npm run e2e:full
```

#### Specific Test Suites
```bash
# Run only student flow tests
npx playwright test student.flow.spec.js

# Run only authentication tests
npx playwright test auth.*.spec.js

# Run tests with specific tags
npx playwright test --grep @ui
npx playwright test --grep @full
```

#### Debug Mode
Run tests in headed browser for debugging:
```bash
npm run e2e:headed
# or
npm run e2e:debug
```

### Environment Variables

Configure test environment with these variables:

```bash
# Web application URL
E2E_WEB_BASE_URL=http://localhost:8081

# API base URL
E2E_API_BASE_URL=http://localhost:5000/api

# Run full tests (backend required)
E2E_FULL=1

# CI environment
CI=true
```

## Test Coverage

### Authentication Coverage
- ✅ Login form validation
- ✅ Registration form validation
- ✅ Password confirmation validation
- ✅ Complete registration/login flow
- ✅ Session management
- ✅ Role-based navigation

### Student Features Coverage
- ✅ Student registration and login
- ✅ Meal booking process
- ✅ Token generation and management
- ✅ Real-time crowd monitoring
- ✅ Historical pattern analysis
- ✅ Profile management

### Staff Features Coverage
- ✅ Staff login and dashboard
- ✅ Queue management operations
- ✅ Token processing workflow
- ✅ Real-time crowd monitoring
- ✅ Staff-specific analytics
- ✅ Alert and notification management

### Admin Features Coverage
- ✅ Admin login and comprehensive dashboard
- ✅ Menu item management (CRUD operations)
- ✅ Staff member management
- ✅ Analytics and reporting
- ✅ Demand forecasting
- ✅ System administration (waste tracking, sustainability, data backup)

### Cross-Role Coverage
- ✅ Data consistency across user roles
- ✅ Shared functionality validation
- ✅ UI consistency and accessibility
- ✅ Performance consistency
- ✅ Alert system functionality

## Test Data Management

### Test Data Generators

The test suite includes comprehensive data generators for consistent test data:

```javascript
// Generate user data
const userData = testDataGenerators.generateUserData('student');

// Generate menu item data
const menuItem = testDataGenerators.generateMenuItem();

// Generate booking data
const booking = testDataGenerators.generateBookingData();
```

### API Helpers

Helper functions for test setup and data creation:

```javascript
// Register user via API
await apiHelpers.registerUser(request, userData);

// Create menu item via API
await apiHelpers.createMenuItem(request, menuItemData);

// Create booking via API
await apiHelpers.createBooking(request, bookingData);
```

## Test Utilities

### Common Test Utilities

```javascript
// Wait for element with timeout
await testUtils.waitForVisible(page, '[data-testid="element"]');

// Take screenshot for debugging
await testUtils.takeScreenshot(page, 'test-step-name');

// Verify page loaded
await testUtils.verifyPageLoaded(page, 'Expected Page Title');
```

### Performance Testing

Tests include performance validation:
- Page load times < 5 seconds
- Performance variance < 2 seconds between roles
- Network idle detection for complete page loads

### Accessibility Testing

Cross-role accessibility validation:
- Keyboard navigation support
- Screen reader compatibility
- Color contrast validation
- ARIA label presence

## Test Results and Reporting

### Test Reports

Playwright generates multiple report formats:
- **List Reporter**: Console output during test execution
- **HTML Reporter**: Interactive HTML report (`test-results/report/index.html`)
- **JSON Reporter**: Machine-readable results (`test-results/results.json`)

### Screenshots and Videos

- **Screenshots**: Captured on test failure for debugging
- **Videos**: Recorded for failed tests to show interaction sequence
- **Traces**: Detailed execution traces for first retry attempts

### Test Metrics

Reports include comprehensive metrics:
- Total test count and pass/fail rates
- Test execution duration
- Individual test step timing
- Error details and stack traces

## Continuous Integration

### CI Configuration

Tests are configured for CI environments:
- Automatic retry on failure (2 retries in CI)
- Headless execution mode
- Parallel test execution
- Artifact collection for failed tests

### Environment-Specific Testing

Support for multiple environments:
- **Development**: Local testing with development servers
- **Staging**: Testing against staging deployment
- **Production**: Smoke testing in production environment

## Best Practices

### Test Writing Guidelines

1. **Use Descriptive Test Names**: Clearly indicate what is being tested
2. **Add Comprehensive Comments**: Document test purpose and expected behavior
3. **Use Test Data Generators**: Ensure unique and consistent test data
4. **Include Error Handling**: Test both success and failure scenarios
5. **Add Performance Assertions**: Validate response times and load performance

### Test Maintenance

1. **Regular Updates**: Keep tests current with application changes
2. **Data Cleanup**: Ensure test data doesn't interfere with other tests
3. **Environment Independence**: Tests should work across different environments
4. **Modular Design**: Reuse common test functions and utilities

### Debugging Failed Tests

1. **Check Screenshots**: Review failure screenshots for UI issues
2. **Watch Videos**: Examine test execution videos for interaction problems
3. **Review Traces**: Analyze execution traces for timing issues
4. **Check Logs**: Review console logs and network requests
5. **Environment Issues**: Verify backend connectivity and data state

## Troubleshooting

### Common Issues

**Test Fails with Timeout**
- Check if backend server is running
- Verify network connectivity
- Increase timeout for slow environments

**Element Not Found**
- Verify element selectors are current
- Check for UI changes in application
- Add explicit waits for dynamic content

**Authentication Failures**
- Verify test user data is unique
- Check backend authentication status
- Ensure database is accessible

**Performance Test Failures**
- Check server load and resources
- Verify network conditions
- Adjust performance thresholds if needed

### Getting Help

1. **Check Test Logs**: Review detailed test execution logs
2. **Review Artifacts**: Examine screenshots, videos, and traces
3. **Test Utilities**: Use provided helper functions for common operations
4. **Environment Validation**: Ensure all prerequisites are met

## Future Enhancements

### Planned Test Coverage
- Mobile app testing (React Native)
- API integration testing
- Load and stress testing
- Security testing
- Cross-browser compatibility testing

### Test Improvements
- Visual regression testing
- Automated test data management
- Enhanced reporting and analytics
- Integration with monitoring systems
- Machine learning-based test optimization