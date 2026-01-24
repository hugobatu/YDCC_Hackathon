# Setup Google Gemini 2.5 Flash - Hướng Dẫn Chi Tiết

## 📌 Tại Sao Chọn Gemini 2.5 Flash?

- ⚡ **Cực kỳ nhanh**: Response time ~1-2 giây
- 💰 **Rẻ**: Free tier hào phóng (1500 requests/day)
- 🎯 **Chính xác**: Model mới nhất từ Google
- 📝 **JSON native**: Hỗ trợ force JSON response
- 🇻🇳 **Vietnamese support**: Hiểu tiếng Việt rất tốt

## 🚀 Bước 1: Lấy API Key

### Cách 1: Google AI Studio (Khuyến nghị - FREE)

1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập bằng Google Account
3. Click **"Get API Key"** → **"Create API Key"**
4. Chọn project hoặc tạo project mới
5. Copy API key (dạng: `AIzaSy...`)

### Cách 2: Google Cloud Console (Cho production)

1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project có sẵn
3. Enable **Generative Language API**
4. Tạo API key trong **APIs & Services** → **Credentials**

## 🔧 Bước 2: Setup Environment

### 2.1. Cài đặt package

```bash
pip install google-generativeai
```

### 2.2. Thêm API Key vào `.env`

Mở file `.env` trong thư mục gốc project:

```env
# Google Gemini API Key
GOOGLE_API_KEY=AIzaSy...your-api-key-here...
```

⚠️ **LƯU Ý**: Không commit file `.env` lên git! File này đã có trong `.gitignore`

### 2.3. Verify Installation

```bash
python -c "import google.generativeai; print('✅ google-generativeai installed!')"
```

## ✅ Bước 3: Test Pipeline

### Test 1: Chạy Test Script

```bash
python app/test_llm_pipeline.py
```

Nếu thành công, bạn sẽ thấy:
```
🤖 Calling Gemini 2.5 Flash API...
✅ Gemini 2.5 Flash response received successfully!
```

### Test 2: Test với cURL

```bash
curl -X POST http://localhost:8000/api/analyze-with-llm \
     -H "Content-Type: application/json" \
     -d '{
         "pool_id": "pool-test-001",
         "species": "tom",
         "include_raw_prompt": true
     }'
```

### Test 3: Xem output trong terminal

Khởi động server với mode verbose:

```bash
python -m app.main
```

Khi gọi API, bạn sẽ thấy log:
```
🤖 Calling Gemini 2.5 Flash API...
✅ Gemini 2.5 Flash response received successfully!
```

## 📊 Gemini 2.5 Flash Configuration

File đã được config sẵn trong `app/services/llm_analysis_service.py`:

```python
generation_config = {
    "temperature": 0.7,           # Độ sáng tạo (0-1)
    "top_p": 0.95,                # Nucleus sampling
    "top_k": 40,                  # Top-k sampling
    "max_output_tokens": 8192,    # Max output length
    "response_mime_type": "application/json",  # Force JSON
}

model = genai.GenerativeModel(
    model_name='gemini-2.0-flash-exp',  # Gemini 2.5 Flash model
    generation_config=generation_config,
    system_instruction="You are an expert in water quality analysis..."
)
```

### Tùy Chỉnh Parameters

Nếu muốn thay đổi behavior:

| Parameter | Mô Tả | Range | Khuyến Nghị |
|-----------|-------|-------|-------------|
| `temperature` | Độ sáng tạo | 0.0 - 1.0 | 0.7 (balanced) |
| `top_p` | Nucleus sampling | 0.0 - 1.0 | 0.95 |
| `top_k` | Top-k sampling | 1 - 100 | 40 |
| `max_output_tokens` | Độ dài max | 1 - 8192 | 8192 |

**Ví dụ**: Response ngắn gọn hơn:
```python
"temperature": 0.3,  # Ít sáng tạo hơn
"max_output_tokens": 2048,  # Ngắn hơn
```

## 🆓 Free Tier & Pricing

### Free Tier (Google AI Studio)
- ✅ **1,500 requests per day**
- ✅ Không cần thẻ tín dụng
- ✅ Đủ cho development & testing

### Paid Tier (Google Cloud)
- 💵 **$0.00001875 per token** (input)
- 💵 **$0.000075 per token** (output)
- ~$0.001 - $0.003 per request (ước tính)

**So sánh**:
- OpenAI GPT-4: ~$0.03/request
- Gemini 2.5 Flash: ~$0.002/request
- **Rẻ hơn 15x!**

## 🔍 Troubleshooting

### Lỗi: "GOOGLE_API_KEY not found"

**Nguyên nhân**: Chưa set API key

**Giải pháp**:
1. Kiểm tra file `.env` có chứa `GOOGLE_API_KEY=...`
2. Restart server sau khi thêm API key
3. Verify: `echo $GOOGLE_API_KEY` (Linux/Mac) hoặc `echo %GOOGLE_API_KEY%` (Windows)

### Lỗi: "google-generativeai package not installed"

**Giải pháp**:
```bash
pip install google-generativeai
```

### Lỗi: "API key not valid"

**Nguyên nhân**: API key sai hoặc đã hết hạn

**Giải pháp**:
1. Tạo API key mới tại https://aistudio.google.com/app/apikey
2. Cập nhật trong `.env`
3. Restart server

