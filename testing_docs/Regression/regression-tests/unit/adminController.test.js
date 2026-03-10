const {
    registerStaff,
    getAllStaff,
    deleteStaff,
    getAnalytics,
    getStaffPerformance,
    getWasteTracking,
    getSustainabilityReport,
    triggerDataBackup,
} = require('../../backend/controllers/adminController');
const User = require('../../backend/models/User');
const Booking = require('../../backend/models/Booking');
const Slot = require('../../backend/models/Slot');
const SlotTemplate = require('../../backend/models/SlotTemplate');

// Mock all dependencies
jest.mock('../../backend/models/User');
jest.mock('../../backend/models/Booking');
jest.mock('../../backend/models/Slot');
jest.mock('../../backend/models/SlotTemplate');
jest.mock('../../backend/utils/slotManager');

/*
 * Unit tests for the admin controller.
 * Tests staff management, analytics, and admin features.
 */
describe('Admin Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    describe('registerStaff', () => {
        test('should register a new staff member', async () => {
            req.body = {
                name: 'Staff Member',
                email: 'newstaff@example.com',
                password: 'password123',
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({
                _id: 'staff1',
                name: 'Staff Member',
                email: 'newstaff@example.com',
                role: 'staff',
            });

            await registerStaff(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    role: 'staff',
                    email: 'newstaff@example.com',
                })
            );
        });

        test('should return 400 if user already exists', async () => {
            req.body = { email: 'existing@example.com' };
            User.findOne.mockResolvedValue({ email: 'existing@example.com' });

            await registerStaff(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User already exists',
            });
        });

        test('should set role as staff', async () => {
            req.body = {
                name: 'New Staff',
                email: 'new@example.com',
                password: 'pass123',
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({
                _id: 's1',
                name: 'New Staff',
                email: 'new@example.com',
                role: 'staff',
            });

            await registerStaff(req, res);

            expect(User.create).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'staff' })
            );
        });
    });

    describe('getAllStaff', () => {
        test('should return all staff members without passwords', async () => {
            const mockStaff = [
                { _id: 's1', name: 'Staff 1', role: 'staff' },
                { _id: 's2', name: 'Staff 2', role: 'staff' },
            ];

            User.find.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockStaff),
            });

            await getAllStaff(req, res);

            expect(User.find).toHaveBeenCalledWith({ role: 'staff' });
            expect(res.json).toHaveBeenCalledWith(mockStaff);
        });
    });

    describe('deleteStaff', () => {
        test('should delete an existing staff member', async () => {
            req.params.id = 'staff1';

            User.findById.mockResolvedValue({
                _id: 'staff1',
                role: 'staff',
            });
            User.findByIdAndDelete.mockResolvedValue(true);

            await deleteStaff(req, res);

            expect(User.findByIdAndDelete).toHaveBeenCalledWith('staff1');
            expect(res.json).toHaveBeenCalledWith({
                message: 'Staff member removed',
            });
        });

        test('should return 404 if staff not found', async () => {
            req.params.id = 'nonexistent';
            User.findById.mockResolvedValue(null);

            await deleteStaff(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('should return 400 if user is not a staff member', async () => {
            req.params.id = 'admin1';
            User.findById.mockResolvedValue({
                _id: 'admin1',
                role: 'admin',
            });

            await deleteStaff(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Can only delete staff members',
            });
        });
    });

    describe('getStaffPerformance', () => {
        test('should return staff performance metrics', async () => {
            Booking.countDocuments.mockResolvedValue(30);
            User.countDocuments.mockResolvedValue(3);

            await getStaffPerformance(req, res);

            expect(res.json).toHaveBeenCalledWith({
                totalServed: 30,
                staffCount: 3,
                averagePerStaff: 10,
            });
        });

        test('should handle zero staff members', async () => {
            Booking.countDocuments.mockResolvedValue(0);
            User.countDocuments.mockResolvedValue(0);

            await getStaffPerformance(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    averagePerStaff: 0,
                })
            );
        });
    });

    describe('getSustainabilityReport', () => {
        test('should calculate sustainability score correctly', async () => {
            const mockBookings = [
                { status: 'served' },
                { status: 'served' },
                { status: 'served' },
                { status: 'served' },
                { status: 'served' },
                { status: 'served' },
                { status: 'served' },
                { status: 'served' },
                { status: 'served' },
                { status: 'cancelled' },
            ];

            Booking.find.mockResolvedValue(mockBookings);

            await getSustainabilityReport(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    sustainabilityScore: '90.0',
                    totalPrepared: 10,
                    totalConsumed: 9,
                    totalWasted: 1,
                })
            );
        });

        test('should return 100 score when no bookings', async () => {
            Booking.find.mockResolvedValue([]);

            await getSustainabilityReport(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    sustainabilityScore: 100,
                })
            );
        });
    });

    describe('triggerDataBackup', () => {
        test('should return backup snapshot info', async () => {
            User.countDocuments.mockResolvedValue(50);
            Booking.countDocuments.mockResolvedValue(200);
            SlotTemplate.countDocuments.mockResolvedValue(4);

            await triggerDataBackup(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'Success',
                    collections: {
                        users: 50,
                        bookings: 200,
                        slots: 4,
                    },
                })
            );
        });
    });

    describe('getWasteTracking', () => {
        test('should aggregate wasted items from cancelled bookings', async () => {
            const mockCancelled = [
                {
                    status: 'cancelled',
                    items: [
                        {
                            menuItemId: { name: 'Burger', price: 100 },
                            quantity: 2,
                        },
                    ],
                },
                {
                    status: 'expired',
                    items: [
                        {
                            menuItemId: { name: 'Burger', price: 100 },
                            quantity: 1,
                        },
                    ],
                },
            ];

            Booking.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCancelled),
            });

            await getWasteTracking(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    totalTokensWasted: 2,
                    totalWasteValue: 300,
                    wastedItems: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'Burger',
                            quantity: 3,
                            value: 300,
                        }),
                    ]),
                })
            );
        });
    });
});
