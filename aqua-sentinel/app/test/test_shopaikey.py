"""
Test script cho OpenAI GPT-4 via ShopAIKey
Run: python test_shopaikey.py
"""
import os
from dotenv import load_dotenv

print("=" * 80)
print("TESTING OPENAI GPT-4 VIA SHOPAIKEY.COM")
print("=" * 80)

# Load environment variables
load_dotenv()

# Check API key
api_key = os.getenv("SHOPAIKEY_API_KEY") or os.getenv("OPENAI_API_KEY")
if not api_key:
    print("\n❌ ERROR: SHOPAIKEY_API_KEY not found in .env file!")
    print("\nSteps to setup:")
    print("1. Truy cập: https://shopaikey.com")
    print("2. Mua API key (GPT-4 hoặc GPT-4o-mini)")
    print("3. Copy API key")
    print("4. Thêm vào .env file:")
    print("   SHOPAIKEY_API_KEY=sk-your-key-here")
    exit(1)

print(f"\n✅ API Key found: {api_key[:20]}...")

# Check if package is installed
try:
    from openai import OpenAI
    print("✅ openai package installed")
except ImportError:
    print("\n❌ ERROR: openai package not installed!")
    print("\nInstall with: pip install openai")
    exit(1)

# Try to connect to OpenAI via ShopAIKey
try:
    print("\n🤖 Connecting to OpenAI GPT-4 via ShopAIKey...")
    
    # Initialize client with ShopAIKey endpoint
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.shopaikey.com/v1"  # ShopAIKey proxy
    )
    
    # Test with simple prompt
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # Rẻ hơn GPT-4, vẫn rất tốt
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant. Respond in Vietnamese."
            },
            {
                "role": "user",
                "content": "Chào bạn! Hãy trả lời 'OpenAI GPT đang hoạt động tốt qua ShopAIKey!' để test."
            }
        ],
        temperature=0.7,
        max_tokens=100
    )
    
    print("✅ Connection successful!")
    print(f"\n📝 Response from GPT-4:")
    print("-" * 80)
    print(response.choices[0].message.content)
    print("-" * 80)
    
    print(f"\n📊 Usage Stats:")
    print(f"   Model: {response.model}")
    print(f"   Total tokens: {response.usage.total_tokens}")
    print(f"   Input tokens: {response.usage.prompt_tokens}")
    print(f"   Output tokens: {response.usage.completion_tokens}")
    
    print("\n🎉 SUCCESS! OpenAI GPT-4 via ShopAIKey is ready to use!")
    print("\nNext steps:")
    print("1. Run the full pipeline: python app/test_llm_pipeline.py")
    print("2. Or start the server: python -m app.main")
    
except Exception as e:
    error_message = str(e)
    print(f"\n❌ ERROR: {error_message}")
    
    # Check for common errors
    if "401" in error_message or "unauthorized" in error_message.lower():
        print("\n🔑 API KEY INVALID!")
        print("\nGiải pháp:")
        print("1. Kiểm tra API key trong .env có đúng không")
        print("2. Đảm bảo key chưa hết hạn")
        print("3. Tạo key mới tại: https://shopaikey.com")
    elif "insufficient_quota" in error_message.lower() or "quota" in error_message.lower():
        print("\n💰 HẾT CREDIT!")
        print("\nGiải pháp:")
        print("1. Nạp thêm credit tại: https://shopaikey.com")
        print("2. Hoặc dùng key khác")
    elif "connection" in error_message.lower() or "timeout" in error_message.lower():
        print("\n🌐 NETWORK ERROR!")
        print("\nGiải pháp:")
        print("1. Kiểm tra kết nối internet")
        print("2. Thử lại sau vài giây")
    else:
        print("\nPossible causes:")
        print("- API endpoint sai (đang dùng: https://api.shopaikey.com/v1)")
        print("- API key không hợp lệ")
        print("- Hết credit trong tài khoản ShopAIKey")
        print("\nTry:")
        print("1. Kiểm tra balance tại: https://shopaikey.com/dashboard")
        print("2. Tạo API key mới nếu cần")
    exit(1)

print("\n" + "=" * 80)
