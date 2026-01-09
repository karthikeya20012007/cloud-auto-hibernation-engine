from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

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

# --------------------------------
# POLICY
# --------------------------------
POLICY = {
    "idle_warn_minutes": 45,
    "idle_stop_minutes": 60,
    "cpu_idle_threshold": 10,
    "require_approval_for": ["finance"],
    "never_stop_tags": ["never-stop"],
}

# --------------------------------
# COMPUTE RESOURCES (5 STATES)
# --------------------------------
COMPUTE_RESOURCES = [
    # 🟢 HEALTHY
    {
        "id": "prod-api-gateway-vm-01",
        "type": "compute-vm",
        "instance_type": "n2-standard-4",
        "cpu": 40,
        "idle_minutes": 10,
        "state": "running",
        "tags": ["prod"],
        "cost": {"gcp": 140, "aws": 165, "azure": 158},
    },

    # ⚠️ WARNING
    {
        "id": "staging-ml-inference-vm-02",
        "type": "compute-vm",
        "instance_type": "g4dn.xlarge",
        "cpu": 5,
        "idle_minutes": 50,
        "state": "running",
        "tags": ["staging"],
        "cost": {"gcp": 210, "aws": 260, "azure": 245},
    },

    # ⛔ AUTO-STOPPED
    {
        "id": "batch-reporting-worker-vm-07",
        "type": "compute-vm",
        "instance_type": "e2-standard-2",
        "cpu": 2,
        "idle_minutes": 90,
        "state": "stopped",
        "tags": ["batch"],
        "cost": {"gcp": 92, "aws": 108, "azure": 101},
    },

    # ✋ APPROVAL REQUIRED
    {
        "id": "finance-payroll-vm-09",
        "type": "compute-vm",
        "instance_type": "c2-standard-8",
        "cpu": 3,
        "idle_minutes": 85,
        "state": "running",
        "tags": ["finance"],
        "cost": {"gcp": 310, "aws": 355, "azure": 342},
    },

    # 🔒 NEVER STOP
    {
        "id": "auth-identity-core-vm-99",
        "type": "compute-vm",
        "instance_type": "c2-standard-16",
        "cpu": 2,
        "idle_minutes": 120,
        "state": "running",
        "tags": ["never-stop", "core"],
        "cost": {"gcp": 520, "aws": 610, "azure": 590},
    },
]

# --------------------------------
# POLICY LOGIC
# --------------------------------
def has_never_stop(resource):
    return any(
        tag in POLICY["never_stop_tags"]
        for tag in resource.get("tags", [])
    )

def requires_approval(resource):
    return any(
        tag in POLICY["require_approval_for"]
        for tag in resource.get("tags", [])
    )

def evaluate_resource(resource):
    # 🔒 NEVER STOP OVERRIDES EVERYTHING
    if has_never_stop(resource):
        return "never-stop"

    if resource["state"] == "stopped":
        return "auto-stopped"

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
# LIST RESOURCES
# --------------------------------
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

# --------------------------------
# APPROVE & STOP
# --------------------------------
@app.post("/resources/{resource_id}/approve-stop")
def approve_stop(resource_id: str):
    for r in COMPUTE_RESOURCES:
        if r["id"] == resource_id:
            if has_never_stop(r):
                raise HTTPException(
                    status_code=403,
                    detail="This VM has a never-stop policy"
                )

            r["state"] = "stopped"
            return {
                "message": "VM stopped after user approval",
                "id": r["id"],
                "state": r["state"],
            }

    raise HTTPException(status_code=404, detail="Resource not found")
