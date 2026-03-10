const mongoose = require('mongoose');

/*
 * Test setup helper for managing in-memory MongoDB connections.
 * Uses mongoose's built-in memory server or mock connections for unit tests.
 */

// Mock Mongoose models for unit testing (no real DB needed)
const createMockUser = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword123',
    role: 'student',
    registrationNumber: 'REG001',
    createdAt: new Date(),
    ...overrides,
});

const createMockStaff = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Staff',
    email: 'staff@example.com',
    password: 'hashedpassword123',
    role: 'staff',
    createdAt: new Date(),
    ...overrides,
});

const createMockAdmin = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Admin',
    email: 'admin@example.com',
    password: 'hashedpassword123',
    role: 'admin',
    createdAt: new Date(),
    ...overrides,
});

const createMockSlotTemplate = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    name: 'Lunch',
    startTime: '12:00',
    endTime: '14:00',
    capacity: 10,
    ...overrides,
});

const createMockSlot = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    templateId: new mongoose.Types.ObjectId(),
    date: '2026-03-10',
    name: 'Lunch',
    startTime: '12:00',
    endTime: '14:00',
    capacity: 10,
    currentBookings: 0,
    ...overrides,
});

const createMockMenuItem = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    name: 'Veggie Burger',
    description: 'A delicious veggie burger',
    category: 'veg',
    price: 120,
    imageUrl: 'https://via.placeholder.com/150',
    isAvailable: true,
    ...overrides,
});

const createMockBooking = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    studentId: new mongoose.Types.ObjectId(),
    slotId: new mongoose.Types.ObjectId(),
    tokenNumber: 'L001',
    items: [{
        menuItemId: new mongoose.Types.ObjectId(),
        quantity: 1,
    }],
    queuePosition: 1,
    status: 'pending',
    estimatedWaitTime: 5,
    bookedAt: new Date(),
    modificationHistory: [],
    ...overrides,
});

const createMockAlertLog = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    timestamp: new Date(),
    slotId: new mongoose.Types.ObjectId(),
    occupancyRate: 95,
    activeBookings: 9,
    totalCapacity: 10,
    alertType: 'overcrowding',
    severity: 'critical',
    message: 'Critical overcrowding detected',
    notifiedUsers: [],
    resolved: false,
    ...overrides,
});

const createMockCrowdData = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    timestamp: new Date(),
    slotId: new mongoose.Types.ObjectId(),
    activeBookings: 5,
    totalCapacity: 10,
    occupancyRate: 50,
    activeTokenCount: 5,
    avgWaitTime: 10,
    crowdLevel: 'medium',
    ...overrides,
});

// Mock Express request/response objects
const mockRequest = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    user: createMockUser(),
    headers: {},
    ...overrides,
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

module.exports = {
    createMockUser,
    createMockStaff,
    createMockAdmin,
    createMockSlotTemplate,
    createMockSlot,
    createMockMenuItem,
    createMockBooking,
    createMockAlertLog,
    createMockCrowdData,
    mockRequest,
    mockResponse,
    mockNext,
};
