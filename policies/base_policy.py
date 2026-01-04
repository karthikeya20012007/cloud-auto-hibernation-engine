from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class PolicyResult:
    allowed: bool
    reason: str


class BasePolicy(ABC):
    """
    Base class for all policies.
    Each policy decides whether a resource is allowed to be stopped.
    """

    @abstractmethod
    def evaluate(self, resource: dict) -> Optional[PolicyResult]:
        """
        Returns:
        - PolicyResult if the policy applies
        - None if the policy does not apply
        """
        pass
