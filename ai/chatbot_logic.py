"""
Chatbot logic
Connects VM configuration + pricing engine
"""

from data.mock_cloud import get_vm_configuration
from cost.pricing_engine import estimate_monthly_cost


def chatbot_estimate_cost(vm_name: str, hours_per_day: int):
    """
    Chatbot-facing function to estimate VM monthly cost
    """

    vm = get_vm_configuration(vm_name)

    if not vm:
        return {
            "error": "VM not found. Please provide a valid VM name."
        }

    monthly_cost = estimate_monthly_cost(
        vm["machine_type"],
        hours_per_day
    )

    return {
        "vm_name": vm["name"],
        "machine_type": vm["machine_type"],
        "vcpus": vm["vcpus"],
        "memory_gb": vm["memory_gb"],
        "region": vm["region"],
        "hours_per_day": hours_per_day,
        "estimated_monthly_cost_inr": monthly_cost,
        "note": "Auto-hibernation can significantly reduce this cost."
    }
