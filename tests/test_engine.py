from policies.vm_policies import (
    NeverStopProdPolicy,
    NeverStopTaggedPolicy,
    StopIdleVMPolicy,
)
from engine.policy_engine import PolicyEngine, Decision


def test_engine_skips_prod_vm():
    vm = {
        "name": "prod-vm",
        "environment": "prod",
        "cpu_utilization": 1,
        "idle_hours": 48,
        "tags": [],
    }

    engine = PolicyEngine([
        NeverStopProdPolicy(),
        StopIdleVMPolicy(),
    ])

    result = engine.evaluate(vm)

    assert result["decision"] == Decision.SKIP


def test_engine_auto_stops_idle_vm():
    vm = {
        "name": "idle-vm",
        "environment": "dev",
        "cpu_utilization": 1,
        "idle_hours": 48,
        "tags": [],
    }

    engine = PolicyEngine([
        NeverStopProdPolicy(),
        StopIdleVMPolicy(),
    ])

    result = engine.evaluate(vm)

    assert result["decision"] == Decision.AUTO_STOP
