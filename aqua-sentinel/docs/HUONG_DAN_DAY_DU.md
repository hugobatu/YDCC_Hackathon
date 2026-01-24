# 🎯 Hướng Dẫn Hoàn Chỉnh - LLM Analysis Pipeline với Gemini 2.5 Flash

## 📋 Tổng Quan

Bạn đã có một pipeline hoàn chỉnh để phân tích chất lượng nước bằng AI:

```
Input (pool_id) → Fetch 24 data points → Predict → Risk Assessment → Combine with News → Gemini 2.5 Flash → JSON Analysis
```

## 🚀 Bắt Đầu Nhanh (5 phút)

### Bước 1: Cài đặt package

```bash
pip install google-generativeai
```

### Bước 2: Verify API Key

File `.env` của bạn đã có sẵn API key. Kiểm tra:

```bash
# Windows PowerShell
type .env | findstr GOOGLE_API_KEY

# Hoặc mở file .env và tìm dòng:
GOOGLE_API_KEY=AIzaSy...
```

Nếu chưa có hoặc muốn đổi key mới:
1. Truy cập: https://aistudio.google.com/app/apikey
2. Tạo API key mới
3. Cập nhật vào `.env`

### Bước 3: Test Gemini connection

```bash
python test_gemini_simple.py
```

Nếu thấy:
```
✅ Connection successful!
📝 Response from Gemini:
Gemini đang hoạt động!
🎉 SUCCESS! Gemini 2.5 Flash is ready to use!
```

→ **XONG! Bạn đã sẵn sàng!**

### Bước 4: Khởi động server

```bash
python -m app.main
```

### Bước 5: Test pipeline đầy đủ

Mở terminal mới (giữ server chạy):

```bash
python app/test_llm_pipeline.py
```

## 📊 Cấu Trúc File Đã Tạo

```
aqua-sentinel/
├── app/
│   ├── api/
│   │   └── predict.py                    # ✅ Đã thêm /analyze-with-llm endpoint
│   ├── services/
│   │   └── llm_analysis_service.py       # ✅ Tích hợp Gemini 2.5 Flash
│   ├── config/
│   │   └── llm_prompt.txt                # ✅ Prompt có thể tùy chỉnh
│   ├── news/                             # ✅ Tin tức tự động load
│   │   ├── water_level.json
│   │   ├── water_flow.json
│   │   ├── weather_land_forecast_24h.json
│   │   ├── hydrology_short_term_forecast.json
│   │   └── tide.json
│   ├── test_llm_pipeline.py              # ✅ Test script đầy đủ
│   └── llm_integration_examples.py       # ✅ Ví dụ các LLM khác
│
├── test_gemini_simple.py                 # ✅ Test script đơn giản
├── .env                                  # ✅ Đã có GOOGLE_API_KEY
│
├── LLM_PIPELINE_README.md                # ✅ Tóm tắt nhanh
├── GEMINI_SETUP_GUIDE.md                 # ✅ Hướng dẫn Gemini chi tiết
├── LLM_PIPELINE_GUIDE.md                 # ✅ Hướng dẫn đầy đủ
├── LLM_PIPELINE_QUICKSTART.md            # ✅ Quick start
├── PIPELINE_ARCHITECTURE.md              # ✅ Kiến trúc hệ thống
└── HUONG_DAN_DAY_DU.md                   # ✅ File này
```

## 🎯 API Endpoint Mới

### POST /api/analyze-with-llm

**Request:**
```json
{
    "pool_id": "pool-test-001",
    "species": "tom",
    "include_raw_prompt": false
}
```

**Response:**
```json
{
    "analysis": {
        "overall_assessment": "Đánh giá tổng quan từ Gemini...",
        "potential_risks": [
            "Rủi ro 1",
            "Rủi ro 2"
        ],
        "recommendations": [
            "Khuyến nghị 1",
            "Khuyến nghị 2"
        ],
        "environmental_impact": "Ảnh hưởng môi trường...",
        "priority_actions": [
            {
                "action": "...",
                "urgency": "high",
                "reason": "..."
            }
        ]
    },
    "context": {
        "timestamp": "2026-01-25T00:20:00",
        "species": "tom",
        "prediction": {...},
        "current_values": {...},
        "risk_assessment": {...},
        "news": {...}
    }
}
```

## 🔄 Pipeline Flow Chi Tiết

