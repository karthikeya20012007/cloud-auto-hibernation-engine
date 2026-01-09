from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from ai.chatbot_logic import chatbot_estimate_cost

app = FastAPI(title="Cloud Auto-Hibernation Engine API")

# -------------------------------------------------
# CORS (Frontend / Expo / Web)
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------
@app.get("/")
def root():
    return {"status": "API running"}

# -------------------------------------------------
# CHATBOT COST ESTIMATION
# -------------------------------------------------
@app.post("/chatbot/estimate-cost")
def estimate_vm_cost(payload: dict):
    """
    Expected input:
    {
        "vm_name": "vm-1",
        "hours_per_day": 3
    }
    """
    if "vm_name" not in payload or "hours_per_day" not in payload:
        raise HTTPException(status_code=400, detail="Invalid request payload")

    return chatbot_estimate_cost(
        payload["vm_name"],
        payload["hours_per_day"]
    )

# -------------------------------------------------
# POLICY
# -------------------------------------------------
POLICY = {
    "idle_warn_minutes": 45,
    "idle_stop_minutes": 60,
    "cpu_idle_threshold": 10,
    "require_approval_for": ["finance", "prod-critical"],
}

# -------------------------------------------------
# COMPUTE RESOURCES (MOCK DATA)
# -------------------------------------------------
COMPUTE_RESOURCES = [
    {
        "id": "prod-eu-west1-api-gateway-vm-01",
        "type": "compute-vm",
        "instance_type": "n2-standard-4",
        "cpu": 6,
        "idle_minutes": 52,
        "state": "running",
        "tags": ["prod-critical"],
        "cost": {"gcp": 140, "aws": 165, "azure": 158},
    },
    {
        "id": "staging-us-central1-ml-inference-vm-02",
        "type": "compute-vm",
        "instance_type": "g4dn.xlarge",
        "cpu": 3,
        "idle_minutes": 61,
        "state": "stopped",
        "tags": ["staging"],
        "cost": {"gcp": 210, "aws": 260, "azure": 245},
    },
    {
        # 🔥 Approval-required VM
        "id": "finance-apac-payroll-batch-vm-09",
        "type": "compute-vm",
        "instance_type": "e2-standard-2",
        "cpu": 2,
        "idle_minutes": 78,
        "state": "running",
        "tags": ["finance"],
        "cost": {"gcp": 92, "aws": 108, "azure": 101},
    },
    {
        "id": "gke-nodepool-video-transcoder-node-a3f",
        "type": "k8s-node",
        "instance_type": "c2-standard-8",
        "cpu": 18,
        "idle_minutes": 12,
        "state": "running",
        "tags": ["prod"],
        "cost": {"gcp": 310, "aws": 355, "azure": 342},
    },
]

# -------------------------------------------------
# POLICY LOGIC
# -------------------------------------------------
def requires_approval(resource):
    return any(
        tag in POLICY["require_approval_for"]
        for tag in resource.get("tags", [])
    )

def evaluate_resource(resource):
    # Terminal state
    if resource["state"] == "stopped":
        return "stopped"

    # Healthy
    if resource["cpu"] > POLICY["cpu_idle_threshold"]:
        return "healthy"

    # Stop zone
    if resource["idle_minutes"] >= POLICY["idle_stop_minutes"]:
        if requires_approval(resource):
            return "approval-required"

        resource["state"] = "stopped"
        return "auto-stopped"

    # Warning zone
    if resource["idle_minutes"] >= POLICY["idle_warn_minutes"]:
        return "warning"

    return "healthy"

# -------------------------------------------------
# LIST RESOURCES
# -------------------------------------------------
@app.get("/resources")
def list_resources():
    response = []

    for r in COMPUTE_RESOURCES:
        status = evaluate_resource(r)

        response.append({
            "id": r["id"],
            "type": r["type"],
            "instance_type": r["instance_type"],
            "cpu": r["cpu"],
            "idle_minutes": r["idle_minutes"],
            "state": r["state"],
            "policy_status": status,
            "tags": r["tags"],
            "cost": r["cost"],
        })

    return {
        "policy": POLICY,
        "timestamp": datetime.utcnow().isoformat(),
        "resources": response,
    }

# -------------------------------------------------
# APPROVE & STOP VM
# -------------------------------------------------
@app.post("/resources/{resource_id}/approve-stop")
def approve_stop(resource_id: str):
    for r in COMPUTE_RESOURCES:
        if r["id"] == resource_id:
            r["state"] = "stopped"
            return {
                "message": "VM stopped after user approval",
                "id": r["id"],
                "state": r["state"],
            }

    raise HTTPException(status_code=404, detail="Resource not found")
