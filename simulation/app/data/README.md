# Aquaculture Data Simulation

## Overview

This directory contains realistic aquaculture water quality data and the tools to generate it.

## Files

- **`data_gen.py`** - Physics-based data generator script
- **`aquaculture_v2.csv`** - Generated realistic aquaculture data (105,123 rows)
- **`README.md`** - This file

## How It Works

### 1. Data Generation (`data_gen.py`)

The `data_gen.py` script generates realistic aquaculture data using physics-based simulation. It models:

- **Temperature**: Seasonal and daily cycles
- **Dissolved Oxygen (DO)**: Saturation curves, photosynthesis, and respiration
- **pH**: Relationship with CO2/oxygen levels
- **Ammonia**: Feeding impact and biological filtration
- **Turbidity**: Rain events and natural settling
- **Events**: Rain, feeding times, oxygen crashes

#### Configuring Data Generation

Edit the configuration at the top of `data_gen.py`:

```python
START_DATE = "2024-01-01"  # Start date for data
END_DATE = "2024-12-31"    # End date for data
FREQ = "5min"               # Frequency of data points
```

To regenerate data:

```bash
python app/data/data_gen.py
```

### 2. Data Playback (Simulation Service)

The simulation service (`app/services/simulation.py`) reads from `aquaculture_v2.csv` and inserts data into the database at configurable intervals.

#### Configuration Variables

Edit these variables at the top of `SimulationService` class:

```python
INTERVAL_SECONDS = 300  # Time between insertions
                        # 300 = 5 minutes (default)
                        # 60 = 1 minute (faster testing)
                        # 600 = 10 minutes (slower)
                        # 1800 = 30 minutes
```

**Examples:**

- **Fast testing**: Set to `60` (1 minute)
- **Normal operation**: Set to `300` (5 minutes)
- **Slow simulation**: Set to `1800` (30 minutes)

#### Dynamic Control (Optional)

You can also change the interval programmatically:

```python
from app.services.simulation import simulation_service

# Change interval to 1 minute
simulation_service.set_interval(60)

# Reset CSV to beginning
simulation_service.reset_csv_position()
```

## Data Characteristics

The CSV contains realistic patterns:

- **Diurnal cycles**: Temperature and oxygen follow day/night patterns
- **Rain events**: Sudden increases in turbidity, pH drops
- **Feeding times**: 7 AM and 5 PM daily, causing oxygen dips and ammonia spikes
- **Oxygen crashes**: Rare but critical events (0.5% probability)
- **Natural variation**: Random noise within realistic bounds

## Data Columns

| Column | Unit | Description |
|--------|------|-------------|
| timestamp | datetime | Date and time of measurement |
| temperature | °C | Water temperature |
| dissolved_oxygen | mg/L | Dissolved oxygen concentration |
| ph | - | pH level (0-14 scale) |
| turbidity | NTU | Water clarity measurement |
| ammonia | mg/L | Ammonia concentration |
| rain_event | 0/1 | Binary flag for rain events |
| feeding_event | 0/1 | Binary flag for feeding times |

## Typical Values

### Normal Conditions
- Temperature: 26-30°C
- DO: 5-8 mg/L
- pH: 7.0-8.5
- Ammonia: 0.01-0.3 mg/L
- Turbidity: 5-100 NTU

### Alert Conditions
- DO < 3.0 mg/L (oxygen crash)
- pH < 6.5 or > 9.0
- Ammonia > 0.5 mg/L
- Turbidity > 200 NTU (heavy rain)

## Quick Start

1. **Generate new data** (optional):
   ```bash
   python app/data/data_gen.py
   ```

2. **Configure interval** in `app/services/simulation.py`:
   ```python
   INTERVAL_SECONDS = 60  # Change to your desired interval
   ```

3. **Start the application**:
   ```bash
   python app.py
   ```

The service will automatically load the CSV and start inserting data at your configured interval!

## License

Auto-generated data for aquaculture simulation purposes.
