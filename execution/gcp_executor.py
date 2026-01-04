import os
from typing import Dict

from engine.policy_engine import Decision

try:
    from google.cloud import compute_v1
    GCP_AVAILABLE = True
except ImportError:
    GCP_AVAILABLE = False


class GCPExecutor:
    """
    Executes VM stop actions on GCP in a strictly gated manner.
    """

    def __init__(self):
        self.execution_enabled = os.getenv("EXECUTION_ENABLED", "false").lower() == "true"
        self.dry_run = os.getenv("DRY_RUN", "true").lower() == "true"

        # Comma-separated VM names allowed for stopping
        self.allowlist = os.getenv("VM_ALLOWLIST", "").split(",")

        # GCP metadata
        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.zone = os.getenv("GCP_ZONE")

    def execute(self, decision_result: Dict):
        """
        Executes action based on decision result.
        """
        vm_name = decision_result["resource_name"]
        decision = decision_result["decision"]

        print(f"\n[EXECUTION] Evaluating VM: {vm_name}")

        # Gate 1: decision check
        if decision != Decision.AUTO_STOP:
            print("[SKIP] Decision is not AUTO-STOP")
            return

        # Gate 2: execution flag
        if not self.execution_enabled:
            print("[SKIP] EXECUTION_ENABLED=false")
            return

        # Gate 3: allowlist
        if vm_name not in self.allowlist:
            print("[SKIP] VM not in allowlist")
            return

        # Gate 4: dry run
        if self.dry_run:
            print(f"[DRY-RUN] Would stop VM '{vm_name}'")
            return

        # Gate 5: GCP availability
        if not GCP_AVAILABLE:
            print("[ERROR] google-cloud-compute not installed")
            return

        print(f"[ACTION] Stopping VM '{vm_name}' on GCP")
        self._stop_vm(vm_name)

    def _stop_vm(self, vm_name: str):
        """
        Stops a VM on GCP.
        """
        if not self.project_id or not self.zone:
            print("[ERROR] GCP_PROJECT_ID or GCP_ZONE not set")
            return

        client = compute_v1.InstancesClient()

        operation = client.stop(
            project=self.project_id,
            zone=self.zone,
            instance=vm_name,
        )

        print(f"[SUCCESS] Stop operation initiated for {vm_name}")
