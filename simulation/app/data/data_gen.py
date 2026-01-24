import pandas as pd
import numpy as np

# =========================
# CONFIG
# =========================
START_DATE = "2024-01-01"
END_DATE = "2024-12-31"
FREQ = "5min"

# Các trạng thái môi trường
STATE_NORMAL = 0
STATE_RAIN = 1
STATE_FEEDING = 2
STATE_CRASH = 3 # Tảo tàn, oxy sập

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def generate_aquaculture_data():
    time_index = pd.date_range(start=START_DATE, end=END_DATE, freq=FREQ)
    data = []
    
    # Init values
    temp = 28.0
    do = 6.5
    ph = 7.5
    turbidity = 5.0
    ammonia = 0.01
    
    current_state = STATE_NORMAL
    state_duration = 0
    
    for t in time_index:
        # 1. QUẢN LÝ TRẠNG THÁI (State Machine)
        if state_duration > 0:
            state_duration -= 1
        else:
            # Chuyển đổi trạng thái ngẫu nhiên nhưng có kịch bản
            rand = np.random.rand()
            if rand < 0.005: # 0.5% cơ hội bị Oxygen Crash (Nguy hiểm)
                current_state = STATE_CRASH
                state_duration = np.random.randint(24, 48) # Kéo dài 2-4 tiếng (12 steps/h)
            elif rand < 0.05: # 5% cơ hội mưa
                current_state = STATE_RAIN
                state_duration = np.random.randint(12, 36)
            elif t.hour in [7, 17] and t.minute == 0: # Giờ ăn
                current_state = STATE_FEEDING
                state_duration = 12 # 1 tiếng
            else:
                current_state = STATE_NORMAL
                state_duration = 0

        # 2. MÔ PHỎNG VẬT LÝ (PHYSICS SIMULATION)
        
        # --- Temperature (Theo giờ + Mùa) ---
        base_temp = 28 + 2 * np.sin(2 * np.pi * (t.month - 1) / 12) # Mùa
        daily_fluct = 3 * np.sin(2 * np.pi * (t.hour - 6) / 24) # Ngày đêm
        target_temp = base_temp + daily_fluct
        
        if current_state == STATE_RAIN:
            target_temp -= 3.0 # Mưa làm lạnh
            
        # Di chuyển temp từ từ về target (quán tính nhiệt)
        temp += 0.1 * (target_temp - temp) + np.random.normal(0, 0.1)

        # --- Dissolved Oxygen (DO) ---
        # DO bão hòa phụ thuộc nghịch đảo với nhiệt độ
        saturation_do = 14.6 - (0.3 * temp) 
        
        if current_state == STATE_CRASH:
            # Crash: Oxy tụt không phanh (Exponential Decay)
            target_do = 1.5 
            do += 0.15 * (target_do - do) # Tụt rất nhanh
        elif current_state == STATE_FEEDING:
            target_do = saturation_do - 1.5 # Cá tập trung ăn -> Tốn oxy
            do += 0.05 * (target_do - do)
        else:
            # Quang hợp ban ngày, hô hấp ban đêm
            photosynthesis = 2.0 * np.sin(2 * np.pi * (t.hour - 6) / 24)
            target_do = saturation_do + photosynthesis
            do += 0.05 * (target_do - do) + np.random.normal(0, 0.1)

        # --- pH ---
        if current_state == STATE_CRASH:
             target_ph = 5.5 # Axit hóa
             ph += 0.1 * (target_ph - ph)
        elif current_state == STATE_RAIN:
            target_ph = 6.8 # Mưa axit nhẹ
            ph += 0.05 * (target_ph - ph)
        else:
            # pH dao động nhẹ theo DO (CO2)
            target_ph = 7.5 + 0.3 * (do - 6) / 10
            ph += 0.02 * (target_ph - ph) + np.random.normal(0, 0.01)

        # --- Ammonia (NH3) ---
        if current_state == STATE_FEEDING:
            ammonia += 0.02 # Tăng nhanh khi ăn
        elif current_state == STATE_CRASH:
            ammonia += 0.01 # Xác tảo phân hủy
        else:
            # Lọc sinh học tự nhiên giảm NH3
            ammonia *= 0.98 
            
        ammonia = max(0.0, ammonia + np.random.normal(0, 0.001))

        # --- Turbidity ---
        if current_state == STATE_RAIN:
            turbidity += 5.0 # Mưa làm đục
        elif current_state == STATE_CRASH:
            turbidity += 2.0
        else:
            # Lắng đọng tự nhiên
            turbidity = max(2.0, turbidity * 0.95)
        
        turbidity += np.random.normal(0, 0.2)

        # Safety Clamps
        do = max(0.1, do)
        ph = np.clip(ph, 4.0, 10.0)
        turbidity = max(1.0, min(turbidity, 500.0)) # Cap lại không cho lên vô cực
        
        data.append([
            t, temp, do, ph, turbidity, ammonia,
            1 if current_state == STATE_RAIN else 0,
            1 if current_state == STATE_FEEDING else 0
        ])
        
    df = pd.DataFrame(data, columns=[
        "timestamp", "temperature", "dissolved_oxygen", 
        "ph", "turbidity", "ammonia", "rain_event", "feeding_event"
    ])
    
    # Save
    df.to_csv("aquaculture_v2.csv", index=False)
    print(f"Generated {len(df)} rows with Physics-based Logic.")
    return df

if __name__ == "__main__":
    generate_aquaculture_data()