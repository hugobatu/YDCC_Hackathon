# LLM Analysis Pipeline - Quick Start

## 🚀 Tóm Tắt

Pipeline tự động phân tích chất lượng nước bằng LLM:
1. ✅ Tự động fetch 24 chỉ số mới nhất từ DB
2. ✅ Dự báo 30 phút tới
3. ✅ Kết hợp tin tức môi trường
4. ✅ Phân tích bằng LLM
5. ✅ Trả về JSON

## 📌 API Endpoint

```bash
POST /api/analyze-with-llm

# Request
{
    "pool_id": "pool-test-001",
    "species": "tom"
}

# Response
{
    "analysis": {
        "overall_assessment": "...",
        "potential_risks": [...],
        "recommendations": [...],
        "environmental_impact": "...",
        "priority_actions": [...]
    },
    "context": {...}
}
```

## 🔧 Setup LLM (BẮT BUỘC)

### Bước 1: Thêm API Key

File `.env`:
```env
OPENAI_API_KEY=sk-...
# hoặc
GOOGLE_API_KEY=...
```

### Bước 2: Tích Hợp LLM

File: `app/services/llm_analysis_service.py`

Tìm dòng: `# TODO: Tích hợp LLM API của bạn vào đây`

**OpenAI:**
```python
from openai import AsyncOpenAI
import os

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
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

**Google Gemini:**
```python
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content(formatted_prompt)
llm_response = json.loads(response.text)
```

### Bước 3: Install Dependencies

```bash
# OpenAI
pip install openai

# Google Gemini
pip install google-generativeai

# Anthropic Claude
pip install anthropic
```

## 📝 Tùy Chỉnh Prompt

File: `app/config/llm_prompt.txt`

Chỉnh sửa theo ý muốn, sử dụng placeholders:
- `{prediction_data}`
- `{current_values}`
- `{risk_level}`
- `{risk_details}`
- `{news_data}`

## 🧪 Test

```bash
# Cách 1: Test script
python app/test_llm_pipeline.py

# Cách 2: cURL
curl -X POST http://localhost:8000/api/analyze-with-llm \
     -H "Content-Type: application/json" \
     -d '{"pool_id": "pool-test-001", "species": "tom"}'
```

## 📰 Quản Lý Tin Tức

Thêm file JSON vào `app/news/`:
```json
{
    "source": "...",
    "content": "..."
}
```

Pipeline tự động load tất cả file `.json` trong thư mục này.

## 📚 Tài Liệu Đầy Đủ

Xem: [`LLM_PIPELINE_GUIDE.md`](./LLM_PIPELINE_GUIDE.md)

## 🆘 Troubleshooting

**Lỗi: "Không đủ dữ liệu trong database"**
→ Chờ simulation service tạo đủ 24 điểm (2 giờ)

**Lỗi: Connection refused**
→ Chạy: `python -m app.main`

**LLM trả về sai format**
→ Kiểm tra prompt, thêm "PHẢI trả về JSON hợp lệ"

---

## ⚡ Quick Commands

```bash
# Start server
python -m app.main

# Test pipeline
python app/test_llm_pipeline.py

# Edit prompt
notepad app/config/llm_prompt.txt  # Windows
nano app/config/llm_prompt.txt     # Linux/Mac
```
