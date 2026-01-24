# 🇻🇳 Setup OpenAI GPT-4 với ShopAIKey.com

## 🎯 Tại Sao Dùng ShopAIKey?

- ✅ **Tiện lợi**: Mua bằng VNĐ, thanh toán qua MoMo/Banking
- ✅ **Rẻ**: Giá rẻ hơn mua trực tiếp từ OpenAI
- ✅ **Không cần thẻ visa**: Phù hợp người Việt
- ✅ **OpenAI Format**: Dùng code y như OpenAI API
- ✅ **Nhiều model**: GPT-4, GPT-4o, GPT-4o-mini, Claude, v.v.

## 🚀 Setup Trong 3 Phút

### Bước 1: Mua API Key

1. **Truy cập**: https://shopaikey.com
2. **Đăng ký/Đăng nhập**
3. **Nạp tiền**: Chọn gói phù hợp
   - GPT-4o-mini: ~20,000 VNĐ/1 triệu tokens (RẺ, đủ dùng!)
   - GPT-4: ~300,000 VNĐ/1 triệu tokens (QUALITY cao)
4. **Lấy API Key**:
   - Vào Dashboard → API Keys
   - Tạo key mới
   - Copy key (dạng: `sk-...`)

### Bước 2: Cài Package

```bash
pip install openai
```

### Bước 3: Config trong `.env`

Mở file `.env` và thêm/sửa dòng:

```env
SHOPAIKEY_API_KEY=sk-your-key-from-shopaikey-here
```

**Lưu ý**: Có thể dùng tên `OPENAI_API_KEY` cũng được, code sẽ tự nhận cả 2.

### Bước 4: Test

```bash
python test_shopaikey.py
```

**Kết quả mong đợi:**
```
✅ API Key found: sk-...
✅ openai package installed
🤖 Connecting to OpenAI GPT-4 via ShopAIKey...
✅ Connection successful!
📝 Response from GPT-4:
OpenAI GPT đang hoạt động tốt qua ShopAIKey!
📊 Usage Stats:
   Model: gpt-4o-mini
   Total tokens: 45
   Input tokens: 30
   Output tokens: 15
🎉 SUCCESS!
```

## 🔧 Config Đã Được Cập Nhật

### ✅ File: `app/services/llm_analysis_service.py`

Đã chuyển từ Gemini sang OpenAI GPT-4 via ShopAIKey:

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("SHOPAIKEY_API_KEY"),
    base_url="https://api.shopaikey.com/v1"  # ShopAIKey proxy
)

response = client.chat.completions.create(
    model="gpt-4o-mini",  # hoặc "gpt-4" cho quality cao hơn
    messages=[...],
    response_format={"type": "json_object"},
    temperature=0.7,
    max_tokens=4096
)
```

**Điểm khác biệt với OpenAI gốc:**
- ✅ Chỉ khác `base_url`: `https://api.shopaikey.com/v1`
- ✅ Code y hệt OpenAI API
- ✅ Tất cả model OpenAI đều support

## 📊 So Sánh Models

| Model | Quality | Speed | Giá (VNĐ/1M tokens) | Khuyến nghị |
|-------|---------|-------|---------------------|-------------|
| **gpt-4o-mini** | ⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ | ~20,000 | ✅ Best choice! |
| gpt-4o | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡ | ~100,000 | Production |
| gpt-4 | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | ~300,000 | Max quality |
| gpt-3.5-turbo | ⭐⭐⭐ | ⚡⚡⚡⚡⚡ | ~5,000 | Budget |

**Khuyến nghị cho project này**: `gpt-4o-mini` - Cân bằng giữa quality, speed và giá.

## 🎯 Cách Dùng Pipeline

### Test Pipeline Đầy Đủ

```bash
# Terminal 1: Start server
python -m app.main

# Terminal 2: Test
python app/test_llm_pipeline.py
```

### Gọi API Trực Tiếp

```bash
curl -X POST http://localhost:8000/api/analyze-with-llm \
     -H "Content-Type: application/json" \
     -d '{
         "pool_id": "pool-test-001",
         "species": "tom"
     }'
```

## 💰 Ước Tính Chi Phí

**Mỗi request analyze-with-llm:**
- Input: ~1,500 tokens (context + prompt)
- Output: ~500 tokens (analysis JSON)
- **Total: ~2,000 tokens/request**

