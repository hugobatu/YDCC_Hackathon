import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.connection import Base # Giả định bạn đã có Base ở file database.py

# 1. Bảng Vùng Miền (Region)
class Region(Base):
    __tablename__ = "region"

    region_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    region_name = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=text("now() AT TIME ZONE 'utc'"))
    updated_at = Column(DateTime, server_default=text("now() AT TIME ZONE 'utc'"))

    # Quan hệ: Một vùng có nhiều hồ
    pools = relationship("Pool", back_populates="region")

# 2. Bảng Loài Thủy Sản (AquaticSpecies)
class AquaticSpecies(Base):
    __tablename__ = "aquatic_species"

    species_id = Column(String, primary_key=True) # Lưu ý: SQL của bạn dùng String làm PK
    species_name = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=text("now() AT TIME ZONE 'utc'"))
    updated_at = Column(DateTime, server_default=text("now() AT TIME ZONE 'utc'"))

    # Quan hệ: Một loài có thể được nuôi trong nhiều hồ
    pools = relationship("Pool", back_populates="species")

# 3. Bảng Người Dùng (User)
class User(Base):
    __tablename__ = "user"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fullname = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=text("now() AT TIME ZONE 'utc'"))
    updated_at = Column(DateTime, server_default=text("now() AT TIME ZONE 'utc'"))

    # Quan hệ: Một người dùng sở hữu nhiều hồ
    pools = relationship("Pool", back_populates="owner")

# 4. Bảng Hồ Nuôi (Pool)
class Pool(Base):
    __tablename__ = "pool"

    pool_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pool_name = Column(String, nullable=False)
    
    # Khóa ngoại
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)
    region_id = Column(UUID(as_uuid=True), ForeignKey("region.region_id"), nullable=False)
    species_id = Column(String, ForeignKey("aquatic_species.species_id"), nullable=False)
    
    created_at = Column(DateTime, server_default=text("now() AT TIME ZONE 'utc'"))
    updated_at = Column(DateTime, server_default=text("now() AT TIME ZONE 'utc'"))

    # Quan hệ ngược lại
    owner = relationship("User", back_populates="pools")
    region = relationship("Region", back_populates="pools")
    species = relationship("AquaticSpecies", back_populates="pools")
    
    # Quan hệ: Một hồ có nhiều bản đo nước
    measurements = relationship("WaterMeasurement", back_populates="pool", cascade="all, delete-orphan")

# 5. Bảng Đo Lường Nước (WaterMeasurement)
class WaterMeasurement(Base):
    __tablename__ = "water_measurement"

    measure_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dissolved_oxygen = Column(Float)
    ph = Column(Float)
    amonia = Column(Float)
    turbidity = Column(Float)
    temperature = Column(Float)
    
    pool_id = Column(UUID(as_uuid=True), ForeignKey("pool.pool_id"), nullable=False)
    
    created_at = Column(DateTime, nullable=False) # Lấy từ sensor timestamp
    updated_at = Column(DateTime, nullable=False)

    # Quan hệ ngược lại
    pool = relationship("Pool", back_populates="measurements")