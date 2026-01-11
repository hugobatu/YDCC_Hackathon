from fastapi import FastAPI
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

app.include_router(predict.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(pool_management.router, prefix="/api/pool")

@app.get("/")
async def root():
    return {"message": "Aqua Sentinel AI API is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT_APP", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)