**Với GPT-4o-mini (20,000 VNĐ/1M tokens):**
- 1 request ≈ 0.04 VNĐ (~$0.000002)
- 1,000 requests ≈ 40 VNĐ
- **100,000 requests ≈ 4,000 VNĐ**

→ **RẤT RẺ cho production!**

## 🔄 Đổi Model Nếu Muốn

Mở file: `app/services/llm_analysis_service.py`

Tìm dòng:
```python
model="gpt-4o-mini",  # hoặc "gpt-4" cho quality cao hơn
```

Đổi thành:
```python
model="gpt-4",  # Quality tốt nhất
# hoặc
model="gpt-4o",  # Cân bằng
# hoặc  
model="gpt-3.5-turbo",  # Rẻ nhất
```

## 🆘 Troubleshooting

### Lỗi: "401 Unauthorized"

**Nguyên nhân**: API key sai hoặc không hợp lệ

**Giải pháp**:
1. Kiểm tra key trong `.env` có đúng không
2. Tạo key mới tại: https://shopaikey.com/dashboard

### Lỗi: "Insufficient quota" hoặc "Balance too low"

**Nguyên nhân**: Hết credit trong tài khoản

**Giải pháp**:
1. Nạp thêm tiền tại: https://shopaikey.com
2. Kiểm tra balance: https://shopaikey.com/dashboard

### Lỗi: "Connection timeout"

**Nguyên nhân**: Mạng chậm hoặc endpoint sai

**Giải pháp**:
1. Kiểm tra internet
2. Verify endpoint: `https://api.shopaikey.com/v1`

### Response không phải JSON

**Nguyên nhân**: Model không tuân theo instruction

**Giải pháp**: Code đã có `response_format={"type": "json_object"}` → Auto fix

## ✅ Checklist Setup

- [ ] Đăng ký tài khoản ShopAIKey.com
- [ ] Nạp tiền (khuyến nghị: 50,000 VNĐ cho test)
- [ ] Tạo API key
- [ ] `pip install openai`
- [ ] Thêm `SHOPAIKEY_API_KEY` vào `.env`
- [ ] `python test_shopaikey.py` → SUCCESS
- [ ] `python app/test_llm_pipeline.py` → Test pipeline

## 📚 Tài Liệu Tham Khảo

- ShopAIKey Homepage: https://shopaikey.com
- ShopAIKey Docs: https://shopaikey.com/docs
- OpenAI API Docs: https://platform.openai.com/docs
- Pricing: https://shopaikey.com/pricing

## 🎓 Tips

### Tiết Kiệm Chi Phí

1. **Dùng gpt-4o-mini** thay vì GPT-4 (rẻ hơn 15x, vẫn tốt)
2. **Cache results** cho cùng context
3. **Giảm max_tokens** xuống 2048 nếu không cần output dài
4. **Batch processing** nhiều requests cùng lúc

### Tối Ưu Quality

1. **Tăng temperature** lên 0.8-0.9 cho creative hơn
2. **Dùng GPT-4** nếu cần analysis sâu
3. **Improve prompt** trong `app/config/llm_prompt.txt`

## 🌟 Ưu Điểm So Với Gemini

| Feature | Gemini Free | ShopAIKey GPT-4o-mini | ShopAIKey GPT-4 |
|---------|-------------|----------------------|-----------------|
| **Quota** | 1,500/day | Không giới hạn* | Không giới hạn* |
| **Speed** | ~2s | ~1s | ~1.5s |
| **Quality** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cost** | FREE | 0.04 VNĐ/req | 0.6 VNĐ/req |
| **Vietnamese** | Tốt | Rất tốt | Xuất sắc |
| **JSON Format** | OK | Perfect | Perfect |

*Giới hạn bởi credit trong tài khoản

## 🎊 Kết Luận

**Setup xong! Giờ bạn có:**
- ✅ OpenAI GPT-4 via ShopAIKey (không quota limit!)
- ✅ Rẻ (~4,000 VNĐ cho 100k requests)
- ✅ Thanh toán VNĐ tiện lợi
- ✅ Quality tốt hơn Gemini free tier
- ✅ Code đã config sẵn, chỉ cần add API key!

**Bắt đầu ngay:**
```bash
python test_shopaikey.py
python -m app.main
python app/test_llm_pipeline.py
```

---

**Questions?** Check https://shopaikey.com/docs
