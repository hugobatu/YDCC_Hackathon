# 📘 Aqua Sentinel AI - API Documentation

> **Phiên bản**: 2.0.0  
> **Base URL**: `http://localhost:8000/api`  
> **Mục đích**: Tài liệu API cho việc tích hợp Frontend

---

## 📑 Mục Lục

1. [Authentication APIs](#1-authentication-apis)
2. [Pool Management APIs](#2-pool-management-apis)
3. [Prediction & Analysis APIs](#3-prediction--analysis-apis)
4. [Data Models](#4-data-models)
5. [Error Handling](#5-error-handling)

---

## 1. Authentication APIs

### 1.1 Đăng Ký Tài Khoản

**Endpoint**: `POST /api/signup`

**Mô tả**: Tạo tài khoản người dùng mới. Hệ thống sẽ tự động gửi email chào mừng.

**Request Body**:
```json
{
  "email": "user@example.com",
  "fullname": "Nguyễn Văn A",
  "password": "securepassword123"
}
```

**Response** (201 Created):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "fullname": "Nguyễn Văn A",
  "created_at": "2026-01-25T01:00:00.000Z"
}
```

**Errors**:
- `400 Bad Request`: Email đã được đăng ký
- `422 Unprocessable Entity`: Dữ liệu không hợp lệ

---

### 1.2 Đăng Nhập

**Endpoint**: `POST /api/login`

**Mô tả**: Đăng nhập và nhận JWT access token.

**Request Body** (Form Data - OAuth2PasswordRequestForm):
```
username: user@example.com  (chú ý: dùng email làm username)
password: securepassword123
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors**:
- `401 Unauthorized`: Email hoặc mật khẩu không chính xác

**Cách sử dụng token**:
```javascript
// Thêm vào header của các request sau này
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

---

## 2. Pool Management APIs

### 2.1 Lấy Danh Sách Loài Thủy Sản

**Endpoint**: `GET /api/pool/species/all`

**Mô tả**: Lấy tất cả loài thủy sản có sẵn (dùng cho dropdown/selection).

**Authentication**: Không yêu cầu

**Response** (200 OK):
```json
[
  {
    "species_id": "tom",
    "species_name": "Tôm",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  },
  {
    "species_id": "ca",
    "species_name": "Cá",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  },
  {
    "species_id": "cua",
    "species_name": "Cua",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### 2.2 Lấy Danh Sách Hồ Của Tôi

**Endpoint**: `GET /api/pool/my-pools`

**Mô tả**: Lấy tất cả hồ nuôi thuộc sở hữu của người dùng hiện tại.

**Authentication**: ✅ Yêu cầu (Bearer Token)

**Response** (200 OK):
```json
[
  {
    "pool_id": "123e4567-e89b-12d3-a456-426614174000",
    "pool_name": "Hồ Tôm Số 1",
    "owner_id": "550e8400-e29b-41d4-a716-446655440000",
    "region": {
      "region_id": "789e4567-e89b-12d3-a456-426614174000",
      "region_name": "Miền Nam"
    },
    "species": {
      "species_id": "tom",
      "species_name": "Tôm"
    },
    "created_at": "2026-01-20T10:30:00.000Z"
  }
]
```

**Errors**:
- `401 Unauthorized`: Token không hợp lệ hoặc hết hạn

---

### 2.3 Tạo Hồ Mới

**Endpoint**: `POST /api/pool/`

**Mô tả**: Tạo hồ nuôi mới. Hệ thống sẽ:
- Gửi email xác nhận
- Tự động seed 24 điểm dữ liệu ban đầu (2 giờ với tần suất 5 phút)

**Authentication**: ✅ Yêu cầu (Bearer Token)

**Request Body**:
```json
{
  "pool_name": "Hồ Tôm Số 2",
  "region_name": "Miền Bắc",
  "species_id": "tom"
}
```

**Response** (201 Created):
```json
{
  "pool_id": "456e4567-e89b-12d3-a456-426614174111",
  "pool_name": "Hồ Tôm Số 2",
  "owner_id": "550e8400-e29b-41d4-a716-446655440000",
  "region": {
    "region_id": "789e4567-e89b-12d3-a456-426614174001",
    "region_name": "Miền Bắc"
  },
  "species": {
    "species_id": "tom",
    "species_name": "Tôm"
  },
  "created_at": "2026-01-25T01:30:00.000Z"
}
```

**Errors**:
- `404 Not Found`: Vùng miền hoặc loài không tồn tại
- `401 Unauthorized`: Token không hợp lệ

**Regions có sẵn**:
- `"Miền Bắc"`
- `"Miền Trung"`
- `"Miền Nam"`

---

### 2.4 Lấy Thông Tin Loài Trong Hồ

**Endpoint**: `GET /api/pool/{pool_id}/species`

**Mô tả**: Lấy thông tin loài thủy sản đang được nuôi trong hồ cụ thể.

**Authentication**: ✅ Yêu cầu (Bearer Token)

**Path Parameters**:
- `pool_id` (UUID): ID của hồ nuôi

**Response** (200 OK):
```json
{
  "pool_id": "123e4567-e89b-12d3-a456-426614174000",
  "pool_name": "Hồ Tôm Số 1",
  "species": {
    "species_id": "tom",
    "species_name": "Tôm",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

**Errors**:
- `404 Not Found`: Hồ không tồn tại hoặc bạn không có quyền truy cập

---

### 2.5 Xóa Hồ

**Endpoint**: `DELETE /api/pool/{pool_id}`

**Mô tả**: Xóa hồ nuôi. Hệ thống sẽ gửi email xác nhận xóa.

**Authentication**: ✅ Yêu cầu (Bearer Token)

**Path Parameters**:
- `pool_id` (UUID): ID của hồ nuôi

**Response** (200 OK):
```json
{
  "message": "Xoá hồ thành công",
  "pool_id": "123e4567-e89b-12d3-a456-426614174000",
  "pool_name": "Hồ Tôm Số 1"
}
```

**Errors**:
- `404 Not Found`: Hồ không tồn tại hoặc bạn không có quyền xoá

---

### 2.6 Lấy Chỉ Số Đo Mới Nhất

**Endpoint**: `GET /api/pool/{pool_id}/measurements`

**Mô tả**: Lấy bản ghi đo lường nước mới nhất của hồ.

**Authentication**: ✅ Yêu cầu (Bearer Token)

**Path Parameters**:
- `pool_id` (UUID): ID của hồ nuôi

**Response** (200 OK):
```json
{
  "measure_id": "890e4567-e89b-12d3-a456-426614174888",
  "dissolved_oxygen": 6.5,
  "ph": 7.8,
  "amonia": 0.05,
  "turbidity": 25.4,
  "temperature": 28.5,
  "created_at": "2026-01-25T02:00:00.000Z"
}
```
*Hoặc `null` nếu chưa có dữ liệu.*

**Errors**:
- `404 Not Found`: Hồ không tồn tại hoặc bạn không có quyền truy cập

---

## 3. Prediction & Analysis APIs

### 3.1 Dự Báo Chất Lượng Nước

**Endpoint**: `POST /api/predict`

**Mô tả**: Dự báo chất lượng nước 30 phút tới và đánh giá rủi ro.

**Cơ chế tự động**: 
- Nếu không truyền `history`, hệ thống sẽ **TỰ ĐỘNG LẤY 24 điểm đo mới nhất** từ database
- Yêu cầu tối thiểu: **24 điểm dữ liệu** (2 giờ với tần suất 5 phút)

**Authentication**: Tùy chọn (hiện tại đã tắt để test)

**Request Body**:

**Cách 1: Tự động lấy từ database (Khuyên dùng)**
```json
{
  "pool_id": "123e4567-e89b-12d3-a456-426614174000",
  "species": "tom"
}
```

**Cách 2: Truyền history thủ công**
```json
{
  "pool_id": "123e4567-e89b-12d3-a456-426614174000",
  "species": "tom",
  "history": [
    {
      "timestamp": "2026-01-25 00:00:00",
      "temperature": 28.5,
      "dissolved_oxygen": 6.2,
      "ph": 7.8,
      "turbidity": 15.3,
      "ammonia": 0.12,
      "rain_event": 0,
      "feeding_event": 1
    },
    // ... 23 điểm nữa
  ]
}
```

**Response** (200 OK):
```json
{
  "species": "tom",
  "current_values": {
    "temperature": 28.5,
    "dissolved_oxygen": 6.2,
    "ph": 7.8,
    "turbidity": 15.3,
    "ammonia": 0.12
  },
  "prediction_next_30min": {
    "temperature": 28.7,
    "dissolved_oxygen": 6.1,
    "ph": 7.75,
    "turbidity": 15.8,
    "ammonia": 0.13
  },
  "risk_level": "low",
  "details": [
    "Nhiệt độ trong ngưỡng an toàn",
    "Oxy hòa tan đủ cho tôm",
    "pH ổn định"
  ],
  "thresholds": {
    "temperature": {"min": 26, "max": 32, "optimal": [28, 30]},
    "dissolved_oxygen": {"min": 5, "optimal": 6},
    "ph": {"min": 7, "max": 8.5, "optimal": [7.5, 8]},
    "ammonia": {"max": 0.5, "warning": 0.3}
  }
}
```

**Risk Levels**:
- `"low"`: An toàn
- `"medium"`: Cảnh báo
- `"high"`: Nguy hiểm
- `"critical"`: Rất nguy hiểm

**Errors**:
- `400 Bad Request`: 
  - Không đủ dữ liệu (cần tối thiểu 24 điểm)
  - Chỉ có X điểm trong database
- `422 Unprocessable Entity`: Dữ liệu không hợp lệ

---

### 3.2 Phân Tích Với AI (LLM Pipeline)

**Endpoint**: `POST /api/analyze-with-llm`

**Mô tả**: Pipeline tự động hoàn chỉnh:
1. ✅ Tự động lấy 24 điểm đo mới nhất từ database
2. ✅ Dự báo chất lượng nước 30 phút tới
3. ✅ Đánh giá rủi ro
4. ✅ Load tin tức môi trường từ thư mục `news/`
5. ✅ Gửi tất cả dữ liệu cho LLM để phân tích
6. ✅ Trả về phân tích AI chi tiết với khuyến nghị hành động

**Authentication**: Tùy chọn (hiện tại đã tắt để test)

**Request Body**:
```json
{
  "pool_id": "123e4567-e89b-12d3-a456-426614174000",
  "species": "tom",
  "include_raw_prompt": false
}
```

**Parameters**:
- `pool_id` (string, required): ID của hồ nuôi
- `species` (string, optional): Loài thủy sản (`"tom"`, `"ca"`, `"cua"`). Mặc định: `"tom"`
- `include_raw_prompt` (boolean, optional): Có trả về raw prompt không (cho debug). Mặc định: `false`

**Response** (200 OK):
```json
{
  "analysis": {
    "overall_assessment": "Tình trạng hồ nuôi hiện tại ổn định. Các chỉ số nằm trong ngưỡng an toàn cho tôm. Dự báo 30 phút tới cho thấy xu hướng tích cực.",
    "potential_risks": [
      {
        "risk": "Ammonia có xu hướng tăng nhẹ",
        "severity": "medium",
        "explanation": "Dự báo cho thấy ammonia tăng từ 0.12 lên 0.13 mg/L. Mặc dù vẫn trong ngưỡng an toàn, cần theo dõi để tránh vượt ngưỡng 0.3 mg/L."
      }
    ],
    "recommendations": [
      {
        "action": "Kiểm tra hệ thống sục khí",
        "priority": "medium",
        "reason": "Oxy hòa tan dự báo giảm nhẹ từ 6.2 xuống 6.1 mg/L",
        "expected_impact": "Duy trì oxy ổn định trên 6.0 mg/L"
      },
      {
        "action": "Theo dõi nhiệt độ nước",
        "priority": "low",
        "reason": "Nhiệt độ dự báo tăng lên 28.7°C, vẫn trong ngưỡng tối ưu"
      }
    ],
    "environmental_impact": "Thời tiết ổn định, không có mưa dự báo trong khu vực. Điều kiện thuận lợi cho nuôi trồng thủy sản.",
    "priority_actions": [
      "Kiểm tra hệ thống sục khí trong 1 giờ tới",
      "Chuẩn bị kế hoạch thay nước nếu ammonia tiếp tục tăng"
    ]
  },
  "context": {
    "timestamp": "2026-01-25T01:44:15+07:00",
    "species": "tom",
    "prediction": {
      "temperature": 28.7,
      "dissolved_oxygen": 6.1,
      "ph": 7.75,
      "turbidity": 15.8,
      "ammonia": 0.13
    },
    "current_values": {
      "temperature": 28.5,
      "dissolved_oxygen": 6.2,
      "ph": 7.8,
      "turbidity": 15.3,
      "ammonia": 0.12
    },
    "risk_assessment": {
      "level": "low",
      "details": [
        "Nhiệt độ trong ngưỡng an toàn",
        "Oxy hòa tan đủ cho tôm",
        "pH ổn định"
      ]
    },
    "news": {
      "environment": [
        {
          "title": "Thời tiết ổn định tại Đồng bằng sông Cửu Long",
          "summary": "Không có mưa lớn trong 3 ngày tới..."
        }
      ]
    }
  }
}
```

**Response với `include_raw_prompt: true`**:
```json
{
  "analysis": { ... },
  "context": { ... },
  "raw_prompt": "Bạn là chuyên gia nuôi trồng thủy sản. Hãy phân tích dữ liệu sau:..."
}
```

**Errors**:
- `400 Bad Request`: Không đủ dữ liệu trong database (cần tối thiểu 24 điểm)
- `500 Internal Server Error`: Lỗi khi gọi LLM API

---

## 4. Data Models

### 4.1 SensorPoint
Dữ liệu đo từ cảm biến tại một thời điểm.

```typescript
interface SensorPoint {
  timestamp: string;          // "YYYY-MM-DD HH:MM:SS"
  temperature: number;        // độ C
  dissolved_oxygen: number;   // mg/L
  ph: number;                 // 0-14
  turbidity: number;          // NTU
  ammonia: number;            // mg/L
  rain_event: number;         // 0 hoặc 1
  feeding_event: number;      // 0 hoặc 1
}
```

### 4.2 User
```typescript
interface User {
  user_id: string;           // UUID
  email: string;
  fullname: string;
  created_at: string;        // ISO 8601
}
```

### 4.3 Pool
```typescript
interface Pool {
  pool_id: string;           // UUID
  pool_name: string;
  owner_id: string;          // UUID
  region: {
    region_id: string;       // UUID
    region_name: string;
  };
  species: {
    species_id: string;      // "tom", "ca", "cua"
    species_name: string;
  };
  created_at: string;        // ISO 8601
}
```

### 4.4 Species
```typescript
interface Species {
  species_id: string;        // "tom", "ca", "cua"
  species_name: string;
  created_at: string;
  updated_at: string;
}
```

---

## 5. Error Handling

### Các mã lỗi HTTP phổ biến:

| Status Code | Ý nghĩa | Ví dụ |
|-------------|---------|-------|
| `200 OK` | Thành công | Lấy dữ liệu thành công |
| `201 Created` | Tạo mới thành công | Tạo hồ mới |
| `400 Bad Request` | Dữ liệu không hợp lệ | Thiếu dữ liệu bắt buộc |
| `401 Unauthorized` | Chưa xác thực | Token không hợp lệ |
| `403 Forbidden` | Không có quyền | Truy cập hồ của người khác |
| `404 Not Found` | Không tìm thấy | Hồ không tồn tại |
| `422 Unprocessable Entity` | Validation error | Email không đúng định dạng |
| `500 Internal Server Error` | Lỗi server | Lỗi database, LLM API |

### Format lỗi chuẩn:
```json
{
  "detail": "Không đủ dữ liệu trong database. Cần tối thiểu 24 điểm, chỉ có 10 điểm."
}
```

---

## 6. Frontend Integration Examples

### 6.1 Setup Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Tự động thêm token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 6.2 Login Flow
```javascript
// Login
const login = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email); // Chú ý: dùng 'username'
  formData.append('password', password);
  
  const response = await api.post('/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  // Lưu token
  localStorage.setItem('access_token', response.data.access_token);
  
  return response.data;
};
```

### 6.3 Lấy Danh Sách Hồ
```javascript
const getMyPools = async () => {
  const response = await api.get('/pool/my-pools');
  return response.data;
};
```

### 6.4 Dự Báo Tự Động
```javascript
const predictWaterQuality = async (poolId, species = 'tom') => {
  const response = await api.post('/predict', {
    pool_id: poolId,
    species: species
    // Không cần truyền history, API sẽ tự lấy từ DB
  });
  
  return response.data;
};
```

### 6.5 Phân Tích AI
```javascript
const analyzeWithAI = async (poolId, species = 'tom') => {
  const response = await api.post('/analyze-with-llm', {
    pool_id: poolId,
    species: species,
    include_raw_prompt: false
  });
  
  return response.data;
};

// Sử dụng
const result = await analyzeWithAI('123e4567-e89b-12d3-a456-426614174000', 'tom');
console.log(result.analysis.overall_assessment);
console.log(result.analysis.recommendations);
```

### 6.6 Error Handling
```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Server trả về lỗi
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        alert(`Dữ liệu không hợp lệ: ${data.detail}`);
        break;
      case 401:
        // Token hết hạn, redirect về trang login
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        break;
      case 404:
        alert('Không tìm thấy tài nguyên');
        break;
      default:
        alert('Có lỗi xảy ra, vui lòng thử lại');
    }
  } else if (error.request) {
    // Request được gửi nhưng không nhận được response
    alert('Không thể kết nối đến server');
  } else {
    // Lỗi khác
    alert('Có lỗi xảy ra: ' + error.message);
  }
};

// Sử dụng
try {
  const pools = await getMyPools();
} catch (error) {
  handleApiError(error);
}
```

---

## 7. Testing với cURL

### Login
```bash
curl -X POST "http://localhost:8000/api/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword123"
```

### Lấy Danh Sách Hồ
```bash
curl -X GET "http://localhost:8000/api/pool/my-pools" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Dự Báo
```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "pool_id": "123e4567-e89b-12d3-a456-426614174000",
    "species": "tom"
  }'
```

### Phân Tích AI
```bash
curl -X POST "http://localhost:8000/api/analyze-with-llm" \
  -H "Content-Type: application/json" \
  -d '{
    "pool_id": "123e4567-e89b-12d3-a456-426614174000",
    "species": "tom",
    "include_raw_prompt": false
  }'
```

---

## 8. Important Notes

### 8.1 Về Dữ Liệu
- ✅ API `/predict` và `/analyze-with-llm` **TỰ ĐỘNG LẤY** 24 điểm đo mới nhất từ database
- ✅ Không cần truyền `history` thủ công
- ⚠️ Cần đảm bảo có **ít nhất 24 điểm dữ liệu** trong database (2 giờ với tần suất 5 phút)
- 🔄 Hệ thống simulation tự động tạo dữ liệu mỗi 5 phút

### 8.2 Về Authentication
- 🔒 Hiện tại auth đã **TẠM TẮT** ở `/predict` và `/analyze-with-llm` để dễ test
- ✅ Pool management APIs **YÊU CẦU** authentication
- 🔑 Token có thời hạn, cần handle refresh token ở production

### 8.3 Về Species
Các giá trị hợp lệ:
- `"tom"` - Tôm
- `"ca"` - Cá
- `"cua"` - Cua

### 8.4 Về Regions
Các giá trị hợp lệ:
- `"Miền Bắc"`
- `"Miền Trung"`
- `"Miền Nam"`

---

## 9. API Endpoint Summary

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `POST` | `/api/signup` | ❌ | Đăng ký tài khoản |
| `POST` | `/api/login` | ❌ | Đăng nhập |
| `GET` | `/api/pool/species/all` | ❌ | Lấy danh sách loài |
| `GET` | `/api/pool/my-pools` | ✅ | Lấy danh sách hồ của tôi |
| `POST` | `/api/pool/` | ✅ | Tạo hồ mới |
| `GET` | `/api/pool/{pool_id}/species` | ✅ | Lấy loài trong hồ |
| `DELETE` | `/api/pool/{pool_id}` | ✅ | Xóa hồ |
| `GET` | `/api/pool/{pool_id}/measurements` | ✅ | Lấy chỉ số mới nhất |
| `POST` | `/api/predict` | ⚠️ | Dự báo chất lượng nước |
| `POST` | `/api/analyze-with-llm` | ⚠️ | Phân tích AI toàn diện |

**Chú thích**:
- ✅ = Yêu cầu authentication
- ❌ = Không yêu cầu authentication
- ⚠️ = Đã tắt authentication để test (sẽ bật lại ở production)

---

## 10. Contact & Support

- **API Version**: 2.0.0
- **FastAPI Docs**: http://localhost:8000/docs (Swagger UI tự động)
- **ReDoc**: http://localhost:8000/redoc

**Cập nhật**: 2026-01-25
