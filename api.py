from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Cloud Auto-Hibernation Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "API running"}

@app.get("/vms")
def list_vms():
    return [
        {"id": "vm-1", "state": "running", "cpu": 15},
        {"id": "vm-2", "state": "idle", "cpu": 2},
    ]
