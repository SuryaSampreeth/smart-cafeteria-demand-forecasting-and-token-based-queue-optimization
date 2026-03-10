const { checkRole } = require('../../backend/middleware/roleCheck');

/*
 * Unit tests for the role check middleware.
 * Tests role-based access control for different user types.
 */
describe('Role Check Middleware - checkRole', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
    });

    test('should return 401 if user is not authenticated (no req.user)', () => {
        const middleware = checkRole('admin');
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 if user role is not in allowed roles', () => {
        req.user = { role: 'student' };

        const middleware = checkRole('admin');
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Access denied. Required role: admin',
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('should call next if user has the required role', () => {
        req.user = { role: 'admin' };

        const middleware = checkRole('admin');
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow access when user has one of multiple allowed roles', () => {
        req.user = { role: 'staff' };

        const middleware = checkRole('staff', 'admin');
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('should deny access when user role is not any of the allowed roles', () => {
        req.user = { role: 'student' };

        const middleware = checkRole('staff', 'admin');
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Access denied. Required role: staff or admin',
        });
    });

    test('should handle student role access to student routes', () => {
        req.user = { role: 'student' };

        const middleware = checkRole('student');
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('should handle admin accessing staff routes', () => {
        req.user = { role: 'admin' };

        const middleware = checkRole('staff', 'admin');
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});
