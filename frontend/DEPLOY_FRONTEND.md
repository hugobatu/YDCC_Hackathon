# Deploy Frontend (Vercel) & Kết nối Backend VPS

Hướng dẫn cấu hình Frontend để kết nối với Backend đã deploy trên VPS.

## 1. Cập nhật địa chỉ API trong code

Frontend Angular sử dụng file environment để lưu địa chỉ API. Bạn cần cập nhật địa chỉ IP của VPS vào file cấu hình production.

1. Mở file `frontend/src/environments/environment.prod.ts`.
2. Tìm dòng `apiUrl` và thay thế `<VPS_IP>` bằng địa chỉ IP thật của VPS bạn.

Ví dụ:
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://123.45.67.89:8000/api' // Thay 123.45.67.89 bằng IP của bạn
};
```

> **Lưu ý quan trọng về Mixed Content**:
> Nếu Vercel chạy HTTPS (mặc định) mà VPS API chỉ chạy HTTP (port 8000), trình duyệt sẽ chặn kết nối (lỗi Mixed Content).
>
> **Giải pháp tạm thời (cho demo):**
> - Mở trang web trên trình duyệt.
> - Bấm vào biểu tượng ổ khóa/cảnh báo ở thanh địa chỉ -> **Site settings** -> **Insecure content**: chọn **Allow**.
>
> **Giải pháp lâu dài:**
> - Cấu hình SSL cho backend trên VPS (dùng Nginx hoặc Cloudflare Tunnel) để API có dạng `https://api.yourdomain.com`.

## 2. Commit và Push code

Sau khi sửa file `environment.prod.ts` và `angular.json` (đã được bot cấu hình tự động), hãy commit và push code lên GitHub/GitLab.

```bash
git add .
git commit -m "config: update api url for production"
git push origin main
```

## 3. Deploy trên Vercel

Vercel sẽ tự động detect commit mới và build lại.

- Nếu build thất bại, hãy kiểm tra log trên Vercel Dashboard.
- Cấu hình Build Command (nếu Vercel không tự nhận): `ng build --configuration production`
- Output Directory: `dist/frontend/browser` (Angular 17+ thường build ra thư mục con `browser`).

## 4. Kiểm tra kết nối

1. Mở trang web trên Vercel.
2. Mở Developer Tools (F12) -> Tab Network.
3. Thử thao tác gọi API (ví dụ: login hoặc xem danh sách hồ).
4. Kiểm tra xem request có gửi đúng đến `http://<VPS_IP>:8000/api/...` không.
