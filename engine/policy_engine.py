from enum import Enum
from typing import List, Optional

from policies.base_policy import BasePolicy, PolicyResult


class Decision(Enum):
    AUTO_STOP = "AUTO-STOP"
    SKIP = "SKIP"


class PolicyEngine:
    """
    Evaluates resources against policies and produces a final decision.
    Policy precedence:
    1. Any policy that returns allowed=False -> SKIP immediately
    2. If at least one policy returns allowed=True -> AUTO-STOP
    3. Otherwise -> SKIP
    """

    def __init__(self, policies: List[BasePolicy]):
        self.policies = policies

    def evaluate(self, resource: dict) -> dict:
        allow_reasons = []

        for policy in self.policies:
            result: Optional[PolicyResult] = policy.evaluate(resource)

            if result is None:
                continue

            # Absolute deny → stop immediately
            if result.allowed is False:
                return {
                    "resource_name": resource.get("name"),
                    "decision": Decision.SKIP,
                    "reason": result.reason,
                }

            # Conditional allow → record
            if result.allowed is True:
                allow_reasons.append(result.reason)

        if allow_reasons:
            return {
                "resource_name": resource.get("name"),
                "decision": Decision.AUTO_STOP,
                "reason": " | ".join(allow_reasons),
            }

        return {
            "resource_name": resource.get("name"),
            "decision": Decision.SKIP,
            "reason": "No policy conditions met for stopping",
        }
