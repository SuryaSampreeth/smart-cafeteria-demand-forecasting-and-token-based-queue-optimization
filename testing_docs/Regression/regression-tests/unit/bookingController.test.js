const {
    createBooking,
    getMyTokens,
    getBooking,
    modifyBooking,
    cancelBooking,
    getAllMyBookings,
} = require('../../backend/controllers/bookingController');
const Booking = require('../../backend/models/Booking');
const Slot = require('../../backend/models/Slot');
const { getTodayDateString, getOrCreateTodaySlots } = require('../../backend/utils/slotManager');
const { generateTokenNumber } = require('../../backend/utils/tokenGenerator');
const { getNextQueuePosition, updateQueuePositions } = require('../../backend/utils/queueManager');
const { predictWaitTime } = require('../../backend/services/crowdPredictionService');
const { performAlertCheck } = require('../../backend/services/alertService');

// Mock all dependencies
jest.mock('../../backend/models/Booking');
jest.mock('../../backend/models/Slot');
jest.mock('../../backend/utils/slotManager');
jest.mock('../../backend/utils/tokenGenerator');
jest.mock('../../backend/utils/queueManager');
jest.mock('../../backend/services/crowdPredictionService');
jest.mock('../../backend/services/alertService');

/*
 * Unit tests for the booking controller.
 * Tests booking creation, retrieval, modification, and cancellation.
 */
