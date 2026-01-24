# 🎯 LLM Analysis Pipeline - Tóm Tắt Setup

## ✅ ĐÃ HOÀN THÀNH

Pipeline đã được config sẵn với **Google Gemini 2.5 Flash**!

## 🚀 Cách Sử Dụng Ngay

### 1. Cài đặt package (BẮT BUỘC)

```bash
pip install google-generativeai
```

### 2. Kiểm tra API Key

File `.env` đã có sẵn `GOOGLE_API_KEY`. Nếu chưa có hoặc muốn đổi:

1. Lấy API key tại: https://aistudio.google.com/app/apikey
2. Thêm vào `.env`:
   ```env
   GOOGLE_API_KEY=AIzaSy...your-key-here...
   ```

### 3. Khởi động server

```bash
python -m app.main
```

### 4. Test pipeline

**Cách 1: Dùng test script**
```bash
python app/test_llm_pipeline.py
```

**Cách 2: Gọi API trực tiếp**
```bash
curl -X POST http://localhost:8000/api/analyze-with-llm \
     -H "Content-Type: application/json" \
     -d "{\"pool_id\": \"pool-test-001\", \"species\": \"tom\"}"
```

## 📊 Kết Quả Mong Đợi

Khi gọi API thành công, bạn sẽ thấy trong console:
```
🤖 Calling Gemini 2.5 Flash API...
✅ Gemini 2.5 Flash response received successfully!
```

Response JSON:
```json
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
        "prediction": {...},
        "current_values": {...},
        "risk_assessment": {...},
        "news": {...}
    }
}
```

## 🔧 Pipeline Tự Động

Khi gọi `/api/analyze-with-llm`, pipeline tự động:

1. ✅ Fetch 24 chỉ số mới nhất từ database
2. ✅ Dự báo chất lượng nước 30 phút tới
3. ✅ Đánh giá mức độ rủi ro
4. ✅ Load tất cả file JSON từ `app/news/`
5. ✅ Kết hợp dữ liệu → gửi Gemini 2.5 Flash
6. ✅ Trả về phân tích JSON

**Không cần làm gì thêm!** Chỉ cần gọi API với `pool_id` và `species`.

## 📝 Tùy Chỉnh Prompt

Muốn thay đổi cách LLM phân tích?

1. Mở file: `app/config/llm_prompt.txt`
2. Chỉnh sửa theo ý muốn
3. Lưu lại
4. Gọi API → Prompt mới sẽ được sử dụng

## 📚 Tài Liệu Chi Tiết

- **Setup Gemini**: [`GEMINI_SETUP_GUIDE.md`](./GEMINI_SETUP_GUIDE.md)
- **Architecture**: [`PIPELINE_ARCHITECTURE.md`](./PIPELINE_ARCHITECTURE.md)
- **Full Guide**: [`LLM_PIPELINE_GUIDE.md`](./LLM_PIPELINE_GUIDE.md)
- **Quick Start**: [`LLM_PIPELINE_QUICKSTART.md`](./LLM_PIPELINE_QUICKSTART.md)
- **Integration Examples**: [`app/llm_integration_examples.py`](./app/llm_integration_examples.py)

## 🆘 Troubleshooting

### Lỗi: "google-generativeai package not installed"
```bash
pip install google-generativeai
```

### Lỗi: "GOOGLE_API_KEY not found"
Kiểm tra file `.env` có dòng:
```env
GOOGLE_API_KEY=AIzaSy...
```

### Lỗi: "Không đủ dữ liệu trong database"
Chờ simulation service tạo đủ 24 điểm (2 giờ với interval 5 phút)

### Nếu muốn test mà chưa có data
Pipeline sẽ tự động fallback to mock response. Bạn vẫn thấy được cấu trúc JSON đầy đủ.

## 🎯 Next Steps

1. ✅ Cài package: `pip install google-generativeai`
2. ✅ Test pipeline: `python app/test_llm_pipeline.py`
3. ✅ Tùy chỉnh prompt nếu cần
4. ✅ Tích hợp vào frontend của bạn

## 🔗 API Endpoint

```
POST http://localhost:8000/api/analyze-with-llm

Body:
{
    "pool_id": "pool-test-001",
    "species": "tom",
    "include_raw_prompt": false
}
```

---

**Mọi thứ đã sẵn sàng! Chỉ cần `pip install google-generativeai` và chạy thôi! 🚀**
