import pandas as pd
import joblib
import os
import numpy as np
from typing import List


class PredictionService:
    def __init__(self, model_dir: str = "./app/models_storage/"):
        self.model_dir = model_dir
        self.targets = [
            "dissolved_oxygen",
            "ph",
            "ammonia",
            "turbidity",
            "temperature",
        ]
        self.models = {}
        self.feature_cols = []

        self._load_models()

    # ---------- MODEL LOADING ----------
    def _load_models(self):
        if not os.path.isdir(self.model_dir):
            print(f"[WARN] Model directory not found: {self.model_dir}")
            return

        # Load models
        for t in self.targets:
            path = os.path.join(self.model_dir, f"xgb_{t}.pkl")
            if os.path.isfile(path):
                try:
                    self.models[t] = joblib.load(path)
                except Exception as e:
                    print(f"[ERROR] Failed to load model {path}: {e}")
            else:

                print(f"[WARN] Missing model file: {path}")

        # Load feature list
        features_path = os.path.join(self.model_dir, "features.pkl")
        if os.path.isfile(features_path):
            try:
                self.feature_cols = joblib.load(features_path)
            except Exception as e:
                print(f"[ERROR] Failed to load features.pkl: {e}")
        else:
            print(f"[WARN] Missing features.pkl in {self.model_dir}")

    # ---------- FEATURE ENGINEERING ----------
    def _engineer_features(self, history):
        if not history:
            raise ValueError("History is empty")

        df = pd.DataFrame([p.dict() for p in history])
        df["timestamp"] = pd.to_datetime(df["timestamp"])

        cols = [
            "dissolved_oxygen",
            "ph",
            "ammonia",
            "turbidity",
            "temperature",
        ]

        for col in cols:
            if col not in df.columns:
                continue
            for w in (3, 12):
                df[f"{col}_roll_mean_{w}"] = df[col].rolling(w).mean()
                df[f"{col}_delta_{w}"] = df[col] - df[col].shift(w)

        df["hour"] = df["timestamp"].dt.hour
        df["month"] = df["timestamp"].dt.month

        return df.iloc[[-1]].fillna(0)

    # ---------- PREDICTION ----------
    def predict(self, history):
        if not self.models:
            raise RuntimeError("PredictionService has no loaded models")

        if not self.feature_cols:
            raise RuntimeError("Feature columns not loaded")

        latest_df = self._engineer_features(history)
        current_do = latest_df.get("dissolved_oxygen", [0]).values[0]

        # Ensure feature consistency
        for col in self.feature_cols:
            if col not in latest_df.columns:
                latest_df[col] = 0

        results = {}
        for name, model in self.models.items():
            pred = float(model.predict(latest_df[self.feature_cols])[0])

            # Physical constraint for DO
            if name == "dissolved_oxygen":
                delta_3 = latest_df.get("dissolved_oxygen_delta_3", [0]).values[0]
                if delta_3 < -0.1:
                    pred = min(pred, current_do)

            results[name] = max(0.0, round(pred, 2))
        
        return results, latest_df.iloc[0].to_dict()


prediction_service = PredictionService()