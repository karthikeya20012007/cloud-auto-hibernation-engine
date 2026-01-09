"""
Pricing engine
Handles cost calculation logic (mock pricing)
"""

# Mock hourly pricing in INR
PRICING_PER_HOUR = {
    "e2-small": 2.5,
    "e2-medium": 5.0,
    "e2-large": 10.0
}


def estimate_monthly_cost(machine_type: str, hours_per_day: int) -> float:
    """
    Estimate monthly VM cost based on usage
    """
    hourly_rate = PRICING_PER_HOUR.get(machine_type, 5.0)
    monthly_hours = hours_per_day * 30
    return round(hourly_rate * monthly_hours, 2)

