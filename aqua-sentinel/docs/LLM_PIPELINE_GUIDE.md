# LLM Analysis Pipeline - Hướng Dẫn Chi Tiết

## Tổng Quan

Pipeline này tự động hóa việc phân tích chất lượng nước kết hợp với tin tức môi trường bằng LLM (Large Language Model).

### Flow của Pipeline:

```
┌─────────────────┐
│  Input Request  │
│  - pool_id      │
│  - species      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ BƯỚC 1: AUTO-FETCH DATA         │
│ Lấy 24 chỉ số mới nhất từ DB    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ BƯỚC 2: PREDICTION              │
│ Dự báo chất lượng nước 30 phút  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ BƯỚC 3: RISK ASSESSMENT         │
│ Đánh giá mức độ rủi ro          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ BƯỚC 4: LOAD NEWS DATA          │
│ Đọc tất cả file JSON từ news/   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ BƯỚC 5: LLM ANALYSIS            │
│ Kết hợp dữ liệu + gửi LLM       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ JSON Response   │
└─────────────────┘
```

---

## API Endpoint

### Endpoint URL
```
POST /api/analyze-with-llm
```

### Request Body
```json
{
    "pool_id": "pool-test-001",
    "species": "tom",
    "include_raw_prompt": false
}
```

**Tham số:**
- `pool_id` (string, required): ID của hồ nuôi cần phân tích
- `species` (string, optional): Loài nuôi - `"tom"`, `"ca"`, hoặc `"cua"`. Mặc định: `"tom"`
- `include_raw_prompt` (bool, optional): Có trả về prompt gửi cho LLM không (để debug). Mặc định: `false`

### Response Format
```json
{
    "analysis": {
        "overall_assessment": "Tình hình chất lượng nước hiện tại ở mức an toàn...",
        "potential_risks": [
            "Nhiệt độ dự báo có xu hướng tăng nhẹ, cần theo dõi",
            "Oxy hòa tan có thể giảm vào buổi tối"
        ],
        "recommendations": [
            "Kiểm tra máy sục khí định kỳ",
            "Theo dõi thời tiết trong 24h tới"
        ],
        "environmental_impact": "Dựa vào tin tức thời tiết...",
        "priority_actions": [
            {
                "action": "Kiểm tra hệ thống thoát nước",
                "urgency": "medium",
                "reason": "Nguy cơ mưa trong 24h tới"
            }
        ]
    },
    "context": {
        "timestamp": "2026-01-25T00:15:00",
        "species": "tom",
        "prediction": {
            "temperature": 28.5,
            "dissolved_oxygen": 6.2,
            "ph": 7.8,
            "turbidity": 15.0,
            "ammonia": 0.05
        },
        "current_values": {
            "temperature": 28.2,
            "dissolved_oxygen": 6.5,
            "ph": 7.7,
            "turbidity": 14.0,
            "ammonia": 0.04
        },
        "risk_assessment": {
            "level": "LOW",
            "details": ["Tất cả chỉ số trong ngưỡng an toàn"]
        },
        "news": {
            "water_level": {...},
            "water_flow": {...},
            "weather_land_forecast_24h": {...},
            "hydrology_short_term_forecast": {...},
            "tide": {...}
        }
    },
    "raw_prompt": "..." // Optional, chỉ có khi include_raw_prompt=true
}
```

---

## Cấu Trúc File

```
aqua-sentinel/
├── app/
│   ├── api/
│   │   └── predict.py              # API endpoint /analyze-with-llm
│   ├── services/
│   │   └── llm_analysis_service.py # Service xử lý LLM
│   ├── config/
│   │   └── llm_prompt.txt          # Template prompt (có thể chỉnh sửa)
│   ├── news/                       # Thư mục chứa file JSON tin tức
│   │   ├── water_level.json
│   │   ├── water_flow.json
│   │   ├── weather_land_forecast_24h.json
│   │   ├── hydrology_short_term_forecast.json
│   │   └── tide.json
│   ├── schemas/
│   │   └── schema_prediction.py    # LLMAnalysisRequest, LLMAnalysisResponse
│   └── test_llm_pipeline.py        # Test script
└── LLM_PIPELINE_GUIDE.md           # File này
```

---

## Hướng Dẫn Sử Dụng

### 1. Khởi động Server

```bash
# Activate virtual environment (nếu có)
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate     # Windows

# Khởi động server
python -m app.main
```

### 2. Test Pipeline

Có 3 cách để test:

#### Cách 1: Dùng Test Script (Khuyến nghị)
```bash
python app/test_llm_pipeline.py
```

#### Cách 2: Dùng cURL
```bash
curl -X POST http://localhost:8000/api/analyze-with-llm \
     -H "Content-Type: application/json" \
     -d '{
         "pool_id": "pool-test-001",
         "species": "tom",
         "include_raw_prompt": true
     }'
```

#### Cách 3: Dùng Python requests
```python
import requests
import json

response = requests.post(
    "http://localhost:8000/api/analyze-with-llm",
    json={
        "pool_id": "pool-test-001",
        "species": "tom",
        "include_raw_prompt": False
    }
)

result = response.json()
print(json.dumps(result, indent=2, ensure_ascii=False))
```

