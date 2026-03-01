import os
import aiofiles
from typing import List, Dict
import re

class FileHandler:
    SUPPORTED_EXTENSIONS = {'.java', '.jsp', '.xml'}
    
    @staticmethod
    async def save_upload_file(file, upload_dir: str = "uploads"):
        """Save uploaded file to disk"""
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return file_path
    
    @staticmethod
    def extract_java_methods(content: str) -> List[Dict[str, str]]:
        """Extract individual Java methods for granular analysis"""
        # Simple method extraction regex
        method_pattern = r'(public|private|protected)?\s+\w+\s+(\w+)\s*\([^)]*\)\s*\{([^}]+)\}'
        methods = []
        
        for match in re.finditer(method_pattern, content, re.DOTALL):
            methods.append({
                'name': match.group(2),
                'code': match.group(0)
            })
        
        return methods
    
    @staticmethod
    def cleanup_file(file_path: str):
        """Remove temporary file"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error cleaning up {file_path}: {e}")