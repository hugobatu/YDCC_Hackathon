# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional # Thêm Optional
import pandas as pd
import joblib
import numpy as np
import os
from risk_classifier import risk_engine

app = FastAPI(title="Aqua Sentinel AI - Multi Species")

MODEL_DIR = "models"
models = {}
targets = ["dissolved_oxygen", "ph", "ammonia", "turbidity"]
feature_cols = []
try:
    if os.path.exists(MODEL_DIR):
        for t in targets:
            models[t] = joblib.load(f"{MODEL_DIR}/xgb_{t}.pkl")
        feature_cols = joblib.load(f"{MODEL_DIR}/features.pkl")
    else:
        print("Model folder not found")
except Exception as e:
    print(f"Error: {e}")


# === CẬP NHẬT SCHEMA ===
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
    
    cols = ["dissolved_oxygen", "ph", "ammonia", "turbidity"]
    windows = [3, 12]
    for col in cols:
        for w in windows:
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
        
        # Ensure features exist
        for col in feature_cols:
            if col not in latest.columns: latest[col] = 0
            
        pred_val = float(models[name].predict(latest[feature_cols])[0])
        
        # Physical Constraint for DO
        if name == "dissolved_oxygen":
            delta_3 = latest.get("dissolved_oxygen_delta_3", 0).values[0]
            if delta_3 < -0.1:
                pred_val = min(pred_val, current_do)

        result[name] = round(pred_val, 2)
        
        # Safety clamp for negative values
        if result[name] < 0: result[name] = 0.0

    # 4. === RISK ASSESSMENT ===
    risk_assessment = risk_engine.assess_risk(
        prediction=result, 
        current_do=current_do, 
        species=req.species
    )

    return {
        "species": req.species,
        "prediction_next_5min": result,
        "risk_level": risk_assessment["level"],
        "details": risk_assessment["reasons"], # lý do tại sao Danger/Warning
        "thresholds": risk_assessment["thresholds_used"] # ngưỡng để check
    }