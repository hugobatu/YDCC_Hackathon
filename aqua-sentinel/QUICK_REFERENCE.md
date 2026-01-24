# Quick Reference: 30-Minute Prediction API

## 🎯 Key Answer: How Many Data Points?

**You need 24 data points (2 hours of data at 5-minute intervals)**

## Why 24?
- Model uses 24-step rolling window (largest feature window)
- 24 points × 5 minutes = 120 minutes = 2 hours of historical data

## 🚀 How to Use

### Method 1: Auto-Fetch (Recommended)
```json
POST /api/predict
{
  "pool_id": "<your_pool_uuid>",
  "species": "tom"
}
```
✅ API automatically fetches latest 24 measurements from database

### Method 2: Manual History
```json
POST /api/predict
{
  "pool_id": "<your_pool_uuid>",
  "species": "tom",
  "history": [ /* 24 SensorPoint objects */ ]
}
```
✅ Backward compatible, useful for testing

## 🧪 Quick Test

```bash
# Test auto-fetch functionality
python app/test_auto_fetch.py

# Test comprehensive scenarios
python app/test_api.py
```

## ✅ What Changed

1. **Minimum data points**: 12 → 24
2. **Prediction field**: `prediction_next_5min` → `prediction_next_30min`
3. **History field**: Required → Optional (auto-fetch from DB)
4. **Database integration**: Auto-fetches from `water_measurement` table

## 📋 Requirements Checklist

For auto-fetch to work:
- [ ] Pool exists in database
- [ ] Pool has ≥ 24 measurements in `water_measurement` table
- [ ] Measurements have `created_at` timestamps
- [ ] Server is running: `uvicorn app.main:app --reload`

## 📖 Full Documentation

See `API_CONFIGURATION_30MIN.md` for complete details.
