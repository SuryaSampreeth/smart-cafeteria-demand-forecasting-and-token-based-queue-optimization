const { getTodayDateString, getOrCreateTodaySlots } = require('../../backend/utils/slotManager');
const SlotTemplate = require('../../backend/models/SlotTemplate');
const Slot = require('../../backend/models/Slot');

// Mock the models
jest.mock('../../backend/models/SlotTemplate');
jest.mock('../../backend/models/Slot');

/*
 * Unit tests for the slot manager utility.
 * Tests daily slot generation from templates.
 */
describe('Slot Manager Utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTodayDateString', () => {
        test('should return date in YYYY-MM-DD format', () => {
            const dateString = getTodayDateString();
            expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        test('should return current date', () => {
            const now = new Date();
            const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            expect(getTodayDateString()).toBe(expected);
        });
    });

    describe('getOrCreateTodaySlots', () => {
        test('should return existing slots if already created for today', async () => {
            const mockSlots = [
                { name: 'Breakfast', startTime: '07:00', endTime: '09:00' },
                { name: 'Lunch', startTime: '12:00', endTime: '14:00' },
            ];

            Slot.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockSlots),
            });

            const result = await getOrCreateTodaySlots();

            expect(result).toEqual(mockSlots);
            expect(SlotTemplate.find).not.toHaveBeenCalled();
        });

        test('should create slots from templates when none exist for today', async () => {
            const mockTemplates = [
                { _id: 'tmpl1', name: 'Breakfast', startTime: '07:00', endTime: '09:00', capacity: 10 },
                { _id: 'tmpl2', name: 'Lunch', startTime: '12:00', endTime: '14:00', capacity: 15 },
            ];

            const createdSlots = [
                { name: 'Breakfast', startTime: '07:00', endTime: '09:00' },
                { name: 'Lunch', startTime: '12:00', endTime: '14:00' },
            ];

            // First call returns empty (no slots), second returns created slots
            Slot.find.mockReturnValueOnce({
                sort: jest.fn().mockResolvedValue([]),
            }).mockReturnValueOnce({
                sort: jest.fn().mockResolvedValue(createdSlots),
            });

            SlotTemplate.find.mockResolvedValue(mockTemplates);
            Slot.insertMany.mockResolvedValue(createdSlots);

            const result = await getOrCreateTodaySlots();

            expect(SlotTemplate.find).toHaveBeenCalled();
            expect(Slot.insertMany).toHaveBeenCalled();
            expect(result).toEqual(createdSlots);
        });

        test('should return empty array when no templates exist', async () => {
            Slot.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([]),
            });

            SlotTemplate.find.mockResolvedValue([]);

            const result = await getOrCreateTodaySlots();

            expect(result).toEqual([]);
            expect(Slot.insertMany).not.toHaveBeenCalled();
        });

        test('should throw error when database operation fails', async () => {
            Slot.find.mockReturnValue({
                sort: jest.fn().mockRejectedValue(new Error('DB Error')),
            });

            await expect(getOrCreateTodaySlots()).rejects.toThrow('DB Error');
        });
    });
});
