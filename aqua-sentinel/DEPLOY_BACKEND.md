# Deploy Backend to VPS

Hướng dẫn triển khai backend (API) lên VPS cùng với service Simulation đã có sẵn.

## 1. Chuẩn bị trên Local

Đảm bảo bạn đã cập nhật code mới nhất có file `docker-compose.prod.yml`.

## 2. Copy file lên VPS

Bạn cần copy thư mục `aqua-sentinel` lên VPS. Nếu bạn dùng Git, hãy SSH vào VPS và pull code về.
Nếu copy thủ công bằng SCP:

```bash
# Tại máy local
scp -r aqua-sentinel/ root@<VPS_IP>:/path/to/your/project/aqua-sentinel
```

## 3. Cấu hình môi trường trên VPS

SSH vào VPS và đi đến thư mục `aqua-sentinel`:

```bash
ssh root@<VPS_IP>
cd /path/to/your/project/aqua-sentinel
```

Tạo file `.env` (hoặc copy từ file `.env` của simulation nếu dùng chung DB):
```bash
nano .env
```

Nội dung file `.env`:
```ini
# Database (copy thông tin này từ .env của service Simulation đang chạy)
DB_USER=postgres.xxxxxxxxxx
DB_PASSWORD=your_secure_password
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres

# App Config
ALLOWED_ORIGINS=https://aquasentinelai.vercel.app,http://localhost:4200
ENABLE_INTERNAL_SIMULATION=false
```

*Lưu ý: `ENABLE_INTERNAL_SIMULATION=false` là quan trọng để backend không tự sinh thêm dữ liệu giả, vì đã có service Simulation riêng đảm nhận việc đó.*

## 4. Chạy Backend với Docker Compose

Sử dụng file cấu hình production mới tạo:

```bash
# Build và chạy container
docker-compose -f docker-compose.prod.yml up -d --build

# Kiểm tra logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 5. Cấu hình Frontend (Vercel)

Sau khi backend đã chạy thành công trên VPS, bạn cần trỏ Frontend về địa chỉ IP của VPS.

1. Vào Dashboard của dự án Frontend trên Vercel.
2. Vào **Settings** -> **Environment Variables**.
3. Thêm/Sửa biến môi trường `NEXT_PUBLIC_API_URL` (hoặc tên biến bạn đang dùng trong code Angular):
   
   ```
   Value: http://<VPS_IP>:8000/api
   ```
   
   *Lưu ý: Vì VPS đang dùng HTTP thường (port 8000), còn Vercel chạy HTTPS, trình duyệt có thể chặn request (Mixed Content). Tốt nhất bạn nên cấu hình SSL (Nginx/Traefik) cho backend hoặc dùng Cloudflare Tunnel. Tuy nhiên để test nhanh, bạn có thể cho phép mixed content trên trình duyệt.*

## 6. (Nâng cao) Cấu hình Network

File `docker-compose.prod.yml` được cấu hình để join vào network `aqua-sentinel-network` (được tạo bởi service Simulation).
Điều này giúp 2 service có thể nhìn thấy nhau (nếu cần).
Nếu gặp lỗi `network aqua-sentinel-network declared as external, but could not be found`, hãy đảm bảo service Simulation đã chạy và tạo network đó, hoặc sửa lại file compose để bỏ dòng `external: true`.

## Check list kiểm tra
- [ ] Backend status: chạy lệnh `docker ps` xem container `aqua_backend` có đang Up không.
- [ ] Logs không có lỗi kết nối DB.
- [ ] Truy cập thử `http://<VPS_IP>:8000/docs` xem có hiện Swagger UI không.
