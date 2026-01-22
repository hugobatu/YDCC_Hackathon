import time
import os
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models.models import Pool, WaterMeasurement

# Update this with your actual DB URL if different
# Assuming default SQLite or similar as per .env (but using direct import here might fail if env not loaded)
# We'll rely on app logic imports

from app.db.connection import SessionLocal

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def monitor():
    print("🌊 STARTING SIMULATION MONITOR...")
    print("Press Ctrl+C to stop")
    
    while True:
        db = SessionLocal()
        try:
            pools = db.query(Pool).all()
            
            clear_screen()
            print(f"🌊 AQUA SENTINEL - DATA SIMULATION MONITOR")
            print(f"🕒 Current Time: {datetime.now().strftime('%H:%M:%S')}")
            print(f"📊 Active Pools: {len(pools)}")
            print("-" * 80)
            print(f"{'Pool Name':<20} | {'timestamp':<20} | {'Temp':<6} | {'pH':<6} | {'DO':<6} | {'NH3':<6}")
            print("-" * 80)
            
            for pool in pools:
                # Get last measurement
                latest = db.query(WaterMeasurement)\
                    .filter(WaterMeasurement.pool_id == pool.pool_id)\
                    .order_by(WaterMeasurement.created_at.desc())\
                    .first()
                
                if latest:
                    time_str = latest.created_at.strftime('%H:%M:%S')
                    print(f"{pool.pool_name[:20]:<20} | {time_str:<20} | {latest.temperature:<6} | {latest.ph:<6} | {latest.dissolved_oxygen:<6} | {latest.amonia:<6}")
                else:
                    print(f"{pool.pool_name[:20]:<20} | {'NO DATA':<20} | {'-':<6} | {'-':<6} | {'-':<6} | {'-':<6}")
            
            print("-" * 80)
            print("\nWaiting for next update (Refreshes every 5s)...")
            
        except Exception as e:
            print(f"Error: {e}")
        finally:
            db.close()
            
        time.sleep(5)

if __name__ == "__main__":
    try:
        monitor()
    except KeyboardInterrupt:
        print("\nStopped.")
