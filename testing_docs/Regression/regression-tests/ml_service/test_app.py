"""
Tests for Flask API Endpoints (app.py)
=======================================
Tests the demand forecasting API health check, forecast endpoints,
accuracy reporting, and error handling when no model is loaded.
"""

import os
import sys
import json
import pytest
import numpy as np
import pandas as pd
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'ml_service'))


# ======================== HEALTH ENDPOINT ========================

class TestHealthEndpoint:
    """Tests for GET /api/health."""

    def test_health_returns_200(self, client):
        """Health endpoint should always return 200."""
        response = client.get('/api/health')
        assert response.status_code == 200

    def test_health_contains_required_fields(self, client):
        """Health response must include status, model_loaded, model_name, timestamp."""
        response = client.get('/api/health')
        data = response.get_json()

        assert 'status' in data
        assert 'model_loaded' in data
        assert 'model_name' in data
        assert 'timestamp' in data

    def test_health_status_is_healthy(self, client):
        """Status field should be 'healthy'."""
        response = client.get('/api/health')
        data = response.get_json()
        assert data['status'] == 'healthy'

    def test_health_timestamp_is_iso_format(self, client):
        """Timestamp should be a valid ISO 8601 string."""
        response = client.get('/api/health')
        data = response.get_json()
        # Should not raise ValueError
        datetime.fromisoformat(data['timestamp'])

    def test_health_model_loaded_is_boolean(self, client):
        """model_loaded should be a boolean value."""
        response = client.get('/api/health')
        data = response.get_json()
        assert isinstance(data['model_loaded'], bool)


# ======================== DAILY FORECAST ENDPOINT ========================

