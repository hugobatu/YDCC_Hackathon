WELCOME_EMAIL_HTML = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Aqua Sentinel</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" style="background-color: #ffffff; border-radius: 8px; padding: 24px;">
          
          <tr>
            <td align="center">
              <h1 style="color: #1e88e5; margin-bottom: 10px;">Aqua Sentinel</h1>
              <p style="font-size: 16px; color: #555;">
                Quản lý thông minh - Nuôi trồng bền vững
              </p>
            </td>
          </tr>

          <tr>
            <td>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            </td>
          </tr>

          <tr>
            <td>
              <h2 style="color: #333;">Chào mừng bạn, {fullname} 👋</h2>
              <p style="font-size: 15px; color: #444; line-height: 1.6;">
                Tài khoản của bạn đã được tạo thành công với email:
                <b>{email}</b>
              </p>

              <p style="font-size: 15px; color: #444; line-height: 1.6;">
                Từ bây giờ, bạn có thể:
              </p>

              <ul style="color: #444; font-size: 15px;">
                <li>📊 Theo dõi chất lượng nước theo thời gian thực</li>
                <li>🤖 Nhận cảnh báo bất thường từ AI</li>
                <li>📈 Phân tích dữ liệu theo mùa & khu vực</li>
              </ul>

              <p style="font-size: 15px; color: #444;">
                Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="font-size: 13px; color: #999;">
                © 2026 Aqua Sentinel. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
POOL_CREATED_EMAIL_HTML = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Khởi tạo hồ nuôi thành công</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" style="background-color: #ffffff; border-radius: 8px; padding: 24px; border-top: 4px solid #4caf50;">
          
          <tr>
            <td align="center">
              <h1 style="color: #1e88e5; margin-bottom: 5px;">Aqua Sentinel</h1>
              <p style="font-size: 14px; color: #777; margin-top: 0;">Quản lý thông minh - Nuôi trồng bền vững</p>
            </td>
          </tr>

          <tr>
            <td>
              <h2 style="color: #333; margin-top: 20px;">Chúc mừng {fullname}!</h2>
              <p style="font-size: 15px; color: #444; line-height: 1.6;">
                Hồ nuôi mới của bạn đã được khởi tạo thành công trên hệ thống. Dưới đây là thông tin chi tiết:
              </p>

              <div style="background-color: #f9f9f9; border-radius: 6px; padding: 15px; border-left: 4px solid #4caf50;">
                <p style="margin: 5px 0;">📍 <b>Tên hồ:</b> {pool_name}</p>
                <p style="margin: 5px 0;">🦐 <b>Loài nuôi:</b> {species_name}</p>
                <p style="margin: 5px 0;">🌍 <b>Khu vực:</b> {region_name}</p>
              </div>

              <p style="font-size: 15px; color: #444; line-height: 1.6; margin-top: 20px;">
                <b>Các bước tiếp theo bạn nên làm:</b>
              </p>
              <ul style="color: #444; font-size: 14px; line-height: 1.8;">
                <li>Kết nối thiết bị cảm biến vào mã hồ <b>{pool_id}</b></li>
                <li>Thiết lập ngưỡng cảnh báo riêng cho hồ này (nếu cần)</li>
                <li>Kiểm tra dữ liệu đo đạc sau 5 phút kể từ khi bật máy</li>
              </ul>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="font-size: 12px; color: #aaa;">
                © 2026 Aqua Sentinel. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
POOL_DELETED_EMAIL_HTML = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Xác nhận xoá hồ nuôi</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" style="background-color: #ffffff; border-radius: 8px; padding: 24px; border-top: 4px solid #e53935;">
          
          <tr>
            <td align="center">
              <h1 style="color: #1e88e5; margin-bottom: 5px;">Aqua Sentinel</h1>
              <p style="font-size: 14px; color: #777; margin-top: 0;">Quản lý thông minh - Nuôi trồng bền vững</p>
              
            </td>
          </tr>

          <tr>
            <td>
              <h2 style="color: #333; margin-top: 20px;">Thông báo xoá hồ nuôi</h2>
              <p style="font-size: 15px; color: #444; line-height: 1.6;">
                Chào {fullname}, chúng tôi xác nhận hồ nuôi sau đã được xoá khỏi tài khoản của bạn:
              </p>

              <div style="background-color: #fff5f5; border-radius: 6px; padding: 15px; border: 1px solid #ffcdd2;">
                <p style="margin: 5px 0; color: #b71c1c;"><b>Tên hồ đã xoá:</b> {pool_name}</p>
                <p style="margin: 5px 0; color: #555;"><b>Thời gian thực hiện:</b> {delete_time}</p>
              </div>

              <p style="font-size: 14px; color: #d32f2f; background-color: #fff9c4; padding: 10px; border-radius: 4px; margin-top: 20px;">
                ⚠️ <b>Lưu ý:</b> Toàn bộ dữ liệu đo đạc lịch sử liên quan đến hồ này cũng đã bị xoá vĩnh viễn và không thể khôi phục.
              </p>

              <p style="font-size: 15px; color: #444; margin-top: 20px;">
                Nếu bạn không thực hiện hành động này, vui lòng liên hệ ngay với bộ phận hỗ trợ kỹ thuật của chúng tôi để bảo mật tài khoản.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="font-size: 12px; color: #aaa;">
                © 2026 Aqua Sentinel. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""