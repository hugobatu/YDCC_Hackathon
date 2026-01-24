from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class WaterMeasurementOut(BaseModel):
    measure_id: UUID
    dissolved_oxygen: Optional[float]
    ph: Optional[float]
    amonia: Optional[float]
    turbidity: Optional[float]
    temperature: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True