---

## Tùy Chỉnh Prompt

### File Prompt Template

Prompt template được lưu tại: `app/config/llm_prompt.txt`

### Placeholders Có Sẵn

Bạn có thể sử dụng các placeholders sau trong prompt:

- `{prediction_data}` - Dự báo chất lượng nước 30 phút tới (JSON)
- `{current_values}` - Giá trị hiện tại các chỉ số (JSON)
- `{risk_level}` - Mức độ rủi ro (LOW/MEDIUM/HIGH)
- `{risk_details}` - Chi tiết các rủi ro (list)
- `{news_data}` - Dữ liệu tin tức từ tất cả file JSON (JSON)

### Ví Dụ Custom Prompt

```text
Bạn là chuyên gia nuôi tôm với 20 năm kinh nghiệm.

Thông tin cần phân tích:
- Dự báo 30 phút tới: {prediction_data}
- Tình trạng hiện tại: {current_values}
- Rủi ro: {risk_level} - {risk_details}
- Tin tức: {news_data}

Hãy đưa ra:
1. Đánh giá tổng quan
2. Top 3 rủi ro cần chú ý
3. Hành động ưu tiên cao nhất

Format JSON:
{{
    "assessment": "...",
    "top_risks": ["...", "...", "..."],
    "priority_action": "..."
}}
```

---

## Tích Hợp LLM

### Vị Trí Code

Mở file: `app/services/llm_analysis_service.py`

Tìm method: `analyze_with_llm()` → phần TODO

### Ví Dụ: OpenAI GPT

```python
from openai import AsyncOpenAI
import os

# Trong method analyze_with_llm()
client = AsyncOpenAI(api_key=llm_api_key or os.getenv("OPENAI_API_KEY"))

response = await client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a water quality expert."},
        {"role": "user", "content": formatted_prompt}
    ],
    response_format={"type": "json_object"}
)

llm_response = json.loads(response.choices[0].message.content)
```

### Ví Dụ: Google Gemini

```python
import google.generativeai as genai
import os
import json

# Configure API key
genai.configure(api_key=llm_api_key or os.getenv("GOOGLE_API_KEY"))

# Create model
model = genai.GenerativeModel('gemini-pro')

# Generate content
response = model.generate_content(formatted_prompt)

# Parse JSON response
llm_response = json.loads(response.text)
```

### Ví Dụ: Anthropic Claude

```python
from anthropic import AsyncAnthropic
import os
import json

client = AsyncAnthropic(api_key=llm_api_key or os.getenv("ANTHROPIC_API_KEY"))

response = await client.messages.create(
    model="claude-3-opus-20240229",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": formatted_prompt}
    ]
)

llm_response = json.loads(response.content[0].text)
```

### Setup Environment Variables

Thêm vào file `.env`:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Google Gemini
GOOGLE_API_KEY=...

# Anthropic
ANTHROPIC_API_KEY=...
```

---

## Quản Lý Tin Tức

### Thêm File Tin Tức Mới

1. Tạo file JSON trong `app/news/`
2. Format tùy ý, ví dụ:

```json
{
    "source": "NCHMF",
    "category": "weather",
    "url": "https://...",
    "title": "Dự báo thời tiết 24h",
    "published_at": "2026-01-25T00:00:00Z",
    "content": "..."
}
```

3. File sẽ tự động được load khi gọi API

### Xóa File Tin Tức

Chỉ cần xóa file JSON trong `app/news/`, pipeline sẽ bỏ qua file đó.

---

## Troubleshooting

### Lỗi: "Không đủ dữ liệu trong database"

**Nguyên nhân:** Hồ chưa có đủ 24 điểm đo

**Giải pháp:**
1. Kiểm tra database: `SELECT COUNT(*) FROM water_measurements WHERE pool_id = 'xxx'`
2. Chờ simulation service tạo thêm dữ liệu (chạy mỗi 5 phút)
3. Hoặc insert dữ liệu test thủ công

### Lỗi: LLM trả về không đúng format JSON

**Nguyên nhân:** Prompt chưa rõ ràng hoặc LLM chưa tuân theo

**Giải pháp:**
1. Kiểm tra lại prompt trong `app/config/llm_prompt.txt`
2. Thêm câu nhấn mạnh format: "BẮT BUỘC trả về JSON hợp lệ"
3. Với OpenAI, dùng `response_format={"type": "json_object"}`

### Lỗi: Connection refused

**Nguyên nhân:** Server chưa chạy

**Giải pháp:**
```bash
python -m app.main
```

---

## Best Practices

### 1. Tối Ưu Prompt

- ✅ Rõ ràng, cụ thể
- ✅ Có ví dụ output mẫu
- ✅ Giới hạn độ dài response
- ❌ Tránh prompt quá dài, dễ nhầm lẫn

### 2. Xử Lý Errors

```python
try:
    response = await client.chat.completions.create(...)