### Lỗi: "Resource exhausted"

**Nguyên nhân**: Vượt quá quota (1500 requests/day)

**Giải pháp**:
- Chờ 24h để quota reset
- Hoặc upgrade lên paid tier
- Hoặc dùng multiple API keys (tạo thêm Google account)

### Response không phải JSON

**Nguyên nhân**: Hiếm khi xảy ra, model không tuân theo instruction

**Giải pháp**: Code đã có fallback mechanism, sẽ tự động retry hoặc dùng mock response

## 🎯 Best Practices

### 1. Rate Limiting

Nếu gọi API nhiều lần:

```python
import asyncio
from datetime import datetime, timedelta

last_call = None
min_interval = timedelta(seconds=1)

async def call_with_rate_limit():
    global last_call
    if last_call and datetime.now() - last_call < min_interval:
        await asyncio.sleep(min_interval.total_seconds())
    
    # Call API here
    last_call = datetime.now()
```

### 2. Error Handling

Code đã có sẵn error handling:
- API key missing → Fallback to mock
- Network error → Fallback to mock
- Invalid JSON → Fallback to mock

### 3. Caching (Optional)

Nếu cùng input, cache response:

```python
from functools import lru_cache
import hashlib

def get_cache_key(context):
    return hashlib.md5(json.dumps(context).encode()).hexdigest()

# Implement Redis cache or simple dict cache
```

## 📝 Example Response từ Gemini 2.5 Flash

```json
{
  "overall_assessment": "Ao tôm hiện tại đang ở trạng thái ổn định với các chỉ số chất lượng nước nằm trong ngưỡng an toàn. Tuy nhiên, dựa vào dự báo thời tiết và thủy văn, cần chú ý đến khả năng có mưa và nước dâng trong 24 giờ tới.",
  "potential_risks": [
    "Mưa lớn có thể làm loãng độ mặn và ảnh hưởng đến pH",
    "Nhiệt độ có xu hướng giảm nhẹ sau khi có mưa",
    "Nước dâng ven biển có thể gây áp lực lên hệ thống thoát nước",
    "Oxy hòa tan có thể giảm do mây che phủ và giảm quang hợp"
  ],
  "recommendations": [
    "Kiểm tra và đảm bảo hệ thống thoát nước hoạt động tốt",
    "Chuẩn bị vôi bột để điều chỉnh pH nếu cần thiết",
    "Theo dõi sát sao oxy hòa tan, đặc biệt vào sáng sớm",
    "Giảm lượng thức ăn 20-30% trong ngày mưa để tránh thừa thức ăn",
    "Bật máy sục khí dự phòng nếu oxy giảm dưới 5 mg/L"
  ],
  "environmental_impact": "Theo thông tin từ dự báo thời tiết và thủy văn, khu vực ven biển có hiện tượng nước dâng từ 0.1-0.4m. Kết hợp với dự báo mưa rào và dông, điều này có thể gây khó khăn cho việc thoát nước của ao nuôi. Nông dân cần lưu ý không để nước mưa tràn vào ao quá nhiều, đồng thời đảm bảo hệ thống thoát nước không bị ngập úng do nước dâng.",
  "priority_actions": [
    {
      "action": "Kiểm tra van thoát nước và hệ thống bơm dự phòng",
      "urgency": "high",
      "reason": "Nguy cơ mưa lớn và nước dâng trong 12 giờ tới",
      "deadline": "Trong 6 giờ tới",
      "estimated_cost": "0 VNĐ (chỉ kiểm tra)"
    },
    {
      "action": "Chuẩn bị vôi bột 50kg",
      "urgency": "medium",
      "reason": "Dự phòng xử lý pH sau mưa",
      "deadline": "Trong 24 giờ",
      "estimated_cost": "200,000 - 300,000 VNĐ"
    },
    {
      "action": "Kiểm tra và bảo dưỡng máy sục khí",
      "urgency": "medium",
      "reason": "Đảm bảo có thể sục khí khi cần thiết",
      "deadline": "Trong 12 giờ",
      "estimated_cost": "0 - 100,000 VNĐ"
    }
  ]
}
```

## 🔄 Migration từ Mock sang Gemini

Code đã được setup sẵn với fallback mechanism:

1. ✅ Có API key → Dùng Gemini 2.5 Flash
2. ⚠️ Không có API key → Fallback to mock
3. ❌ API error → Fallback to mock

**Không cần thay đổi code**, chỉ cần thêm API key!

## 📚 Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Python SDK Docs](https://ai.google.dev/tutorials/python_quickstart)
- [Pricing](https://ai.google.dev/pricing)

## 🆘 Support

Nếu gặp vấn đề, kiểm tra:
1. ✅ API key đúng trong `.env`
2. ✅ Package đã cài: `google-generativeai`
3. ✅ Server đã restart sau khi thêm API key
4. ✅ Quota chưa hết (1500/day)

Vẫn không được? Chạy test đơn giản:

```python
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel('gemini-2.0-flash-exp')
response = model.generate_content("Hello, how are you?")
print(response.text)
```

Nếu script này chạy được → API key OK → Vấn đề ở chỗ khác
Nếu script này lỗi → Vấn đề ở API key hoặc network

---

**Chúc bạn setup thành công! 🚀**
