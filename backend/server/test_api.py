import requests
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta

# =========================
# CONFIG
# =========================
API_URL = "http://127.0.0.1:8000/predict"

def generate_history(scenario_name, start_time, steps=15):
    """
    Sinh ra chuỗi 15 điểm dữ liệu (75 phút) theo kịch bản.
    """
    history = []
    base_time = pd.to_datetime(start_time)

    for i in range(steps):
        t = base_time + timedelta(minutes=5*i)
        
        # === KỊCH BẢN 1: SAFE (Bình thường) ===
        if scenario_name == "SAFE":
            # Mọi chỉ số ổn định, dao động nhẹ
            temp = 28.0 + np.random.normal(0, 0.1)
            do = 6.5 + np.random.normal(0, 0.1)         # Oxy cao
            ph = 7.5 + np.random.normal(0, 0.05)        # pH trung tính
            ammonia = 0.01 + np.random.normal(0, 0.002) # Độc tố thấp
            turbidity = 5.0 + np.random.normal(0, 0.5)
            rain = 0
            feeding = 0
            
        # === KỊCH BẢN 2: WARNING (Oxy đang giảm dần) ===
        elif scenario_name == "WARNING":
            # Oxy giảm tuyến tính từ 5.5 xuống 4.0 (Với Tôm: < 5.0 là Warning)
            progress = i / steps
            temp = 29.0
            do = 5.5 - (1.5 * progress) + np.random.normal(0, 0.1) # Kết thúc ~4.0
            ph = 7.2
            ammonia = 0.1 + (0.15 * progress) # Tăng nhẹ lên 0.25
            turbidity = 10.0
            rain = 0
            feeding = 1 if i in [5, 6] else 0 
            
        # === KỊCH BẢN 3: DANGER (Sốc môi trường - Mưa lớn & Tảo tàn) ===
        elif scenario_name == "DANGER":
            # Oxy sập mạnh, pH tụt nhanh
            progress = i / steps
            temp = 26.0 
            
            # Oxy crash: Từ 4.5 tụt thảm hại xuống 2.5 (Với Tôm: < 3.5 là Danger)
            do = 4.5 - (2.0 * progress**2) + np.random.normal(0, 0.2) 
            
            # pH tụt: 7.0 -> 5.8
            ph = 7.0 - (1.2 * progress) 
            
            ammonia = 0.4 + (0.2 * progress) 
            turbidity = 50 + (200 * progress) 
            rain = 1 
            feeding = 0

        # Safety clamp
        do = max(0.5, do)
        ammonia = max(0, ammonia)
        
        history.append({
            "timestamp": t.strftime("%Y-%m-%d %H:%M:%S"),
            "temperature": round(temp, 2),
            "dissolved_oxygen": round(do, 2),
            "ph": round(ph, 2),
            "turbidity": round(turbidity, 2),
            "ammonia": round(ammonia, 4),
            "rain_event": int(rain),
            "feeding_event": int(feeding)
        })
        
    return history

def run_test(scenario_name, species="tom"):
    print(f"\n{'='*20} TESTING SCENARIO: {scenario_name} (Species: {species}) {'='*20}")
    
    # 1. Tạo dữ liệu giả lập
    # Dùng ngày tháng 1 để khớp với simulation logic tránh lỗi turbidity ảo
    history_data = generate_history(scenario_name, "2024-01-15 08:00:00")
    
    # Hiển thị 3 dòng cuối
    print("📉 Input Data (Last 3 points):")
    for item in history_data[-3:]:
        print(f"  - Time: {item['timestamp']} | DO: {item['dissolved_oxygen']} | pH: {item['ph']} | NH3: {item['ammonia']}")

    # 2. Gửi request (Thêm field species)
    payload = {
        "species": species,
        "history": history_data
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            
            # In kết quả
            print("\n🤖 PREDICTION RESULT:")
            print(f"  - Predicted (5min): {result['prediction_next_5min']}")
            print(f"  - Risk Level:       [{result['risk_level']}]")
            
            # In lý do (Nếu có)
            if 'details' in result and result['details']:
                print(f"  - Reasons:          {result['details']}")
            
            # Validate kết quả mong đợi
            expected_map = {
                "SAFE": "SAFE",
                "WARNING": "WARNING",
                "DANGER": "DANGER_ACTION_NEEDED"
            }
            
            expected_status = expected_map[scenario_name]
            is_pass = result['risk_level'] == expected_status
            
            print(f"  - TEST PASSED:      {'✅ YES' if is_pass else '❌ NO (Expected: ' + expected_status + ')'}")
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("   (Make sure uvicorn server is running)")

if __name__ == "__main__":
    # Test với loài Tôm (Nhạy cảm)
    run_test("SAFE", species="tom")
    run_test("WARNING", species="tom")
    run_test("DANGER", species="tom")
    
    # Bonus: Test thử Cá Tra với kịch bản Warning của Tôm -> Nên ra SAFE
    print("\n\n>>> BONUS TEST: Same 'WARNING' data but for 'Catfish' (Ca Tra)")
    run_test("WARNING", species="ca_tra")