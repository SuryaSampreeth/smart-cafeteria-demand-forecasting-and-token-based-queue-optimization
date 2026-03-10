const request = require('supertest');
const app = require('../../backend/server');

/*
 * Integration tests for API route mounting and authentication.
 * Tests that all routes are properly mounted and protected.
 */
describe('API Route Integration', () => {
    // ==================== AUTH ROUTES ====================
    describe('Auth Routes (/api/auth)', () => {
        test('POST /api/auth/register should exist', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({});

            // Should not be 404 (route exists), should get validation/DB error
            expect(response.statusCode).not.toBe(404);
        });

        test('POST /api/auth/login should exist', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({});

            expect(response.statusCode).not.toBe(404);
        });

        test('GET /api/auth/me should require authentication', async () => {
            const response = await request(app).get('/api/auth/me');

            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty('message');
        });

        test('PUT /api/auth/update-profile should require authentication', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({});

            expect(response.statusCode).toBe(401);
        });
    });

    // ==================== BOOKING ROUTES ====================
    describe('Booking Routes (/api/bookings)', () => {
        test('POST /api/bookings should require authentication', async () => {
            const response = await request(app)
                .post('/api/bookings')
                .send({});

            expect(response.statusCode).toBe(401);
        });

        test('GET /api/bookings/my-tokens should require authentication', async () => {
            const response = await request(app).get('/api/bookings/my-tokens');

            expect(response.statusCode).toBe(401);
        });

        test('GET /api/bookings/all should require authentication', async () => {
            const response = await request(app).get('/api/bookings/all');

            expect(response.statusCode).toBe(401);
        });
    });

    // ==================== MENU ROUTES ====================
    describe('Menu Routes (/api/menu)', () => {
        test('GET /api/menu/slots should be publicly accessible', async () => {
            const response = await request(app).get('/api/menu/slots');

            // Not 401 (public), could be 200 or 500 depending on DB
            expect(response.statusCode).not.toBe(401);
        });

        test('GET /api/menu/items should be publicly accessible', async () => {
            const response = await request(app).get('/api/menu/items');

            expect(response.statusCode).not.toBe(401);
        });

        test('POST /api/menu/slots should require admin authentication', async () => {
            const response = await request(app)
                .post('/api/menu/slots')
                .send({});

            expect(response.statusCode).toBe(401);
        });

        test('POST /api/menu/items should require admin authentication', async () => {
            const response = await request(app)
                .post('/api/menu/items')
                .send({});

            expect(response.statusCode).toBe(401);
        });
    });

    // ==================== STAFF ROUTES ====================
    describe('Staff Routes (/api/staff)', () => {
        test('GET /api/staff/queue/:slotId should require staff auth', async () => {
            const response = await request(app).get('/api/staff/queue/someid');

            expect(response.statusCode).toBe(401);
        });

        test('POST /api/staff/call-next/:slotId should require staff auth', async () => {
            const response = await request(app).post('/api/staff/call-next/someid');

            expect(response.statusCode).toBe(401);
        });

        test('PUT /api/staff/mark-serving/:bookingId should require staff auth', async () => {
            const response = await request(app).put('/api/staff/mark-serving/someid');

            expect(response.statusCode).toBe(401);
        });

        test('PUT /api/staff/mark-served/:bookingId should require staff auth', async () => {
            const response = await request(app).put('/api/staff/mark-served/someid');

            expect(response.statusCode).toBe(401);
        });
    });

    // ==================== ADMIN ROUTES ====================
    describe('Admin Routes (/api/admin)', () => {
        test('POST /api/admin/staff should require admin auth', async () => {
            const response = await request(app)
                .post('/api/admin/staff')
                .send({});

            expect(response.statusCode).toBe(401);
        });

        test('GET /api/admin/staff should require admin auth', async () => {
            const response = await request(app).get('/api/admin/staff');

            expect(response.statusCode).toBe(401);
        });

        test('GET /api/admin/analytics should require admin auth', async () => {
            const response = await request(app).get('/api/admin/analytics');

            expect(response.statusCode).toBe(401);
        });

        test('GET /api/admin/features/waste-tracking should require admin auth', async () => {
            const response = await request(app).get('/api/admin/features/waste-tracking');

            expect(response.statusCode).toBe(401);
        });

        test('GET /api/admin/features/sustainability should require admin auth', async () => {
            const response = await request(app).get('/api/admin/features/sustainability');

            expect(response.statusCode).toBe(401);
        });

        test('POST /api/admin/features/data-backup should require admin auth', async () => {
            const response = await request(app).post('/api/admin/features/data-backup');

            expect(response.statusCode).toBe(401);
        });
    });

    // ==================== CROWD ROUTES ====================
    describe('Crowd Routes (/api/crowd)', () => {
        test('GET /api/crowd/levels should require authentication', async () => {
            const response = await request(app).get('/api/crowd/levels');

            expect(response.statusCode).toBe(401);
        });

        test('GET /api/crowd/patterns should require authentication', async () => {
            const response = await request(app).get('/api/crowd/patterns');

            expect(response.statusCode).toBe(401);
        });

        test('GET /api/crowd/staff/dashboard should require staff auth', async () => {
            const response = await request(app).get('/api/crowd/staff/dashboard');

            expect(response.statusCode).toBe(401);
        });

        test('GET /api/crowd/admin/analytics should require admin auth', async () => {
            const response = await request(app).get('/api/crowd/admin/analytics');

            expect(response.statusCode).toBe(401);
        });
    });

    // ==================== DEMAND FORECAST ROUTES ====================
    describe('Demand Forecast Routes (/api/demand-forecast)', () => {
        test('GET /api/demand-forecast/health should require admin auth', async () => {
            const response = await request(app).get('/api/demand-forecast/health');

            expect(response.statusCode).toBe(401);
        });

        test('GET /api/demand-forecast/daily should require admin auth', async () => {
            const response = await request(app).get('/api/demand-forecast/daily');

            expect(response.statusCode).toBe(401);
        });

        test('POST /api/demand-forecast/retrain should require admin auth', async () => {
            const response = await request(app).post('/api/demand-forecast/retrain');

            expect(response.statusCode).toBe(401);
        });
    });
});
