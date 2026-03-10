const mongoose = require('mongoose');

/*
 * Unit tests for Mongoose model schemas.
 * Tests field validation, defaults, enums, and required fields.
 * These tests validate schema structure without needing a database.
 */

// We test schema validation by creating model instances and checking validation
// Using mongoose's validateSync() for synchronous validation checks

describe('Model Schema Validations', () => {

    // ==================== USER MODEL ====================
    describe('User Model', () => {
        const User = require('../../backend/models/User');

        test('should require name field', () => {
            const user = new User({ email: 'test@test.com', password: 'pass123' });
            const errors = user.validateSync();

            expect(errors.errors.name).toBeDefined();
        });

        test('should require email field', () => {
            const user = new User({ name: 'Test', password: 'pass123' });
            const errors = user.validateSync();

            expect(errors.errors.email).toBeDefined();
        });

        test('should require password field', () => {
            const user = new User({ name: 'Test', email: 'test@test.com' });
            const errors = user.validateSync();

            expect(errors.errors.password).toBeDefined();
        });

        test('should default role to student', () => {
            const user = new User({
                name: 'Test',
                email: 'test@test.com',
                password: 'password123',
            });

            expect(user.role).toBe('student');
        });

        test('should only allow valid roles', () => {
            const user = new User({
                name: 'Test',
                email: 'test@test.com',
                password: 'password123',
                role: 'invalidrole',
            });
            const errors = user.validateSync();

            expect(errors.errors.role).toBeDefined();
        });

        test('should accept valid roles: student, staff, admin', () => {
            ['student', 'staff', 'admin'].forEach(role => {
                const user = new User({
                    name: 'Test',
                    email: 'test@test.com',
                    password: 'password123',
                    role,
                });
                const errors = user.validateSync();
                // Should have no role error
                expect(errors?.errors?.role).toBeUndefined();
            });
        });

        test('should reject email without proper format', () => {
            const user = new User({
                name: 'Test',
                email: 'invalid-email',
                password: 'password123',
            });
            const errors = user.validateSync();

            expect(errors.errors.email).toBeDefined();
        });

        test('should trim the name field', () => {
            const user = new User({
                name: '  Test User  ',
                email: 'test@test.com',
                password: 'password123',
            });

            expect(user.name).toBe('Test User');
        });

        test('should lowercase the email field', () => {
            const user = new User({
                name: 'Test',
                email: 'TEST@EXAMPLE.COM',
                password: 'password123',
            });

            expect(user.email).toBe('test@example.com');
        });
    });

    // ==================== BOOKING MODEL ====================
    describe('Booking Model', () => {
        const Booking = require('../../backend/models/Booking');

        test('should require studentId', () => {
            const booking = new Booking({
                slotId: new mongoose.Types.ObjectId(),
                tokenNumber: 'L001',
                items: [{ menuItemId: new mongoose.Types.ObjectId(), quantity: 1 }],
                queuePosition: 1,
            });
            const errors = booking.validateSync();

            expect(errors.errors.studentId).toBeDefined();
        });

        test('should require slotId', () => {
            const booking = new Booking({
                studentId: new mongoose.Types.ObjectId(),
                tokenNumber: 'L001',
                items: [{ menuItemId: new mongoose.Types.ObjectId(), quantity: 1 }],
                queuePosition: 1,
            });
            const errors = booking.validateSync();

            expect(errors.errors.slotId).toBeDefined();
        });

        test('should require tokenNumber', () => {
            const booking = new Booking({
                studentId: new mongoose.Types.ObjectId(),
                slotId: new mongoose.Types.ObjectId(),
                items: [{ menuItemId: new mongoose.Types.ObjectId(), quantity: 1 }],
                queuePosition: 1,
            });
            const errors = booking.validateSync();

            expect(errors.errors.tokenNumber).toBeDefined();
        });

        test('should default status to pending', () => {
            const booking = new Booking({
                studentId: new mongoose.Types.ObjectId(),
                slotId: new mongoose.Types.ObjectId(),
                tokenNumber: 'L001',
                items: [{ menuItemId: new mongoose.Types.ObjectId(), quantity: 1 }],
                queuePosition: 1,
            });

            expect(booking.status).toBe('pending');
        });

        test('should only accept valid status values', () => {
            const booking = new Booking({
                studentId: new mongoose.Types.ObjectId(),
                slotId: new mongoose.Types.ObjectId(),
                tokenNumber: 'L001',
                items: [{ menuItemId: new mongoose.Types.ObjectId(), quantity: 1 }],
                queuePosition: 1,
                status: 'invalidstatus',
            });
            const errors = booking.validateSync();

            expect(errors.errors.status).toBeDefined();
        });

        test('should accept all valid status values', () => {
            ['pending', 'serving', 'cancelled', 'served', 'expired'].forEach(status => {
                const booking = new Booking({
                    studentId: new mongoose.Types.ObjectId(),
                    slotId: new mongoose.Types.ObjectId(),
                    tokenNumber: 'L001',
                    items: [{ menuItemId: new mongoose.Types.ObjectId(), quantity: 1 }],
                    queuePosition: 1,
                    status,
                });
                const errors = booking.validateSync();
                expect(errors?.errors?.status).toBeUndefined();
            });
        });

        test('should enforce minimum quantity of 1 for items', () => {
            const booking = new Booking({
                studentId: new mongoose.Types.ObjectId(),
                slotId: new mongoose.Types.ObjectId(),
                tokenNumber: 'L001',
                items: [{ menuItemId: new mongoose.Types.ObjectId(), quantity: 0 }],
                queuePosition: 1,
            });
            const errors = booking.validateSync();

            expect(errors).toBeDefined();
        });

        test('should default estimatedWaitTime to 0', () => {
            const booking = new Booking({
                studentId: new mongoose.Types.ObjectId(),
                slotId: new mongoose.Types.ObjectId(),
                tokenNumber: 'L001',
                items: [{ menuItemId: new mongoose.Types.ObjectId(), quantity: 1 }],
                queuePosition: 1,
            });

            expect(booking.estimatedWaitTime).toBe(0);
        });
    });

    // ==================== MENU ITEM MODEL ====================
    describe('MenuItem Model', () => {
        const MenuItem = require('../../backend/models/MenuItem');

        test('should require name field', () => {
            const item = new MenuItem({ category: 'veg', price: 100 });
            const errors = item.validateSync();

            expect(errors.errors.name).toBeDefined();
        });

        test('should require category field', () => {
            const item = new MenuItem({ name: 'Burger', price: 100 });
            const errors = item.validateSync();

            expect(errors.errors.category).toBeDefined();
        });

        test('should require price field', () => {
            const item = new MenuItem({ name: 'Burger', category: 'veg' });
            const errors = item.validateSync();

            expect(errors.errors.price).toBeDefined();
        });

        test('should only accept valid categories', () => {
            const item = new MenuItem({
                name: 'Item',
                category: 'invalid',
                price: 100,
            });
            const errors = item.validateSync();

            expect(errors.errors.category).toBeDefined();
        });

        test('should accept all valid categories', () => {
            ['veg', 'non-veg', 'beverage', 'dessert'].forEach(category => {
                const item = new MenuItem({ name: 'Item', category, price: 100 });
                const errors = item.validateSync();
                expect(errors?.errors?.category).toBeUndefined();
            });
        });

        test('should not accept negative prices', () => {
            const item = new MenuItem({
                name: 'Burger',
                category: 'veg',
                price: -10,
            });
            const errors = item.validateSync();

            expect(errors.errors.price).toBeDefined();
        });

        test('should default isAvailable to true', () => {
            const item = new MenuItem({
                name: 'Burger',
                category: 'veg',
                price: 100,
            });

            expect(item.isAvailable).toBe(true);
        });

        test('should have default imageUrl', () => {
            const item = new MenuItem({
                name: 'Burger',
                category: 'veg',
                price: 100,
            });

            expect(item.imageUrl).toBe('https://via.placeholder.com/150');
        });
    });

    // ==================== SLOT MODEL ====================
    describe('Slot Model', () => {
        const Slot = require('../../backend/models/Slot');

        test('should require templateId', () => {
            const slot = new Slot({
                date: '2026-03-10',
                name: 'Lunch',
                startTime: '12:00',
                endTime: '14:00',
            });
            const errors = slot.validateSync();

            expect(errors.errors.templateId).toBeDefined();
        });

        test('should require date field', () => {
            const slot = new Slot({
                templateId: new mongoose.Types.ObjectId(),
                name: 'Lunch',
                startTime: '12:00',
                endTime: '14:00',
            });
            const errors = slot.validateSync();

            expect(errors.errors.date).toBeDefined();
        });

        test('should only accept valid meal names', () => {
            const slot = new Slot({
                templateId: new mongoose.Types.ObjectId(),
                date: '2026-03-10',
                name: 'Brunch', // Invalid
                startTime: '12:00',
                endTime: '14:00',
            });
            const errors = slot.validateSync();

            expect(errors.errors.name).toBeDefined();
        });

        test('should accept all valid meal names', () => {
            ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].forEach(name => {
                const slot = new Slot({
                    templateId: new mongoose.Types.ObjectId(),
                    date: '2026-03-10',
                    name,
                    startTime: '12:00',
                    endTime: '14:00',
                });
                const errors = slot.validateSync();
                expect(errors?.errors?.name).toBeUndefined();
            });
        });

        test('should default capacity to 10', () => {
            const slot = new Slot({
                templateId: new mongoose.Types.ObjectId(),
                date: '2026-03-10',
                name: 'Lunch',
                startTime: '12:00',
                endTime: '14:00',
            });

            expect(slot.capacity).toBe(10);
        });

        test('should default currentBookings to 0', () => {
            const slot = new Slot({
                templateId: new mongoose.Types.ObjectId(),
                date: '2026-03-10',
                name: 'Lunch',
                startTime: '12:00',
                endTime: '14:00',
            });

            expect(slot.currentBookings).toBe(0);
        });
    });

    // ==================== SLOT TEMPLATE MODEL ====================
    describe('SlotTemplate Model', () => {
        const SlotTemplate = require('../../backend/models/SlotTemplate');

        test('should require name field', () => {
            const template = new SlotTemplate({ startTime: '07:00', endTime: '09:00' });
            const errors = template.validateSync();

            expect(errors.errors.name).toBeDefined();
        });

        test('should require startTime', () => {
            const template = new SlotTemplate({ name: 'Breakfast', endTime: '09:00' });
            const errors = template.validateSync();

            expect(errors.errors.startTime).toBeDefined();
        });

        test('should require endTime', () => {
            const template = new SlotTemplate({ name: 'Breakfast', startTime: '07:00' });
            const errors = template.validateSync();

            expect(errors.errors.endTime).toBeDefined();
        });

        test('should only accept valid slot names', () => {
            const template = new SlotTemplate({
                name: 'Brunch',
                startTime: '10:00',
                endTime: '11:00',
            });
            const errors = template.validateSync();

            expect(errors.errors.name).toBeDefined();
        });

        test('should default capacity to 10', () => {
            const template = new SlotTemplate({
                name: 'Lunch',
                startTime: '12:00',
                endTime: '14:00',
            });

            expect(template.capacity).toBe(10);
        });
    });

    // ==================== ALERT LOG MODEL ====================
    describe('AlertLog Model', () => {
        const AlertLog = require('../../backend/models/AlertLog');

        test('should require slotId', () => {
            const alert = new AlertLog({
                occupancyRate: 95,
                activeBookings: 9,
                totalCapacity: 10,
                message: 'Overcrowding',
            });
            const errors = alert.validateSync();

            expect(errors.errors.slotId).toBeDefined();
        });

        test('should require message field', () => {
            const alert = new AlertLog({
                slotId: new mongoose.Types.ObjectId(),
                occupancyRate: 95,
                activeBookings: 9,
                totalCapacity: 10,
            });
            const errors = alert.validateSync();

            expect(errors.errors.message).toBeDefined();
        });

        test('should only accept valid alert types', () => {
            const alert = new AlertLog({
                slotId: new mongoose.Types.ObjectId(),
                occupancyRate: 95,
                activeBookings: 9,
                totalCapacity: 10,
                alertType: 'invalid_type',
                message: 'Test',
            });
            const errors = alert.validateSync();

            expect(errors.errors.alertType).toBeDefined();
        });

        test('should accept all valid alert types', () => {
            ['overcrowding', 'capacity_warning', 'spike_detected'].forEach(alertType => {
                const alert = new AlertLog({
                    slotId: new mongoose.Types.ObjectId(),
                    occupancyRate: 95,
                    activeBookings: 9,
                    totalCapacity: 10,
                    alertType,
                    message: 'Test',
                });
                const errors = alert.validateSync();
                expect(errors?.errors?.alertType).toBeUndefined();
            });
        });

        test('should default resolved to false', () => {
            const alert = new AlertLog({
                slotId: new mongoose.Types.ObjectId(),
                occupancyRate: 95,
                activeBookings: 9,
                totalCapacity: 10,
                message: 'Test',
            });

            expect(alert.resolved).toBe(false);
        });

        test('should only accept valid severity levels', () => {
            const alert = new AlertLog({
                slotId: new mongoose.Types.ObjectId(),
                occupancyRate: 95,
                activeBookings: 9,
                totalCapacity: 10,
                severity: 'extreme', // Invalid
                message: 'Test',
            });
            const errors = alert.validateSync();

            expect(errors.errors.severity).toBeDefined();
        });

        test('should accept valid severity levels', () => {
            ['low', 'medium', 'high', 'critical'].forEach(severity => {
                const alert = new AlertLog({
                    slotId: new mongoose.Types.ObjectId(),
                    occupancyRate: 95,
                    activeBookings: 9,
                    totalCapacity: 10,
                    severity,
                    message: 'Test',
                });
                const errors = alert.validateSync();
                expect(errors?.errors?.severity).toBeUndefined();
            });
        });
    });

    // ==================== CROWD DATA MODEL ====================
    describe('CrowdData Model', () => {
        const CrowdData = require('../../backend/models/CrowdData');

        test('should require slotId', () => {
            const data = new CrowdData({
                activeBookings: 5,
                totalCapacity: 10,
                occupancyRate: 50,
                crowdLevel: 'medium',
            });
            const errors = data.validateSync();

            expect(errors.errors.slotId).toBeDefined();
        });

        test('should only accept valid crowd levels', () => {
            const data = new CrowdData({
                slotId: new mongoose.Types.ObjectId(),
                activeBookings: 5,
                totalCapacity: 10,
                occupancyRate: 50,
                crowdLevel: 'extreme',
            });
            const errors = data.validateSync();

            expect(errors.errors.crowdLevel).toBeDefined();
        });

        test('should accept valid crowd levels', () => {
            ['low', 'medium', 'high'].forEach(level => {
                const data = new CrowdData({
                    slotId: new mongoose.Types.ObjectId(),
                    activeBookings: 5,
                    totalCapacity: 10,
                    occupancyRate: 50,
                    crowdLevel: level,
                });
                const errors = data.validateSync();
                expect(errors?.errors?.crowdLevel).toBeUndefined();
            });
        });

        test('should default activeBookings to 0', () => {
            const data = new CrowdData({
                slotId: new mongoose.Types.ObjectId(),
                totalCapacity: 10,
                occupancyRate: 0,
                crowdLevel: 'low',
            });

            expect(data.activeBookings).toBe(0);
        });
    });

    // ==================== DEMAND FORECAST MODEL ====================
    describe('DemandForecast Model', () => {
        const DemandForecast = require('../../backend/models/DemandForecast');

        test('should require forecastType', () => {
            const forecast = new DemandForecast({
                modelUsed: 'XGBoost',
            });
            const errors = forecast.validateSync();

            expect(errors.errors.forecastType).toBeDefined();
        });

        test('should require modelUsed', () => {
            const forecast = new DemandForecast({
                forecastType: 'daily',
            });
            const errors = forecast.validateSync();

            expect(errors.errors.modelUsed).toBeDefined();
        });

        test('should only accept valid forecast types', () => {
            const forecast = new DemandForecast({
                forecastType: 'yearly', // Invalid
                modelUsed: 'XGBoost',
            });
            const errors = forecast.validateSync();

            expect(errors.errors.forecastType).toBeDefined();
        });

        test('should accept valid forecast types', () => {
            ['daily', 'weekly', 'monthly'].forEach(type => {
                const forecast = new DemandForecast({
                    forecastType: type,
                    modelUsed: 'XGBoost',
                });
                const errors = forecast.validateSync();
                expect(errors?.errors?.forecastType).toBeUndefined();
            });
        });

        test('should only accept valid model names', () => {
            const forecast = new DemandForecast({
                forecastType: 'daily',
                modelUsed: 'RandomForest', // Invalid
            });
            const errors = forecast.validateSync();

            expect(errors.errors.modelUsed).toBeDefined();
        });

        test('should accept valid model names', () => {
            ['XGBoost', 'SARIMA', 'LSTM'].forEach(model => {
                const forecast = new DemandForecast({
                    forecastType: 'daily',
                    modelUsed: model,
                });
                const errors = forecast.validateSync();
                expect(errors?.errors?.modelUsed).toBeUndefined();
            });
        });
    });
});
