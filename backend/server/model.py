import pandas as pd
import numpy as np
from xgboost import XGBRegressor
import joblib
import os

# CONFIG
DATA_PATH = "../data/aquaculture_v2.csv"
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# LOAD
print("🔄 Loading data...")
df = pd.read_csv(DATA_PATH)
df["timestamp"] = pd.to_datetime(df["timestamp"])

target_cols = ["dissolved_oxygen", "ph", "ammonia", "turbidity"]

# FEATURE ENGINEERING (SERVER & TRAIN PHẢI GIỐNG NHAU 100%)
# Shift target (-1 step = 5 mins prediction)
for col in target_cols:
    df[f"{col}_target"] = df[col].shift(-1)

# Rolling windows (Quan trọng: window nhỏ để bắt trend nhanh)
windows = [3, 12] 
for col in target_cols:
    for w in windows:
        df[f"{col}_roll_mean_{w}"] = df[col].rolling(window=w).mean()
        df[f"{col}_delta_{w}"] = df[col] - df[col].shift(w) # Trend

# Time info
df["hour"] = df["timestamp"].dt.hour
df["month"] = df["timestamp"].dt.month

df = df.dropna()

# FEATURES LIST
feature_cols = ["rain_event", "feeding_event", "hour", "month"]
for col in target_cols:
    feature_cols.append(col) # Current Value
    feature_cols.extend([f"{col}_roll_mean_3", f"{col}_roll_mean_12", 
                         f"{col}_delta_3", f"{col}_delta_12"])

# TRAIN LOOP
X = df[feature_cols]
weights = np.ones(len(X))
# Tăng trọng số cho các mẫu nguy hiểm để model nhớ hơn
weights[df["dissolved_oxygen"] < 3.5] = 10.0 
weights[df["ammonia"] > 0.5] = 10.0

for name in target_cols:
    print(f"Training {name}...")
    y = df[f"{name}_target"]
    
    model = XGBRegressor(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.05,
        objective="reg:squarederror",
        n_jobs=-1
    )
    
    model.fit(X, y, sample_weight=weights) # Apply weight
    
    joblib.dump(model, f"{MODEL_DIR}/xgb_{name}.pkl")
    
joblib.dump(feature_cols, f"{MODEL_DIR}/features.pkl")
print("Training Done. Models saved in 'models/' directory.")