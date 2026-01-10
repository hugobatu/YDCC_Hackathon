# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from app.db.connection import get_db
# from app.api.deps import get_current_user
# from app.models.user import User
# from app.models.pool import Pool # Giả định bạn đã tạo Model Pool

# router = APIRouter()

# @router.get("/my-pools")
# def get_my_pools(
#     db: Session = Depends(get_db), 
#     current_user: User = Depends(get_current_user) # BẮT BUỘC ĐĂNG NHẬP
# ):
#     # Lọc hồ theo owner_id của người đang đăng nhập
#     pools = db.query(Pool).filter(Pool.owner_id == current_user.user_id).all()
#     return pools