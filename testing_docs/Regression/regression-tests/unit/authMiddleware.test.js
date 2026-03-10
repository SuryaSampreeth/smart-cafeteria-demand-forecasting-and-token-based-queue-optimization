const jwt = require('jsonwebtoken');
const { protect } = require('../../backend/middleware/auth');
const User = require('../../backend/models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../backend/models/User');

/*
 * Unit tests for the auth middleware.
 * Tests JWT token verification and user authentication.
 */
describe('Auth Middleware - protect', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();

        // Set environment variable for testing
        process.env.JWT_SECRET = 'test-secret-key';
    });

    test('should return 401 if no token is provided', async () => {
        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Not authorized, no token',
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if authorization header has no Bearer prefix', async () => {
        req.headers.authorization = 'InvalidToken123';

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if token verification fails', async () => {
        req.headers.authorization = 'Bearer invalid-token';
        jwt.verify.mockImplementation(() => {
            throw new Error('jwt malformed');
        });

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Not authorized, token failed',
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if user is not found in database', async () => {
        req.headers.authorization = 'Bearer valid-token';
        jwt.verify.mockReturnValue({ id: 'user123' });

        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null),
        });

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User not found',
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('should attach user to request and call next on valid token', async () => {
        const mockUser = {
            _id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'student',
        };

        req.headers.authorization = 'Bearer valid-token';
        jwt.verify.mockReturnValue({ id: 'user123' });

        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser),
        });

        await protect(req, res, next);

        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    test('should use JWT_SECRET from environment for verification', async () => {
        const mockUser = {
            _id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'student',
        };

        req.headers.authorization = 'Bearer some-token';
        jwt.verify.mockReturnValue({ id: 'user123' });
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser),
        });

        await protect(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('some-token', 'test-secret-key');
    });

    test('should exclude password field when fetching user', async () => {
        const selectMock = jest.fn().mockResolvedValue({ _id: 'user123', name: 'Test' });

        req.headers.authorization = 'Bearer valid-token';
        jwt.verify.mockReturnValue({ id: 'user123' });
        User.findById.mockReturnValue({ select: selectMock });

        await protect(req, res, next);

        expect(selectMock).toHaveBeenCalledWith('-password');
    });
});
