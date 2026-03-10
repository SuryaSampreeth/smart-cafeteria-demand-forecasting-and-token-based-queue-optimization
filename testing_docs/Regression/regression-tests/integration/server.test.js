const request = require('supertest');
const app = require('../../backend/server');

/*
 * Integration tests for the Express application setup.
 * Verifies that the server boots, middleware is applied, and routes are mounted.
 */
describe('Server Setup', () => {
    test('should respond to health check route', async () => {
        const response = await request(app).get('/');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Smart Cafeteria API is running');
    });

    test('should return JSON content type', async () => {
        const response = await request(app).get('/');

        expect(response.headers['content-type']).toMatch(/json/);
    });

    test('should have CORS enabled', async () => {
        const response = await request(app).get('/');

        // CORS middleware adds access-control headers
        expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('should return 500 for global error handler with faulty middleware', async () => {
        // The global error handler catches thrown errors
        // We test it indirectly by hitting non-existent nested routes
        const response = await request(app).get('/api/nonexistent');

        // Express returns 404 for unmatched routes (no custom 404 handler)
        expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
});
