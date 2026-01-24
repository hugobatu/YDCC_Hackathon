"""
LLM Analysis Service
Kết hợp dự báo chất lượng nước với thông tin tin tức để phân tích bằng LLM
"""
import json
import os
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime


class LLMAnalysisService:
    """
    Service để phân tích dữ liệu dự báo kết hợp với tin tức bằng LLM
    """
    
    def __init__(self):
        self.news_dir = Path(__file__).parent.parent / "news"
        self.prompt_template = self._load_prompt_template()
    
    def _load_prompt_template(self) -> str:
        """
        Load prompt template từ file config.
        User có thể customize prompt tại file này.
        """
        prompt_file = Path(__file__).parent.parent / "config" / "llm_prompt.txt"
        
        # Tạo default prompt nếu chưa có file
        if not prompt_file.exists():
            default_prompt = """Bạn là một chuyên gia phân tích chất lượng nước và nuôi trồng thủy sản.

Dựa trên thông tin sau:

1. DỰ BÁO CHẤT LƯỢNG NƯỚC 30 PHÚT TỚI:
{prediction_data}

2. LOẠI THUỶ SẢN:
{species}

3. TÌNH TRẠNG HIỆN TẠI:
{current_values}

4. MỨC ĐỘ RỦI RO: 
{risk_level}

5. Chi tiết: 
{risk_details}

6. THÔNG TIN TIN TỨC MỚI NHẤT:
{news_data}

Hãy phân tích và đưa ra:
- Đánh giá tổng quan về tình hình
- Các rủi ro tiềm ẩn
- Khuyến nghị hành động cụ thể dựa trên các hành động sau (hoặc bạn có thể tư vấn thêm cho người dùng):
+ Bơm thêm nước
+ Mở quạt sục khí
+ Mở van cấp nước
+ Xả bớt nước
- Ảnh hưởng của điều kiện môi trường (thời tiết, thủy văn) đến ao nuôi

Trả về kết quả dưới dạng JSON với cấu trúc:
{{
    "overall_assessment": "...",
    "potential_risks": [...],
    "recommendations": [...],
    "environmental_impact": "...",
    "priority_actions": [...]
}}
"""
            prompt_file.parent.mkdir(parents=True, exist_ok=True)
            with open(prompt_file, "w", encoding="utf-8") as f:
                f.write(default_prompt)
        
        with open(prompt_file, "r", encoding="utf-8") as f:
            return f.read()
    
    def load_news_data(self) -> Dict[str, Any]:
        """
        Load tất cả các file JSON từ thư mục news
        
        Returns:
            Dict chứa tất cả nội dung tin tức
        """
        news_data = {}
        
        if not self.news_dir.exists():
            return news_data
        
        # Đọc tất cả các file .json trong thư mục news
        for json_file in self.news_dir.glob("*.json"):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    # Sử dụng tên file (không có extension) làm key
                    news_data[json_file.stem] = content
            except Exception as e:
                print(f"Warning: Không thể load file {json_file.name}: {e}")
                continue
        
        return news_data
    
    def prepare_context(
        self,
        prediction_data: Dict[str, float],
        current_values: Dict[str, float],
        risk_level: str,
        risk_details: List[str],
        species: str
    ) -> Dict[str, Any]:
        """
        Chuẩn bị context để gửi cho LLM
        
        Args:
            prediction_data: Dự báo 30 phút tới
            current_values: Giá trị hiện tại
            risk_level: Mức độ rủi ro
            risk_details: Chi tiết rủi ro
            species: Loài nuôi
        
        Returns:
            Dict chứa toàn bộ context
        """
        news_data = self.load_news_data()
        
        context = {
            "timestamp": datetime.now().isoformat(),
            "species": species,
            "prediction": prediction_data,
            "current_values": current_values,
            "risk_assessment": {
                "level": risk_level,
                "details": risk_details
            },
            "news": news_data
        }
        
        return context
    
    def format_prompt(
        self,
        prediction_data: Dict[str, float],
        species: str,
        current_values: Dict[str, float],
        risk_level: str,
        risk_details: List[str],
        news_data: Dict[str, Any]
    ) -> str:
        """
        Format prompt với dữ liệu thực tế
        
        Returns:
            Prompt đã được format
        """
        return self.prompt_template.format(
            prediction_data=json.dumps(prediction_data, indent=2, ensure_ascii=False),
            species=species,
            current_values=json.dumps(current_values, indent=2, ensure_ascii=False),
            risk_level=risk_level,
            risk_details="\n".join(f"- {detail}" for detail in risk_details),
            news_data=json.dumps(news_data, indent=2, ensure_ascii=False)
        )
    
    async def analyze_with_llm(
        self,
        prediction_data: Dict[str, float],
        species: str,
        current_values: Dict[str, float],
        risk_level: str,
        risk_details: List[str],
        llm_api_key: str = None
    ) -> Dict[str, Any]:
        """
        Phân tích dữ liệu bằng LLM
        
        Args:
            prediction_data: Dự báo 30 phút tới
            current_values: Giá trị hiện tại
            risk_level: Mức độ rủi ro
            risk_details: Chi tiết rủi ro
            species: Loài nuôi
            llm_api_key: API key cho LLM (nếu cần)
        
        Returns:
            Kết quả phân tích dạng JSON
        """
        # Load news data
        news_data = self.load_news_data()
        
        # Prepare full context
        context = self.prepare_context(
            prediction_data,
            current_values,
            risk_level,
            risk_details,
            species
        )
        
        # Format prompt
        formatted_prompt = self.format_prompt(
            prediction_data,
            species,
            current_values,
            risk_level,
            risk_details,
            news_data
        )
        
        # ============================================
        # OPENAI GPT-4
        # ============================================
        
        llm_response = None
        
        try:
            from openai import OpenAI
            import json as json_lib
            
            # Get API key from environment
            api_key = llm_api_key or os.getenv("SHOPAIKEY_API_KEY") or os.getenv("OPENAI_API_KEY")
            
            if not api_key:
                print("⚠️  WARNING: SHOPAIKEY_API_KEY hoặc OPENAI_API_KEY not found!")
                raise ValueError("No API key provided")
            
            # Initialize OpenAI client with ShopAIKey endpoint
            client = OpenAI(
                api_key=api_key,
                base_url="https://api.shopaikey.com/v1"  # ShopAIKey proxy endpoint
            )
            
            print("🤖 Calling OpenAI GPT-4 via ShopAIKey API...")
            
            # Generate content using OpenAI API
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # hoặc "gpt-4" cho quality cao hơn
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert in water quality analysis and aquaculture. Always respond in Vietnamese with valid JSON format following the exact structure requested in the prompt."
                    },
                    {
                        "role": "user",
                        "content": formatted_prompt
                    }
                ],
                response_format={"type": "json_object"},  # Force JSON response
                temperature=0.7,
                max_tokens=4096
            )
            
            # Parse response
            response_text = response.choices[0].message.content.strip()
            
            # Parse JSON
            llm_response = json_lib.loads(response_text)
            
            print("✅ OpenAI GPT-4 response received successfully!")
            print(f"   Model: {response.model}")
            print(f"   Tokens: {response.usage.total_tokens} (input: {response.usage.prompt_tokens}, output: {response.usage.completion_tokens})")
            
        except ImportError:
            print("⚠️  openai package not installed!")
            print("   Install with: pip install openai")
            print("   Falling back to mock response.")
        except Exception as e:
            print(f"⚠️  LLM API Error: {str(e)}")
            print("   Falling back to mock response.")
        
        # ============================================
        # FALLBACK: MOCK RESPONSE if LLM fails
        # ============================================
        if llm_response is None:
            llm_response = {
                "overall_assessment": "Tình hình chất lượng nước hiện tại ở mức an toàn với các chỉ số trong ngưỡng cho phép.",
                "potential_risks": [
                    "Nhiệt độ dự báo có xu hướng tăng nhẹ, cần theo dõi",
                    "Oxy hòa tan có thể giảm vào buổi tối do hoạt động hô hấp"
                ],
                "recommendations": [
                    "Kiểm tra máy sục khí định kỳ",
                    "Theo dõi thời tiết trong 24h tới",
                    "Chuẩn bị kế hoạch xử lý nếu mưa lớn"
                ],
                "environmental_impact": "Dựa vào tin tức thời tiết và thủy văn, khu vực có khả năng mưa nhẹ và nước dâng nhẹ ở ven biển. Cần chú ý không để nước mưa tràn vào ao nuôi.",
                "priority_actions": [
                    {
                        "action": "Kiểm tra hệ thống thoát nước",
                        "urgency": "medium",
                        "reason": "Nguy cơ mưa trong 24h tới"
                    }
                ],
                "metadata": {
                    "source": "MOCK_RESPONSE",
                    "reason": "LLM API not configured or failed",
                    "prompt_used": formatted_prompt[:200] + "...",
                    "context_summary": {
                        "news_sources": list(news_data.keys()),
                        "news_count": len(news_data),
                        "risk_level": risk_level,
                        "species": species
                    }
                }
            }
        
        return {
            "analysis": llm_response,
            "context": context,
            "raw_prompt": formatted_prompt
        }


# Singleton instance
llm_analysis_service = LLMAnalysisService()
