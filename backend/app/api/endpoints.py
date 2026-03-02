from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import aiofiles
import os
from ..models.vulnerability_model import model_instance
from ..utils.file_handler import FileHandler

router = APIRouter(prefix="/api", tags=["vulnerability"])

@router.post("/analyze")
async def analyze_files(files: List[UploadFile] = File(...)):
    """Analyze multiple Java files for vulnerabilities"""
    try:
        # Ensure model is loaded
        if model_instance.model is None:
            model_instance.load_model()
        
        results = []
        file_handler = FileHandler()
        
        for file in files:
            # Check file extension
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in file_handler.SUPPORTED_EXTENSIONS:
                results.append({
                    "filename": file.filename,
                    "error": f"Unsupported file type. Supported: {file_handler.SUPPORTED_EXTENSIONS}"
                })
                continue
            
            # Save and read file
            file_path = await file_handler.save_upload_file(file)
            
            try:
                async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                    content = await f.read()
                
                # Analyze entire file
                file_result = model_instance.predict(content)
                
                # Also analyze individual methods if it's Java
                methods_analysis = []
                if ext == '.java':
                    methods = file_handler.extract_java_methods(content)
                    for method in methods[:10]:  # Limit to 10 methods per file
                        method_result = model_instance.predict(method['code'])
                        if method_result['is_vulnerable']:
                            methods_analysis.append({
                                "method_name": method['name'],
                                "prediction": method_result['prediction'],
                                "confidence": round(method_result['confidence'] * 100, 2)
                            })
                
                results.append({
                    "filename": file.filename,
                    "file_analysis": {
                        "prediction": file_result['prediction'],
                        "confidence": round(file_result['confidence'] * 100, 2),
                        "is_vulnerable": file_result['is_vulnerable'],
                        "all_probabilities": {
                            k: round(v * 100, 2) 
                            for k, v in file_result['all_probabilities'].items()
                        }
                    },
                    "vulnerable_methods": methods_analysis
                })
                
            finally:
                # Cleanup
                file_handler.cleanup_file(file_path)
        
        # Calculate summary statistics
        total_files = len(results)
        vulnerable_files = sum(1 for r in results if r.get('file_analysis', {}).get('is_vulnerable', False))
        
        return {
            "success": True,
            "summary": {
                "total_files": total_files,
                "vulnerable_files": vulnerable_files,
                "clean_files": total_files - vulnerable_files
            },
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Check if the API is running and model is loaded"""
    return {
        "status": "healthy",
        "model_loaded": model_instance.model is not None,
        "device": str(model_instance.device)
    }