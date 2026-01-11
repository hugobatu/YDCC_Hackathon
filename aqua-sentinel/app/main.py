from fastapi import FastAPI
from app.api import predict
from app.api import auth
from app.api import pool_management

app = FastAPI(
    title="Aqua Sentinel AI",
    description="Hệ thống dự báo chất lượng nước và cảnh báo rủi ro nuôi trồng thủy sản",
    version="2.0.0"
)

app.include_router(predict.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(pool_management.router, prefix="/api/pool")

@app.get("/")
async def root():
    return {"message": "Aqua Sentinel AI API is running"}