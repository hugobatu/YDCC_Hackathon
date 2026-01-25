from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import predict
from app.api import auth
from app.api import pool_management
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Aqua Sentinel AI",
    description="Hệ thống dự báo chất lượng nước và cảnh báo rủi ro nuôi trồng thủy sản",
    version="2.0.0"
)

# Cấu hình CORS cho frontend
# Lấy danh sách origins từ biến môi trường, mặc định cho phép tất cả (*) nếu không thiết lập
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = allowed_origins_env.split(",") if allowed_origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(pool_management.router, prefix="/api/pool")

@app.get("/")
async def root():
    return {"message": "Aqua Sentinel AI API is running"}

# Init Simulation on Startup
from app.services.simulation_service import simulation_service

@app.on_event("startup")
async def startup_event():
    # Chỉ bật internal simulation nếu biến môi trường ENABLE_INTERNAL_SIMULATION=true
    # Trên VPS đã có service simulation riêng nên mặc định sẽ tắt để tránh trùng lặp
    if os.getenv("ENABLE_INTERNAL_SIMULATION", "false").lower() == "true":
        print("Starting internal simulation service...")
        await simulation_service.start()
    else:
        print("Internal simulation service disabled (ENABLE_INTERNAL_SIMULATION is not true)")

@app.on_event("shutdown")
async def shutdown_event():
    await simulation_service.stop()


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT_APP", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)