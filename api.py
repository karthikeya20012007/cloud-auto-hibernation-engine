from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ai.chatbot_logic import chatbot_estimate_cost

app = FastAPI(title="Cloud Auto-Hibernation Engine API")

# CORS (for React Native / frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
def root():
    return {"status": "API running"}

# Existing VM list (mock)
@app.get("/vms")
def list_vms():
    return [
        {"id": "vm-1", "state": "running", "cpu": 15},
        {"id": "vm-2", "state": "idle", "cpu": 2},
    ]

# 🔥 NEW: Chatbot cost estimation endpoint
@app.post("/chatbot/estimate-cost")
def estimate_vm_cost(payload: dict):
    """
    Expected input:
    {
        "vm_name": "vm-1",
        "hours_per_day": 3
    }
    """
    return chatbot_estimate_cost(
        payload["vm_name"],
        payload["hours_per_day"]
    )
