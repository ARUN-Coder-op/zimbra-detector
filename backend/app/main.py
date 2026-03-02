from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Zimbra Vulnerability Detector API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)

@app.on_event("startup")
async def startup_event():
    """Pre-load model on startup"""
    from .models.vulnerability_model import model_instance
    try:
        logger.info("Pre-loading model on startup...")
        model_instance.load_model()
        logger.info("Model pre-loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to pre-load model: {e}")

@app.get("/")
async def root():
    return {
        "message": "Zimbra Vulnerability Detector API",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/api/analyze",
            "health": "/api/health"
        }
    }