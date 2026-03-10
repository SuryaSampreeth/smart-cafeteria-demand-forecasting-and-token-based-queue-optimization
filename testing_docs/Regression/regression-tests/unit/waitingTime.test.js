const { calculateWaitingTime } = require('../../backend/utils/waitingTime');

/*
 * Unit tests for the waitingTime utility.
 * Tests the time estimation logic based on queue position.
 */
describe('Waiting Time Utility', () => {
    describe('calculateWaitingTime', () => {
        test('should return 5 minutes for position 1', () => {
            expect(calculateWaitingTime(1)).toBe(5);
        });

        test('should return 10 minutes for position 2', () => {
            expect(calculateWaitingTime(2)).toBe(10);
        });

        test('should return 15 minutes for position 3', () => {
            expect(calculateWaitingTime(3)).toBe(15);
        });

        test('should return 0 minutes for position 0', () => {
            expect(calculateWaitingTime(0)).toBe(0);
        });

        test('should scale linearly with queue position', () => {
            const pos5 = calculateWaitingTime(5);
            const pos10 = calculateWaitingTime(10);
            expect(pos10).toBe(pos5 * 2);
        });

        test('should handle large queue positions', () => {
            expect(calculateWaitingTime(100)).toBe(500);
        });
    });
});
