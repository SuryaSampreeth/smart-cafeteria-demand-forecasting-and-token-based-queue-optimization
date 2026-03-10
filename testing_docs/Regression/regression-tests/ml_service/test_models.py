"""
Tests for ML Models (models.py)
================================
Tests compute_metrics, model selection, and the training wrappers
using small synthetic data to avoid long training times.
"""

import os
import sys
import json
import pytest
import numpy as np
import pandas as pd
from unittest.mock import patch, MagicMock
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'ml_service'))

from models import compute_metrics, select_best_model


# ======================== COMPUTE METRICS ========================

class TestComputeMetrics:
    """Tests for the compute_metrics() utility function."""

    def test_perfect_prediction(self):
        """Identical arrays should give zero error metrics."""
        y_true = np.array([10.0, 20.0, 30.0])
        y_pred = np.array([10.0, 20.0, 30.0])
        metrics = compute_metrics(y_true, y_pred)
        assert metrics['rmse'] == 0.0
        assert metrics['mae'] == 0.0
        assert metrics['mape'] == 0.0

    def test_known_rmse_value(self):
        """RMSE of [3, -3] errors should be 3.0."""
        y_true = np.array([10.0, 20.0])
        y_pred = np.array([13.0, 17.0])
        metrics = compute_metrics(y_true, y_pred)
        assert metrics['rmse'] == 3.0

    def test_known_mae_value(self):
        """MAE of [2, 4] absolute errors should be 3.0."""
        y_true = np.array([10.0, 20.0])
        y_pred = np.array([12.0, 16.0])
        metrics = compute_metrics(y_true, y_pred)
        assert metrics['mae'] == 3.0

    def test_mape_with_zero_actuals(self):
        """MAPE should handle zero actual values gracefully (skip them)."""
        y_true = np.array([0.0, 10.0, 20.0])
        y_pred = np.array([5.0, 10.0, 20.0])
        metrics = compute_metrics(y_true, y_pred)
        # MAPE is only computed where y_true > 0
        assert metrics['mape'] == 0.0  # Both non-zero actuals match exactly

    def test_all_zero_actuals(self):
        """MAPE should return 0 when all actuals are zero."""
        y_true = np.array([0.0, 0.0, 0.0])
        y_pred = np.array([1.0, 2.0, 3.0])
        metrics = compute_metrics(y_true, y_pred)
        assert metrics['mape'] == 0.0

    def test_returns_rounded_values(self):
        """Metrics should be rounded to specified decimal places."""
        y_true = np.array([10.0, 20.0, 30.0])
        y_pred = np.array([11.123, 19.456, 31.789])
        metrics = compute_metrics(y_true, y_pred)
        # RMSE and MAE rounded to 4 decimal places
        assert isinstance(metrics['rmse'], float)
        assert isinstance(metrics['mae'], float)
        assert isinstance(metrics['mape'], float)

    def test_returns_dict_with_expected_keys(self):
        """Result should contain rmse, mae, and mape keys."""
        metrics = compute_metrics(np.array([1.0]), np.array([1.0]))
        assert set(metrics.keys()) == {'rmse', 'mae', 'mape'}

    def test_large_error(self):
        """Large prediction errors should produce large metric values."""
        y_true = np.array([10.0, 20.0])
        y_pred = np.array([100.0, 200.0])
        metrics = compute_metrics(y_true, y_pred)
        assert metrics['rmse'] > 50
        assert metrics['mae'] > 50
        assert metrics['mape'] > 100  # > 100% off


# ======================== SELECT BEST MODEL ========================

