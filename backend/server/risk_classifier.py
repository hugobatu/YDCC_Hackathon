# risk_engine.py

class RiskEngine:
    def __init__(self):
        # Cấu hình ngưỡng mặc định (Có thể mở rộng cho đa loài sau này)
        self.THRESHOLDS = {
            "do": {"danger": 3.5, "warning": 5.0},
            "ph": {"min": 6.0, "max": 8.5, "warn_min": 6.8, "warn_max": 8.2},
            "ammonia": {"danger": 1.0, "warning": 0.5, "caution": 0.2}
        }

    def assess_risk(self, prediction: dict, current_do: float) -> str:
        """
        Đánh giá rủi ro dựa trên dự đoán AI và chỉ số hiện tại.
        :param prediction: Dictionary chứa kết quả dự đoán {'dissolved_oxygen': 4.5, ...}
        :param current_do: Chỉ số DO thực tế từ cảm biến hiện tại (Safety Net)
        :return: String trạng thái (SAFE, WARNING, DANGER_ACTION_NEEDED)
        """
        score = 0
        cfg = self.THRESHOLDS

        # 1. Đánh giá DO (Dissolved Oxygen)
        pred_do = prediction.get("dissolved_oxygen", 0)
        if pred_do < cfg["do"]["danger"]:
            score += 5
        elif pred_do < cfg["do"]["warning"]:
            score += 2
        
        # 2. Đánh giá pH
        pred_ph = prediction.get("ph", 7.0)
        if pred_ph < cfg["ph"]["min"] or pred_ph > cfg["ph"]["max"]:
            score += 3
        elif pred_ph < cfg["ph"]["warn_min"] or pred_ph > cfg["ph"]["warn_max"]:
            score += 1

        # 3. Đánh giá Ammonia
        pred_amm = prediction.get("ammonia", 0)
        if pred_amm > cfg["ammonia"]["danger"]:
            score += 5
        elif pred_amm > cfg["ammonia"]["warning"]:
            score += 3
        elif pred_amm > cfg["ammonia"]["caution"]:
            score += 1

        # 4. Safety Net (Ghi đè bằng chỉ số hiện tại)
        # Nếu cảm biến hiện tại đã báo nguy hiểm, thì BÁO ĐỘNG NGAY bất kể AI đoán gì
        if current_do < cfg["do"]["danger"]:
            score = max(score, 5)

        # 5. Kết luận trạng thái
        if score >= 5:
            return "DANGER_ACTION_NEEDED"
        elif score >= 2:
            return "WARNING"
        else:
            return "SAFE"

# Tạo instance để dùng bên main
risk_engine = RiskEngine()