class TestDailyForecast:
    """Tests for GET /api/forecast/daily."""

    def test_daily_returns_503_when_no_model(self, client):
        """Should return 503 when no model is loaded."""
        import app as app_module
        original_model = app_module.loaded_model
        app_module.loaded_model = None
        try:
            response = client.get('/api/forecast/daily')
            assert response.status_code == 503
            data = response.get_json()
            assert 'error' in data
        finally:
            app_module.loaded_model = original_model

    def test_daily_returns_200_with_model(self, client, sample_processed_data):
        """Should return 200 when a model is loaded."""
        import app as app_module
        csv_path, df = sample_processed_data

        # Mock XGBoost model
        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([50.0])

        original_model = app_module.loaded_model
        original_name = app_module.loaded_model_name
        original_path = app_module.PROCESSED_PATH

        app_module.loaded_model = {
            'model': mock_model,
            'feature_cols': ['day_of_week', 'month', 'is_weekend'],
        }
        app_module.loaded_model_name = 'XGBoost'
        app_module.PROCESSED_PATH = csv_path

        try:
            response = client.get('/api/forecast/daily')
            assert response.status_code == 200
            data = response.get_json()
            assert data['forecast_type'] == 'daily'
            assert data['model_used'] == 'XGBoost'
            assert 'data' in data
            assert len(data['data']) == 7  # Default 7 days
        finally:
            app_module.loaded_model = original_model
            app_module.loaded_model_name = original_name
            app_module.PROCESSED_PATH = original_path

    def test_daily_custom_days_param(self, client, sample_processed_data):
        """Should accept custom 'days' query parameter."""
        import app as app_module
        csv_path, df = sample_processed_data

        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([50.0])

        original_model = app_module.loaded_model
        original_name = app_module.loaded_model_name
        original_path = app_module.PROCESSED_PATH

        app_module.loaded_model = {
            'model': mock_model,
            'feature_cols': ['day_of_week', 'month', 'is_weekend'],
        }
        app_module.loaded_model_name = 'XGBoost'
        app_module.PROCESSED_PATH = csv_path

        try:
            response = client.get('/api/forecast/daily?days=3')
            assert response.status_code == 200
            data = response.get_json()
            assert len(data['data']) == 3
        finally:
            app_module.loaded_model = original_model
            app_module.loaded_model_name = original_name
            app_module.PROCESSED_PATH = original_path

    def test_daily_caps_at_30_days(self, client, sample_processed_data):
        """Days parameter should be capped at 30."""
        import app as app_module
        csv_path, df = sample_processed_data

        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([50.0])

        original_model = app_module.loaded_model
        original_name = app_module.loaded_model_name
        original_path = app_module.PROCESSED_PATH

        app_module.loaded_model = {
            'model': mock_model,
            'feature_cols': ['day_of_week', 'month', 'is_weekend'],
        }
        app_module.loaded_model_name = 'XGBoost'
        app_module.PROCESSED_PATH = csv_path

        try:
            response = client.get('/api/forecast/daily?days=100')
            assert response.status_code == 200
            data = response.get_json()
            assert len(data['data']) == 30  # Capped
        finally:
            app_module.loaded_model = original_model
            app_module.loaded_model_name = original_name
            app_module.PROCESSED_PATH = original_path

    def test_daily_forecast_item_structure(self, client, sample_processed_data):
        """Each forecast item should have date, day_name, predicted_demand, confidence."""
        import app as app_module
        csv_path, df = sample_processed_data

        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([50.0])

        original_model = app_module.loaded_model
        original_name = app_module.loaded_model_name
        original_path = app_module.PROCESSED_PATH

        app_module.loaded_model = {
            'model': mock_model,
            'feature_cols': ['day_of_week', 'month', 'is_weekend'],
        }
        app_module.loaded_model_name = 'XGBoost'
        app_module.PROCESSED_PATH = csv_path

        try:
            response = client.get('/api/forecast/daily?days=1')
            data = response.get_json()
            item = data['data'][0]
            assert 'date' in item
            assert 'day_name' in item
            assert 'predicted_demand' in item
            assert 'confidence' in item
            assert 'lower' in item['confidence']
            assert 'upper' in item['confidence']
        finally:
            app_module.loaded_model = original_model
            app_module.loaded_model_name = original_name
            app_module.PROCESSED_PATH = original_path

    def test_daily_predicted_demand_non_negative(self, client, sample_processed_data):
        """Predicted demand values should never be negative."""
        import app as app_module
        csv_path, df = sample_processed_data

        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([-10.0])  # Negative prediction

        original_model = app_module.loaded_model
        original_name = app_module.loaded_model_name
        original_path = app_module.PROCESSED_PATH

        app_module.loaded_model = {
            'model': mock_model,
            'feature_cols': ['day_of_week'],
        }
        app_module.loaded_model_name = 'XGBoost'
        app_module.PROCESSED_PATH = csv_path

        try:
            response = client.get('/api/forecast/daily?days=1')
            data = response.get_json()
            assert data['data'][0]['predicted_demand'] >= 0
        finally:
            app_module.loaded_model = original_model
            app_module.loaded_model_name = original_name
            app_module.PROCESSED_PATH = original_path


# ======================== WEEKLY FORECAST ENDPOINT ========================

