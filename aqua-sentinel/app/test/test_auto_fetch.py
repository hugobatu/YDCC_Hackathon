import requests
import json

# =========================
# CONFIG
# =========================
API_URL = "http://127.0.0.1:8000/api/predict"

def test_auto_fetch_from_db():
    """
    Test API với auto-fetch từ database.
    Chỉ cần gửi pool_id, API sẽ tự động lấy 24 điểm dữ liệu mới nhất.
    """
    print("\n" + "="*80)
    print("TEST: AUTO-FETCH LATEST DATA FROM DATABASE")
    print("="*80)
    print("\nMô tả:")
    print("  - API sẽ tự động lấy 24 điểm dữ liệu mới nhất từ bảng water_measurement")
    print("  - Chỉ cần cung cấp pool_id và species")
    print("  - Không cần gửi history trong request body")
    print("\n")
    
    # Test với pool_id thực tế từ database
    # Thay đổi pool_id này thành một pool_id có thực trong database của bạn
    test_pool_id = "b219d0fa-6057-41ba-a22c-8f401a37f209"  # THAY ĐỔI NÀY
    
    payload = {
        "pool_id": test_pool_id,
        "species": "tom",
        # Không có field "history" - API sẽ tự động fetch
    }
    
    print(f"Sending request for pool_id: {test_pool_id}")
    print(f"Payload: {json.dumps(payload, indent=2)}\n")
    
    try:
        response = requests.post(API_URL, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            
            print("✓ SUCCESS: API auto-fetched data from database")
            print("\nRESPONSE:")
            print(f"  - Species: {result['species']}")
            print(f"  - Current Values: {result['current_values']}")
            print(f"  - Predicted (30min): {result['prediction_next_30min']}")
            print(f"  - Risk Level: [{result['risk_level']}]")
            
            if 'details' in result and result['details']:
                print(f"  - Risk Details: {result['details']}")
            
            print("\n✓ TEST PASSED")
            
        elif response.status_code == 400:
            error_detail = response.json().get('detail', 'Unknown error')
            print(f"⚠ WARNING: {error_detail}")
            print("\nPossible reasons:")
            print("  1. Pool không tồn tại trong database")
            print("  2. Pool chưa có đủ 24 điểm dữ liệu")
            print("  3. pool_id không đúng format UUID")
            print("\nSuggestions:")
            print("  - Kiểm tra database xem có pool nào có ít nhất 24 measurements")
            print("  - Chạy simulation để tạo dữ liệu test")
            print("  - Cập nhật test_pool_id trong file này với pool_id thực")
            
        else:
            print(f"✗ FAILED: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("✗ ERROR: Cannot connect to API server")
        print("   Make sure uvicorn server is running: uvicorn app.main:app --reload")
    except Exception as e:
        print(f"✗ ERROR: {e}")

def test_manual_history_still_works():
    """
    Test rằng việc gửi history thủ công vẫn hoạt động bình thường.
    """
    print("\n" + "="*80)
    print("TEST: MANUAL HISTORY SUBMISSION (Backward Compatibility)")
    print("="*80)
    print("\n")
    
    # Tạo 24 điểm dữ liệu giả
    from datetime import datetime, timedelta
    import pandas as pd
    
    history = []
    base_time = datetime(2024, 1, 15, 8, 0, 0)
    
    for i in range(24):
        t = base_time + timedelta(minutes=5*i)
        history.append({
            "timestamp": t.strftime("%Y-%m-%d %H:%M:%S"),
            "temperature": 28.0,
            "dissolved_oxygen": 6.5,
            "ph": 7.5,
            "turbidity": 5.0,
            "ammonia": 0.01,
            "rain_event": 0,
            "feeding_event": 0
        })
    
    payload = {
        "pool_id": "test_pool_001",
        "species": "tom",
        "history": history  # Gửi history thủ công
    }
    
    print("Sending request with manual history (24 points)...")
    
    try:
        response = requests.post(API_URL, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print("✓ SUCCESS: Manual history submission still works")
            print(f"  - Risk Level: [{result['risk_level']}]")
            print("\n✓ TEST PASSED (Backward Compatibility OK)")
            
        else:
            print(f"✗ FAILED: HTTP {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"✗ ERROR: {e}")

if __name__ == "__main__":
    # Test 1: Auto-fetch from database
    test_auto_fetch_from_db()
    
    # Test 2: Manual history still works
    # test_manual_history_still_works()
    
    print("\n" + "="*80)
    print("ALL TESTS COMPLETED")
    print("="*80)
    print("\nNOTE: To use auto-fetch in production:")
    print("  1. Ensure pool_id is a valid UUID from your database")
    print("  2. Pool must have at least 24 water_measurement records")
    print("  3. Measurements should be ordered by created_at")
    print("  4. Data frequency should be approximately 5 minutes")
    print("="*80)
