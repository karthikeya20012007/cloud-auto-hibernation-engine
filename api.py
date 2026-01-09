from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from fastapi import HTTPException

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

@app.post("/resources/{resource_id}/approve-stop")
def approve_stop(resource_id: str):
    for r in COMPUTE_RESOURCES:
        if r["id"] == resource_id:
            r["state"] = "stopped"
            return {
                "message": "VM stopped after user approval",
                "id": r["id"],
                "state": r["state"]
            }

    raise HTTPException(status_code=404, detail="Resource not found")

# --------------------------------
# USER-DEFINED POLICY (MOCK)
# --------------------------------
POLICY = {
    "idle_warn_minutes": 45,
    "idle_stop_minutes": 60,
    "cpu_idle_threshold": 10,
    "require_approval_for": ["prod-critical", "finance"],  # tags
}

# --------------------------------
# COMPUTE RESOURCES (REALISTIC)
# --------------------------------
COMPUTE_RESOURCES = [
    {
        "id": "prod-eu-west1-api-gateway-vm-01",
        "type": "compute-vm",
        "cpu": 6,
        "idle_minutes": 52,
        "state": "running",
        "tags": ["prod-critical"],
    },
    {
        "id": "staging-us-central1-ml-inference-vm-02",
        "type": "compute-vm",
        "cpu": 3,
        "idle_minutes": 61,
        "state": "running",
        "tags": ["staging"],
    },
    {
        "id": "finance-apac-payroll-batch-vm-09",
        "type": "compute-vm",
        "cpu": 2,
        "idle_minutes": 78,  # crossed threshold
        "state": "running",
        "tags": ["finance"],  # requires approval
    },
    {
        "id": "gke-nodepool-video-transcoder-node-a3f",
        "type": "k8s-node",
        "cpu": 18,
        "idle_minutes": 12,
        "state": "running",
        "tags": ["prod"],
    },
]

# --------------------------------
# POLICY EVALUATION
# --------------------------------
def requires_approval(resource):
    return any(
        tag in POLICY["require_approval_for"]
        for tag in resource.get("tags", [])
    )

def evaluate_resource(resource):
    if resource["cpu"] > POLICY["cpu_idle_threshold"]:
        return "healthy"

    if resource["idle_minutes"] >= POLICY["idle_stop_minutes"]:
        if requires_approval(resource):
            return "approval-required"

        resource["state"] = "stopped"
        return "auto-stopped"

    if resource["idle_minutes"] >= POLICY["idle_warn_minutes"]:
        return "warning"

    return "healthy"

# --------------------------------
# API ENDPOINT
# --------------------------------
@app.get("/resources")
def list_resources():
    response = []

    for r in COMPUTE_RESOURCES:
        status = evaluate_resource(r)

        response.append({
            "id": r["id"],
            "type": r["type"],
            "cpu": r["cpu"],
            "idle_minutes": r["idle_minutes"],
            "state": r["state"],
            "policy_status": status,
            "tags": r["tags"],
        })

    return {
        "policy": POLICY,
        "timestamp": datetime.utcnow().isoformat(),
        "resources": response,
    }