class TestWeeklyForecast:
    """Tests for GET /api/forecast/weekly."""

    def test_weekly_returns_503_when_no_model(self, client):
        """Should return 503 when no model is loaded."""
        import app as app_module
        original_model = app_module.loaded_model
        app_module.loaded_model = None
        try:
            response = client.get('/api/forecast/weekly')
            assert response.status_code == 503
        finally:
            app_module.loaded_model = original_model

    def test_weekly_returns_200_with_model(self, client, sample_processed_data):
        """Should return 200 with aggregated weekly data."""
        import app as app_module
        csv_path, df = sample_processed_data

        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([50.0])

        original_model = app_module.loaded_model
        original_name = app_module.loaded_model_name
        original_path = app_module.PROCESSED_PATH

        app_module.loaded_model = {
            'model': mock_model,
            'feature_cols': ['day_of_week'],
        }
        app_module.loaded_model_name = 'XGBoost'
        app_module.PROCESSED_PATH = csv_path

        try:
            response = client.get('/api/forecast/weekly')
            assert response.status_code == 200
            data = response.get_json()
            assert data['forecast_type'] == 'weekly'
            assert len(data['data']) == 4  # Default 4 weeks
        finally:
            app_module.loaded_model = original_model
            app_module.loaded_model_name = original_name
            app_module.PROCESSED_PATH = original_path

    def test_weekly_item_has_aggregated_fields(self, client, sample_processed_data):
        """Weekly items should have total and average demand fields."""
        import app as app_module
        csv_path, df = sample_processed_data

        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([50.0])

        original_model = app_module.loaded_model
        original_name = app_module.loaded_model_name
        original_path = app_module.PROCESSED_PATH

        app_module.loaded_model = {
            'model': mock_model,
            'feature_cols': ['day_of_week'],
        }
        app_module.loaded_model_name = 'XGBoost'
        app_module.PROCESSED_PATH = csv_path

        try:
            response = client.get('/api/forecast/weekly?weeks=1')
            data = response.get_json()
            week = data['data'][0]
            assert 'week_number' in week
            assert 'start_date' in week
            assert 'end_date' in week
            assert 'total_predicted_demand' in week
            assert 'avg_daily_demand' in week
            assert 'confidence' in week
        finally:
            app_module.loaded_model = original_model
            app_module.loaded_model_name = original_name
            app_module.PROCESSED_PATH = original_path

    def test_weekly_caps_at_12_weeks(self, client, sample_processed_data):
        """Weeks parameter should be capped at 12."""
        import app as app_module
        csv_path, df = sample_processed_data

        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([50.0])

        original_model = app_module.loaded_model
        original_name = app_module.loaded_model_name
        original_path = app_module.PROCESSED_PATH

        app_module.loaded_model = {
            'model': mock_model,
            'feature_cols': ['day_of_week'],
        }
        app_module.loaded_model_name = 'XGBoost'
        app_module.PROCESSED_PATH = csv_path

        try:
            response = client.get('/api/forecast/weekly?weeks=50')
            assert response.status_code == 200
            data = response.get_json()
            assert len(data['data']) == 12  # Capped
        finally:
            app_module.loaded_model = original_model
            app_module.loaded_model_name = original_name
            app_module.PROCESSED_PATH = original_path


# ======================== MONTHLY FORECAST ENDPOINT ========================

class TestMonthlyForecast:
    """Tests for GET /api/forecast/monthly."""

    def test_monthly_returns_503_when_no_model(self, client):
        """Should return 503 when no model is loaded."""
        import app as app_module
        original_model = app_module.loaded_model
        app_module.loaded_model = None
        try:
            response = client.get('/api/forecast/monthly')
            assert response.status_code == 503
        finally:
            app_module.loaded_model = original_model

    def test_monthly_returns_200_with_model(self, client, sample_processed_data):
        """Should return 200 with aggregated monthly data."""
        import app as app_module
        csv_path, df = sample_processed_data

        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([50.0])

        original_model = app_module.loaded_model
        original_name = app_module.loaded_model_name
        original_path = app_module.PROCESSED_PATH

        app_module.loaded_model = {
            'model': mock_model,
            'feature_cols': ['day_of_week'],
        }
        app_module.loaded_model_name = 'XGBoost'
        app_module.PROCESSED_PATH = csv_path

        try:
            response = client.get('/api/forecast/monthly')
            assert response.status_code == 200
            data = response.get_json()
            assert data['forecast_type'] == 'monthly'
            assert len(data['data']) == 3  # Default 3 months
        finally:
            app_module.loaded_model = original_model
            app_module.loaded_model_name = original_name
            app_module.PROCESSED_PATH = original_path

    def test_monthly_caps_at_6_months(self, client, sample_processed_data):
        """Months parameter should be capped at 6."""
        import app as app_module
        csv_path, df = sample_processed_data

        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([50.0])

        original_model = app_module.loaded_model
        original_name = app_module.loaded_model_name
        original_path = app_module.PROCESSED_PATH

        app_module.loaded_model = {
            'model': mock_model,
            'feature_cols': ['day_of_week'],
        }
        app_module.loaded_model_name = 'XGBoost'
        app_module.PROCESSED_PATH = csv_path

        try:
            response = client.get('/api/forecast/monthly?months=20')
            assert response.status_code == 200
            data = response.get_json()
            assert len(data['data']) == 6  # Capped
        finally:
            app_module.loaded_model = original_model
            app_module.loaded_model_name = original_name
            app_module.PROCESSED_PATH = original_path


