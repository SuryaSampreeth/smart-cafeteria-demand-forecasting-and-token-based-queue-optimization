const {
    getDailyForecast,
    getWeeklyForecast,
    getMonthlyForecast,
    getModelAccuracy,
    triggerRetrain,
    getHistoricalComparison,
    checkMLHealth,
} = require('../../backend/controllers/demandForecastController');
const axios = require('axios');
const DemandForecast = require('../../backend/models/DemandForecast');

// Mock dependencies
jest.mock('axios');
jest.mock('../../backend/models/DemandForecast');

/*
 * Unit tests for the demand forecast controller.
 * Tests ML service integration, forecast retrieval, and caching.
 */
describe('Demand Forecast Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ML_SERVICE_URL = 'http://localhost:5001';

        req = {
            query: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    describe('getDailyForecast', () => {
        test('should return daily forecast data from ML service', async () => {
            const mockMLResponse = {
                data: {
                    model_used: 'XGBoost',
                    generated_at: '2026-03-10',
                    forecast_horizon: '7 days',
                    data: [
                        {
                            date: '2026-03-11',
                            day_name: 'Wednesday',
                            predicted_demand: 150,
                            confidence: { lower: 120, upper: 180 },
                        },
                    ],
                },
            };

            axios.mockResolvedValue(mockMLResponse);
            DemandForecast.findOneAndUpdate.mockResolvedValue({});

            await getDailyForecast(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    forecastType: 'daily',
                })
            );
        });

        test('should use default 7 days when no days parameter provided', async () => {
            axios.mockResolvedValue({
                data: {
                    model_used: 'XGBoost',
                    generated_at: '2026-03-10',
                    forecast_horizon: '7 days',
                    data: [],
                },
            });
            DemandForecast.findOneAndUpdate.mockResolvedValue({});

            await getDailyForecast(req, res);

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: { days: 7 },
                })
            );
        });

        test('should return 500 if ML service is down', async () => {
            const error = new Error('Connection refused');
            error.code = 'ECONNREFUSED';
            axios.mockRejectedValue(error);

            await getDailyForecast(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false })
            );
        });
    });

    describe('getWeeklyForecast', () => {
        test('should return weekly forecast data', async () => {
            axios.mockResolvedValue({
                data: {
                    model_used: 'XGBoost',
                    generated_at: '2026-03-10',
                    forecast_horizon: '4 weeks',
                    data: [
                        {
                            start_date: '2026-03-11',
                            total_predicted_demand: 700,
                            confidence: { lower: 600, upper: 800 },
                        },
                    ],
                },
            });
            DemandForecast.findOneAndUpdate.mockResolvedValue({});

            await getWeeklyForecast(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    forecastType: 'weekly',
                })
            );
        });
    });

    describe('getMonthlyForecast', () => {
        test('should return monthly forecast data', async () => {
            axios.mockResolvedValue({
                data: {
                    model_used: 'LSTM',
                    generated_at: '2026-03-10',
                    forecast_horizon: '3 months',
                    data: [
                        {
                            start_date: '2026-04-01',
                            total_predicted_demand: 3000,
                            confidence: { lower: 2500, upper: 3500 },
                        },
                    ],
                },
            });
            DemandForecast.findOneAndUpdate.mockResolvedValue({});

            await getMonthlyForecast(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    forecastType: 'monthly',
                })
            );
        });
    });

    describe('getModelAccuracy', () => {
        test('should return model accuracy metrics', async () => {
            axios.mockResolvedValue({
                data: {
                    best_model: 'XGBoost',
                    active_model: 'XGBoost',
                    trained_at: '2026-03-09',
                    models: {},
                    description: 'Model comparison',
                },
            });

            await getModelAccuracy(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    bestModel: 'XGBoost',
                })
            );
        });
    });

    describe('triggerRetrain', () => {
        test('should trigger model retraining', async () => {
            axios.mockResolvedValue({
                data: {
                    status: 'success',
                    message: 'Models retrained',
                    active_model: 'XGBoost',
                },
            });

            await triggerRetrain(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    status: 'success',
                })
            );
        });
    });

    describe('getHistoricalComparison', () => {
        test('should return historical comparison data', async () => {
            axios.mockResolvedValue({
                data: {
                    model_used: 'XGBoost',
                    period: '30 days',
                    data: [],
                },
            });

            await getHistoricalComparison(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    modelUsed: 'XGBoost',
                })
            );
        });
    });

    describe('checkMLHealth', () => {
        test('should return ML service health status', async () => {
            axios.mockResolvedValue({
                data: { status: 'healthy', models_loaded: true },
            });

            await checkMLHealth(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    mlService: { status: 'healthy', models_loaded: true },
                })
            );
        });

        test('should return 503 when ML service is unavailable', async () => {
            const error = new Error('Connection refused');
            error.code = 'ECONNREFUSED';
            axios.mockRejectedValue(error);

            await checkMLHealth(req, res);

            expect(res.status).toHaveBeenCalledWith(503);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    hint: expect.stringContaining('Start the ML service'),
                })
            );
        });
    });
});
