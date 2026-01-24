import pandas as pd
import numpy as np
from xgboost import XGBRegressor
import joblib
import os

# =========================
# CONFIG
# =========================
DATA_PATH = "../data/aquaculture_v2.csv"
MODEL_DIR = "../models_storage"
os.makedirs(MODEL_DIR, exist_ok=True)

# Cấu hình dự báo: 30 phút (6 bước)
STEPS_AHEAD = 6 

print("Loading data...")
df = pd.read_csv(DATA_PATH)
df["timestamp"] = pd.to_datetime(df["timestamp"])
df = df.sort_values("timestamp") # Luôn sort để chắc chắn

target_cols = ["dissolved_oxygen", "ph", "ammonia", "turbidity", "temperature"]

# =========================
# 1. FEATURE ENGINEERING
# =========================

# A. TARGET: Predict DELTA
for col in target_cols:
    # Target = Giá trị tương lai - Giá trị hiện tại
    df[f"{col}_target"] = df[col].shift(-STEPS_AHEAD) - df[col]

# B. INPUT FEATURES
# Windows: 3 (15p), 6 (30p), 12 (60p), 24 (120p)
windows = [3, 6, 12, 24] 

for col in target_cols:
    for w in windows:
        # Rolling Mean
        df[f"{col}_roll_mean_{w}"] = df[col].rolling(window=w).mean()
        # Rolling Std
        df[f"{col}_roll_std_{w}"] = df[col].rolling(window=w).std()
        # Trend (Hiện tại - Quá khứ)
        df[f"{col}_trend_{w}"] = df[col] - df[col].shift(w)

# Time Features
df["hour_sin"] = np.sin(2 * np.pi * df["timestamp"].dt.hour / 24)
df["hour_cos"] = np.cos(2 * np.pi * df["timestamp"].dt.hour / 24)
df["month"] = df["timestamp"].dt.month

# Xóa NaN (Những dòng đầu tiên không đủ window 24 sẽ bị xóa)
df = df.dropna()

# =========================
# 2. SELECT FEATURES
# =========================
feature_cols = ["rain_event", "feeding_event", "hour_sin", "hour_cos", "month"]

for col in target_cols:
    feature_cols.append(col) # Giá trị hiện tại
    for w in windows:
        feature_cols.append(f"{col}_roll_mean_{w}")
        feature_cols.append(f"{col}_roll_std_{w}")
        feature_cols.append(f"{col}_trend_{w}")

print(f"Total Features used: {len(feature_cols)}")

# =========================
# 3. TRAIN LOOP
# =========================
X = df[feature_cols]

# Trọng số: Tập trung vào các mẫu nguy hiểm
weights = np.ones(len(X))
weights[df["dissolved_oxygen"] < 3.5] = 10.0 
weights[df["ammonia"] > 0.5] = 10.0

for name in target_cols:
    print(f"Training model for {name}...")
    y = df[f"{name}_target"]
    
    model = XGBRegressor(
        n_estimators=800,
        max_depth=7,
        learning_rate=0.03,
        objective="reg:squarederror",
        n_jobs=-1
    )
    
    model.fit(X, y, sample_weight=weights)
    
    # Lưu model với suffix mới
    joblib.dump(model, f"{MODEL_DIR}/xgb_{name}.pkl")

# Lưu danh sách features (RẤT QUAN TRỌNG)
joblib.dump(feature_cols, f"{MODEL_DIR}/features.pkl")
print("Training Done.")