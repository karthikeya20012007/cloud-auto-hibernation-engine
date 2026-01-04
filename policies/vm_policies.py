from .base_policy import BasePolicy, PolicyResult


class NeverStopProdPolicy(BasePolicy):
    """
    Absolute policy:
    Never stop production VMs.
    """

    def evaluate(self, resource: dict):
        if resource.get("environment") == "prod":
            return PolicyResult(
                allowed=False,
                reason="Production VM must never be stopped"
            )
        return None


class NeverStopTaggedPolicy(BasePolicy):
    """
    Absolute policy:
    Never stop VMs with protection tags.
    """

    def evaluate(self, resource: dict):
        tags = resource.get("tags", [])
        if "do-not-stop" in tags or "critical" in tags:
            return PolicyResult(
                allowed=False,
                reason="VM is protected by do-not-stop or critical tag"
            )
        return None


class StopIdleVMPolicy(BasePolicy):
    """
    Conditional policy:
    Stop VM if it is idle beyond a threshold.
    """

    def __init__(self, cpu_threshold: float = 5.0, idle_hours: int = 24):
        self.cpu_threshold = cpu_threshold
        self.idle_hours = idle_hours

    def evaluate(self, resource: dict):
        cpu = resource.get("cpu_utilization", 100)
        idle_time = resource.get("idle_hours", 0)

        if cpu < self.cpu_threshold and idle_time >= self.idle_hours:
            return PolicyResult(
                allowed=True,
                reason=(
                    f"VM idle for {idle_time}h "
                    f"with CPU {cpu}% (below {self.cpu_threshold}%)"
                )
            )
        return None
