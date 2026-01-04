class CostModel:
    """
    Simple, explainable cost model for VMs.

    This is a mock model intended for demos and governance logic,
    not exact cloud billing accuracy.
    """

    def __init__(self, hourly_cost: float = 5.0):
        """
        :param hourly_cost: Cost per hour of running a VM (default mock value)
        """
        self.hourly_cost = hourly_cost

    def hourly(self) -> float:
        """
        Cost per hour.
        """
        return self.hourly_cost

    def daily(self) -> float:
        """
        Cost per day.
        """
        return self.hourly_cost * 24

    def monthly(self) -> float:
        """
        Approximate monthly cost (30 days).
        """
        return self.daily() * 30

    def cost_leakage(self, hours_idle: int) -> float:
        """
        Cost leaked if VM stays idle for given hours.
        """
        return self.hourly_cost * hours_idle

    def prevented_savings(self, decision: str) -> float:
        """
        Estimated monthly savings if VM is stopped.
        """
        if decision == "AUTO-STOP":
            return self.monthly()
        return 0.0
