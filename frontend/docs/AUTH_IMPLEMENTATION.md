# 🔐 Authentication API Integration Summary

## ✅ Hoàn Thành

### 1. **Route Protection (Dashboard Guard)**
- ✅ Tạo `auth.guard.ts` để bảo vệ các route dashboard
- ✅ Apply guard vào `/dashboard` và `/dashboard/:id`
- ✅ Tự động redirect về `/login` nếu chưa đăng nhập
- ✅ Lưu `returnUrl` để quay lại trang cần truy cập sau khi login

**File:** `src/app/guards/auth.guard.ts`

### 2. **HTTP Interceptor**
- ✅ Tạo `auth.interceptor.ts` để tự động inject JWT token
- ✅ Thêm `Authorization: Bearer {token}` vào mọi request
- ✅ Tự động xử lý lỗi 401 (Unauthorized)
- ✅ Tự động xóa token và redirect về login khi token hết hạn

**File:** `src/app/interceptors/auth.interceptor.ts`

### 3. **Auth Service - API Integration**
- ✅ Tích hợp API `/api/login` với FormData (OAuth2)
- ✅ Tích hợp API `/api/signup` với JSON body
- ✅ Lưu `access_token` vào localStorage
- ✅ Quản lý user state với Angular signals
- ✅ Error handling đầy đủ

**File:** `src/app/services/auth.service.ts`

**API Endpoints:**
- `POST /api/login` - Đăng nhập
  - Body: FormData với `username` (email) và `password`
  - Response: `{ access_token, token_type }`
  
- `POST /api/signup` - Đăng ký
  - Body: JSON với `{ email, fullname, password }`
  - Response: `{ user_id, email, fullname, created_at }`

### 4. **Login Component**
- ✅ Gọi API login thật thay vì mock
- ✅ Xử lý loading state
- ✅ Xử lý error với thông báo tiếng Việt
- ✅ Redirect về returnUrl hoặc dashboard
- ✅ Validation form đầy vào

**File:** `src/app/pages/auth/login-page/login-page.ts`

### 5. **Signup Component**
- ✅ Gọi API signup thật
- ✅ Tự động login sau khi signup thành công
- ✅ Validation đầy đủ: email format, password length, confirm password
- ✅ Xử lý error với thông báo tiếng Việt
- ✅ Redirect về dashboard sau khi thành công

**File:** `src/app/pages/auth/signup-page/signup-page.ts`

### 6. **Configuration**
- ✅ Tạo environment file với API URL
- ✅ Configure HTTP client với interceptor
- ✅ Setup app.config.ts

**Files:**
- `src/environments/environment.ts`
- `src/app/app.config.ts`
- `src/app/app.routes.ts`

---

## 🔧 Cách Sử Dụng

### 1. Token Storage
Token được lưu trong localStorage với key `access_token`:
```typescript
localStorage.getItem('access_token')
```

### 2. Auto Token Injection
Tất cả HTTP requests sẽ tự động được thêm header:
```
Authorization: Bearer {token}
```

### 3. Protected Routes
Các route được bảo vệ:
- `/dashboard` - Yêu cầu đăng nhập
- `/dashboard/:id` - Yêu cầu đăng nhập

### 4. Auth Flow
```
1. User vào /dashboard (chưa login)
   ↓
2. Auth guard chặn lại
   ↓
3. Redirect về /login?returnUrl=/dashboard
   ↓
4. User đăng nhập
   ↓
5. API trả về access_token
   ↓
6. Lưu token vào localStorage
   ↓
7. Redirect về /dashboard (returnUrl)
```

---

## 🎯 API Configuration

### Base URL
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

### Thay đổi API URL
Để đổi sang production hoặc server khác, chỉ cần sửa trong `environment.ts`:
```typescript
apiUrl: 'https://your-production-api.com/api'
```

---

## 🔍 Error Handling

### Login Errors
- `401` → "Email hoặc mật khẩu không chính xác"
- `0` → "Không thể kết nối đến server"
- Other → Hiển thị `error.detail` từ backend

### Signup Errors
- `400` → "Email đã được đăng ký"
- `422` → "Dữ liệu không hợp lệ"
- `0` → "Không thể kết nối đến server"
- Other → Hiển thị `error.detail` từ backend

---

## 📝 Validation Rules

### Login
- Email: không để trống
- Password: không để trống

### Signup
- Full Name: không để trống
- Email: 
  - Không để trống
  - Phải đúng format email
- Password:
  - Không để trống
  - Tối thiểu 6 ký tự
- Confirm Password:
  - Phải khớp với password

---

## 🚀 Next Steps (Đợi config thêm)

Dựa vào API documentation, bạn có thể tiếp tục:

1. **Pool Management APIs**
   - GET `/api/pool/my-pools` - Lấy danh sách hồ
   - POST `/api/pool/` - Tạo hồ mới
   - DELETE `/api/pool/{id}` - Xóa hồ
   
2. **Prediction APIs**
   - POST `/api/predict` - Dự báo chất lượng nước
   - POST `/api/analyze-with-llm` - Phân tích AI

3. **Species API**
   - GET `/api/pool/species/all` - Lấy danh sách loài

---

## 🐛 Testing

### Test Login
1. Đảm bảo backend đang chạy ở `http://localhost:8000`
2. Truy cập `/login`
3. Nhập email và password đã đăng ký
4. Kiểm tra console để xem request/response
5. Kiểm tra localStorage có `access_token` chưa

### Test Signup
1. Truy cập `/signup`
2. Điền đầy đủ thông tin
3. Submit form
4. Sẽ tự động login và redirect về dashboard

### Test Route Protection
1. Đảm bảo chưa login (xóa token trong localStorage)
2. Truy cập `/dashboard`
3. Sẽ tự động redirect về `/login?returnUrl=/dashboard`
4. Sau khi login → tự động về dashboard

---

## ✨ Features Implemented

1. ✅ JWT Authentication với bearer token
2. ✅ Auto token injection cho mọi request
3. ✅ Route protection với guard
4. ✅ Return URL preservation
5. ✅ Auto logout khi token expire (401)
6. ✅ Error handling đầy đủ
7. ✅ Loading states
8. ✅ Form validation
9. ✅ Auto login sau signup
10. ✅ Notification messages (tiếng Việt)

---

**Created:** 2026-01-25
**Status:** ✅ Ready for Testing
