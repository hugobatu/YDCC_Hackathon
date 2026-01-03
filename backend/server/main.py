from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
import joblib
from risk_classifier import risk_engine

app = FastAPI()

# LOAD MODELS
MODEL_DIR = "models"
models = {}
targets = ["dissolved_oxygen", "ph", "ammonia", "turbidity"]
try:
    for t in targets:
        models[t] = joblib.load(f"{MODEL_DIR}/xgb_{t}.pkl")
    feature_cols = joblib.load(f"{MODEL_DIR}/features.pkl")
except:
    print("Model chưa train hoặc sai path")

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
    history: List[SensorPoint]

@app.post("/predict")
def predict(req: PredictRequest):
    # 1. Prepare Data
    if len(req.history) < 12:
        raise HTTPException(400, "Cần tối thiểu 12 điểm dữ liệu lịch sử (60 phút)")
        
    data = [item.dict() for item in req.history]
    df = pd.DataFrame(data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # 2. Feature Engineering (giống lúc train)
    cols = ["dissolved_oxygen", "ph", "ammonia", "turbidity"]
    windows = [3, 12]

    for col in cols:
        for w in windows:
            df[f"{col}_roll_mean_{w}"] = df[col].rolling(window=w).mean()
            df[f"{col}_delta_{w}"] = df[col] - df[col].shift(w)
            
    df["hour"] = df["timestamp"].dt.hour
    df["month"] = df["timestamp"].dt.month
    
    # Lấy dòng cuối cùng để predict
    latest = df.iloc[[-1]].copy().fillna(0) # Fillna an toàn
    
    # 3. Predict & Safety Check
    result = {}
    
    # === HYBRID SAFETY NET ===
    # Nếu chỉ số hiện tại ĐANG RẤT XẤU, đừng tin AI hoàn toàn nếu AI báo tốt
    current_do = latest["dissolved_oxygen"].values[0]
    
    for name in targets:
        # Predict AI
        for col in feature_cols:
            if col not in latest.columns: latest[col] = 0
        
        pred = float(models[name].predict(latest[feature_cols])[0])
        
        # Post-processing Logic (Hackathon Tip)
        if name == "dissolved_oxygen":
            # Nếu hiện tại đang 3.0, trend đang giảm (-0.1), AI không được phép đoán > 3.0
            delta_3 = latest["dissolved_oxygen_delta_3"].values[0]
            if delta_3 < 0: 
                pred = min(pred, current_do) # Ép phải giảm hoặc bằng
        
        result[name] = round(pred, 2)

    # 4. Risk Assessment
    status = risk_engine.assess_risk(result, current_do)
    
    return {
        "prediction_next_5min": result,
        "risk_level": status
    }