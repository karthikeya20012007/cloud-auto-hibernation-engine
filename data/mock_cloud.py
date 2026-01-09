"""
Mock cloud layer
Simulates VM configurations as if fetched from a real cloud provider
"""

MOCK_VM_DATABASE = {
    "vm-1": {
        "name": "vm-1",
        "machine_type": "e2-medium",
        "vcpus": 4,
        "memory_gb": 8,
        "region": "asia-south1",
        "status": "RUNNING"
    },
    "vm-2": {
        "name": "vm-2",
        "machine_type": "e2-small",
        "vcpus": 2,
        "memory_gb": 4,
        "region": "us-central1",
        "status": "STOPPED"
    }
}


def get_vm_configuration(vm_name: str):
    """
    Simulates fetching VM configuration from cloud metadata / API
    """
    return MOCK_VM_DATABASE.get(vm_name)
