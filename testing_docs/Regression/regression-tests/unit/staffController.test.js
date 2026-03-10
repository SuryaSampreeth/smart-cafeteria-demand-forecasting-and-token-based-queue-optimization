const {
    getQueueForSlot,
    callNextToken,
    markAsServing,
    markAsServed,
} = require('../../backend/controllers/staffController');
const Booking = require('../../backend/models/Booking');
const { recalculateQueueAfterServing } = require('../../backend/utils/queueManager');

// Mock dependencies
jest.mock('../../backend/models/Booking');
jest.mock('../../backend/utils/queueManager');

/*
 * Unit tests for the staff controller.
 * Tests queue management, token calling, and order status updates.
 */
describe('Staff Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    describe('getQueueForSlot', () => {
        test('should return the queue for a slot sorted by position', async () => {
            req.params.slotId = 'slot123';

            const mockBookings = [
                { _id: 'b1', queuePosition: 1, status: 'serving' },
                { _id: 'b2', queuePosition: 2, status: 'pending' },
            ];

            Booking.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        sort: jest.fn().mockResolvedValue(mockBookings),
                    }),
                }),
            });

            await getQueueForSlot(req, res);

            expect(Booking.find).toHaveBeenCalledWith({
                slotId: 'slot123',
                status: { $in: ['pending', 'serving'] },
            });
            expect(res.json).toHaveBeenCalledWith(mockBookings);
        });

        test('should return 500 on error', async () => {
            req.params.slotId = 'slot123';

            Booking.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        sort: jest.fn().mockRejectedValue(new Error('DB Error')),
                    }),
                }),
            });

            await getQueueForSlot(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('callNextToken', () => {
        test('should call the next pending token in queue', async () => {
            req.params.slotId = 'slot123';

            const mockBooking = {
                _id: 'b1',
                status: 'pending',
                queuePosition: 1,
                save: jest.fn().mockResolvedValue(true),
            };

            Booking.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockResolvedValue(mockBooking),
                    }),
                }),
            });

            await callNextToken(req, res);

            expect(mockBooking.status).toBe('serving');
            expect(mockBooking.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockBooking);
        });

        test('should return 404 if no pending tokens in queue', async () => {
            req.params.slotId = 'slot123';

            Booking.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockResolvedValue(null),
                    }),
                }),
            });

            await callNextToken(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'No pending tokens in queue',
            });
        });
    });

    describe('markAsServing', () => {
        test('should mark a pending booking as serving', async () => {
            req.params.bookingId = 'b1';

            const mockBooking = {
                _id: 'b1',
                status: 'pending',
                save: jest.fn().mockResolvedValue(true),
            };
            Booking.findById.mockResolvedValueOnce(mockBooking);

            const mockPopulated = {
                _id: 'b1',
                status: 'serving',
                studentId: { name: 'John' },
            };
            Booking.findById.mockReturnValueOnce({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockPopulated),
                }),
            });

            await markAsServing(req, res);

            expect(mockBooking.status).toBe('serving');
            expect(mockBooking.save).toHaveBeenCalled();
        });

        test('should return 404 if booking not found', async () => {
            req.params.bookingId = 'nonexistent';
            Booking.findById.mockResolvedValue(null);

            await markAsServing(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('should return 400 if booking is not pending', async () => {
            req.params.bookingId = 'b1';

            Booking.findById.mockResolvedValue({
                _id: 'b1',
                status: 'served',
            });

            await markAsServing(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Can only mark pending bookings as serving',
            });
        });
    });

    describe('markAsServed', () => {
        test('should mark a serving booking as served', async () => {
            req.params.bookingId = 'b1';

            const mockBooking = {
                _id: 'b1',
                status: 'serving',
                slotId: 'slot123',
                save: jest.fn().mockResolvedValue(true),
            };
            Booking.findById.mockResolvedValue(mockBooking);
            recalculateQueueAfterServing.mockResolvedValue(true);

            await markAsServed(req, res);

            expect(mockBooking.status).toBe('served');
            expect(mockBooking.servedAt).toBeDefined();
            expect(recalculateQueueAfterServing).toHaveBeenCalledWith('slot123');
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Token marked as served',
                })
            );
        });

        test('should return 404 if booking not found', async () => {
            req.params.bookingId = 'nonexistent';
            Booking.findById.mockResolvedValue(null);

            await markAsServed(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('should return 400 if booking is not in serving status', async () => {
            req.params.bookingId = 'b1';

            Booking.findById.mockResolvedValue({
                _id: 'b1',
                status: 'pending',
            });

            await markAsServed(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Can only mark serving bookings as served',
            });
        });
    });
});
