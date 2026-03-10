const jwt = require('jsonwebtoken');
const { registerStudent, login, getMe, updateProfile } = require('../../backend/controllers/authController');
const User = require('../../backend/models/User');

// Mock dependencies
jest.mock('../../backend/models/User');
jest.mock('jsonwebtoken');

/*
 * Unit tests for the auth controller.
 * Tests registration, login, profile retrieval, and profile update.
 */
describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';

        req = {
            body: {},
            user: { _id: 'user123' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        jwt.sign.mockReturnValue('mock-jwt-token');
    });

    describe('registerStudent', () => {
        test('should register a new student successfully', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                registrationNumber: 'REG001',
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({
                _id: 'newUser123',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'student',
                registrationNumber: 'REG001',
            });

            await registerStudent(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    _id: 'newUser123',
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'student',
                    token: 'mock-jwt-token',
                })
            );
        });

        test('should return 400 if user already exists', async () => {
            req.body = {
                name: 'John Doe',
                email: 'existing@example.com',
                password: 'password123',
            };

            User.findOne.mockResolvedValue({ email: 'existing@example.com' });

            await registerStudent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User already exists',
            });
        });

        test('should return 500 on database error', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            };

            User.findOne.mockRejectedValue(new Error('DB connection failed'));

            await registerStudent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'DB connection failed',
            });
        });

        test('should set role as student for registered user', async () => {
            req.body = {
                name: 'Jane',
                email: 'jane@example.com',
                password: 'pass123',
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({
                _id: 'id1',
                name: 'Jane',
                email: 'jane@example.com',
                role: 'student',
            });

            await registerStudent(req, res);

            expect(User.create).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'student' })
            );
        });
    });

    describe('login', () => {
        test('should login successfully with valid credentials', async () => {
            req.body = { email: 'john@example.com', password: 'password123' };

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'student',
                registrationNumber: 'REG001',
                comparePassword: jest.fn().mockResolvedValue(true),
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            await login(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    _id: 'user123',
                    name: 'John Doe',
                    email: 'john@example.com',
                    token: 'mock-jwt-token',
                })
            );
        });

        test('should return 401 if email is not found', async () => {
            req.body = { email: 'nonexistent@example.com', password: 'pass' };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(null),
            });

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid email or password',
            });
        });

        test('should return 401 if password is incorrect', async () => {
            req.body = { email: 'john@example.com', password: 'wrongpass' };

            const mockUser = {
                _id: 'user123',
                comparePassword: jest.fn().mockResolvedValue(false),
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid email or password',
            });
        });

        test('should return 500 on database error', async () => {
            req.body = { email: 'john@example.com', password: 'pass' };

            User.findOne.mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error('DB Error')),
            });

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getMe', () => {
        test('should return the current user details', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'student',
            };

            User.findById.mockResolvedValue(mockUser);

            await getMe(req, res);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        test('should return 500 on error', async () => {
            User.findById.mockRejectedValue(new Error('DB Error'));

            await getMe(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('updateProfile', () => {
        test('should update user name and registration number', async () => {
            req.body = { name: 'Updated Name', registrationNumber: 'REG002' };

            const mockUser = {
                _id: 'user123',
                name: 'Old Name',
                email: 'john@example.com',
                role: 'student',
                registrationNumber: 'REG001',
                save: jest.fn().mockResolvedValue({
                    _id: 'user123',
                    name: 'Updated Name',
                    email: 'john@example.com',
                    role: 'student',
                    registrationNumber: 'REG002',
                }),
            };

            User.findById.mockResolvedValue(mockUser);

            await updateProfile(req, res);

            expect(mockUser.name).toBe('Updated Name');
            expect(mockUser.registrationNumber).toBe('REG002');
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Updated Name',
                    registrationNumber: 'REG002',
                    token: 'mock-jwt-token',
                })
            );
        });

        test('should return 404 if user is not found', async () => {
            req.body = { name: 'New Name' };
            User.findById.mockResolvedValue(null);

            await updateProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User not found',
            });
        });

        test('should keep existing values if no new values provided', async () => {
            req.body = {};

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'student',
                registrationNumber: 'REG001',
                save: jest.fn().mockResolvedValue({
                    _id: 'user123',
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'student',
                    registrationNumber: 'REG001',
                }),
            };

            User.findById.mockResolvedValue(mockUser);

            await updateProfile(req, res);

            // Name should remain unchanged
            expect(mockUser.name).toBe('John Doe');
        });
    });
});
