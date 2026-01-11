import asyncio
import aiohttp
import random
import json
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# =========================
# CẤU HÌNH
# =========================
API_URL = "http://127.0.0.1:8000/predict"
SEND_INTERVAL = 2  # Gửi dữ liệu mỗi 2 giây (Test nhanh)
HISTORY_LEN = 12   # Độ dài lịch sử bắt buộc

# Định nghĩa các hồ nuôi (Mỗi hồ 1 loài, 1 kịch bản)
PONDS = [
    {"id": "POND_01", "species": "tom",    "scenario": "SAFE"},   # Hồ Tôm - An toàn
    {"id": "POND_02", "species": "ca_tra", "scenario": "SAFE"},   # Hồ Cá Tra - An toàn
    {"id": "POND_03", "species": "tom",    "scenario": "DANGER"}, # Hồ Tôm - Đang gặp sự cố (Demo Warning/Danger)
]

# =========================
# HÀM SINH DỮ LIỆU GIẢ (GENERATE)
# =========================
def generate_next_point(last_point, scenario, step_count):
    """
    Sinh điểm dữ liệu tiếp theo dựa trên điểm trước đó và kịch bản
    """
    # Lấy giá trị cũ hoặc khởi tạo nếu chưa có
    if last_point is None:
        return {
            "temperature": 28.0, "dissolved_oxygen": 6.5, "ph": 7.5,
            "turbidity": 5.0, "ammonia": 0.01,
            "rain_event": 0, "feeding_event": 0
        }

    # Copy để không sửa đè
    current = last_point.copy()
    
    # Kịch bản biến động
    if scenario == "SAFE":
        # Dao động ngẫu nhiên nhẹ (Random Walk)
        current["dissolved_oxygen"] += np.random.normal(0, 0.1)
        current["ph"] += np.random.normal(0, 0.02)
        current["ammonia"] = max(0.01, current["ammonia"] + np.random.normal(0, 0.001))
        current["temperature"] += np.random.normal(0, 0.05)
        
        # Hồi quy về chuẩn (để không bị drift quá xa)
        current["dissolved_oxygen"] += 0.05 * (6.5 - current["dissolved_oxygen"])

    elif scenario == "DANGER":
        # Mô phỏng sự cố: Oxy giảm dần, NH3 tăng dần
        # Cứ mỗi bước giảm oxy một chút
        current["dissolved_oxygen"] -= np.random.uniform(0.05, 0.2) 
        current["ammonia"] += np.random.uniform(0.005, 0.02)
        current["ph"] -= np.random.uniform(0.01, 0.05)
        
        # Nếu thấp quá thì giữ ở đáy (để duy trì Danger)
        if current["dissolved_oxygen"] < 2.5: current["dissolved_oxygen"] = 2.5 + np.random.normal(0, 0.1)

    # Các chỉ số khác
    current["turbidity"] = max(1, current["turbidity"] + np.random.normal(0, 0.5))
    current["rain_event"] = 0
    current["feeding_event"] = 0

    # Safety clamp (Kẹp giá trị hợp lý)
    current["dissolved_oxygen"] = max(0.5, current["dissolved_oxygen"])
    current["ammonia"] = max(0.0, current["ammonia"])
    current["ph"] = max(4.0, min(10.0, current["ph"]))

    return current

# =========================
# LOGIC MÔ PHỎNG TỪNG HỒ
# =========================
async def simulate_pond(session, pond_config):
    pond_id = pond_config["id"]
    species = pond_config["species"]
    scenario = pond_config["scenario"]
    
    print(f"🚀 [{pond_id}] Khởi động mô phỏng loài: {species} | Kịch bản: {scenario}")
    
    # 1. Khởi tạo lịch sử giả (Pre-fill 12 điểm)
    history = []
    last_point = None
    
    # Tạo sẵn 12 điểm quá khứ để lần gửi đầu tiên đã hợp lệ
    start_time = datetime.now() - timedelta(minutes=5 * HISTORY_LEN)
    for i in range(HISTORY_LEN):
        point = generate_next_point(last_point, "SAFE", i) # Khởi đầu luôn an toàn
        last_point = point
        # Gắn timestamp quá khứ
        t = start_time + timedelta(minutes=5 * i)
        point["timestamp"] = t.strftime("%Y-%m-%d %H:%M:%S")
        history.append(point)

    step = 0
    while True:
        try:
            # 2. Sinh điểm dữ liệu mới nhất (Realtime)
            new_point = generate_next_point(history[-1], scenario, step)
            new_point["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # 3. Cập nhật cửa sổ trượt (Xóa cũ nhất, thêm mới nhất)
            history.pop(0)
            history.append(new_point)
            
            # 4. Gửi API
            payload = {
                "species": species,
                "history": history
            }
            
            async with session.post(API_URL, json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    
                    # In log đẹp
                    risk = result["risk_level"]
                    icon = "🟢" if risk == "SAFE" else "🟡" if risk == "WARNING" else "🔴"
                    pred_do = result["prediction_next_5min"]["dissolved_oxygen"]
                    
                    print(f"{icon} [{pond_id}] Input DO:{new_point['dissolved_oxygen']:.2f} | Pred DO:{pred_do:.2f} | Risk: {risk}")
                    
                    # Nếu scenario DANGER và hệ thống đã báo DANGER, có thể reset lại SAFE để loop
                    if scenario == "DANGER" and risk == "DANGER_ACTION_NEEDED" and step > 20:
                        print(f"♻️ [{pond_id}] Đã phát hiện nguy hiểm. Reset môi trường về SAFE...")
                        scenario = "SAFE" 
                        step = 0
                else:
                    text = await response.text()
                    print(f"❌ [{pond_id}] API Error: {text}")

        except Exception as e:
            print(f"⚠️ [{pond_id}] Connection Error: {e}")

        step += 1
        # Chờ đến lần gửi tiếp theo
        await asyncio.sleep(SEND_INTERVAL)

# =========================
# MAIN LOOP
# =========================
async def main():
    async with aiohttp.ClientSession() as session:
        tasks = []
        for pond in PONDS:
            tasks.append(simulate_pond(session, pond))
        
        # Chạy tất cả các hồ song song
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nĐã dừng mô phỏng.")