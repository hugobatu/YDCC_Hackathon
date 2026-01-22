# 🐟 Quick Reference: Species API Endpoints

## 📋 Endpoints at a Glance

### 1️⃣ Get All Species (Public)
```
GET /api/pool/species/all
```
**No authentication required** ✅  
Returns list of all available species in the system.

**Quick Test:**
```bash
curl http://localhost:8000/api/pool/species/all
```

---

### 2️⃣ Get Pool's Current Species (Protected)
```
GET /api/pool/{pool_id}/species
```
**Authentication required** 🔐  
Returns species information for a specific pool.

**Quick Test:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/pool/YOUR_POOL_ID/species
```

---

## 🚀 Quick Start

### Step 1: Start Server
```bash
cd "c:\Users\quanh\OneDrive\Tài liệu\YDCC_Hackathon\aqua-sentinel"
python -m uvicorn app.main:app --reload
```

### Step 2: Test Endpoints
```bash
# Run the test script
python test_species_api.py
```

### Step 3: View API Docs
Open browser: http://localhost:8000/docs

---

## 📝 Response Examples

### All Species Response
```json
[
  {
    "species_id": "tom",
    "species_name": "Tôm",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

### Pool Species Response
```json
{
  "pool_id": "123e4567-...",
  "pool_name": "Hồ số 1",
  "species": {
    "species_id": "tom",
    "species_name": "Tôm",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

---

## 🔍 Common Use Cases

### Frontend: Populate Species Dropdown
```javascript
fetch('/api/pool/species/all')
  .then(res => res.json())
  .then(species => {
    // Populate your <select> element
    species.forEach(s => {
      console.log(s.species_name);
    });
  });
```

### Frontend: Display Pool's Species
```javascript
const poolId = 'your-pool-id';
const token = 'your-access-token';

fetch(`/api/pool/${poolId}/species`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(res => res.json())
  .then(data => {
    console.log(`Species: ${data.species.species_name}`);
  });
```

---

## 📚 Full Documentation

- **Detailed API Docs:** See `SPECIES_API_DOCS.md`
- **Implementation Summary:** See `IMPLEMENTATION_SUMMARY.md`
- **Test Script:** Run `test_species_api.py`

---

## ⚠️ Important Notes

1. **Public vs Protected:**
   - `/species/all` is PUBLIC (no auth needed)
   - `/{pool_id}/species` is PROTECTED (needs auth)

2. **Authorization:**
   - You can only view species from pools you own
   - Attempting to access another user's pool returns 404

3. **Database:**
   - Make sure your database has species records
   - Check `aquatic_species` table for available species

---

## 🛠️ Files Modified

- ✅ `app/api/pool_management.py` - Added 2 new endpoints
- ✅ `SPECIES_API_DOCS.md` - Complete documentation
- ✅ `test_species_api.py` - Test script
- ✅ `IMPLEMENTATION_SUMMARY.md` - Implementation details
- ✅ `QUICK_REFERENCE.md` - This file

---

**Need help?** Check the detailed docs in `SPECIES_API_DOCS.md`