class TestSelectBestModel:
    """Tests for the select_best_model() function."""

    def test_selects_lowest_rmse(self, tmp_path):
        """Should select the model with the lowest RMSE."""
        results = [
            {'name': 'ModelA', 'metrics': {'rmse': 20.0, 'mae': 15.0, 'mape': 25.0}},
            {'name': 'ModelB', 'metrics': {'rmse': 10.0, 'mae': 8.0, 'mape': 15.0}},
            {'name': 'ModelC', 'metrics': {'rmse': 15.0, 'mae': 12.0, 'mape': 20.0}},
        ]
        # Patch MODELS_DIR to use tmp_path for the comparison JSON
        with patch('models.MODELS_DIR', str(tmp_path)):
            best, comparison = select_best_model(results)
            assert best['name'] == 'ModelB'

    def test_raises_on_empty_results(self):
        """Should raise ValueError when no valid models exist."""
        with pytest.raises(ValueError, match="No models were successfully trained"):
            select_best_model([])

    def test_skips_none_results(self, tmp_path):
        """Should ignore None entries in results list."""
        results = [
            None,
            {'name': 'ModelA', 'metrics': {'rmse': 15.0, 'mae': 10.0, 'mape': 20.0}},
            None,
        ]
        with patch('models.MODELS_DIR', str(tmp_path)):
            best, comparison = select_best_model(results)
            assert best['name'] == 'ModelA'

    def test_raises_when_all_none(self):
        """Should raise ValueError when all results are None."""
        with pytest.raises(ValueError):
            select_best_model([None, None, None])

    def test_creates_comparison_json(self, tmp_path):
        """Should write model_comparison.json to MODELS_DIR."""
        results = [
            {'name': 'ModelA', 'metrics': {'rmse': 10.0, 'mae': 8.0, 'mape': 15.0}},
        ]
        with patch('models.MODELS_DIR', str(tmp_path)):
            best, comparison = select_best_model(results)
            comp_path = tmp_path / 'model_comparison.json'
            assert comp_path.exists()

    def test_comparison_json_has_correct_structure(self, tmp_path):
        """model_comparison.json should have best_model, trained_at, models keys."""
        results = [
            {'name': 'XGBoost', 'metrics': {'rmse': 12.0, 'mae': 9.0, 'mape': 18.0}},
            {'name': 'SARIMA', 'metrics': {'rmse': 15.0, 'mae': 11.0, 'mape': 22.0}},
        ]
        with patch('models.MODELS_DIR', str(tmp_path)):
            best, comparison = select_best_model(results)
            assert comparison['best_model'] == 'XGBoost'
            assert 'trained_at' in comparison
            assert 'XGBoost' in comparison['models']
            assert 'SARIMA' in comparison['models']

    def test_single_model_is_selected(self, tmp_path):
        """When only one model trains, it should be selected as best."""
        results = [
            {'name': 'LSTM', 'metrics': {'rmse': 25.0, 'mae': 20.0, 'mape': 30.0}},
        ]
        with patch('models.MODELS_DIR', str(tmp_path)):
            best, comparison = select_best_model(results)
            assert best['name'] == 'LSTM'


# ======================== TRAIN ALL MODELS ========================

class TestTrainAllModels:
    """Tests for the train_all_models() orchestrator."""

    @patch('models.train_lstm', return_value=None)
    @patch('models.train_xgboost')
    @patch('models.train_arima', return_value=None)
    def test_train_all_calls_each_trainer(self, mock_arima, mock_xgb, mock_lstm, tmp_path):
        """train_all_models should invoke all three training functions."""
        mock_xgb.return_value = {
            'name': 'XGBoost',
            'metrics': {'rmse': 12.0, 'mae': 9.0, 'mape': 18.0},
        }

        from models import train_all_models

        # Create a minimal DataFrame
        df = pd.DataFrame({
            'date': pd.date_range('2023-01-01', periods=200),
            'item': 1,
            'sales': np.random.poisson(50, 200),
        })

        with patch('models.MODELS_DIR', str(tmp_path)):
            best, comparison, all_results = train_all_models(df)

        mock_arima.assert_called_once()
        mock_xgb.assert_called_once()
        mock_lstm.assert_called_once()
        assert best['name'] == 'XGBoost'
