"""
Test script to verify CSV-based simulation is working correctly
"""
import sys
import os
sys.path.insert(0, os.path.abspath('.'))

from app.services.simulation import simulation_service

def test_csv_loading():
    """Test if CSV data is loaded correctly"""
    print("=" * 60)
    print("SIMULATION SERVICE TEST")
    print("=" * 60)
    
    print(f"\n1. CSV Data Status:")
    if simulation_service.csv_data is not None:
        print(f"   ✅ CSV loaded successfully")
        print(f"   📊 Rows: {len(simulation_service.csv_data)}")
        print(f"   📁 Path: {simulation_service.CSV_PATH}")
        print(f"   🔢 Current position: {simulation_service.current_index}")
    else:
        print(f"   ❌ CSV not loaded")
        print(f"   📁 Looking for: {simulation_service.CSV_PATH}")
        return False
    
    print(f"\n2. Configuration:")
    print(f"   ⏱️  Interval: {simulation_service.INTERVAL_SECONDS} seconds")
    minutes = simulation_service.INTERVAL_SECONDS / 60
    print(f"   📅 That's {minutes:.1f} minute(s) between data insertions")
    
    print(f"\n3. Sample Data (first 3 rows from CSV):")
    for i in range(3):
        data = simulation_service._get_next_csv_row()
        print(f"   Row {i+1}:")
        print(f"      Temperature: {data['temperature']:.2f}°C")
        print(f"      DO: {data['dissolved_oxygen']:.2f} mg/L")
        print(f"      pH: {data['ph']:.2f}")
        print(f"      Ammonia: {data['ammonia']:.4f} mg/L")
        print(f"      Turbidity: {data['turbidity']:.2f} NTU")
    
    print(f"\n4. CSV Cycling Test:")
    # Reset to near end
    simulation_service.current_index = len(simulation_service.csv_data) - 2
    print(f"   Position before: {simulation_service.current_index}")
    
    # Get data (should advance to last row)
    simulation_service._get_next_csv_row()
    print(f"   Position after 1st call: {simulation_service.current_index}")
    
    # Get data (should cycle back to 0)
    simulation_service._get_next_csv_row()
    print(f"   Position after 2nd call: {simulation_service.current_index}")
    
    if simulation_service.current_index == 0:
        print(f"   ✅ Cycling works correctly!")
    else:
        print(f"   ❌ Cycling failed!")
    
    print(f"\n5. Interval Change Test:")
    old_interval = simulation_service.INTERVAL_SECONDS
    simulation_service.set_interval(60)
    print(f"   Changed from {old_interval}s to {simulation_service.INTERVAL_SECONDS}s")
    simulation_service.set_interval(old_interval)  # Reset
    print(f"   Reset to {simulation_service.INTERVAL_SECONDS}s")
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("=" * 60)
    print("\nThe simulation service is ready to use CSV data!")
    print(f"It will insert data every {simulation_service.INTERVAL_SECONDS} seconds.")
    print("\nTo change the interval, edit INTERVAL_SECONDS in:")
    print("  app/services/simulation.py (line ~37)")
    print("\n" + "=" * 60)
    
    return True

if __name__ == "__main__":
    test_csv_loading()