```
1. CLIENT gửi request
   └─→ pool_id: "pool-test-001"
   └─→ species: "tom"

2. API ENDPOINT (/api/analyze-with-llm)
   └─→ Nhận request
   └─→ Parse parameters

3. DATABASE AUTO-FETCH
   └─→ Query: SELECT * FROM water_measurements
              WHERE pool_id = 'pool-test-001'
              ORDER BY created_at DESC
              LIMIT 24
   └─→ Lấy được 24 điểm đo (2 giờ data @ 5-min interval)

4. PREDICTION SERVICE
   └─→ Input: 24 historical points
   └─→ ML Model (LSTM/Transformer)
   └─→ Output: Predicted values @ t+30min

5. RISK ASSESSMENT
   └─→ Compare predictions vs thresholds
   └─→ Output: risk_level (LOW/MEDIUM/HIGH)

6. LOAD NEWS DATA
   └─→ Read all JSON files from app/news/
   └─→ water_level.json
   └─→ water_flow.json
   └─→ weather_land_forecast_24h.json
   └─→ hydrology_short_term_forecast.json
   └─→ tide.json

7. PREPARE CONTEXT
   └─→ Combine all data into single object

8. FORMAT PROMPT
   └─→ Load template: app/config/llm_prompt.txt
   └─→ Replace placeholders with actual data

9. GEMINI 2.5 FLASH API CALL
   └─→ Send formatted prompt
   └─→ Receive JSON response
   └─→ Parse & validate

10. RETURN RESPONSE
    └─→ {analysis: {...}, context: {...}}
```

## ⚙️ Tùy Chỉnh

### 1. Thay Đổi Prompt

File: `app/config/llm_prompt.txt`

Bạn có thể sử dụng các placeholders:
- `{prediction_data}` - Dự báo 30 phút tới
- `{current_values}` - Giá trị hiện tại
- `{risk_level}` - Mức độ rủi ro
- `{risk_details}` - Chi tiết rủi ro
- `{news_data}` - Dữ liệu tin tức

**Ví dụ:**
```text
Bạn là chuyên gia nuôi tôm. Phân tích dữ liệu sau:

Dự báo: {prediction_data}
Hiện tại: {current_values}
Rủi ro: {risk_level}
Tin tức: {news_data}

Trả về JSON với format:
{{
    "assessment": "...",
    "risks": [...],
    "actions": [...]
}}
```

### 2. Thay Đổi Model Parameters

File: `app/services/llm_analysis_service.py`

Tìm dòng:
```python
generation_config = {
    "temperature": 0.7,           # 0-1: Độ sáng tạo
    "top_p": 0.95,                # 0-1: Nucleus sampling
    "top_k": 40,                  # 1-100: Top-k sampling
    "max_output_tokens": 8192,    # Max length
}
```

Thay đổi theo nhu cầu:
- **Response ngắn gọn**: `max_output_tokens=2048`
- **Ít sáng tạo hơn**: `temperature=0.3`
- **Đa dạng hơn**: `temperature=0.9`

### 3. Thêm News Sources

Tạo file JSON mới trong `app/news/`:

```bash
# Tạo file mới
echo {} > app/news/your_news_source.json
```

Thêm nội dung:
```json
{
    "source": "Your Source",
    "category": "weather",
    "content": "..."
}
```

Pipeline sẽ tự động load file mới!

### 4. Đổi LLM Provider

Xem file: `app/llm_integration_examples.py`

Có sẵn code mẫu cho:
- OpenAI GPT-4
- Anthropic Claude
- Azure OpenAI
- Ollama (local)
- HuggingFace

## 📱 Tích Hợp Frontend

### JavaScript/React Example

```javascript
async function analyzeWaterQuality(poolId, species) {
    const response = await fetch('http://localhost:8000/api/analyze-with-llm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pool_id: poolId,
            species: species,
            include_raw_prompt: false
        })
    });
    
    const data = await response.json();
    
    console.log('Analysis:', data.analysis);
    console.log('Context:', data.context);
    
    return data;
}

// Usage
analyzeWaterQuality('pool-test-001', 'tom')
    .then(result => {
        // Display results
        document.getElementById('assessment').textContent = 
            result.analysis.overall_assessment;
        
        // Display risks
        const riskList = document.getElementById('risks');
        result.analysis.potential_risks.forEach(risk => {
            const li = document.createElement('li');
            li.textContent = risk;
            riskList.appendChild(li);
        });
    });
```

