const { getNextQueuePosition, updateQueuePositions, recalculateQueueAfterServing } = require('../../backend/utils/queueManager');
const Booking = require('../../backend/models/Booking');

// Mock the Booking model
jest.mock('../../backend/models/Booking');

/*
 * Unit tests for the queue manager utility.
 * Tests queue position assignment, update, and recalculation logic.
 */
describe('Queue Manager Utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getNextQueuePosition', () => {
        test('should return 1 when no active bookings exist', async () => {
            // Mock chained calls: findOne().sort().select()
            Booking.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(null),
                }),
            });

            const position = await getNextQueuePosition('slot123');
            expect(position).toBe(1);
        });

        test('should return next position after highest existing', async () => {
            Booking.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue({ queuePosition: 5 }),
                }),
            });

            const position = await getNextQueuePosition('slot123');
            expect(position).toBe(6);
        });

        test('should query only pending and serving bookings', async () => {
            Booking.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(null),
                }),
            });

            await getNextQueuePosition('slot123');

            expect(Booking.findOne).toHaveBeenCalledWith({
                slotId: 'slot123',
                status: { $in: ['pending', 'serving'] },
            });
        });
    });

    describe('updateQueuePositions', () => {
        test('should decrement positions behind the cancelled position', async () => {
            Booking.updateMany.mockResolvedValue({ modifiedCount: 3 });

            await updateQueuePositions('slot123', 2);

            expect(Booking.updateMany).toHaveBeenCalledWith(
                {
                    slotId: 'slot123',
                    queuePosition: { $gt: 2 },
                    status: { $in: ['pending', 'serving'] },
                },
                {
                    $inc: { queuePosition: -1 },
                }
            );
        });

        test('should handle cancellation at position 1', async () => {
            Booking.updateMany.mockResolvedValue({ modifiedCount: 5 });

            await updateQueuePositions('slot123', 1);

            expect(Booking.updateMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    queuePosition: { $gt: 1 },
                }),
                expect.any(Object)
            );
        });
    });

    describe('recalculateQueueAfterServing', () => {
        test('should reorder pending bookings sequentially starting from 1', async () => {
            const mockBookings = [
                { queuePosition: 3, save: jest.fn().mockResolvedValue(true) },
                { queuePosition: 5, save: jest.fn().mockResolvedValue(true) },
                { queuePosition: 7, save: jest.fn().mockResolvedValue(true) },
            ];

            Booking.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockBookings),
            });

            await recalculateQueueAfterServing('slot123');

            expect(mockBookings[0].queuePosition).toBe(1);
            expect(mockBookings[1].queuePosition).toBe(2);
            expect(mockBookings[2].queuePosition).toBe(3);

            mockBookings.forEach(b => expect(b.save).toHaveBeenCalled());
        });

        test('should handle empty queue gracefully', async () => {
            Booking.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([]),
            });

            await recalculateQueueAfterServing('slot123');
            // No error should be thrown
        });

        test('should query only pending bookings', async () => {
            Booking.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([]),
            });

            await recalculateQueueAfterServing('slot123');

            expect(Booking.find).toHaveBeenCalledWith({
                slotId: 'slot123',
                status: 'pending',
            });
        });
    });
});
