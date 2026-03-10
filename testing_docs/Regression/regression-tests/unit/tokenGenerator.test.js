const { generateTokenNumber } = require('../../backend/utils/tokenGenerator');
const Booking = require('../../backend/models/Booking');

// Mock the Booking model
jest.mock('../../backend/models/Booking');

/*
 * Unit tests for the token generator utility.
 * Tests unique token generation based on slot and daily count.
 */
describe('Token Generator Utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should generate B001 for first Breakfast booking', async () => {
        Booking.countDocuments.mockResolvedValue(0);

        const token = await generateTokenNumber('slot123', 'Breakfast');
        expect(token).toBe('B001');
    });

    test('should generate L005 for fifth Lunch booking', async () => {
        Booking.countDocuments.mockResolvedValue(4);

        const token = await generateTokenNumber('slot456', 'Lunch');
        expect(token).toBe('L005');
    });

    test('should generate S010 for tenth Snacks booking', async () => {
        Booking.countDocuments.mockResolvedValue(9);

        const token = await generateTokenNumber('slot789', 'Snacks');
        expect(token).toBe('S010');
    });

    test('should generate D001 for first Dinner booking', async () => {
        Booking.countDocuments.mockResolvedValue(0);

        const token = await generateTokenNumber('slotDinner', 'Dinner');
        expect(token).toBe('D001');
    });

    test('should pad number to 3 digits', async () => {
        Booking.countDocuments.mockResolvedValue(0);

        const token = await generateTokenNumber('slot123', 'Lunch');
        expect(token).toMatch(/^L\d{3}$/);
    });

    test('should handle large booking counts', async () => {
        Booking.countDocuments.mockResolvedValue(999);

        const token = await generateTokenNumber('slot123', 'Lunch');
        expect(token).toBe('L1000');
    });

    test('should call countDocuments with correct filter', async () => {
        Booking.countDocuments.mockResolvedValue(0);

        await generateTokenNumber('slot123', 'Breakfast');

        expect(Booking.countDocuments).toHaveBeenCalledWith(
            expect.objectContaining({
                slotId: 'slot123',
                bookedAt: expect.objectContaining({ $gte: expect.any(Date) }),
            })
        );
    });
});