# ======================== ACCURACY ENDPOINT ========================

class TestAccuracyEndpoint:
    """Tests for GET /api/forecast/accuracy."""

    def test_accuracy_returns_503_when_no_comparison(self, client):
        """Should return 503 if model_comparison.json does not exist."""
        import app as app_module
        original_dir = app_module.MODELS_DIR

        app_module.MODELS_DIR = '/nonexistent/path'
        try:
            response = client.get('/api/forecast/accuracy')
            assert response.status_code == 503
        finally:
            app_module.MODELS_DIR = original_dir

    def test_accuracy_returns_200_with_comparison(self, client, mock_model_comparison):
        """Should return 200 with model accuracy data."""
        import app as app_module
        comp_path, comparison = mock_model_comparison
        original_dir = app_module.MODELS_DIR

        app_module.MODELS_DIR = os.path.dirname(comp_path)
        try:
            response = client.get('/api/forecast/accuracy')
            assert response.status_code == 200
            data = response.get_json()
            assert 'best_model' in data
            assert 'models' in data
            assert 'description' in data
        finally:
            app_module.MODELS_DIR = original_dir

    def test_accuracy_includes_metric_descriptions(self, client, mock_model_comparison):
        """Response should include descriptions for rmse, mae, mape."""
        import app as app_module
        comp_path, comparison = mock_model_comparison
        original_dir = app_module.MODELS_DIR

        app_module.MODELS_DIR = os.path.dirname(comp_path)
        try:
            response = client.get('/api/forecast/accuracy')
            data = response.get_json()
            assert 'rmse' in data['description']
            assert 'mae' in data['description']
            assert 'mape' in data['description']
        finally:
            app_module.MODELS_DIR = original_dir


# ======================== RETRAIN ENDPOINT ========================

class TestRetrainEndpoint:
    """Tests for POST /api/forecast/retrain."""

    @patch('subprocess.run')
    def test_retrain_success(self, mock_subprocess, client):
        """Successful retrain should return status 'success'."""
        import app as app_module

        mock_subprocess.return_value = MagicMock(
            returncode=0,
            stdout='Training complete',
            stderr='',
        )

        with patch.object(app_module, 'load_best_model', return_value=True):
            response = client.post('/api/forecast/retrain')
            assert response.status_code == 200
            data = response.get_json()
            assert data['status'] == 'success'

    @patch('subprocess.run')
    def test_retrain_failure(self, mock_subprocess, client):
        """Failed retraining should return 500 with error details."""
        mock_subprocess.return_value = MagicMock(
            returncode=1,
            stdout='',
            stderr='Training error: out of memory',
        )

        response = client.post('/api/forecast/retrain')
        assert response.status_code == 500
        data = response.get_json()
        assert data['status'] == 'error'

    @patch('subprocess.run', side_effect=Exception('Process timeout'))
    def test_retrain_exception(self, mock_subprocess, client):
        """Exception during retraining should be caught and return 500."""
        response = client.post('/api/forecast/retrain')
        assert response.status_code == 500
        data = response.get_json()
        assert data['status'] == 'error'


# ======================== HISTORICAL ENDPOINT ========================

