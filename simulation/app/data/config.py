# =============================================================================
# SIMULATION CONFIGURATION
# =============================================================================
# 
# This file contains EASY-TO-CHANGE configuration variables for the 
# aquaculture simulation service.
#
# Simply edit the values below and restart the application.
# =============================================================================

# -----------------------------------------------------------------------------
# DATA INSERTION INTERVAL
# -----------------------------------------------------------------------------
# How often should new data be inserted into the database?
# 
# Common values:
#   - 60     = 1 minute (fast, for testing)
#   - 300    = 5 minutes (default, realistic)
#   - 600    = 10 minutes
#   - 1800   = 30 minutes
#   - 3600   = 1 hour
#
# Note: The actual CSV data was generated with 5-minute intervals,
# but you can insert it at any rate you choose.

INTERVAL_SECONDS = 300

# -----------------------------------------------------------------------------
# CSV DATA FILE PATH
# -----------------------------------------------------------------------------
# Path to the aquaculture data CSV file (relative to project root)

CSV_PATH = "app/data/aquaculture_v2.csv"

# -----------------------------------------------------------------------------
# HOW TO USE THIS CONFIGURATION
# -----------------------------------------------------------------------------
#
# Option 1 (Recommended): Import in simulation.py
#   
#   In app/services/simulation.py, replace hardcoded values with:
#   
#   from app.data.config import INTERVAL_SECONDS, CSV_PATH
#   
#   class SimulationService:
#       INTERVAL_SECONDS = INTERVAL_SECONDS  # from config
#       CSV_PATH = CSV_PATH                    # from config
#
# Option 2: Edit directly in simulation.py
#   
#   Open app/services/simulation.py and find:
#   
#   INTERVAL_SECONDS = 300  # <-- Change this
#   CSV_PATH = "app/data/aquaculture_v2.csv"  # <-- Or this
#
# =============================================================================
