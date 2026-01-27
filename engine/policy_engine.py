from enum import Enum
from typing import List, Optional

from policies.base_policy import BasePolicy, PolicyResult


class Decision(Enum):
    AUTO_STOP = "AUTO-STOP"
    REQUIRE_APPROVAL = "REQUIRE-APPROVAL"
    SKIP = "SKIP"


class PolicyEngine:
    """
    Evaluates resources against policies and produces a final decision.
    Policy precedence:
    1. Any policy that returns allowed=False -> SKIP immediately
    2. If at least one policy requires approval -> REQUIRE_APPROVAL
    3. If at least one policy returns allowed=True -> AUTO_STOP
    4. Otherwise -> SKIP
    """

    def __init__(self, policies: List[BasePolicy]):
        self.policies = policies

    def evaluate(self, resource: dict) -> dict:
        allow_reasons = []
        approval_reasons = []

        for policy in self.policies:
            result: Optional[PolicyResult] = policy.evaluate(resource)

            if result is None:
                continue

            # Absolute deny → skip immediately
            if result.allowed is False:
                return {
                    "resource_name": resource.get("name"),
                    "decision": Decision.SKIP,
                    "reason": result.reason,
                }

            # Allowed but needs human approval
            if result.allowed and result.requires_approval:
                approval_reasons.append(result.reason)
                continue

            # Allowed and auto-executable
            if result.allowed:
                allow_reasons.append(result.reason)

        if approval_reasons:
            return {
                "resource_name": resource.get("name"),
                "decision": Decision.REQUIRE_APPROVAL,
                "reason": " | ".join(approval_reasons),
            }

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