class TestHistoricalEndpoint:
    """Tests for GET /api/forecast/historical."""

    def test_historical_returns_503_when_no_data(self, client):
        """Should return 503 when processed data is missing."""
        import app as app_module
        original_dir = app_module.MODELS_DIR
        original_path = app_module.PROCESSED_PATH

        app_module.MODELS_DIR = '/nonexistent'
        app_module.PROCESSED_PATH = '/nonexistent/data.csv'
        try:
            response = client.get('/api/forecast/historical')
            assert response.status_code == 503
        finally:
            app_module.MODELS_DIR = original_dir
            app_module.PROCESSED_PATH = original_path

    def test_historical_returns_200_with_data(self, client, sample_processed_data, mock_model_comparison):
        """Should return 200 with historical actual demand data."""
        import app as app_module
        csv_path, df = sample_processed_data
        comp_path, comparison = mock_model_comparison

        original_dir = app_module.MODELS_DIR
        original_path = app_module.PROCESSED_PATH
        original_name = app_module.loaded_model_name

        app_module.MODELS_DIR = os.path.dirname(comp_path)
        app_module.PROCESSED_PATH = csv_path
        app_module.loaded_model_name = 'XGBoost'

        try:
            response = client.get('/api/forecast/historical')
            assert response.status_code == 200
            data = response.get_json()
            assert 'data' in data
            assert 'model_used' in data
            assert len(data['data']) > 0
        finally:
            app_module.MODELS_DIR = original_dir
            app_module.PROCESSED_PATH = original_path
            app_module.loaded_model_name = original_name

    def test_historical_items_have_actual_demand(self, client, sample_processed_data, mock_model_comparison):
        """Each historical item should have date and actual_demand."""
        import app as app_module
        csv_path, df = sample_processed_data
        comp_path, comparison = mock_model_comparison

        original_dir = app_module.MODELS_DIR
        original_path = app_module.PROCESSED_PATH
        original_name = app_module.loaded_model_name

        app_module.MODELS_DIR = os.path.dirname(comp_path)
        app_module.PROCESSED_PATH = csv_path
        app_module.loaded_model_name = 'XGBoost'

        try:
            response = client.get('/api/forecast/historical')
            data = response.get_json()
            item = data['data'][0]
            assert 'date' in item
            assert 'actual_demand' in item
        finally:
            app_module.MODELS_DIR = original_dir
            app_module.PROCESSED_PATH = original_path
            app_module.loaded_model_name = original_name


# ======================== LOAD MODEL FUNCTION ========================

class TestLoadBestModel:
    """Tests for the load_best_model() helper function."""

    def test_load_returns_false_when_no_comparison_file(self):
        """Should return False when model_comparison.json is missing."""
        import app as app_module
        original_dir = app_module.MODELS_DIR

        app_module.MODELS_DIR = '/nonexistent'
        try:
            result = app_module.load_best_model()
            assert result is False
        finally:
            app_module.MODELS_DIR = original_dir

    def test_load_sets_global_model_name(self, mock_model_comparison, tmp_path):
        """Should set loaded_model_name when model file exists."""
        import app as app_module
        comp_path, comparison = mock_model_comparison

        # Create a dummy xgboost_model.pkl file so os.path.exists returns True
        model_path = tmp_path / 'xgboost_model.pkl'
        model_path.write_bytes(b'fake')

        fake_model_data = {
            'model': MagicMock(),
            'feature_cols': ['day_of_week'],
            'feature_importance': {},
        }

        original_dir = app_module.MODELS_DIR

        app_module.MODELS_DIR = str(tmp_path)
        try:
            with patch('joblib.load', return_value=fake_model_data):
                result = app_module.load_best_model()
                assert result is True
                assert app_module.loaded_model_name == 'XGBoost'
        finally:
            app_module.MODELS_DIR = original_dir


# ======================== GENERATE FORECAST DISPATCH ========================

class TestGenerateForecast:
    """Tests for the generate_forecast() dispatcher function."""

    def test_routes_to_xgboost(self, sample_processed_data):
        """Should call XGBoost forecast when model name is 'XGBoost'."""
        import app as app_module
        csv_path, df = sample_processed_data

        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([42.0])

        original_model = app_module.loaded_model
        original_name = app_module.loaded_model_name
        original_path = app_module.PROCESSED_PATH

        app_module.loaded_model = {
            'model': mock_model,
            'feature_cols': ['day_of_week'],
        }
        app_module.loaded_model_name = 'XGBoost'
        app_module.PROCESSED_PATH = csv_path

        try:
            result = app_module.generate_forecast(1)
            assert len(result) == 1
            assert result[0]['predicted_demand'] >= 0
        finally:
            app_module.loaded_model = original_model
            app_module.loaded_model_name = original_name
            app_module.PROCESSED_PATH = original_path

    def test_returns_empty_for_unknown_model(self):
        """Should return empty list for unknown model name."""
        import app as app_module
        original_name = app_module.loaded_model_name

        app_module.loaded_model_name = 'UnknownModel'
        try:
            result = app_module.generate_forecast(5)
            assert result == []
        finally:
            app_module.loaded_model_name = original_name