### Python Example

```python
import requests

response = requests.post(
    'http://localhost:8000/api/analyze-with-llm',
    json={
        'pool_id': 'pool-test-001',
        'species': 'tom',
        'include_raw_prompt': False
    }
)

result = response.json()
print(f"Assessment: {result['analysis']['overall_assessment']}")
print(f"Risks: {result['analysis']['potential_risks']}")
```

## 🔍 Debugging & Monitoring

### Enable Debug Mode

Thêm vào request:
```json
{
    "pool_id": "pool-test-001",
    "species": "tom",
    "include_raw_prompt": true  // ← Bật debug
}
```

Response sẽ có thêm `raw_prompt` để xem prompt gửi cho LLM.

### Check Logs

Khi server chạy, bạn sẽ thấy logs:
```
🤖 Calling Gemini 2.5 Flash API...
✅ Gemini 2.5 Flash response received successfully!
```

Hoặc nếu có lỗi:
```
⚠️  LLM API Error: ...
   Falling back to mock response.
```

## 💰 Chi Phí & Performance

### Free Tier (Đang dùng)
- ✅ 1,500 requests/day
- ✅ Không cần thẻ tín dụng
- ✅ Đủ cho development

### Performance
- Database query: ~10-50ms
- ML Prediction: ~50-200ms
- Risk assessment: ~5-10ms
- News loading: ~5-20ms
- **Gemini API: ~1-2s** (phần chậm nhất)
- **Total: ~1.5-2.5s**

### Optimization Tips
1. **Cache responses** cho cùng context
2. **Async processing** nếu gọi nhiều pools
3. **Background jobs** cho auto-analysis theo lịch

## 🆘 Troubleshooting Common Issues

### 1. "google-generativeai not installed"
```bash
pip install google-generativeai
```

### 2. "GOOGLE_API_KEY not found"
- Kiểm tra file `.env` có dòng `GOOGLE_API_KEY=...`
- Restart server sau khi thêm API key

### 3. "Không đủ dữ liệu trong database"
- Database cần có ít nhất 24 measurements cho pool
- Chờ simulation service tạo thêm data (5 phút/điểm)

### 4. "API key not valid"
- Tạo key mới tại https://aistudio.google.com/app/apikey
- Cập nhật vào `.env`

### 5. "Resource exhausted"
- Vượt quota 1500 requests/day
- Chờ 24h để reset hoặc upgrade lên paid

### 6. Response timeout
- Gemini đôi khi chậm do network
- Đã có fallback mechanism, sẽ retry hoặc dùng mock

## 📚 Tài Liệu Tham Khảo

| File | Mục Đích |
|------|----------|
| `LLM_PIPELINE_README.md` | Tóm tắt nhanh, bắt đầu ngay |
| `GEMINI_SETUP_GUIDE.md` | Setup Gemini chi tiết |
| `LLM_PIPELINE_GUIDE.md` | Hướng dẫn đầy đủ toàn bộ |
| `PIPELINE_ARCHITECTURE.md` | Kiến trúc và data flow |
| `app/llm_integration_examples.py` | Code mẫu các LLM |
| `test_gemini_simple.py` | Test Gemini connection |
| `app/test_llm_pipeline.py` | Test pipeline đầy đủ |

## ✅ Checklist Hoàn Thành

- [x] LLM Analysis Service
- [x] API Endpoint `/analyze-with-llm`
- [x] Gemini 2.5 Flash Integration
- [x] Auto-fetch 24 data points
- [x] Prediction integration
- [x] Risk assessment integration
- [x] News data loading
- [x] Customizable prompt template
- [x] Fallback mechanism
- [x] Error handling
- [x] Test scripts
- [x] Documentation (5 files)
- [x] Integration examples

## 🎉 Kết Luận

**Bạn đã có một pipeline hoàn chỉnh!**

Để sử dụng:
1. ✅ `pip install google-generativeai`
2. ✅ `python test_gemini_simple.py` (verify)
3. ✅ `python -m app.main` (start server)
4. ✅ `python app/test_llm_pipeline.py` (test)

**Sau đó tích hợp vào frontend của bạn!**

---

**Questions? Issues?**
- Check các file MD documentation
- Xem examples trong `llm_integration_examples.py`
- Test với `test_gemini_simple.py`

**Chúc bạn thành công! 🚀🎯**
