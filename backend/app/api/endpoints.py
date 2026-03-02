from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
from ..models.vulnerability_model import model_instance

router = APIRouter(prefix="/api", tags=["vulnerability"])


@router.post("/analyze")
async def analyze_files(files: List[UploadFile] = File(...)):

    results = []

    for file in files:

        ext = os.path.splitext(file.filename)[1].lower()

        if ext != ".java":
            results.append({
                "filename": file.filename,
                "error": "Only .java files supported"
            })
            continue

        try:
            content = await file.read()
            content = content.decode("utf-8")

            prediction = model_instance.predict(content)

            if "error" in prediction:
                raise HTTPException(status_code=400, detail=prediction["error"])

            results.append({
                "filename": file.filename,
                "analysis": prediction
            })

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return {
        "success": True,
        "results": results
    }


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_type": "HuggingFace API"
    }