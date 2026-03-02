# Project Setup Guide
Python Version Used: 3.14.1  
If any issue occurs, use Python 3.10


## Tested Environment
Python: 3.14.1  
Node: 18+  
OS: Windows



## Backend Setup
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

Open:
http://127.0.0.1:8000/docs


## Frontend Setup
cd frontend
npm install
npm run dev

Open:
http://localhost:3000