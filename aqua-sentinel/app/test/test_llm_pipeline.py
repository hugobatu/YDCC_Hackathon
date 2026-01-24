"""
Test script cho LLM Analysis Pipeline
Hướng dẫn sử dụng và test endpoint /analyze-with-llm
"""
import requests
import json


def test_llm_analysis_pipeline():
    """
    Test LLM Analysis Pipeline
    
    Pipeline này sẽ:
    1. Tự động lấy 24 chỉ số mới nhất từ database
    2. Dự báo chất lượng nước 30 phút tới
    3. Load tất cả file JSON trong thư mục news
    4. Gửi cho LLM để phân tích
    5. Trả về kết quả JSON
    """
    
    # API endpoint
    url = "http://localhost:8000/api/analyze-with-llm"
    
    # Request body - chỉ cần pool_id và species
    request_body = {
        "pool_id": "b219d0fa-6057-41ba-a22c-8f401a37f209",  # Thay bằng pool_id thực tế của bạn
        "species": "tom",            # tom, ca, hoặc cua
        "include_raw_prompt": True   # True để xem prompt gửi cho LLM (debug)
    }
    
    print("=" * 80)
    print("TESTING LLM ANALYSIS PIPELINE")
    print("=" * 80)
    print(f"\nRequest URL: {url}")
    print(f"Request Body:\n{json.dumps(request_body, indent=2, ensure_ascii=False)}")
    print("\n" + "=" * 80)
    
    try:
        # Gửi request
        response = requests.post(url, json=request_body)
        
        # Kiểm tra status code
        if response.status_code == 200:
            result = response.json()
            
            print("\n✅ SUCCESS!")
            print("=" * 80)
            
            # In kết quả phân tích
            print("\n📊 ANALYSIS RESULT:")
            print("-" * 80)
            print(json.dumps(result["analysis"], indent=2, ensure_ascii=False))
            
            # In context
            print("\n📋 CONTEXT (Data sent to LLM):")
            print("-" * 80)
            print(f"Timestamp: {result['context']['timestamp']}")
            print(f"Species: {result['context']['species']}")
            print(f"\nPrediction (30 min):")
            print(json.dumps(result['context']['prediction'], indent=2, ensure_ascii=False))
            print(f"\nCurrent Values:")
            print(json.dumps(result['context']['current_values'], indent=2, ensure_ascii=False))
            print(f"\nRisk Assessment:")
            print(json.dumps(result['context']['risk_assessment'], indent=2, ensure_ascii=False))
            print(f"\nNews Sources: {list(result['context']['news'].keys())}")
            
            # In raw prompt nếu có
            if "raw_prompt" in result:
                print("\n📝 RAW PROMPT (sent to LLM):")
                print("-" * 80)
                print(result["raw_prompt"][:1000] + "...")  # Preview 500 ký tự đầu
            
            print("\n" + "=" * 80)
            
        else:
            print(f"\n❌ ERROR: Status code {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Không thể kết nối tới server!")
        print("Hãy chắc chắn server đang chạy: python -m app.main")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")


def print_usage_guide():
    """In hướng dẫn sử dụng"""
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                     LLM ANALYSIS PIPELINE - HƯỚNG DẪN SỬ DỤNG                ║
╚══════════════════════════════════════════════════════════════════════════════╝

📌 ENDPOINT:
   POST /api/analyze-with-llm

📌 REQUEST BODY:
   {
       "pool_id": "string",              # ID của hồ nuôi
       "species": "tom",                 # Loài: tom, ca, hoặc cua
       "include_raw_prompt": false       # True để xem prompt (debug)
   }

📌 RESPONSE:
   {
       "analysis": {
           "overall_assessment": "...",
           "potential_risks": [...],
           "recommendations": [...],
           "environmental_impact": "...",
           "priority_actions": [...]
       },
       "context": {
           "timestamp": "...",
           "species": "...",
           "prediction": {...},
           "current_values": {...},
           "risk_assessment": {...},
           "news": {...}
       },
       "raw_prompt": "..." (optional)
   }

📌 PIPELINE FLOW:
   1. Tự động fetch 24 chỉ số mới nhất từ database
   2. Gọi prediction service → dự báo 30 phút tới
   3. Load tất cả file JSON từ app/news/
   4. Kết hợp dữ liệu → gửi cho LLM với prompt template
   5. Trả về JSON kết quả phân tích

📌 TÙY CHỈNH PROMPT:
   - File prompt: app/config/llm_prompt.txt
   - Có thể chỉnh sửa prompt theo ý muốn
   - Sử dụng placeholders:
     * {prediction_data}
     * {current_values}
     * {risk_level}
     * {risk_details}
     * {news_data}

📌 TÍCH HỢP LLM:
   - Mở file: app/services/llm_analysis_service.py
   - Tìm phần TODO trong method analyze_with_llm()
   - Thêm code gọi LLM API của bạn (OpenAI, Gemini, etc.)
   - Ví dụ đã có sẵn trong comment

📌 EXAMPLE CURL:
   curl -X POST http://localhost:8000/api/analyze-with-llm \\
        -H "Content-Type: application/json" \\
        -d '{
            "pool_id": "pool-test-001",
            "species": "tom",
            "include_raw_prompt": false
        }'

╔══════════════════════════════════════════════════════════════════════════════╗
║                              CHẠY TEST                                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

1. Khởi động server:
   python -m app.main

2. Chạy test này:
   python app/test_llm_pipeline.py

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")


if __name__ == "__main__":
    print_usage_guide()
    
    # Chạy test
    input("\nNhấn Enter để chạy test...")
    test_llm_analysis_pipeline()
