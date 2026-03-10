"""
Tests for Data Pipeline (data_pipeline.py)
============================================
Tests data loading, weather fetching (with mocks), academic calendar
parsing, and feature engineering logic.
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


# ======================== LOAD KAGGLE DATA ========================

class TestLoadKaggleData:
    """Tests for load_kaggle_sales_data()."""

    def test_raises_when_file_missing(self, tmp_path):
        """Should raise FileNotFoundError when train.csv doesn't exist."""
        from data_pipeline import load_kaggle_sales_data
        with patch('data_pipeline.RAW_DATA_PATH', str(tmp_path / 'missing.csv')):
            with pytest.raises(FileNotFoundError):
                load_kaggle_sales_data()

    def test_loads_csv_successfully(self, sample_sales_data):
        """Should load and return a DataFrame with expected columns."""
        from data_pipeline import load_kaggle_sales_data
        csv_path, original_df = sample_sales_data

        with patch('data_pipeline.RAW_DATA_PATH', csv_path):
            df = load_kaggle_sales_data()

        assert isinstance(df, pd.DataFrame)
        assert 'date' in df.columns
        assert 'store' in df.columns
        assert 'item' in df.columns
        assert 'sales' in df.columns

    def test_shifts_dates_by_7_years(self, tmp_path):
        """Kaggle dates (2013-2017) should be shifted to (2020-2024)."""
        from data_pipeline import load_kaggle_sales_data

        # Create a small dataset with 2013 dates (each row gets its own date)
        np.random.seed(42)
        dates = pd.date_range('2013-01-01', periods=30, freq='D')
        rows = []
        for d in dates:
            rows.append({'date': d.strftime('%Y-%m-%d'), 'store': 1, 'item': 1, 'sales': 50})
        old_df = pd.DataFrame(rows)
        csv_path = tmp_path / 'train_2013.csv'
        old_df.to_csv(csv_path, index=False)

        with patch('data_pipeline.RAW_DATA_PATH', str(csv_path)):
            df = load_kaggle_sales_data()
            # All dates should be >= 2020 (shifted by 7 years)
            assert df['date'].min().year >= 2020

    def test_validates_required_columns(self, tmp_path):
        """Should raise ValueError if expected columns are missing."""
        from data_pipeline import load_kaggle_sales_data

        # CSV has a 'date' column (so parse_dates won't choke) but missing
        # the other required columns: store, item, sales
        bad_df = pd.DataFrame({'date': ['2020-01-01'], 'a': [1], 'b': [2]})
        bad_path = tmp_path / 'bad.csv'
        bad_df.to_csv(bad_path, index=False)

        with patch('data_pipeline.RAW_DATA_PATH', str(bad_path)):
            with pytest.raises(ValueError, match="missing columns|Missing column"):
                load_kaggle_sales_data()


# ======================== FETCH WEATHER DATA ========================

class TestFetchWeatherData:
    """Tests for fetch_weather_data()."""

    def test_loads_from_cache_if_exists(self, sample_weather_data):
        """Should load cached weather CSV instead of hitting the API."""
        from data_pipeline import fetch_weather_data
        csv_path, original_df = sample_weather_data

        with patch('data_pipeline.WEATHER_PATH', csv_path):
            df = fetch_weather_data()

        assert isinstance(df, pd.DataFrame)
        assert len(df) == len(original_df)
        assert 'temperature_max' in df.columns

    @patch('requests.get')
    def test_fetches_from_api_when_no_cache(self, mock_get, tmp_path):
        """Should call Open-Meteo API when no cached file exists."""
        from data_pipeline import fetch_weather_data

        # Mock API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {
            'daily': {
                'time': ['2023-01-01', '2023-01-02'],
                'temperature_2m_max': [30.0, 31.0],
                'temperature_2m_min': [20.0, 21.0],
                'temperature_2m_mean': [25.0, 26.0],
                'precipitation_sum': [0.0, 2.5],
                'rain_sum': [0.0, 2.0],
            }
        }
        mock_get.return_value = mock_response

        weather_path = str(tmp_path / 'weather_data.csv')
        with patch('data_pipeline.WEATHER_PATH', weather_path):
            df = fetch_weather_data(
                start='2023-01-01',
                end='2023-01-02',
            )

        assert isinstance(df, pd.DataFrame)
        assert len(df) >= 2

    @patch('requests.get', side_effect=Exception('Network error'))
    def test_generates_fallback_on_api_failure(self, mock_get, tmp_path):
        """Should generate fallback weather data when the API fails."""
        from data_pipeline import fetch_weather_data

        weather_path = str(tmp_path / 'weather_data.csv')
        with patch('data_pipeline.WEATHER_PATH', weather_path):
            df = fetch_weather_data(
                start='2023-01-01',
                end='2023-01-02',
            )

        assert isinstance(df, pd.DataFrame)
        assert len(df) > 0


