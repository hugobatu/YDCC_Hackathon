from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
from datetime import datetime

from app.db.connection import get_db
from app.api.deps import get_current_user
from app.models.models import User, Pool, Region, AquaticSpecies
from app.schemas.schema_pool import PoolCreate, PoolOut

from app.core.email import EmailService
from app.core.email_template import POOL_CREATED_EMAIL_HTML, POOL_DELETED_EMAIL_HTML

router = APIRouter()
email_service = EmailService()

# 1. get pools
@router.get("/my-pools", response_model=List[PoolOut])
def get_my_pools(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return db.query(Pool).options(
        joinedload(Pool.region),
        joinedload(Pool.species)
    ).filter(Pool.owner_id == current_user.user_id).all()

# 2. add pool
@router.post("/", response_model=PoolOut, status_code=status.HTTP_201_CREATED)
def create_pool(
    pool_in: PoolCreate,
    background_tasks: BackgroundTasks, # Thêm BackgroundTasks
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    region = db.query(Region).filter(Region.region_name == pool_in.region_name).first()
    species = db.query(AquaticSpecies).filter(AquaticSpecies.species_id == pool_in.species_id).first()
    
    if not region or not species:
        raise HTTPException(404, detail="Vùng miền hoặc loài không tồn tại")

    new_pool = Pool(
        pool_name=pool_in.pool_name,
        region_id=region.region_id,
        species_id=pool_in.species_id,
        owner_id=current_user.user_id
    )
    
    db.add(new_pool)
    db.commit()
    db.refresh(new_pool)

    # background task sending email
    background_tasks.add_task(
        email_service.send_email,
        to=[current_user.email],
        subject="Aqua Sentinel: Tạo hồ mới thành công!",
        body=POOL_CREATED_EMAIL_HTML.format(
            fullname=current_user.fullname,
            pool_name=new_pool.pool_name,
            species_name=species.species_name,
            region_name=region.region_name,
            pool_id=str(new_pool.pool_id)
        ),
        html=True
    )
    return new_pool

# 3. delete pool
@router.delete("/{pool_id}", status_code=status.HTTP_200_OK)
def delete_pool(
    pool_id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pool = db.query(Pool).filter(
        Pool.pool_id == pool_id, 
        Pool.owner_id == current_user.user_id
    ).first()
    
    if not pool:
        raise HTTPException(404, detail="Hồ không tồn tại hoặc bạn không có quyền xoá")
    
    # Lưu lại tên hồ trước khi xoá để đưa vào email
    pool_name_deleted = pool.pool_name
    
    db.delete(pool)
    db.commit()

    # Gửi email cảnh báo xoá dữ liệu
    background_tasks.add_task(
        email_service.send_email,
        to=[current_user.email],
        subject="Aqua Sentinel: Xác nhận xoá hồ nuôi",
        body=POOL_DELETED_EMAIL_HTML.format(
            fullname=current_user.fullname,
            pool_name=pool_name_deleted,
            delete_time=datetime.now().strftime("%H:%M:%S %d/%m/%Y")
        ),
        html=True
    )
    return {
        "message": "Xoá hồ thành công",
        "pool_id": str(pool.pool_id),
        "pool_name": pool_name_deleted
    }