from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional, List

# Schema trả về cho Vùng và Loài (để nhúng vào thông tin hồ)
class RegionSimple(BaseModel):
    region_id: UUID
    region_name: str
    class Config: from_attributes = True

class SpeciesSimple(BaseModel):
    species_id: str
    species_name: str
    class Config: from_attributes = True

# Schema dùng để THÊM hồ mới
class PoolCreate(BaseModel):
    pool_name: str
    region_name: str
    species_id: str

# Schema trả về khi LẤY thông tin hồ (bao gồm thông tin vùng và loài)
class PoolOut(BaseModel):
    pool_id: UUID
    pool_name: str
    owner_id: UUID
    region: RegionSimple
    species: SpeciesSimple
    created_at: datetime
    
    class Config:
        from_attributes = True