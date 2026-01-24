# Simulation & Data Seeding Service

## Overview
This service automatically generates realistic water quality data for all active pools in the background. It simulates a live monitoring system by inserting new data points every 5 minutes.

## Features

### 1. Automatic Data Generation
- **Frequency**: Every 5 minutes (configurable via `INTERVAL_SECONDS` in `app/services/simulation_service.py`).
- **Scope**: All pools currently in the database.
- **Persistence**: Runs as a background task when the API server starts.

### 2. Species-Specific Simulation
The data is not random; it is generated based on the "Ideal Range" for the specific species in the pool (e.g., Shrimp/Tôm vs Catfish/Cá Tra).

- **Algorithm**: _Random Walk with Mean Reversion_
  - Data fluctuates naturally (Random Walk).
  - Data tends to drift back towards the optimal value for the species (Mean Reversion).
  - Prevents data from wandering into unrealistic ranges over long periods.

### 3. Lifecycle Management
- **Creation**: When a pool is created, an initial data point is seeded immediately so the dashboard isn't empty.
- **Deletion**: When a pool is deleted, simulation stops for that pool (since it's no longer in the DB).

## Configuration

The simulation profiles are defined in `app/services/simulation_service.py`:

```python
self.IDEAL_RANGES = {
    "tom": {
        "temp": 29.0, "ph": 8.0, "do": 6.5, "ammonia": 0.05, "turbidity": 30.0
    },
    "ca_tra": {
        "temp": 28.0, "ph": 7.5, "do": 5.0, "ammonia": 0.1, "turbidity": 80.0
    }
}
```

## How to Verify
1.  **Start the App**: `python -m uvicorn app.main:app --reload`
2.  **Check Logs**: You should see:
    ```
    INFO:     🌊 Simulation Service Started - Inserting data every 5 minutes...
    ```
3.  **Wait**: After 5 minutes, you will see:
    ```
    INFO:     ✅ Generated simulated data for X pools...
    ```
4.  **Create Pool**: Create a new pool via API/UI. You will immediately see:
    ```
    INFO:     ✅ Seeded initial data for new pool...
    ```