except Exception as e:
    # Log error
    logger.error(f"LLM API error: {e}")
    # Return fallback response
    return {"error": "LLM unavailable", "fallback": "..."}
```

### 3. Cache Response (Optional)

Nếu gọi LLM nhiều lần với cùng input:

```python
from functools import lru_cache
import hashlib

def get_cache_key(context):
    return hashlib.md5(json.dumps(context).encode()).hexdigest()

# Lưu cache vào Redis hoặc memory
```

### 4. Rate Limiting

Tránh vượt quota API:

```python
import asyncio
from datetime import datetime, timedelta

# Simple rate limiter
last_call = None
min_interval = timedelta(seconds=1)

async def call_llm_with_rate_limit(...):
    global last_call
    if last_call and datetime.now() - last_call < min_interval:
        await asyncio.sleep(min_interval.total_seconds())
    
    result = await client.chat.completions.create(...)
    last_call = datetime.now()
    return result
```

---

## Ví Dụ Response Thực Tế

### Request
```json
{
    "pool_id": "pool-test-001",
    "species": "tom",
    "include_raw_prompt": false
}
```

### Response
```json
{
    "analysis": {
        "overall_assessment": "Ao tôm hiện tại ở trạng thái tốt với các chỉ số trong ngưỡng an toàn. Tuy nhiên cần lưu ý thời tiết có khả năng mưa trong 24h tới.",
        "potential_risks": [
            "Mưa lớn có thể làm loãng độ mặn và giảm pH",
            "Nhiệt độ có xu hướng giảm nhẹ sau mưa",
            "Nước dâng ven biển có thể ảnh hưởng hệ thống thoát nước"
        ],
        "recommendations": [
            "Kiểm tra và bảo trì hệ thống thoát nước",
            "Chuẩn bị vôi để xử lý pH nếu cần",
            "Giảm lượng thức ăn 20% trong ngày mưa",
            "Theo dõi sát oxy hòa tan sau mưa"
        ],
        "environmental_impact": "Theo dự báo thủy văn, khu vực ven biển có nước dâng 0.1-0.4m. Kết hợp với mưa dự báo có thể gây áp lực lên hệ thống thoát nước ao nuôi.",
        "priority_actions": [
            {
                "action": "Kiểm tra van thoát nước và bơm dự phòng",
                "urgency": "high",
                "reason": "Nguy cơ mưa + nước dâng trong 12h tới",
                "deadline": "Trong 6 giờ tới"
            },
            {
                "action": "Chuẩn bị vôi bột 50kg",
                "urgency": "medium",
                "reason": "Dự phòng xử lý pH sau mưa",
                "deadline": "Trong 24 giờ"
            }
        ]
    },
    "context": {
        "timestamp": "2026-01-25T00:15:00+07:00",
        "species": "tom",
        "prediction": {
            "temperature": 28.3,
            "dissolved_oxygen": 6.1,
            "ph": 7.8,
            "turbidity": 15.2,
            "ammonia": 0.048
        },
        "current_values": {
            "temperature": 28.5,
            "dissolved_oxygen": 6.3,
            "ph": 7.9,
            "turbidity": 14.8,
            "ammonia": 0.045
        },
        "risk_assessment": {
            "level": "LOW",
            "details": [
                "Tất cả chỉ số trong ngưỡng an toàn cho tôm"
            ]
        },
        "news": {
            "water_level": {
                "source": "NCHMF",
                "content": "Nước dâng 0.1-0.4m ven biển"
            },
            "weather_land_forecast_24h": {
                "source": "NCHMF",
                "content": "Có mưa rào và dông rải rác..."
            }
        }
    }
}
```

---

## FAQ

**Q: Pipeline có tự động chạy không?**  
A: Không. Pipeline chỉ chạy khi bạn gọi API endpoint `/analyze-with-llm`. Bạn có thể setup cron job hoặc scheduler để tự động gọi định kỳ.

**Q: Có thể dùng nhiều LLM khác nhau không?**  
A: Có. Bạn có thể tạo nhiều service khác nhau hoặc dùng strategy pattern để switch giữa các LLM.

**Q: File tin tức có format cố định không?**  
A: Không. File JSON có thể có format tùy ý, LLM sẽ tự hiểu và phân tích.

**Q: Chi phí gọi LLM API?**  
A: Phụ thuộc provider. Với OpenAI GPT-4, mỗi request ~$0.01-0.03. Nên cache hoặc rate limit.

**Q: Có thể dùng LLM local (offline) không?**  
A: Có. Bạn có thể dùng Ollama, LlamaCpp, hoặc các model local khác. Chỉ cần thay đổi phần gọi API trong service.

---

## Changelog

### v1.0.0 (2026-01-25)
- ✨ Initial release
- 🎯 Auto-fetch 24 data points from database
- 🤖 LLM analysis integration placeholder
- 📰 News data integration
- ⚙️ Customizable prompt template
- 📝 Comprehensive documentation

---

## License

MIT License - Aqua Sentinel Project

---

## Support

Nếu có vấn đề, tạo issue hoặc liên hệ team phát triển.
