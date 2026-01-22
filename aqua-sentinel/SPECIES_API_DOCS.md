# Species API Endpoints Documentation

## Overview
This document describes the API endpoints for fetching species information in the Aqua Sentinel system.

## Endpoints

### 1. Get All Available Species
**Endpoint:** `GET /api/pool/species/all`

**Description:** Retrieves all available aquatic species in the system. This is useful for populating dropdown menus when creating or editing pools.

**Authentication:** None required (public endpoint)

**Request:**
```http
GET /api/pool/species/all HTTP/1.1
Host: localhost:8000
```

**Response:**
```json
[
  {
    "species_id": "tom",
    "species_name": "Tôm",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  },
  {
    "species_id": "ca_tra",
    "species_name": "Cá Tra",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

**Status Codes:**
- `200 OK`: Successfully retrieved species list

---

### 2. Get Species from a Specific Pool
**Endpoint:** `GET /api/pool/{pool_id}/species`

**Description:** Retrieves the species information for a specific pool. The user must own the pool to access this information.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `pool_id` (UUID): The unique identifier of the pool

**Request:**
```http
GET /api/pool/123e4567-e89b-12d3-a456-426614174000/species HTTP/1.1
Host: localhost:8000
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "pool_id": "123e4567-e89b-12d3-a456-426614174000",
  "pool_name": "Hồ số 1",
  "species": {
    "species_id": "tom",
    "species_name": "Tôm",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

**Status Codes:**
- `200 OK`: Successfully retrieved species information
- `404 Not Found`: Pool does not exist or user does not have access
- `401 Unauthorized`: User is not authenticated

---

## Usage Examples

### Python (using requests)

#### Get All Species
```python
import requests

# Get all available species
response = requests.get("http://localhost:8000/api/pool/species/all")
species_list = response.json()

for species in species_list:
    print(f"{species['species_id']}: {species['species_name']}")
```

#### Get Species from a Pool
```python
import requests

pool_id = "123e4567-e89b-12d3-a456-426614174000"
access_token = "YOUR_ACCESS_TOKEN"

headers = {
    "Authorization": f"Bearer {access_token}"
}

response = requests.get(
    f"http://localhost:8000/api/pool/{pool_id}/species",
    headers=headers
)

pool_species = response.json()
print(f"Pool: {pool_species['pool_name']}")
print(f"Species: {pool_species['species']['species_name']}")
```

### JavaScript (using fetch)

#### Get All Species
```javascript
// Get all available species
fetch('http://localhost:8000/api/pool/species/all')
  .then(response => response.json())
  .then(speciesList => {
    speciesList.forEach(species => {
      console.log(`${species.species_id}: ${species.species_name}`);
    });
  });
```

#### Get Species from a Pool
```javascript
const poolId = '123e4567-e89b-12d3-a456-426614174000';
const accessToken = 'YOUR_ACCESS_TOKEN';

fetch(`http://localhost:8000/api/pool/${poolId}/species`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
  .then(response => response.json())
  .then(poolSpecies => {
    console.log(`Pool: ${poolSpecies.pool_name}`);
    console.log(`Species: ${poolSpecies.species.species_name}`);
  });
```

### cURL

#### Get All Species
```bash
curl -X GET "http://localhost:8000/api/pool/species/all"
```

#### Get Species from a Pool
```bash
curl -X GET "http://localhost:8000/api/pool/123e4567-e89b-12d3-a456-426614174000/species" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Integration with Frontend

### React Example (Dropdown)
```jsx
import React, { useState, useEffect } from 'react';

function SpeciesDropdown() {
  const [species, setSpecies] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState('');

  useEffect(() => {
    // Fetch all available species
    fetch('http://localhost:8000/api/pool/species/all')
      .then(response => response.json())
      .then(data => setSpecies(data))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <select 
      value={selectedSpecies} 
      onChange={(e) => setSelectedSpecies(e.target.value)}
    >
      <option value="">-- Chọn loài thủy sản --</option>
      {species.map(sp => (
        <option key={sp.species_id} value={sp.species_id}>
          {sp.species_name}
        </option>
      ))}
    </select>
  );
}
```

---

## Notes

1. **Authentication**: The `/species/all` endpoint is public and doesn't require authentication, making it easy to populate dropdowns before user login. The `/{pool_id}/species` endpoint requires authentication to protect user data.

2. **Authorization**: When fetching species from a specific pool, the system verifies that the authenticated user owns the pool. This ensures data privacy and security.

3. **Performance**: The `/species/all` endpoint uses a simple query without joins, making it fast and suitable for frequent calls.

4. **Eager Loading**: The `/{pool_id}/species` endpoint uses SQLAlchemy's `joinedload` for efficient database queries, reducing the number of round trips to the database.

---

## Error Handling

### Example Error Response (404)
```json
{
  "detail": "Hồ không tồn tại hoặc bạn không có quyền truy cập"
}
```

### Example Error Response (401)
```json
{
  "detail": "Not authenticated"
}
```