# ======================== FALLBACK WEATHER ========================

class TestFallbackWeather:
    """Tests for _generate_fallback_weather()."""

    def test_returns_correct_columns(self):
        """Fallback weather should have all required columns."""
        from data_pipeline import _generate_fallback_weather
        dates = pd.date_range('2023-06-01', periods=10, freq='D')
        df = _generate_fallback_weather(dates)

        expected_cols = {'date', 'temperature_max', 'temperature_min',
                         'temperature_mean', 'precipitation', 'rainfall'}
        assert expected_cols.issubset(set(df.columns))

    def test_returns_correct_number_of_rows(self):
        """Should return one row per date."""
        from data_pipeline import _generate_fallback_weather
        dates = pd.date_range('2023-01-01', periods=30, freq='D')
        df = _generate_fallback_weather(dates)
        assert len(df) == 30

    def test_temperature_max_above_min(self):
        """Max temperature should generally be above min temperature."""
        from data_pipeline import _generate_fallback_weather
        dates = pd.date_range('2023-06-01', periods=100, freq='D')
        df = _generate_fallback_weather(dates)
        # Allow some statistical outliers, but majority should hold
        assert (df['temperature_max'] > df['temperature_min']).mean() > 0.9

    def test_precipitation_non_negative(self):
        """Precipitation should never be negative."""
        from data_pipeline import _generate_fallback_weather
        dates = pd.date_range('2023-01-01', periods=100, freq='D')
        df = _generate_fallback_weather(dates)
        assert (df['precipitation'] >= 0).all()


# ======================== ACADEMIC CALENDAR ========================

class TestLoadAcademicCalendar:
    """Tests for load_academic_calendar()."""

    def test_loads_calendar_successfully(self, sample_academic_calendar):
        """Should parse academic calendar and return date sets."""
        from data_pipeline import load_academic_calendar
        cal_path, cal_data = sample_academic_calendar

        with patch('data_pipeline.CALENDAR_PATH', cal_path):
            semester, exam, holiday, vacation = load_academic_calendar()

        assert len(semester) > 0
        assert len(exam) > 0
        assert len(holiday) > 0
        assert len(vacation) > 0

    def test_semester_dates_are_timestamps(self, sample_academic_calendar):
        """Semester dates should be pandas Timestamps."""
        from data_pipeline import load_academic_calendar
        cal_path, _ = sample_academic_calendar

        with patch('data_pipeline.CALENDAR_PATH', cal_path):
            semester, _, _, _ = load_academic_calendar()

        for d in list(semester)[:5]:
            assert isinstance(d, pd.Timestamp)

    def test_holiday_dates_match_input(self, sample_academic_calendar):
        """Holiday dates should match the JSON input."""
        from data_pipeline import load_academic_calendar
        cal_path, cal_data = sample_academic_calendar

        with patch('data_pipeline.CALENDAR_PATH', cal_path):
            _, _, holidays, _ = load_academic_calendar()

        # Our fixture has 3 holiday dates
        assert len(holidays) == 3

    def test_vacation_period_span(self, sample_academic_calendar):
        """Vacation date set should span the full period."""
        from data_pipeline import load_academic_calendar
        cal_path, cal_data = sample_academic_calendar

        with patch('data_pipeline.CALENDAR_PATH', cal_path):
            _, _, _, vacation = load_academic_calendar()

        # Winter Break: Dec 20 to Jan 10 = 22 days
        assert len(vacation) == 22


