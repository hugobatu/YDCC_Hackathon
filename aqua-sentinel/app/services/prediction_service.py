import pandas as pd
import joblib
import os
import numpy as np
from typing import List, Dict, Any

class PredictionService:
    def __init__(self, model_dir: str = "./app/models_storage/"):
        self.model_dir = model_dir
        self.targets = ["dissolved_oxygen", "ph", "ammonia", "turbidity", "temperature"]
        self.models = {}
        self.feature_cols = []
        
        # CẤU HÌNH PHẢI KHỚP 100% VỚI TRAINING
        self.windows = [3, 6, 12, 24] 
        self.model_suffix = ""  # Khớp với file training ở trên

        self._load_models()

    def _load_models(self):
        if not os.path.isdir(self.model_dir):
            print(f"[WARN] Model dir not found: {self.model_dir}")
            return

        # Load Features List
        features_path = os.path.join(self.model_dir, f"features{self.model_suffix}.pkl")
        if os.path.isfile(features_path):
            self.feature_cols = joblib.load(features_path)
            print(f"[INFO] Loaded {len(self.feature_cols)} features.")
        else:
            print(f"[ERROR] Missing features file: {features_path}")

        # Load Models
        for t in self.targets:
            path = os.path.join(self.model_dir, f"xgb_{t}{self.model_suffix}.pkl")
            if os.path.isfile(path):
                self.models[t] = joblib.load(path)
            else:
                print(f"[ERROR] Missing model: {path}")

    def _engineer_features(self, history_dicts: List[Dict]) -> pd.DataFrame:
        if not history_dicts:
            raise ValueError("No history data provided")

        df = pd.DataFrame(history_dicts)
        
        # --- BƯỚC QUAN TRỌNG NHẤT: SẮP XẾP DỮ LIỆU ---
        # Dữ liệu từ DB thường là mới nhất -> cũ nhất.
        # Rolling window cần cũ nhất -> mới nhất (Chronological).
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp", ascending=True).reset_index(drop=True)

        # Kiểm tra độ dài dữ liệu
        # Nếu không đủ 24 điểm (cho window 24), rolling sẽ ra NaN
        if len(df) < 24:
            print(f"[WARN] History length ({len(df)}) < required window (24). Features may be inaccurate.")

        # 1. Time Features
        df["hour_sin"] = np.sin(2 * np.pi * df["timestamp"].dt.hour / 24)
        df["hour_cos"] = np.cos(2 * np.pi * df["timestamp"].dt.hour / 24)
        df["month"] = df["timestamp"].dt.month

        # 2. Rolling Features
        for col in self.targets:
            # Nếu cột thiếu trong history (ví dụ sensor hỏng), fill 0 để tránh lỗi code
            if col not in df.columns:
                df[col] = 0.0
                
            for w in self.windows:
                # Rolling Mean & Std
                df[f"{col}_roll_mean_{w}"] = df[col].rolling(window=w).mean()
                df[f"{col}_roll_std_{w}"] = df[col].rolling(window=w).std()
                # Trend
                df[f"{col}_trend_{w}"] = df[col] - df[col].shift(w)

        # 3. Xử lý NaN ở các dòng đầu tiên (do rolling)
        # Bắt buộc phải backfill để dòng cuối cùng (dòng hiện tại) có dữ liệu nếu history quá ngắn
        df = df.fillna(method='bfill').fillna(0)

        # Chỉ lấy dòng cuối cùng (Trạng thái hiện tại) để dự báo
        return df.iloc[[-1]]

    def predict(self, history: List[Any]) -> tuple[Dict[str, float], Dict[str, Any]]:
        # Chuyển đổi Input Pydantic/Dict sang List Dict chuẩn
        history_data = [h if isinstance(h, dict) else h.__dict__ for h in history]
        
        # Tạo features
        latest_df = self._engineer_features(history_data)
        
        # Đảm bảo đủ cột features như lúc train
        for col in self.feature_cols:
            if col not in latest_df.columns:
                latest_df[col] = 0.0 # Fallback an toàn
        
        X_input = latest_df[self.feature_cols]
        results = {}

        for name, model in self.models.items():
            current_val = float(latest_df[name].values[0])
            
            # Predict Delta
            pred_delta = float(model.predict(X_input)[0])
            
            # Calculate Future Value
            future_val = current_val + pred_delta
            
            # Safety Clamps
            if name in ["dissolved_oxygen", "ammonia", "turbidity"]:
                future_val = max(0.0, future_val)
            if name == "ph":
                future_val = np.clip(future_val, 0, 14)
                
            results[name] = round(future_val, 2)

        # Trả về kết quả và trạng thái hiện tại (raw values của dòng cuối)
        current_state = latest_df.iloc[0].to_dict()
        return results, current_state

prediction_service = PredictionService()