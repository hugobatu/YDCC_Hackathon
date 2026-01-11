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
    current_user: User = Depends(get_current_user) # Yêu cầu đăng nhập
):
    # KIỂM TRA QUYỀN SỞ HỮU HỒ
    pool = db.query(Pool).filter(
        Pool.pool_id == req.pool_id, 
        Pool.owner_id == current_user.user_id # Phải trùng owner_id
    ).first()

    if not pool:
        raise HTTPException(
            status_code=403, 
            detail="Bạn không có quyền truy cập vào hồ này hoặc hồ không tồn tại"
        )
    if len(req.history) < 12:
        raise HTTPException(400, "Cần tối thiểu 12 điểm dữ liệu")
    
    # 1. Dự đoán
    preds, current_state = prediction_service.predict(req.history)
    
    # 2. Đánh giá rủi ro
    risk = risk_engine.assess_risk(preds, current_state, req.species)
    
    return {
        "species": req.species,
        "current_values": {
            k: current_state[k] for k in preds.keys() if k in current_state
        },
        "prediction_next_5min": preds,
        "risk_level": risk["level"],
        "details": risk["reasons"],
        "thresholds": risk["thresholds_used"]
    }