# ======================== FEATURE ENGINEERING ========================

class TestEngineerFeatures:
    """Tests for engineer_features()."""

    def test_produces_expected_columns(self, sample_sales_data, sample_weather_data, sample_academic_calendar):
        """Engineered features should include temporal, weather, and calendar columns."""
        from data_pipeline import engineer_features, load_academic_calendar

        _, sales_df = sample_sales_data
        sales_df['date'] = pd.to_datetime(sales_df['date'])

        _, weather_df = sample_weather_data
        cal_path, _ = sample_academic_calendar

        with patch('data_pipeline.CALENDAR_PATH', cal_path):
            semester, exam, holiday, vacation = load_academic_calendar()

        result = engineer_features(sales_df, weather_df, semester, exam, holiday, vacation)

        # Check temporal features
        assert 'day_of_week' in result.columns
        assert 'month' in result.columns
        assert 'is_weekend' in result.columns

        # Check weather features
        assert 'temperature_mean' in result.columns
        assert 'is_rainy' in result.columns

        # Check calendar features
        assert 'is_semester' in result.columns
        assert 'is_exam' in result.columns

        # Check lag features
        assert 'sales_lag_1' in result.columns
        assert 'sales_lag_7' in result.columns

        # Check rolling features
        assert 'sales_rolling_mean_7' in result.columns

    def test_drops_nan_rows(self, sample_sales_data, sample_weather_data, sample_academic_calendar):
        """Should drop rows with NaN values from lag computations."""
        from data_pipeline import engineer_features, load_academic_calendar

        _, sales_df = sample_sales_data
        sales_df['date'] = pd.to_datetime(sales_df['date'])

        _, weather_df = sample_weather_data
        cal_path, _ = sample_academic_calendar

        with patch('data_pipeline.CALENDAR_PATH', cal_path):
            semester, exam, holiday, vacation = load_academic_calendar()

        result = engineer_features(sales_df, weather_df, semester, exam, holiday, vacation)
        assert result.isna().sum().sum() == 0

    def test_cyclical_encoding_range(self, sample_sales_data, sample_weather_data, sample_academic_calendar):
        """Cyclical sin/cos features should be in [-1, 1] range."""
        from data_pipeline import engineer_features, load_academic_calendar

        _, sales_df = sample_sales_data
        sales_df['date'] = pd.to_datetime(sales_df['date'])

        _, weather_df = sample_weather_data
        cal_path, _ = sample_academic_calendar

        with patch('data_pipeline.CALENDAR_PATH', cal_path):
            semester, exam, holiday, vacation = load_academic_calendar()

        result = engineer_features(sales_df, weather_df, semester, exam, holiday, vacation)

        assert result['dow_sin'].between(-1, 1).all()
        assert result['dow_cos'].between(-1, 1).all()
        assert result['month_sin'].between(-1, 1).all()
        assert result['month_cos'].between(-1, 1).all()

    def test_item_category_mapping(self, sample_sales_data, sample_weather_data, sample_academic_calendar):
        """Items should be mapped to one of 5 food categories."""
        from data_pipeline import engineer_features, load_academic_calendar

        _, sales_df = sample_sales_data
        sales_df['date'] = pd.to_datetime(sales_df['date'])

        _, weather_df = sample_weather_data
        cal_path, _ = sample_academic_calendar

        with patch('data_pipeline.CALENDAR_PATH', cal_path):
            semester, exam, holiday, vacation = load_academic_calendar()

        result = engineer_features(sales_df, weather_df, semester, exam, holiday, vacation)

        valid_categories = {'veg', 'non-veg', 'beverage', 'dessert', 'snack'}
        assert set(result['item_category'].unique()).issubset(valid_categories)