describe('Booking Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {},
            params: {},
            user: { _id: 'student123' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        performAlertCheck.mockResolvedValue(null);
    });

    describe('createBooking', () => {
        test('should create a booking successfully', async () => {
            req.body = {
                slotId: 'slot123',
                items: [{ menuItemId: 'item1', quantity: 2 }],
            };

            getOrCreateTodaySlots.mockResolvedValue([]);
            getTodayDateString.mockReturnValue('2026-03-10');

            const mockSlot = {
                _id: 'slot123',
                name: 'Lunch',
                date: '2026-03-10',
                startTime: '12:00',
                endTime: '23:59',
                capacity: 10,
                currentBookings: 0,
                save: jest.fn().mockResolvedValue(true),
            };

            Slot.findById.mockResolvedValue(mockSlot);
            generateTokenNumber.mockResolvedValue('L001');
            getNextQueuePosition.mockResolvedValue(1);
            predictWaitTime.mockResolvedValue({ predictedWaitTime: 5 });

            const mockCreatedBooking = {
                _id: 'booking123',
                studentId: 'student123',
                slotId: 'slot123',
                tokenNumber: 'L001',
                items: [{ menuItemId: 'item1', quantity: 2 }],
                queuePosition: 1,
                estimatedWaitTime: 5,
            };

            Booking.create.mockResolvedValue(mockCreatedBooking);
            Booking.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockCreatedBooking),
                }),
            });

            await createBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockCreatedBooking);
            expect(mockSlot.currentBookings).toBe(1);
        });

        test('should return 404 if slot not found', async () => {
            req.body = { slotId: 'nonexistent', items: [] };
            getOrCreateTodaySlots.mockResolvedValue([]);
            Slot.findById.mockResolvedValue(null);

            await createBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Slot not found',
            });
        });

        test('should return 400 if slot is for a different day', async () => {
            req.body = { slotId: 'slot123', items: [] };
            getOrCreateTodaySlots.mockResolvedValue([]);
            getTodayDateString.mockReturnValue('2026-03-10');

            Slot.findById.mockResolvedValue({
                _id: 'slot123',
                date: '2026-03-09', // Yesterday
            });

            await createBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Cannot book slots for a different day',
            });
        });

        test('should return 400 if slot is full', async () => {
            req.body = { slotId: 'slot123', items: [] };
            getOrCreateTodaySlots.mockResolvedValue([]);
            getTodayDateString.mockReturnValue('2026-03-10');

            Slot.findById.mockResolvedValue({
                _id: 'slot123',
                date: '2026-03-10',
                startTime: '12:00',
                endTime: '23:59',
                capacity: 10,
                currentBookings: 10,
            });

            await createBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Slot is full',
            });
        });
    });

    describe('getMyTokens', () => {
        test('should return active tokens for the logged-in student', async () => {
            const mockBookings = [
                { _id: 'b1', tokenNumber: 'L001', status: 'pending' },
                { _id: 'b2', tokenNumber: 'L002', status: 'serving' },
            ];

            Booking.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        sort: jest.fn().mockResolvedValue(mockBookings),
                    }),
                }),
            });

            await getMyTokens(req, res);

            expect(res.json).toHaveBeenCalledWith(mockBookings);
            expect(Booking.find).toHaveBeenCalledWith({
                studentId: 'student123',
                status: { $in: ['pending', 'serving'] },
            });
        });
    });

    describe('getBooking', () => {
        test('should return booking details for the owner', async () => {
            req.params.id = 'booking123';

            const mockBooking = {
                _id: 'booking123',
                studentId: { toString: () => 'student123' },
                tokenNumber: 'L001',
            };

            Booking.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockBooking),
                }),
            });

            await getBooking(req, res);

            expect(res.json).toHaveBeenCalledWith(mockBooking);
        });

        test('should return 404 if booking not found', async () => {
            req.params.id = 'nonexistent';

            Booking.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null),
                }),
            });

            await getBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('should return 403 if booking belongs to another student', async () => {
            req.params.id = 'booking123';

            const mockBooking = {
                _id: 'booking123',
                studentId: { toString: () => 'otherStudent456' },
            };

            Booking.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockBooking),
                }),
            });

            await getBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Not authorized',
            });
        });
    });

    describe('modifyBooking', () => {
        test('should modify a pending booking successfully', async () => {
            req.params.id = 'booking123';
            req.body = { items: [{ menuItemId: 'newItem', quantity: 3 }] };

            const mockBooking = {
                _id: 'booking123',
                studentId: { toString: () => 'student123' },
                status: 'pending',
                items: [{ menuItemId: 'oldItem', quantity: 1 }],
                modificationHistory: [],
                save: jest.fn().mockResolvedValue(true),
            };

            Booking.findById.mockResolvedValueOnce(mockBooking);
            Booking.findById.mockReturnValueOnce({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue({
                        ...mockBooking,
                        items: req.body.items,
                    }),
                }),
            });

            await modifyBooking(req, res);

            expect(mockBooking.save).toHaveBeenCalled();
            expect(mockBooking.modificationHistory.length).toBe(1);
        });

        test('should return 400 if booking is not pending', async () => {
            req.params.id = 'booking123';
            req.body = { items: [] };

            Booking.findById.mockResolvedValue({
                _id: 'booking123',
                studentId: { toString: () => 'student123' },
                status: 'served',
            });

            await modifyBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 403 if booking belongs to another student', async () => {
            req.params.id = 'booking123';
            req.body = { items: [] };

            Booking.findById.mockResolvedValue({
                _id: 'booking123',
                studentId: { toString: () => 'otherStudent' },
                status: 'pending',
            });

            await modifyBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('cancelBooking', () => {
        test('should cancel a pending booking', async () => {
            req.params.id = 'booking123';

            const mockBooking = {
                _id: 'booking123',
                studentId: { toString: () => 'student123' },
                slotId: 'slot123',
                status: 'pending',
                queuePosition: 2,
                save: jest.fn().mockResolvedValue(true),
            };

            Booking.findById.mockResolvedValue(mockBooking);

            const mockSlot = {
                currentBookings: 5,
                save: jest.fn().mockResolvedValue(true),
            };
            Slot.findById.mockResolvedValue(mockSlot);
            updateQueuePositions.mockResolvedValue(true);

            await cancelBooking(req, res);

            expect(mockBooking.status).toBe('cancelled');
            expect(mockBooking.cancelledAt).toBeDefined();
            expect(mockSlot.currentBookings).toBe(4);
            expect(updateQueuePositions).toHaveBeenCalledWith('slot123', 2);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Booking cancelled successfully',
            });
        });

        test('should return 400 if booking is already served', async () => {
            req.params.id = 'booking123';

            Booking.findById.mockResolvedValue({
                _id: 'booking123',
                studentId: { toString: () => 'student123' },
                status: 'served',
            });

            await cancelBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should not let currentBookings go below 0', async () => {
            req.params.id = 'booking123';

            Booking.findById.mockResolvedValue({
                _id: 'booking123',
                studentId: { toString: () => 'student123' },
                slotId: 'slot123',
                status: 'pending',
                queuePosition: 1,
                save: jest.fn().mockResolvedValue(true),
            });

            const mockSlot = {
                currentBookings: 0,
                save: jest.fn().mockResolvedValue(true),
            };
            Slot.findById.mockResolvedValue(mockSlot);
            updateQueuePositions.mockResolvedValue(true);

            await cancelBooking(req, res);

            expect(mockSlot.currentBookings).toBe(0);
        });
    });

    describe('getAllMyBookings', () => {
        test('should return all bookings for the logged-in student', async () => {
            const mockBookings = [
                { _id: 'b1', status: 'served' },
                { _id: 'b2', status: 'cancelled' },
                { _id: 'b3', status: 'pending' },
            ];

            Booking.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        sort: jest.fn().mockResolvedValue(mockBookings),
                    }),
                }),
            });

            await getAllMyBookings(req, res);

            expect(res.json).toHaveBeenCalledWith(mockBookings);
            expect(Booking.find).toHaveBeenCalledWith({
                studentId: 'student123',
            });
        });
    });
});
