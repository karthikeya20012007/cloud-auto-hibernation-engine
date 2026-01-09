from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# -------------------------------------------------
# APP INITIALIZATION
# -------------------------------------------------
app = FastAPI(title="Cloud Auto-Hibernation Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# ROOT ENDPOINT (IMPORTANT FOR TESTING)
# -------------------------------------------------
@app.get("/")
def root():
    return {"status": "API running"}

# -------------------------------------------------
# USER-DEFINED POLICY (MOCK)
# -------------------------------------------------
POLICY = {
    "idle_warn_minutes": 45,
    "idle_stop_minutes": 60,
    "cpu_idle_threshold": 10  # %
}

# -------------------------------------------------
# REALISTIC COMPUTE RESOURCES (MOCK DATA)
# -------------------------------------------------
COMPUTE_RESOURCES = [
    {
        "id": "prod-eu-west1-api-gateway-vm-01",
        "type": "compute-vm",
        "cpu": 6,
        "idle_minutes": 52,
        "state": "running",
    },
    {
        "id": "staging-us-central1-ml-inference-vm-02",
        "type": "compute-vm",
        "cpu": 3,
        "idle_minutes": 61,
        "state": "running",
    },
    {
        "id": "gke-nodepool-video-transcoder-node-a3f",
        "type": "k8s-node",
        "cpu": 18,
        "idle_minutes": 12,
        "state": "running",
    },
    {
        "id": "batch-apac-reporting-worker-17",
        "type": "batch-worker",
        "cpu": 1,
        "idle_minutes": 48,
        "state": "running",
    },
]

# -------------------------------------------------
# POLICY EVALUATION LOGIC
# -------------------------------------------------
def evaluate_resource(resource):
    # If CPU usage is high, resource is healthy
    if resource["cpu"] > POLICY["cpu_idle_threshold"]:
        return "healthy"

    # If idle time crosses stop threshold → auto-stop
    if resource["idle_minutes"] >= POLICY["idle_stop_minutes"]:
        resource["state"] = "stopped"
        return "auto-stopped"

    # If idle time crosses warning threshold
    if resource["idle_minutes"] >= POLICY["idle_warn_minutes"]:
        return "warning"

    return "healthy"

# -------------------------------------------------
# API ENDPOINT: LIST RESOURCES
# -------------------------------------------------
@app.get("/resources")
def list_resources():
    response = []

    for r in COMPUTE_RESOURCES:
        policy_status = evaluate_resource(r)

        response.append({
            "id": r["id"],
            "type": r["type"],
            "cpu": r["cpu"],
            "idle_minutes": r["idle_minutes"],
            "state": r["state"],
            "policy_status": policy_status,
        })

    return {
        "policy": POLICY,
        "timestamp": datetime.utcnow().isoformat(),
        "resources": response,
    }
