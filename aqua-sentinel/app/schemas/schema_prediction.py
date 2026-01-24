from pydantic import BaseModel
from typing import List, Dict, Any

class SensorPoint(BaseModel):
    timestamp: str
    temperature: float
    dissolved_oxygen: float
    ph: float
    turbidity: float
    ammonia: float
    rain_event: int
    feeding_event: int

class PredictRequest(BaseModel):
    pool_id: str
    species: str = "tom" 
    history: List[SensorPoint] = None  # Optional: auto-fetch from DB if not provided

class PredictResponse(BaseModel):
    species: str
    current_values: Dict[str, float]
    prediction_next_30min: Dict[str, float]
    risk_level: str
    details: List[str]
    thresholds: Dict[str, Any]

class LLMAnalysisRequest(BaseModel):
    """Request cho LLM Analysis Pipeline"""
    pool_id: str
    species: str = "tom"
    include_raw_prompt: bool = False  # Có trả về raw prompt không (cho debug)

class LLMAnalysisResponse(BaseModel):
    """Response từ LLM Analysis Pipeline"""
    analysis: Dict[str, Any]  # Kết quả phân tích từ LLM
    context: Dict[str, Any]   # Context đã gửi cho LLM
    raw_prompt: str = None    # Prompt gốc (optional, cho debug)