# risk_engine.py

class RiskEngine:
    def __init__(self):
        # Cấu hình ngưỡng an toàn cho từng loài
        self.SPECIES_CONFIG = {
            "tom": {  # Tôm thẻ/sú (Nhạy cảm nhất)
                "do_danger": 3.5, "do_warning": 5.0,
                "ph_min": 7.5, "ph_max": 8.5,
                "ammonia_danger": 0.5, "ammonia_warning": 0.1, # Đã nới lỏng theo kịch bản test
                "temp_min": 26.0, "temp_max": 32.0,
                "temp_shock_delta": 2.0
            },
            "ca_tra": {  # Cá tra (Rất khỏe)
                "do_danger": 2.0, "do_warning": 3.0,
                "ph_min": 6.5, "ph_max": 8.5,
                "ammonia_danger": 1.0, "ammonia_warning": 0.5,
                "temp_min": 25.0, "temp_max": 34.0,
                "temp_shock_delta": 3.0
            },
            "ca_basa": {  # Tương tự cá tra
                "do_danger": 2.5, "do_warning": 3.5,
                "ph_min": 6.5, "ph_max": 8.5,
                "ammonia_danger": 0.8, "ammonia_warning": 0.4,
                "temp_min": 25.0, "temp_max": 34.0,
                "temp_shock_delta": 3.0
            },
            "ca_ro_phi": {  # Rất khỏe
                "do_danger": 2.0, "do_warning": 3.0,
                "ph_min": 6.0, "ph_max": 9.0,
                "ammonia_danger": 1.0, "ammonia_warning": 0.5,
                "temp_min": 25.0, "temp_max": 34.0,
                "temp_shock_delta": 3.0
            },
            "ca_loc": {  # Cá lóc bông (Chịu đựng tốt)
                "do_danger": 2.5, "do_warning": 3.5,
                "ph_min": 6.0, "ph_max": 8.0,
                "ammonia_danger": 0.5, "ammonia_warning": 0.2,
                "temp_min": 25.0, "temp_max": 34.0,
                "temp_shock_delta": 3.0
            },
            "luon": {  # Lươn (Nhạy cảm pH)
                "do_danger": 3.0, "do_warning": 4.0,
                "ph_min": 6.5, "ph_max": 8.0,
                "ammonia_danger": 0.2, "ammonia_warning": 0.1,
                "temp_min": 25.0, "temp_max": 34.0,
                "temp_shock_delta": 3.0
            }
        }

    def assess_risk(self, prediction: dict, current_state: dict, species: str = "tom") -> dict:
        """
        Đánh giá rủi ro dựa trên loài cụ thể.
        :param prediction: Dict chứa dự đoán tương lai (VD: {'dissolved_oxygen': 4.5...})
        :param current_state: Dict chứa chỉ số hiện tại (VD: {'dissolved_oxygen': 4.2, 'temperature': 28...})
        :param species: Tên loài
        """
        # 1. Lấy config theo loài
        cfg = self.SPECIES_CONFIG.get(species, self.SPECIES_CONFIG["tom"])
        
        score = 0
        details = [] 

        # === 2. Đánh giá DO (Dissolved Oxygen) ===
        pred_do = prediction.get("dissolved_oxygen", 0)
        
        if pred_do < cfg["do_danger"]:
            score += 5
            details.append(f"Nồng độ Oxi dự đoán ({pred_do:.2f}) < Ngưỡng chết ({cfg['do_danger']})")
        elif pred_do < cfg["do_warning"]:
            score += 2
            details.append(f"Nồng độ Oxi dự đoán ({pred_do:.2f}) < Ngưỡng cảnh báo ({cfg['do_warning']})")

        # === 3. Đánh giá pH ===
        pred_ph = prediction.get("ph", 7.0)
        
        if pred_ph < (cfg["ph_min"] - 0.5) or pred_ph > (cfg["ph_max"] + 0.5):
            score += 3
            details.append(f"Nồng độ pH ({pred_ph:.2f}) lệch nghiêm trọng khỏi chuẩn {cfg['ph_min']}-{cfg['ph_max']}")
        elif pred_ph < cfg["ph_min"] or pred_ph > cfg["ph_max"]:
            score += 1
            details.append(f"Nồng độ pH ({pred_ph:.2f}) lệch nhẹ khỏi chuẩn")

        # === 4. Đánh giá Ammonia ===
        pred_amm = prediction.get("ammonia", 0)
        
        if pred_amm > cfg["ammonia_danger"]:
            score += 5
            details.append(f"Nồng độ NH3 ({pred_amm:.4f}) vượt ngưỡng độc ({cfg['ammonia_danger']})")
        elif pred_amm > cfg["ammonia_warning"]:
            score += 2
            details.append(f"Nồng độ NH3 ({pred_amm:.4f}) mức cảnh báo ({cfg['ammonia_warning']})")

        # === 5. Đánh giá Nhiệt độ (MỚI) ===
        # Chỉ đánh giá nếu có dữ liệu nhiệt độ, nếu không thì bỏ qua (tránh lỗi)
        pred_temp = prediction.get("temperature")
        curr_temp = current_state.get("temperature")

        if pred_temp is not None and curr_temp is not None:
            # 5.1 Quá nóng hoặc Quá lạnh
            if pred_temp < (cfg["temp_min"] - 2) or pred_temp > (cfg["temp_max"] + 2):
                score += 3
                details.append(f"Nhiệt độ ({pred_temp:.1f}°C) vượt ngưỡng chịu đựng!")
            elif pred_temp < cfg["temp_min"] or pred_temp > cfg["temp_max"]:
                score += 1
                details.append(f"Nhiệt độ ({pred_temp:.1f}°C) không tối ưu")

            # 5.2 Sốc nhiệt (Shock check)
            delta_temp = abs(pred_temp - curr_temp)
            if delta_temp > cfg.get("temp_shock_delta", 2.0):
                score += 5 # BÁO ĐỘNG ĐỎ
                details.append(f"Nguy cơ SỐC NHIỆT! Biến động {delta_temp:.1f}°C cực nhanh.")

        # === 6. Safety Net (Dựa trên chỉ số hiện tại) ===
        # Lấy DO hiện tại từ dictionary current_state
        curr_do = current_state.get("dissolved_oxygen", 99.0) # Mặc định 99 nếu không có để không báo lỗi
        
        if curr_do < cfg["do_danger"]:
            score = max(score, 5)
            details.append(f"DO hiện tại ({curr_do:.2f}) đã ở mức nguy hiểm!")

        # === 7. Kết luận ===
        status = "SAFE"
        if score >= 5:
            status = "DANGER_ACTION_NEEDED"
        elif score >= 2:
            status = "WARNING"

        return {
            "level": status,
            "score": score,
            "reasons": details,
            "thresholds_used": cfg
        }

# Instance singleton
risk_engine = RiskEngine()