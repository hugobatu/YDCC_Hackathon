# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import joblib
import os

# 1. SỬA IMPORT CHO ĐÚNG TÊN FILE
from risk_classifier import risk_engine 

app = FastAPI(title="Aqua Sentinel AI - Multi Species")

# 2. CẤU HÌNH LOAD MODEL
MODEL_DIR = "models" 

models = {}
# 3. THÊM TEMPERATURE VÀO TARGET ĐỂ DỰ BÁO
targets = ["dissolved_oxygen", "ph", "ammonia", "turbidity", "temperature"]
feature_cols = []

try:
    if os.path.exists(MODEL_DIR):
        for t in targets:
            # Load model nếu file tồn tại (tránh lỗi nếu chưa train model nhiệt độ)
            model_path = f"{MODEL_DIR}/xgb_{t}.pkl"
            if os.path.exists(model_path):
                models[t] = joblib.load(model_path)
            else:
                print(f"⚠️ Warning: Model for {t} not found at {model_path}")
                
        feature_cols = joblib.load(f"{MODEL_DIR}/features.pkl")
        print("Models & Features loaded successfully.")
    else:
        print(f"Error: Model folder '{MODEL_DIR}' not found")
except Exception as e:
    print(f"Error loading models: {e}")

# === SCHEMA ===
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
    species: str = "tom" 
    history: List[SensorPoint]

@app.post("/predict")
def predict(req: PredictRequest):
    # 1. Validate History length
    if len(req.history) < 12:
        raise HTTPException(400, "Cần tối thiểu 12 điểm dữ liệu lịch sử")
        
    # 2. Convert to DataFrame & Feature Engineering
    data = [item.dict() for item in req.history]
    df = pd.DataFrame(data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # 4. THÊM TEMPERATURE VÀO ĐÂY ĐỂ TÍNH ROLLING FEATURES
    # Nếu không thêm, model sẽ không hiểu xu hướng nhiệt độ
    cols = ["dissolved_oxygen", "ph", "ammonia", "turbidity", "temperature"]
    windows = [3, 12]
    
    for col in cols:
        for w in windows:
            # Kiểm tra cột có tồn tại không trước khi tính (Safety)
            if col in df.columns:
                df[f"{col}_roll_mean_{w}"] = df[col].rolling(window=w).mean()
                df[f"{col}_delta_{w}"] = df[col] - df[col].shift(w)
            
    df["hour"] = df["timestamp"].dt.hour
    df["month"] = df["timestamp"].dt.month
    
    latest = df.iloc[[-1]].copy().fillna(0)
    current_do = latest["dissolved_oxygen"].values[0]
    
    # 3. Model Prediction Loop
    result = {}
    for name in targets:
        if name not in models: continue
        
        # Ensure features exist (Điền 0 nếu thiếu để tránh crash)
        for col in feature_cols:
            if col not in latest.columns: latest[col] = 0
            
        pred_val = float(models[name].predict(latest[feature_cols])[0])
        
        # Physical Constraint for DO (Ràng buộc vật lý)
        if name == "dissolved_oxygen":
            delta_3 = latest.get("dissolved_oxygen_delta_3", 0).values[0]
            if delta_3 < -0.1:
                pred_val = min(pred_val, current_do)

        result[name] = round(pred_val, 2)
        
        # Safety clamp
        if result[name] < 0: result[name] = 0.0

    # 4. === RISK ASSESSMENT ===
    # Lấy trạng thái hiện tại đầy đủ
    current_state = {
        "dissolved_oxygen": latest["dissolved_oxygen"].values[0],
        # Lấy nhiệt độ hiện tại (quan trọng để tính delta shock nhiệt)
        "temperature": latest.get("temperature", pd.Series([28.0])).values[0], 
        "ph": latest["ph"].values[0],
        "ammonia": latest["ammonia"].values[0]
    }

    # Gọi Risk Engine
    risk_assessment = risk_engine.assess_risk(
        prediction=result, 
        current_state=current_state, 
        species=req.species
    )

    return {
        "species": req.species,
        "prediction_next_5min": result,
        "risk_level": risk_assessment["level"],
        "details": risk_assessment["reasons"], 
        "thresholds": risk_assessment["thresholds_used"]
    }