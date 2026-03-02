import os
import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import router

# ---------------- LOGGING ---------------- #
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------- APP INIT ---------------- #
app = FastAPI(
    title="Zimbra Vulnerability Detector API",
    version="1.0.0"
)

# ---------------- CORS ---------------- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://zimbra-detector.vercel.app",  # Vercel frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ROUTERS ---------------- #
app.include_router(router)

# ---------------- ROOT ---------------- #
@app.get("/")
async def root():
    return {
        "message": "Zimbra Vulnerability Detector API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "analyze": "/api/analyze",
            "health": "/api/health"
        }
    }

# Fix for Render HEAD request
@app.head("/")
async def head_root():
    return {}

# ---------------- HEALTH CHECK ---------------- #
@app.get("/api/health")
async def health():
    return {
        "status": "healthy"
    }

# ---------------- RENDER PORT ---------------- #
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)