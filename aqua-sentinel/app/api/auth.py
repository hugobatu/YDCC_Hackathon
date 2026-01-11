from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.connection import get_db
from app.models.models import User
from app.schemas.schema_user import UserCreate, UserOut, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.email import EmailService
from app.core.email_template import WELCOME_EMAIL_HTML

router = APIRouter()
email_service = EmailService()

# 1. signup
@router.post("/signup", response_model=UserOut)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user_exists = db.query(User).filter(User.email == user_in.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")
    
    new_user = User(
        email=user_in.email,
        fullname=user_in.fullname,
        password=get_password_hash(user_in.password)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    email_service.send_email(
        to=[new_user.email],
        subject="Chào mừng bạn đến với Aqua Sentinel",
        body=WELCOME_EMAIL_HTML.format(
            fullname=new_user.fullname,
            email=new_user.email
        ),
        html=True
    )
    return new_user

# 2. login
@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác"
        )
    
    # Tạo Token
    access_token = create_access_token(data={"sub": str(user.user_id)})
    return {"access_token": access_token, "token_type": "bearer"}