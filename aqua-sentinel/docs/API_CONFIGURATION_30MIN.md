# API Configuration for 30-Minute Prediction Model

## 📊 Model Requirements

The water quality prediction model has been configured to predict **30 minutes ahead** instead of 5 minutes. Here's what you need to know:

### Model Specifications
- **Prediction Horizon**: 30 minutes (6 steps ahead)
- **Data Frequency**: 5 minutes
- **Rolling Window Features**: Uses windows of 3, 6, 12, and 24 steps
- **Largest Window**: 24 steps = 120 minutes (2 hours)
- **Minimum Data Points Required**: **24 data points**

## 🎯 Why 24 Data Points?

The model uses rolling window features to capture trends and patterns:
- **3-step window** (15 minutes): Short-term trends
- **6-step window** (30 minutes): Medium-term trends
- **12-step window** (60 minutes): Hourly patterns
- **24-step window** (120 minutes): 2-hour patterns

The **largest window (24 steps)** requires at least 24 historical data points to compute all features correctly.

## 🔄 Auto-Fetch Feature

The API now supports **automatic data fetching** from the database! You have two options:

### Option 1: Auto-Fetch (NEW) ✨
Send only the pool_id and species, and the API will automatically fetch the latest 24 measurements from the database.

**Request:**
```json
POST /api/predict
{
  "pool_id": "550e8400-e29b-41d4-a716-446655440000",
  "species": "tom"
}
```

**Response:**
```json
{
  "species": "tom",
  "current_values": {
    "dissolved_oxygen": 6.5,
    "ph": 7.5,
    "ammonia": 0.01,
    "turbidity": 5.0,
    "temperature": 28.0
  },
  "prediction_next_30min": {
    "dissolved_oxygen": 6.45,
    "ph": 7.48,
    "ammonia": 0.012,
    "turbidity": 5.1,
    "temperature": 28.1
  },
  "risk_level": "SAFE",
  "details": [],
  "thresholds": {...}
}
```

### Option 2: Manual History (Backward Compatible)
Send the full history manually (useful for testing or when data is not in DB).

**Request:**
```json
POST /api/predict
{
  "pool_id": "550e8400-e29b-41d4-a716-446655440000",
  "species": "tom",
  "history": [
    {
      "timestamp": "2024-01-15 08:00:00",
      "temperature": 28.0,
      "dissolved_oxygen": 6.5,
      "ph": 7.5,
      "turbidity": 5.0,
      "ammonia": 0.01,
      "rain_event": 0,
      "feeding_event": 0
    },
    // ... 23 more data points
  ]
}
```

## 📋 Database Requirements for Auto-Fetch

For auto-fetch to work, ensure:

1. **Pool exists** in the `pool` table with valid `pool_id`
2. **At least 24 measurements** in the `water_measurement` table for that pool
3. **Measurements are timestamped** with `created_at` field
4. **Data frequency** is approximately 5 minutes (not strict, but recommended)

### Database Schema
The API queries the `water_measurement` table:
```sql
SELECT * FROM water_measurement 
WHERE pool_id = '<your_pool_id>'
ORDER BY created_at DESC
LIMIT 24
```

### Handled Columns
- `dissolved_oxygen` (Float)
- `ph` (Float)
- `amonia` or `ammonia` (Float) - API handles both spellings
- `turbidity` (Float)
- `temperature` (Float)
- `created_at` (DateTime) - used as timestamp

**Note**: `rain_event` and `feeding_event` default to 0 when auto-fetched (can be added to DB schema later).

## 🧪 Testing

### Test 1: Auto-Fetch from Database
```bash
python app/test_auto_fetch.py
```

This tests:
- ✓ Auto-fetch with valid pool_id
- ✓ Error handling for insufficient data
- ✓ Backward compatibility with manual history

### Test 2: Comprehensive 30-Minute Model Tests
```bash
python app/test_api.py
```

This tests:
- ✓ Minimum data points (24)
- ✓ Insufficient data rejection (23 points)
- ✓ Extended history handling (50 points)
- ✓ SAFE scenario prediction
- ✓ WARNING scenario prediction
- ✓ DANGER scenario prediction
- ✓ Cross-species validation

## 📝 Changes Made

### 1. **API Endpoint** (`app/api/predict.py`)
- Added auto-fetch logic to retrieve latest 24 measurements from database
- Validates minimum 24 data points
- Handles both `ammonia` and `amonia` column names
- Updated response field: `prediction_next_5min` → `prediction_next_30min`

### 2. **Schema** (`app/schemas/schema_prediction.py`)
- Made `history` field optional (`history: List[SensorPoint] = None`)
- Updated response model: `prediction_next_30min`

### 3. **Tests** (`app/test_api.py`)
- Increased default data points from 15 to 30
- Added minimum data point validation test
- Added insufficient data test
- Added extended history test
- Updated all tests to use 30-minute predictions

### 4. **New Test File** (`app/test_auto_fetch.py`)
- Tests auto-fetch functionality
- Tests backward compatibility
- Provides clear error messages and suggestions

## 🚀 Usage Examples

### Example 1: Production Use with Real Database
```python
import requests

response = requests.post('http://localhost:8000/api/predict', json={
    "pool_id": "550e8400-e29b-41d4-a716-446655440000",
    "species": "tom"
})

result = response.json()
print(f"Risk Level: {result['risk_level']}")
print(f"Predicted DO in 30min: {result['prediction_next_30min']['dissolved_oxygen']}")
```

### Example 2: Testing with Manual Data
```python
import requests
from datetime import datetime, timedelta

# Generate test history
history = []
base_time = datetime.now()
for i in range(24):
    history.append({
        "timestamp": (base_time - timedelta(minutes=5*(24-i))).strftime("%Y-%m-%d %H:%M:%S"),
        "temperature": 28.0,
        "dissolved_oxygen": 6.5,
        "ph": 7.5,
        "turbidity": 5.0,
        "ammonia": 0.01,
        "rain_event": 0,
        "feeding_event": 0
    })

response = requests.post('http://localhost:8000/api/predict', json={
    "pool_id": "test_pool",
    "species": "tom",
    "history": history
})
```

## ⚠️ Error Handling

### Error: Insufficient Data
```json
{
  "detail": "Không đủ dữ liệu trong database. Cần tối thiểu 24 điểm, chỉ có 15 điểm."
}
```
**Solution**: Add more measurements to the database or use manual history.

### Error: Pool Not Found
```json
{
  "detail": "Bạn không có quyền truy cập vào hồ này hoặc hồ không tồn tại"
}
```
**Solution**: Verify pool_id exists in database (authentication currently disabled for testing).

## 🔧 Model Training

The model was trained with these configurations (see `app/script/train_model.py`):
- **Prediction Target**: 30 minutes ahead (6 steps)
- **Features**: Rolling means, stds, and trends for windows [3, 6, 12, 24]
- **Algorithm**: XGBoost Regressor
- **Weights**: Higher weights for dangerous conditions (DO < 3.5, Ammonia > 0.5)

## 📊 Summary

| Aspect | Value |
|--------|-------|
| Prediction Horizon | 30 minutes |
| Data Frequency | 5 minutes |
| Minimum Data Points | 24 |
| History Duration | 2 hours (120 minutes) |
| Auto-Fetch Support | ✅ Yes |
| Manual History Support | ✅ Yes (backward compatible) |
| Database Table | `water_measurement` |
| Response Field | `prediction_next_30min` |

---

**Last Updated**: 2026-01-24  
**Model Version**: 30-minute prediction with auto-fetch
