# Test Documentation — Smart Cafeteria Management System

> **Total: 272 tests across 18 test suites (206 JavaScript + 66 Python)**
>
> Last run: March 10, 2026 — All passing

---

## How to Run

### Backend (Node.js / Jest)

```bash
cd backend
npx jest --verbose
```

### ML Service (Python / Pytest)

```bash
cd backend/ml_service
python -m pytest tests/ -v
```

---

## Table of Contents

1. [JavaScript Unit Tests](#javascript-unit-tests)
   - [Waiting Time Utility](#1-waiting-time-utility)
   - [Token Generator Utility](#2-token-generator-utility)
   - [Queue Manager Utility](#3-queue-manager-utility)
   - [Slot Manager Utility](#4-slot-manager-utility)
   - [Auth Middleware](#5-auth-middleware---protect)
   - [Role Check Middleware](#6-role-check-middleware---checkrole)
   - [Auth Controller](#7-auth-controller)
   - [Booking Controller](#8-booking-controller)
   - [Menu Controller](#9-menu-controller)
   - [Staff Controller](#10-staff-controller)
   - [Admin Controller](#11-admin-controller)
   - [Demand Forecast Controller](#12-demand-forecast-controller)
   - [Model Schema Validations](#13-model-schema-validations)
2. [JavaScript Integration Tests](#javascript-integration-tests)
   - [Server Setup](#14-server-setup)
   - [API Route Integration](#15-api-route-integration)
3. [Python ML Service Tests](#python-ml-service-tests)
   - [Flask API Endpoints](#16-flask-api-endpoints-test_apppy)
   - [ML Models](#17-ml-models-test_modelspy)
   - [Data Pipeline](#18-data-pipeline-test_data_pipelinepy)

---

## JavaScript Unit Tests

### 1. Waiting Time Utility

**File:** `backend/__tests__/unit/waitingTime.test.js`
**Source:** `backend/utils/waitingTime.js`
**Tests:** 6

| # | Test | Description |
|---|------|-------------|
| 1 | should return 5 minutes for position 1 | First in queue waits 5 min (1 × AVERAGE_SERVICE_TIME) |
| 2 | should return 10 minutes for position 2 | Second in queue waits 10 min |
| 3 | should return 15 minutes for position 3 | Third in queue waits 15 min |
| 4 | should return 0 minutes for position 0 | Edge case: position 0 returns 0 |
| 5 | should scale linearly with queue position | Verifies linear scaling formula |
| 6 | should handle large queue positions | Handles position 100+ correctly |

---

### 2. Token Generator Utility

**File:** `backend/__tests__/unit/tokenGenerator.test.js`
**Source:** `backend/utils/tokenGenerator.js`
**Tests:** 7

| # | Test | Description |
|---|------|-------------|
| 1 | should generate B001 for first Breakfast booking | Breakfast prefix 'B' + zero-padded count |
| 2 | should generate L005 for fifth Lunch booking | Lunch prefix 'L' |
| 3 | should generate S010 for tenth Snacks booking | Snacks prefix 'S' |
| 4 | should generate D001 for first Dinner booking | Dinner prefix 'D' |
| 5 | should pad number to 3 digits | Ensures 3-digit padding (e.g., 001, 010) |
| 6 | should handle large booking counts | Counts above 999 still work |
| 7 | should call countDocuments with correct filter | Verifies DB query for slot + date |

---

### 3. Queue Manager Utility

**File:** `backend/__tests__/unit/queueManager.test.js`
**Source:** `backend/utils/queueManager.js`
**Tests:** 8

**getNextQueuePosition**

| # | Test | Description |
|---|------|-------------|
| 1 | should return 1 when no active bookings exist | Empty queue starts at position 1 |
| 2 | should return next position after highest existing | Correctly increments max position |
| 3 | should query only pending and serving bookings | Filters out cancelled/served |

**updateQueuePositions**

| # | Test | Description |
|---|------|-------------|
| 4 | should decrement positions behind the cancelled position | Shifts queue forward on cancel |
| 5 | should handle cancellation at position 1 | Edge case: first position cancelled |

**recalculateQueueAfterServing**

| # | Test | Description |
|---|------|-------------|
| 6 | should reorder pending bookings sequentially starting from 1 | Reorders after serve completes |
| 7 | should handle empty queue gracefully | No error when queue is empty |
| 8 | should query only pending bookings | Only pending bookings are reordered |

---

### 4. Slot Manager Utility

**File:** `backend/__tests__/unit/slotManager.test.js`
**Source:** `backend/utils/slotManager.js`
**Tests:** 6

**getTodayDateString**

| # | Test | Description |
|---|------|-------------|
| 1 | should return date in YYYY-MM-DD format | Validates date string format |
| 2 | should return current date | Matches today's date |

**getOrCreateTodaySlots**

| # | Test | Description |
|---|------|-------------|
| 3 | should return existing slots if already created for today | Cache hit path |
| 4 | should create slots from templates when none exist for today | Generates daily slots from templates |
| 5 | should return empty array when no templates exist | Handles no templates gracefully |
| 6 | should throw error when database operation fails | Propagates DB errors |

---

### 5. Auth Middleware - protect

**File:** `backend/__tests__/unit/authMiddleware.test.js`
**Source:** `backend/middleware/auth.js`
**Tests:** 7

| # | Test | Description |
|---|------|-------------|
| 1 | should return 401 if no token is provided | Missing Authorization header |
| 2 | should return 401 if authorization header has no Bearer prefix | Malformed header |
| 3 | should return 401 if token verification fails | Invalid/expired JWT |
| 4 | should return 401 if user is not found in database | Token valid but user deleted |
| 5 | should attach user to request and call next on valid token | Happy path — user set on req |
| 6 | should use JWT_SECRET from environment for verification | Uses process.env.JWT_SECRET |
| 7 | should exclude password field when fetching user | Password not leaked via select('-password') |

---

### 6. Role Check Middleware - checkRole

**File:** `backend/__tests__/unit/roleCheck.test.js`
**Source:** `backend/middleware/roleCheck.js`
**Tests:** 7

| # | Test | Description |
|---|------|-------------|
| 1 | should return 401 if user is not authenticated (no req.user) | No user on request |
| 2 | should return 403 if user role is not in allowed roles | Forbidden for wrong role |
| 3 | should call next if user has the required role | Single role match |
| 4 | should allow access when user has one of multiple allowed roles | Multi-role array match |
| 5 | should deny access when user role is not any of the allowed roles | Multi-role array mismatch |
| 6 | should handle student role access to student routes | Student accessing student-only |
| 7 | should handle admin accessing staff routes | Admin role on staff route |

---

### 7. Auth Controller

**File:** `backend/__tests__/unit/authController.test.js`
**Source:** `backend/controllers/authController.js`
**Tests:** 13

**registerStudent**

| # | Test | Description |
|---|------|-------------|
| 1 | should register a new student successfully | Creates user, returns JWT token |
| 2 | should return 400 if user already exists | Duplicate email check |
| 3 | should return 500 on database error | DB failure handled |
| 4 | should set role as student for registered user | Role forced to 'student' |

**login**

| # | Test | Description |
|---|------|-------------|
| 5 | should login successfully with valid credentials | Correct email + password returns token |
| 6 | should return 401 if email is not found | Unknown email |
| 7 | should return 401 if password is incorrect | Wrong password |
| 8 | should return 500 on database error | DB failure handled |

**getMe**

| # | Test | Description |
|---|------|-------------|
| 9 | should return the current user details | Returns user from req.user.id |
| 10 | should return 500 on error | Error handling |

**updateProfile**

| # | Test | Description |
|---|------|-------------|
| 11 | should update user name and registration number | Partial update works |
| 12 | should return 404 if user is not found | Missing user |
| 13 | should keep existing values if no new values provided | No-op update safe |

---

### 8. Booking Controller

**File:** `backend/__tests__/unit/bookingController.test.js`
**Source:** `backend/controllers/bookingController.js`
**Tests:** 15

**createBooking**

| # | Test | Description |
|---|------|-------------|
| 1 | should create a booking successfully | Full happy path with token + queue position |
| 2 | should return 404 if slot not found | Invalid slot ID |
| 3 | should return 400 if slot is for a different day | Past/future slot check |
| 4 | should return 400 if slot is full | Capacity exceeded |

**getMyTokens**

| # | Test | Description |
|---|------|-------------|
| 5 | should return active tokens for the logged-in student | Filters pending + serving |

**getBooking**

| # | Test | Description |
|---|------|-------------|
| 6 | should return booking details for the owner | Owner can view own booking |
| 7 | should return 404 if booking not found | Missing booking ID |
| 8 | should return 403 if booking belongs to another student | Authorization check |

**modifyBooking**

| # | Test | Description |
|---|------|-------------|
| 9 | should modify a pending booking successfully | Update items on pending booking |
| 10 | should return 400 if booking is not pending | Can't modify served/cancelled |
| 11 | should return 403 if booking belongs to another student | Authorization check |

**cancelBooking**

| # | Test | Description |
|---|------|-------------|
| 12 | should cancel a pending booking | Sets status cancelled, decrements slot count |
| 13 | should return 400 if booking is already served | Can't cancel served booking |
| 14 | should not let currentBookings go below 0 | Floor at zero guard |

**getAllMyBookings**

| # | Test | Description |
|---|------|-------------|
| 15 | should return all bookings for the logged-in student | Returns full history |

---

### 9. Menu Controller

**File:** `backend/__tests__/unit/menuController.test.js`
**Source:** `backend/controllers/menuController.js`
**Tests:** 18

**getAllSlots**

| # | Test | Description |
|---|------|-------------|
| 1 | should return all today slots | Returns slots generated for today |
| 2 | should return 500 on error | Error handling |

**createSlot**

| # | Test | Description |
|---|------|-------------|
| 3 | should create a new slot template | Creates SlotTemplate with name + times |
| 4 | should return 500 on creation error | Validation failure |

**updateSlot**

| # | Test | Description |
|---|------|-------------|
| 5 | should update a slot template when daily slot exists | Updates capacity, times |
| 6 | should return 404 if daily slot not found | Invalid slot ID |
| 7 | should return 404 if template not found | Template deleted |

**getAllMenuItems**

| # | Test | Description |
|---|------|-------------|
| 8 | should return only available menu items | Filters isAvailable: true |

**addMenuItem**

| # | Test | Description |
|---|------|-------------|
| 9 | should add a new menu item | Creates with name, price, category |

**updateMenuItem**

| # | Test | Description |
|---|------|-------------|
| 10 | should update an existing menu item | Partial update |
| 11 | should return 404 if item not found | Invalid item ID |

**deleteMenuItem**

| # | Test | Description |
|---|------|-------------|
| 12 | should delete a menu item | Removes from database |
| 13 | should return 404 if item not found | Invalid item ID |

**getMenuForSlot**

| # | Test | Description |
|---|------|-------------|
| 14 | should return menu for a valid slot | Returns populated menu items |
| 15 | should return 404 if slot not found | Invalid slot ID |
| 16 | should return empty list if no menu assigned | Slot exists, no menu |

**assignMenuToSlot**

| # | Test | Description |
|---|------|-------------|
| 17 | should create menu when none exists for slot | New menu assignment |
| 18 | should update existing menu for the slot | Overwrite menu items |
| 19 | should return 404 if slot not found | Invalid slot ID |

---

### 10. Staff Controller

**File:** `backend/__tests__/unit/staffController.test.js`
**Source:** `backend/controllers/staffController.js`
**Tests:** 10

**getQueueForSlot**

| # | Test | Description |
|---|------|-------------|
| 1 | should return the queue for a slot sorted by position | Ordered by queuePosition |
| 2 | should return 500 on error | Error handling |

**callNextToken**

| # | Test | Description |
|---|------|-------------|
| 3 | should call the next pending token in queue | Finds lowest position pending |
| 4 | should return 404 if no pending tokens in queue | Empty queue |

**markAsServing**

| # | Test | Description |
|---|------|-------------|
| 5 | should mark a pending booking as serving | Status transition pending → serving |
| 6 | should return 404 if booking not found | Missing booking |
| 7 | should return 400 if booking is not pending | Invalid state transition |

**markAsServed**

| # | Test | Description |
|---|------|-------------|
| 8 | should mark a serving booking as served | Status transition serving → served |
| 9 | should return 404 if booking not found | Missing booking |
| 10 | should return 400 if booking is not in serving status | Invalid state transition |

---

### 11. Admin Controller

**File:** `backend/__tests__/unit/adminController.test.js`
**Source:** `backend/controllers/adminController.js`
**Tests:** 13

**registerStaff**

| # | Test | Description |
|---|------|-------------|
| 1 | should register a new staff member | Creates user with role 'staff' |
| 2 | should return 400 if user already exists | Duplicate email |
| 3 | should set role as staff | Forced role assignment |

**getAllStaff**

| # | Test | Description |
|---|------|-------------|
| 4 | should return all staff members without passwords | Excludes password field |

**deleteStaff**

| # | Test | Description |
|---|------|-------------|
| 5 | should delete an existing staff member | Removes from DB |
| 6 | should return 404 if staff not found | Missing user |
| 7 | should return 400 if user is not a staff member | Can't delete non-staff |

**getStaffPerformance**

| # | Test | Description |
|---|------|-------------|
| 8 | should return staff performance metrics | Aggregated serve counts |
| 9 | should handle zero staff members | Empty staff list |

**getSustainabilityReport**

| # | Test | Description |
|---|------|-------------|
| 10 | should calculate sustainability score correctly | Score based on waste ratio |
| 11 | should return 100 score when no bookings | Perfect score with no data |

**triggerDataBackup**

| # | Test | Description |
|---|------|-------------|
| 12 | should return backup snapshot info | Returns collection counts |

**getWasteTracking**

| # | Test | Description |
|---|------|-------------|
| 13 | should aggregate wasted items from cancelled bookings | Sums wasted item quantities |

---

### 12. Demand Forecast Controller

**File:** `backend/__tests__/unit/demandForecastController.test.js`
**Source:** `backend/controllers/demandForecastController.js`
**Tests:** 10

**getDailyForecast**

| # | Test | Description |
|---|------|-------------|
| 1 | should return daily forecast data from ML service | Proxies to Flask ML API |
| 2 | should use default 7 days when no days parameter provided | Default param |
| 3 | should return 500 if ML service is down | Connection refused handling |

**getWeeklyForecast**

| # | Test | Description |
|---|------|-------------|
| 4 | should return weekly forecast data | Proxies weekly endpoint |

**getMonthlyForecast**

| # | Test | Description |
|---|------|-------------|
| 5 | should return monthly forecast data | Proxies monthly endpoint |

**getModelAccuracy**

| # | Test | Description |
|---|------|-------------|
| 6 | should return model accuracy metrics | Returns RMSE/MAE/MAPE |

**triggerRetrain**

| # | Test | Description |
|---|------|-------------|
| 7 | should trigger model retraining | POST to ML retrain endpoint |

**getHistoricalComparison**

| # | Test | Description |
|---|------|-------------|
| 8 | should return historical comparison data | Actual vs predicted data |

**checkMLHealth**

| # | Test | Description |
|---|------|-------------|
| 9 | should return ML service health status | Health check proxy |
| 10 | should return 503 when ML service is unavailable | Service down handling |

---

### 13. Model Schema Validations

**File:** `backend/__tests__/unit/models.test.js`
**Source:** `backend/models/*.js`
**Tests:** 50

**User Model**

| # | Test | Description |
|---|------|-------------|
| 1 | should require name field | Validation error on missing name |
| 2 | should require email field | Validation error on missing email |
| 3 | should require password field | Validation error on missing password |
| 4 | should default role to student | Default enum value |
| 5 | should only allow valid roles | Rejects invalid role string |
| 6 | should accept valid roles: student, staff, admin | All enum values pass |
| 7 | should reject email without proper format | Email format validation |
| 8 | should trim the name field | Whitespace trimming |
| 9 | should lowercase the email field | Case normalization |

**Booking Model**

| # | Test | Description |
|---|------|-------------|
| 10 | should require studentId | Required ObjectId ref |
| 11 | should require slotId | Required ObjectId ref |
| 12 | should require tokenNumber | Required string |
| 13 | should default status to pending | Default enum |
| 14 | should only accept valid status values | Rejects invalid status |
| 15 | should accept all valid status values | pending, serving, served, cancelled |
| 16 | should enforce minimum quantity of 1 for items | Min validator on items.quantity |
| 17 | should default estimatedWaitTime to 0 | Default numeric |

**MenuItem Model**

| # | Test | Description |
|---|------|-------------|
| 18 | should require name field | Required string |
| 19 | should require category field | Required enum |
| 20 | should require price field | Required number |
| 21 | should only accept valid categories | Rejects invalid category |
| 22 | should accept all valid categories | veg, non-veg, beverage, dessert, snack |
| 23 | should not accept negative prices | Min: 0 validator |
| 24 | should default isAvailable to true | Default boolean |
| 25 | should have default imageUrl | Default placeholder image path |

**Slot Model**

| # | Test | Description |
|---|------|-------------|
| 26 | should require templateId | Required ObjectId ref |
| 27 | should require date field | Required string |
| 28 | should only accept valid meal names | Rejects invalid meal |
| 29 | should accept all valid meal names | Breakfast, Lunch, Snacks, Dinner |
| 30 | should default capacity to 10 | Default numeric |
| 31 | should default currentBookings to 0 | Default counter |

**SlotTemplate Model**

| # | Test | Description |
|---|------|-------------|
| 32 | should require name field | Required string |
| 33 | should require startTime | Required string |
| 34 | should require endTime | Required string |
| 35 | should only accept valid slot names | Rejects invalid slot name |
| 36 | should default capacity to 10 | Default numeric |

**AlertLog Model**

| # | Test | Description |
|---|------|-------------|
| 37 | should require slotId | Required ObjectId ref |
| 38 | should require message field | Required string |
| 39 | should only accept valid alert types | Rejects invalid type |
| 40 | should accept all valid alert types | All enum values pass |
| 41 | should default resolved to false | Default boolean |
| 42 | should only accept valid severity levels | Rejects invalid severity |
| 43 | should accept valid severity levels | low, medium, high, critical |

**CrowdData Model**

| # | Test | Description |
|---|------|-------------|
| 44 | should require slotId | Required ObjectId ref |
| 45 | should only accept valid crowd levels | Rejects invalid level |
| 46 | should accept valid crowd levels | low, medium, high |
| 47 | should default activeBookings to 0 | Default counter |

**DemandForecast Model**

| # | Test | Description |
|---|------|-------------|
| 48 | should require forecastType | Required enum |
| 49 | should require modelUsed | Required enum |
| 50 | should only accept valid forecast types | Rejects invalid type |
| 51 | should accept valid forecast types | daily, weekly, monthly |
| 52 | should only accept valid model names | Rejects invalid model |
| 53 | should accept valid model names | XGBoost, SARIMA, LSTM |

---

## JavaScript Integration Tests

### 14. Server Setup

**File:** `backend/__tests__/integration/server.test.js`
**Source:** `backend/server.js`
**Tests:** 4

| # | Test | Description |
|---|------|-------------|
| 1 | should respond to health check route | GET / returns 200 |
| 2 | should return JSON content type | Content-Type header check |
| 3 | should have CORS enabled | CORS headers present |
| 4 | should return 500 for global error handler with faulty middleware | Error handler catch-all |

---

### 15. API Route Integration

**File:** `backend/__tests__/integration/routes.test.js`
**Source:** `backend/routes/*.js`
**Tests:** 28

**Auth Routes (/api/auth)**

| # | Test | Description |
|---|------|-------------|
| 1 | POST /api/auth/register should exist | Route mounted |
| 2 | POST /api/auth/login should exist | Route mounted |
| 3 | GET /api/auth/me should require authentication | Returns 401 without token |
| 4 | PUT /api/auth/update-profile should require authentication | Returns 401 without token |

**Booking Routes (/api/bookings)**

| # | Test | Description |
|---|------|-------------|
| 5 | POST /api/bookings should require authentication | Returns 401 |
| 6 | GET /api/bookings/my-tokens should require authentication | Returns 401 |
| 7 | GET /api/bookings/all should require authentication | Returns 401 |

**Menu Routes (/api/menu)**

| # | Test | Description |
|---|------|-------------|
| 8 | GET /api/menu/slots should be publicly accessible | No auth required |
| 9 | GET /api/menu/items should be publicly accessible | No auth required |
| 10 | POST /api/menu/slots should require admin authentication | Returns 401 |
| 11 | POST /api/menu/items should require admin authentication | Returns 401 |

**Staff Routes (/api/staff)**

| # | Test | Description |
|---|------|-------------|
| 12 | GET /api/staff/queue/:slotId should require staff auth | Returns 401 |
| 13 | POST /api/staff/call-next/:slotId should require staff auth | Returns 401 |
| 14 | PUT /api/staff/mark-serving/:bookingId should require staff auth | Returns 401 |
| 15 | PUT /api/staff/mark-served/:bookingId should require staff auth | Returns 401 |

**Admin Routes (/api/admin)**

| # | Test | Description |
|---|------|-------------|
| 16 | POST /api/admin/staff should require admin auth | Returns 401 |
| 17 | GET /api/admin/staff should require admin auth | Returns 401 |
| 18 | GET /api/admin/analytics should require admin auth | Returns 401 |
| 19 | GET /api/admin/features/waste-tracking should require admin auth | Returns 401 |
| 20 | GET /api/admin/features/sustainability should require admin auth | Returns 401 |
| 21 | POST /api/admin/features/data-backup should require admin auth | Returns 401 |

**Crowd Routes (/api/crowd)**

| # | Test | Description |
|---|------|-------------|
| 22 | GET /api/crowd/levels should require authentication | Returns 401 |
| 23 | GET /api/crowd/patterns should require authentication | Returns 401 |
| 24 | GET /api/crowd/staff/dashboard should require staff auth | Returns 401 |
| 25 | GET /api/crowd/admin/analytics should require admin auth | Returns 401 |

**Demand Forecast Routes (/api/demand-forecast)**

| # | Test | Description |
|---|------|-------------|
| 26 | GET /api/demand-forecast/health should require admin auth | Returns 401 |
| 27 | GET /api/demand-forecast/daily should require admin auth | Returns 401 |
| 28 | POST /api/demand-forecast/retrain should require admin auth | Returns 401 |

---

## Python ML Service Tests

### 16. Flask API Endpoints (`test_app.py`)

**File:** `backend/ml_service/tests/test_app.py`
**Source:** `backend/ml_service/app.py`
**Tests:** 31

**TestHealthEndpoint** — GET /api/health

| # | Test | Description |
|---|------|-------------|
| 1 | test_health_returns_200 | Health endpoint always returns 200 |
| 2 | test_health_contains_required_fields | Response has status, model_loaded, model_name, timestamp |
| 3 | test_health_status_is_healthy | Status field equals 'healthy' |
| 4 | test_health_timestamp_is_iso_format | Timestamp is valid ISO 8601 |
| 5 | test_health_model_loaded_is_boolean | model_loaded is bool type |

**TestDailyForecast** — GET /api/forecast/daily

| # | Test | Description |
|---|------|-------------|
| 6 | test_daily_returns_503_when_no_model | 503 when model not loaded |
| 7 | test_daily_returns_200_with_model | 200 with valid XGBoost model |
| 8 | test_daily_custom_days_param | Accepts ?days=3 query param |
| 9 | test_daily_caps_at_30_days | ?days=100 capped to 30 |
| 10 | test_daily_forecast_item_structure | Items have date, day_name, predicted_demand, confidence |
| 11 | test_daily_predicted_demand_non_negative | Negative predictions clamped to 0 |

**TestWeeklyForecast** — GET /api/forecast/weekly

| # | Test | Description |
|---|------|-------------|
| 12 | test_weekly_returns_503_when_no_model | 503 when model not loaded |
| 13 | test_weekly_returns_200_with_model | Returns 4 weeks by default |
| 14 | test_weekly_item_has_aggregated_fields | week_number, total_predicted_demand, avg_daily_demand |
| 15 | test_weekly_caps_at_12_weeks | ?weeks=50 capped to 12 |

**TestMonthlyForecast** — GET /api/forecast/monthly

| # | Test | Description |
|---|------|-------------|
| 16 | test_monthly_returns_503_when_no_model | 503 when model not loaded |
| 17 | test_monthly_returns_200_with_model | Returns 3 months by default |
| 18 | test_monthly_caps_at_6_months | ?months=20 capped to 6 |

**TestAccuracyEndpoint** — GET /api/forecast/accuracy

| # | Test | Description |
|---|------|-------------|
| 19 | test_accuracy_returns_503_when_no_comparison | 503 when model_comparison.json missing |
| 20 | test_accuracy_returns_200_with_comparison | Returns best_model, models, description |
| 21 | test_accuracy_includes_metric_descriptions | Descriptions for rmse, mae, mape |

**TestRetrainEndpoint** — POST /api/forecast/retrain

| # | Test | Description |
|---|------|-------------|
| 22 | test_retrain_success | Subprocess success → status 'success' |
| 23 | test_retrain_failure | Subprocess failure → 500 with error |
| 24 | test_retrain_exception | Exception caught → 500 |

**TestHistoricalEndpoint** — GET /api/forecast/historical

| # | Test | Description |
|---|------|-------------|
| 25 | test_historical_returns_503_when_no_data | 503 when data files missing |
| 26 | test_historical_returns_200_with_data | Returns historical actual demand |
| 27 | test_historical_items_have_actual_demand | Items have date and actual_demand |

**TestLoadBestModel** — load_best_model() helper

| # | Test | Description |
|---|------|-------------|
| 28 | test_load_returns_false_when_no_comparison_file | Returns False if JSON missing |
| 29 | test_load_sets_global_model_name | Sets loaded_model_name on success |

**TestGenerateForecast** — generate_forecast() dispatcher

| # | Test | Description |
|---|------|-------------|
| 30 | test_routes_to_xgboost | Routes to XGBoost forecast generator |
| 31 | test_returns_empty_for_unknown_model | Unknown model name → empty list |

---

### 17. ML Models (`test_models.py`)

**File:** `backend/ml_service/tests/test_models.py`
**Source:** `backend/ml_service/models.py`
**Tests:** 16

**TestComputeMetrics** — compute_metrics()

| # | Test | Description |
|---|------|-------------|
| 1 | test_perfect_prediction | Identical arrays → zero error |
| 2 | test_known_rmse_value | RMSE of [3, -3] errors = 3.0 |
| 3 | test_known_mae_value | MAE of [2, 4] errors = 3.0 |
| 4 | test_mape_with_zero_actuals | Skips zero actuals in MAPE |
| 5 | test_all_zero_actuals | All zeros → MAPE = 0 |
| 6 | test_returns_rounded_values | Values are properly rounded |
| 7 | test_returns_dict_with_expected_keys | Keys: rmse, mae, mape |
| 8 | test_large_error | Large errors produce large metrics |

**TestSelectBestModel** — select_best_model()

| # | Test | Description |
|---|------|-------------|
| 9 | test_selects_lowest_rmse | Picks model with lowest RMSE |
| 10 | test_raises_on_empty_results | ValueError on empty list |
| 11 | test_skips_none_results | Ignores None entries |
| 12 | test_raises_when_all_none | ValueError when all None |
| 13 | test_creates_comparison_json | Writes model_comparison.json |
| 14 | test_comparison_json_has_correct_structure | Has best_model, trained_at, models |
| 15 | test_single_model_is_selected | Single model auto-selected |

**TestTrainAllModels** — train_all_models()

| # | Test | Description |
|---|------|-------------|
| 16 | test_train_all_calls_each_trainer | Invokes ARIMA, XGBoost, and LSTM trainers |

---

### 18. Data Pipeline (`test_data_pipeline.py`)

**File:** `backend/ml_service/tests/test_data_pipeline.py`
**Source:** `backend/ml_service/data_pipeline.py`
**Tests:** 19

**TestLoadKaggleData** — load_kaggle_sales_data()

| # | Test | Description |
|---|------|-------------|
| 1 | test_raises_when_file_missing | FileNotFoundError when train.csv absent |
| 2 | test_loads_csv_successfully | Returns DataFrame with expected columns |
| 3 | test_shifts_dates_by_7_years | Dates shifted from 2013→2020 range |
| 4 | test_validates_required_columns | ValueError on missing required columns |

**TestFetchWeatherData** — fetch_weather_data()

| # | Test | Description |
|---|------|-------------|
| 5 | test_loads_from_cache_if_exists | Reads cached CSV instead of API |
| 6 | test_fetches_from_api_when_no_cache | Calls Open-Meteo API |
| 7 | test_generates_fallback_on_api_failure | Generates synthetic weather on error |

**TestFallbackWeather** — _generate_fallback_weather()

| # | Test | Description |
|---|------|-------------|
| 8 | test_returns_correct_columns | Has all required weather columns |
| 9 | test_returns_correct_number_of_rows | One row per date |
| 10 | test_temperature_max_above_min | Max > Min for 90%+ of rows |
| 11 | test_precipitation_non_negative | No negative precipitation |

**TestLoadAcademicCalendar** — load_academic_calendar()

| # | Test | Description |
|---|------|-------------|
| 12 | test_loads_calendar_successfully | Parses JSON into date sets |
| 13 | test_semester_dates_are_timestamps | Returns pandas Timestamps |
| 14 | test_holiday_dates_match_input | Correct count from JSON |
| 15 | test_vacation_period_span | Spans full date range (22 days) |

**TestEngineerFeatures** — engineer_features()

| # | Test | Description |
|---|------|-------------|
| 16 | test_produces_expected_columns | Temporal, weather, calendar, lag columns present |
| 17 | test_drops_nan_rows | No NaN values in output |
| 18 | test_cyclical_encoding_range | sin/cos values in [-1, 1] |
| 19 | test_item_category_mapping | Maps to veg/non-veg/beverage/dessert/snack |

---

## Summary

| Category | Test Suites | Tests |
|----------|-------------|-------|
| JS Unit Tests | 13 | 174 |
| JS Integration Tests | 2 | 32 |
| Python ML Service Tests | 3 | 66 |
| **Total** | **18** | **272** |
