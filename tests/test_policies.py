from policies.vm_policies import (
    NeverStopProdPolicy,
    NeverStopTaggedPolicy,
    StopIdleVMPolicy,
)


def test_never_stop_prod_vm():
    vm = {
        "environment": "prod",
        "tags": [],
    }

    policy = NeverStopProdPolicy()
    result = policy.evaluate(vm)

    assert result is not None
    assert result.allowed is False


def test_never_stop_tagged_vm():
    vm = {
        "environment": "dev",
        "tags": ["do-not-stop"],
    }

    policy = NeverStopTaggedPolicy()
    result = policy.evaluate(vm)

    assert result is not None
    assert result.allowed is False


def test_stop_idle_vm():
    vm = {
        "environment": "dev",
        "cpu_utilization": 2,
        "idle_hours": 30,
        "tags": [],
    }

    policy = StopIdleVMPolicy()
    result = policy.evaluate(vm)

    assert result is not None
    assert result.allowed is True
