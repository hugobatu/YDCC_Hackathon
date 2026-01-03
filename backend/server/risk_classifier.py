# risk_engine.py

class RiskEngine:
    def __init__(self):
        # Cấu hình ngưỡng an toàn cho từng loài (Dựa trên yêu cầu của bạn)
        self.SPECIES_CONFIG = {
            "tom": {  # Tôm thẻ/sú (Nhạy cảm nhất)
                "do_danger": 3.5, "do_warning": 5.0,
                "ph_min": 7.5, "ph_max": 8.5,
                "ammonia_danger": 0.1, "ammonia_warning": 0.05
            },
            "ca_tra": {  # Cá tra (Rất khỏe)
                "do_danger": 2.0, "do_warning": 3.0,
                "ph_min": 6.5, "ph_max": 8.5,
                "ammonia_danger": 1.0, "ammonia_warning": 0.5
            },
            "ca_basa": {  # Tương tự cá tra
                "do_danger": 2.5, "do_warning": 3.5,
                "ph_min": 6.5, "ph_max": 8.5,
                "ammonia_danger": 0.8, "ammonia_warning": 0.4
            },
            "ca_ro_phi": {  # Rất khỏe
                "do_danger": 2.0, "do_warning": 3.0,
                "ph_min": 6.0, "ph_max": 9.0,
                "ammonia_danger": 1.0, "ammonia_warning": 0.5
            },
            "ca_loc": {  # Cá lóc bông (Chịu đựng tốt)
                "do_danger": 2.5, "do_warning": 3.5,
                "ph_min": 6.0, "ph_max": 8.0,
                "ammonia_danger": 0.5, "ammonia_warning": 0.2
            },
            "luon": {  # Lươn (Nhạy cảm pH)
                "do_danger": 3.0, "do_warning": 4.0,
                "ph_min": 6.5, "ph_max": 8.0,  # pH ổn định là quan trọng nhất
                "ammonia_danger": 0.2, "ammonia_warning": 0.1
            }
        }

    def assess_risk(self, prediction: dict, current_do: float, species: str = "tom") -> dict:
        """
        Đánh giá rủi ro dựa trên loài cụ thể.
        """
        # 1. Lấy config theo loài (Nếu không tìm thấy, mặc định là 'tom' cho an toàn)
        cfg = self.SPECIES_CONFIG.get(species, self.SPECIES_CONFIG["tom"])
        
        score = 0
        details = [] # Lưu lý do bị phạt điểm để debug/hiển thị

        # === 2. Đánh giá DO (Dissolved Oxygen) ===
        pred_do = prediction.get("dissolved_oxygen", 0)
        
        # Nguy hiểm chết người
        if pred_do < cfg["do_danger"]:
            score += 5
            details.append(f"DO dự đoán ({pred_do:.2f}) < Ngưỡng chết ({cfg['do_danger']})")
        # Cảnh báo
        elif pred_do < cfg["do_warning"]:
            score += 2
            details.append(f"DO dự đoán ({pred_do:.2f}) < Ngưỡng cảnh báo ({cfg['do_warning']})")
        
        # === 3. Đánh giá pH ===
        pred_ph = prediction.get("ph", 7.0)
        
        # pH lệch quá xa (vượt ngưỡng min/max quá 0.5 đơn vị) -> Nguy hiểm
        if pred_ph < (cfg["ph_min"] - 0.5) or pred_ph > (cfg["ph_max"] + 0.5):
            score += 3
            details.append(f"pH ({pred_ph:.2f}) lệch nghiêm trọng khỏi chuẩn {cfg['ph_min']}-{cfg['ph_max']}")
        # pH chỉ vừa lệch khỏi chuẩn -> Cảnh báo nhẹ
        elif pred_ph < cfg["ph_min"] or pred_ph > cfg["ph_max"]:
            score += 1
            details.append(f"pH ({pred_ph:.2f}) lệch nhẹ khỏi chuẩn")

        # === 4. Đánh giá Ammonia ===
        pred_amm = prediction.get("ammonia", 0)
        
        if pred_amm > cfg["ammonia_danger"]:
            score += 5
            details.append(f"NH3 ({pred_amm:.4f}) vượt ngưỡng độc ({cfg['ammonia_danger']})")
        elif pred_amm > cfg["ammonia_warning"]:
            score += 2
            details.append(f"NH3 ({pred_amm:.4f}) mức cảnh báo ({cfg['ammonia_warning']})")

        # === 5. Safety Net (Dựa trên chỉ số hiện tại) ===
        # Quan trọng: Safety Net cũng phải dùng ngưỡng của loài đó!
        if current_do < cfg["do_danger"]:
            score = max(score, 5)
            details.append(f"⚠️ DO hiện tại ({current_do:.2f}) đã ở mức nguy hiểm!")

        # === 6. Kết luận ===
        status = "SAFE"
        if score >= 5:
            status = "DANGER_ACTION_NEEDED"
        elif score >= 2:
            status = "WARNING"

        return {
            "level": status,
            "score": score,
            "reasons": details, # Trả về lý do cụ thể
            "thresholds_used": cfg # Trả về ngưỡng để Frontend biết
        }

# Instance singleton
risk_engine = RiskEngine()