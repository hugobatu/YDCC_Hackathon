# 🚫 Giải Quyết Lỗi Quota Exceeded

## ❌ Vấn Đề

Bạn đang gặp lỗi:
```
429 You exceeded your current quota
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0
```

**Nguyên nhân:** API key hiện tại đã hết quota hoặc bị giới hạn.

## ✅ Giải Pháp (3 Cách)

### 🎯 Cách 1: Tạo API Key Mới (KHUYẾN NGHỊ - 2 phút)

1. **Truy cập Google AI Studio:**
   https://aistudio.google.com/app/apikey

2. **Tạo key mới:**
   - Click nút **"Create API Key"**
   - Chọn project hoặc tạo project mới
   - Copy API key được tạo (dạng: `AIzaSy...`)

3. **Cập nhật trong .env:**
   ```bash
   # Mở file .env
   notepad .env  # Windows
   # hoặc
   nano .env     # Linux/Mac
   ```

   Thay đổi dòng:
   ```env
   GOOGLE_API_KEY=new-api-key-here
   ```

4. **Test lại:**
   ```bash
   python test_gemini_simple.py
   ```

### ⏱️ Cách 2: Đợi Quota Reset (24 giờ)

Quota sẽ tự động reset sau 24 giờ (tính từ lần đầu dùng API key).

**Lưu ý:** Không phải giải pháp tốt nếu bạn đang phát triển!

### 🔄 Cách 3: Dùng LLM Khác (Tạm thời)

Trong khi chờ quota, bạn có thể dùng LLM khác:

#### Option A: OpenAI GPT-4 (Paid, ~$0.03/request)
```bash
pip install openai
```

File `.env`:
```env
OPENAI_API_KEY=sk-...
```

Code (trong `app/services/llm_analysis_service.py`):
```python
from openai import AsyncOpenAI
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
response = await client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": formatted_prompt}],
    response_format={"type": "json_object"}
)
llm_response = json.loads(response.choices[0].message.content)
```

#### Option B: Ollama (FREE, Local, No API key needed!)

1. **Install Ollama:**
   - Windows: https://ollama.ai/download/windows
   - Linux: `curl https://ollama.ai/install.sh | sh`

2. **Pull model:**
   ```bash
   ollama pull llama2
   ```

3. **Update code:**
   ```bash
   pip install ollama
   ```

   Code:
   ```python
   import ollama
   response = ollama.chat(
       model='llama2',
       messages=[{'role': 'user', 'content': formatted_prompt}]
   )
   llm_response = json.loads(response['message']['content'])
   ```

**Ưu điểm Ollama:**
- ✅ Hoàn toàn FREE
- ✅ Chạy local, không cần internet
- ✅ Không giới hạn quota
- ❌ Cần RAM (~8GB) và chậm hơn Gemini

## 📝 Package Update (Quan Trọng!)

Package `google.generativeai` đã deprecated. Tôi đã cập nhật code để dùng package mới.

### Cài đặt package mới:

```bash
# Gỡ package cũ (nếu có)
pip uninstall google-generativeai -y

# Cài package mới
pip install google-genai
```

## 🔧 Các File Đã Được Cập Nhật

✅ `app/services/llm_analysis_service.py` - Dùng `google.genai` mới
✅ `test_gemini_simple.py` - Dùng `google.genai` mới + better error handling

## 🧪 Test Sau Khi Fix

### Test 1: Verify package mới
```bash
python -c "from google import genai; print('✅ New package OK!')"
```

### Test 2: Test với API key mới
```bash
python test_gemini_simple.py
```

**Kết quả mong đợi:**
```
✅ API Key found: AIzaSy...
✅ google-genai package installed
🤖 Connecting to Gemini 2.5 Flash (new SDK)...
✅ Connection successful!
📝 Response from Gemini:
Gemini đang hoạt động!
🎉 SUCCESS!
```

### Test 3: Test pipeline đầy đủ
```bash
python -m app.main  # Terminal 1
python app/test_llm_pipeline.py  # Terminal 2
```

## 💡 Tại Sao Quota = 0?

Có thể do:
1. **API key đã được dùng hết quota** trong 24h qua
2. **Project bị giới hạn** (kiểm tra tại Google Cloud Console)
3. **Free tier đã hết** (cần upgrade lên paid)

## 🆓 Free Tier Limits

**Gemini API Free Tier:**
- ✅ 1,500 requests/day
- ✅ 15 requests/minute
- ✅ 1 million tokens/minute

Nếu API key bị limit = 0 ngay cả khi mới tạo, có thể project đã hết quota free tier.

## 🚀 Khuyến Nghị

**Best solution:** Tạo API key mới (2 phút)

1. https://aistudio.google.com/app/apikey
2. Create API Key
3. Copy → paste vào `.env`
4. `python test_gemini_simple.py`

**Backup solution:** Dùng Ollama (free, local, no quota limits)

## 📚 Tài Liệu Tham Khảo

- New SDK Docs: https://github.com/googleapis/python-genai
- Migration Guide: https://github.com/google-gemini/deprecated-generative-ai-python
- Get API Key: https://aistudio.google.com/app/apikey
- Quota Info: https://ai.google.dev/gemini-api/docs/rate-limits

## ✅ Checklist

- [ ] Tạo API key mới
- [ ] Cập nhật trong `.env`
- [ ] Uninstall `google-generativeai` cũ
- [ ] Install `google-genai` mới
- [ ] Test với `python test_gemini_simple.py`
- [ ] Chạy pipeline: `python app/test_llm_pipeline.py`

---

**Questions?** Check error message và search trong file này!
