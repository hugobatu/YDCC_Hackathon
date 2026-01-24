from fastapi import APIRouter, HTTPException
from app.schemas.schema_prediction import PredictRequest, PredictResponse
from app.services.prediction_service import prediction_service
from app.services.risk_engine import risk_engine
from app.db.connection import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.models.models import User, Pool

router = APIRouter()

@router.post("/predict", response_model=PredictResponse)
async def predict_water(
    req: PredictRequest,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user) # Yêu cầu đăng nhập
):
    # KIỂM TRA QUYỀN SỞ HỮU HỒ (Tạm thời tắt để test)
    # pool = db.query(Pool).filter(
    #     Pool.pool_id == req.pool_id, 
    #     Pool.owner_id == current_user.user_id # Phải trùng owner_id
    # ).first()

    # if not pool:
    #     raise HTTPException(
    #         status_code=403, 
    #         detail="Bạn không có quyền truy cập vào hồ này hoặc hồ không tồn tại"
    #     )
    
    # AUTO-FETCH HISTORY FROM DATABASE IF NOT PROVIDED
    if req.history is None or len(req.history) == 0:
        from app.models.models import WaterMeasurement
        from app.schemas.schema_prediction import SensorPoint
        
        # Fetch latest 24 measurements for this pool, ordered by created_at DESC
        measurements = db.query(WaterMeasurement).filter(
            WaterMeasurement.pool_id == req.pool_id
        ).order_by(
            WaterMeasurement.created_at.desc()
        ).limit(24).all()
        
        if len(measurements) < 24:
            raise HTTPException(
                400, 
                f"Không đủ dữ liệu trong database. Cần tối thiểu 24 điểm, chỉ có {len(measurements)} điểm."
            )
        
        # Convert to SensorPoint objects (reverse to get chronological order)
        measurements.reverse()
        req.history = []
        for m in measurements:
            # Handle both 'ammonia' and 'amonia' column names
            ammonia_value = getattr(m, 'ammonia', None) or getattr(m, 'amonia', 0.0)
            
            req.history.append(SensorPoint(
                timestamp=m.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                temperature=m.temperature or 0.0,
                dissolved_oxygen=m.dissolved_oxygen or 0.0,
                ph=m.ph or 0.0,
                turbidity=m.turbidity or 0.0,
                ammonia=ammonia_value,
                rain_event=0,  # Default values - can be added to DB schema later
                feeding_event=0
            ))
    
    # VALIDATE MINIMUM DATA POINTS
    if len(req.history) < 24:
        raise HTTPException(400, "Cần tối thiểu 24 điểm dữ liệu (2 giờ dữ liệu với tần suất 5 phút)")
    
    # 1. Dự đoán
    preds, current_state = prediction_service.predict(req.history)
    
    # 2. Đánh giá rủi ro
    risk = risk_engine.assess_risk(preds, current_state, req.species)
    
    return {
        "species": req.species,
        "current_values": {
            k: current_state[k] for k in preds.keys() if k in current_state
        },
        "prediction_next_30min": preds,
        "risk_level": risk["level"],
        "details": risk["reasons"],
        "thresholds": risk["thresholds_used"]
    }

@router.post("/analyze-with-llm", response_model=dict)
async def analyze_with_llm(
    req: dict,  # LLMAnalysisRequest
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user) # Yêu cầu đăng nhập
):
    """
    PIPELINE: Dự báo chất lượng nước + Phân tích LLM
    
    Pipeline tự động:
    1. Fetch 24 chỉ số mới nhất từ database
    2. Gọi prediction service để dự báo 30 phút tới
    3. Load tất cả file JSON từ thư mục news
    4. Kết hợp dữ liệu và gửi cho LLM với prompt có thể tùy chỉnh
    5. Trả về kết quả phân tích dạng JSON
    
    Request body:
    {
        "pool_id": "string",
        "species": "tom" (or "ca", "cua"),
        "include_raw_prompt": false (optional, for debugging)
    }
    
    Response:
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
            "species": "...",
            "prediction": {...},
            "current_values": {...},
            "risk_assessment": {...},
            "news": {...}
        },
        "raw_prompt": "..." (optional)
    }
    """
    from app.schemas.schema_prediction import LLMAnalysisRequest, LLMAnalysisResponse
    from app.services.llm_analysis_service import llm_analysis_service
    
    # Parse request
    analysis_req = LLMAnalysisRequest(**req)
    
    # BƯỚC 1: AUTO-FETCH 24 MEASUREMENTS MỚI NHẤT TỪ DATABASE
    from app.models.models import WaterMeasurement
    from app.schemas.schema_prediction import SensorPoint
    
    measurements = db.query(WaterMeasurement).filter(
        WaterMeasurement.pool_id == analysis_req.pool_id
    ).order_by(
        WaterMeasurement.created_at.desc()
    ).limit(24).all()
    
    if len(measurements) < 24:
        raise HTTPException(
            400, 
            f"Không đủ dữ liệu trong database. Cần tối thiểu 24 điểm, chỉ có {len(measurements)} điểm."
        )
    
    # Convert to SensorPoint objects (reverse to get chronological order)
    measurements.reverse()
    history = []
    for m in measurements:
        ammonia_value = getattr(m, 'ammonia', None) or getattr(m, 'amonia', 0.0)
        
        history.append(SensorPoint(
            timestamp=m.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            temperature=m.temperature or 0.0,
            dissolved_oxygen=m.dissolved_oxygen or 0.0,
            ph=m.ph or 0.0,
            turbidity=m.turbidity or 0.0,
            ammonia=ammonia_value,
            rain_event=0,
            feeding_event=0
        ))
    
    # BƯỚC 2: PREDICTION
    preds, current_state = prediction_service.predict(history)
    
    # BƯỚC 3: RISK ASSESSMENT
    risk = risk_engine.assess_risk(preds, current_state, analysis_req.species)
    
    # BƯỚC 4: LLM ANALYSIS (với news data)
    result = await llm_analysis_service.analyze_with_llm(
        prediction_data=preds,
        current_values={k: current_state[k] for k in preds.keys() if k in current_state},
        risk_level=risk["level"],
        risk_details=risk["reasons"],
        species=analysis_req.species
    )
    
    # Trả về kết quả
    response = {
        "analysis": result["analysis"],
        "context": result["context"]
    }
    
    # Include raw prompt if requested (for debugging)
    if analysis_req.include_raw_prompt:
        response["raw_prompt"] = result["raw_prompt"]
    
    return response