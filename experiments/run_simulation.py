import json

from policies.vm_policies import (
    NeverStopProdPolicy,
    NeverStopTaggedPolicy,
    StopIdleVMPolicy,
)
from engine.policy_engine import PolicyEngine, Decision
from cost.cost_model import CostModel


def load_vms(path: str):
    with open(path, "r") as f:
        return json.load(f)


def main():
    print("\n=== Cloud Auto-Hibernation Dry Run ===\n")

    # Load mock VM data
    vms = load_vms("data/sample_vms.json")

    # Initialize policies
    policies = [
        NeverStopProdPolicy(),
        NeverStopTaggedPolicy(),
        StopIdleVMPolicy(),
    ]

    # Initialize engine
    engine = PolicyEngine(policies)

    total_prevented_savings = 0.0

    for vm in vms:
        print(f"VM: {vm['name']}")

        # Decision
        decision_result = engine.evaluate(vm)
        decision = decision_result["decision"]
        reason = decision_result["reason"]

        print(f"  Decision : {decision.value}")
        print(f"  Reason   : {reason}")

        # Cost calculation
        cost_model = CostModel(hourly_cost=vm["hourly_cost"])

        if decision == Decision.AUTO_STOP:
            savings = cost_model.monthly()
            total_prevented_savings += savings
            print(f"  💰 Prevented monthly cost leakage: ₹{savings:.2f}")
        else:
            leakage = cost_model.cost_leakage(vm["idle_hours"])
            print(f"  ℹ️  Potential cost leakage if idle: ₹{leakage:.2f}")

        print("-" * 50)

    print(f"\n✅ Total potential monthly savings: ₹{total_prevented_savings:.2f}")
    print("\n(Dry run only — no resources were stopped)\n")


if __name__ == "__main__":
    main()
