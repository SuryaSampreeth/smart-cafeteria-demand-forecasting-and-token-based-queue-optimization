"""
conftest.py — Shared Pytest Fixtures for ML Service Tests
===========================================================
Provides test fixtures for the Flask app, mock data,
temporary directories, and model comparison stubs.
"""

import os
import sys
import json
import pytest
import tempfile
import shutil
import numpy as np
import pandas as pd
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

# Ensure ml_service package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'ml_service'))


@pytest.fixture
def app():
    """Create a Flask test client with mocked model state."""
    from app import app as flask_app
    flask_app.config['TESTING'] = True
    yield flask_app


@pytest.fixture
def client(app):
    """Provide a Flask test client."""
    return app.test_client()


@pytest.fixture
def sample_processed_data(tmp_path):
    """Generate a small processed dataset matching the expected schema."""
    np.random.seed(42)
    dates = pd.date_range('2023-01-01', periods=180, freq='D')
    rows = []
    for d in dates:
        for item in range(1, 4):  # 3 items for speed
            rows.append({
                'date': d,
                'item': item,
                'sales': np.random.poisson(50),
                'store': 1,
                'day_of_week': d.dayofweek,
                'day_of_month': d.day,
                'month': d.month,
                'year': d.year,
                'week_of_year': d.isocalendar()[1],
                'is_weekend': int(d.dayofweek >= 5),
                'quarter': (d.month - 1) // 3 + 1,
                'day_of_year': d.timetuple().tm_yday,
                'dow_sin': np.sin(2 * np.pi * d.dayofweek / 7),
                'dow_cos': np.cos(2 * np.pi * d.dayofweek / 7),
                'month_sin': np.sin(2 * np.pi * d.month / 12),
                'month_cos': np.cos(2 * np.pi * d.month / 12),
                'temperature_max': 30 + np.random.normal(0, 3),
                'temperature_min': 20 + np.random.normal(0, 3),
                'temperature_mean': 25 + np.random.normal(0, 2),
                'precipitation': max(0, np.random.exponential(2)),
                'rainfall': max(0, np.random.exponential(1.5)),
                'is_rainy': 0,
                'is_hot': 0,
                'temp_range': 10 + np.random.normal(0, 1),
                'is_semester': 1,
                'is_exam': 0,
                'is_holiday': 0,
                'is_vacation': 0,
                'sales_lag_1': np.random.poisson(50),
                'sales_lag_7': np.random.poisson(50),
                'sales_lag_14': np.random.poisson(50),
                'sales_lag_28': np.random.poisson(50),
                'sales_rolling_mean_7': 50 + np.random.normal(0, 5),
                'sales_rolling_mean_14': 50 + np.random.normal(0, 5),
                'sales_rolling_mean_30': 50 + np.random.normal(0, 5),
                'sales_rolling_std_7': 5 + abs(np.random.normal(0, 1)),
                'sales_rolling_std_14': 5 + abs(np.random.normal(0, 1)),
                'sales_rolling_std_30': 5 + abs(np.random.normal(0, 1)),
                'sales_expanding_mean': 50 + np.random.normal(0, 3),
                'item_category': ['veg', 'non-veg', 'beverage'][item - 1],
                'cat_beverage': int(item == 3),
                'cat_dessert': 0,
                'cat_non-veg': int(item == 2),
                'cat_snack': 0,
                'cat_veg': int(item == 1),
            })

    df = pd.DataFrame(rows)
    csv_path = tmp_path / 'processed_data.csv'
    df.to_csv(csv_path, index=False)
    return str(csv_path), df


@pytest.fixture
def mock_model_comparison(tmp_path):
    """Create a mock model_comparison.json."""
    comparison = {
        'best_model': 'XGBoost',
        'trained_at': datetime.now().isoformat(),
        'models': {
            'XGBoost': {'rmse': 12.5, 'mae': 9.2, 'mape': 15.3},
            'SARIMA': {'rmse': 18.1, 'mae': 14.6, 'mape': 22.8},
            'LSTM': {'rmse': 14.7, 'mae': 11.3, 'mape': 17.9},
        },
    }
    comp_path = tmp_path / 'model_comparison.json'
    with open(comp_path, 'w') as f:
        json.dump(comparison, f, indent=2)
    return str(comp_path), comparison


@pytest.fixture
def sample_academic_calendar(tmp_path):
    """Create a mock academic_calendar.json."""
    calendar = {
        'semesters': [
            {'name': 'Fall 2023', 'start': '2023-08-01', 'end': '2023-12-15'},
            {'name': 'Spring 2024', 'start': '2024-01-15', 'end': '2024-05-30'},
        ],
        'exam_periods': [
            {'name': 'Fall Midterm', 'start': '2023-10-01', 'end': '2023-10-07'},
            {'name': 'Fall Final', 'start': '2023-12-01', 'end': '2023-12-10'},
        ],
        'holidays': [
            {'name': 'Republic Day', 'dates': ['2024-01-26']},
            {'name': 'Diwali', 'dates': ['2023-11-12', '2023-11-13']},
        ],
        'vacation_periods': [
            {'name': 'Winter Break', 'start': '2023-12-20', 'end': '2024-01-10'},
        ],
    }
    cal_path = tmp_path / 'academic_calendar.json'
    with open(cal_path, 'w') as f:
        json.dump(calendar, f, indent=2)
    return str(cal_path), calendar


@pytest.fixture
def sample_weather_data(tmp_path):
    """Create a small weather dataset."""
    np.random.seed(42)
    dates = pd.date_range('2023-01-01', periods=180, freq='D')
    weather_df = pd.DataFrame({
        'date': dates,
        'temperature_max': 30 + np.random.normal(0, 5, len(dates)),
        'temperature_min': 20 + np.random.normal(0, 3, len(dates)),
        'temperature_mean': 25 + np.random.normal(0, 3, len(dates)),
        'precipitation': np.maximum(0, np.random.exponential(2, len(dates))),
        'rainfall': np.maximum(0, np.random.exponential(1.5, len(dates))),
    })
    csv_path = tmp_path / 'weather_data.csv'
    weather_df.to_csv(csv_path, index=False)
    return str(csv_path), weather_df


@pytest.fixture
def sample_sales_data(tmp_path):
    """Create a small raw sales dataset matching Kaggle format."""
    np.random.seed(42)
    dates = pd.date_range('2020-01-01', periods=180, freq='D')
    rows = []
    for d in dates:
        for store in range(1, 3):
            for item in range(1, 4):
                rows.append({
                    'date': d.strftime('%Y-%m-%d'),
                    'store': store,
                    'item': item,
                    'sales': np.random.poisson(50),
                })
    df = pd.DataFrame(rows)
    csv_path = tmp_path / 'train.csv'
    df.to_csv(csv_path, index=False)
    return str(csv_path), df
