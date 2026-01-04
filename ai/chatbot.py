import os

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class GeminiChatbot:
    """
    Chatbot for explaining cloud governance decisions.
    Uses Gemini if API key is available, otherwise falls back to rule-based answers.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")

        if GEMINI_AVAILABLE and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-pro")
        else:
            self.model = None

    def answer(self, question: str, context: dict) -> str:
        """
        Answer a question using system context.

        context example:
        {
            "vm_name": str,
            "decision": str,
            "reason": str,
            "monthly_savings": float
        }
        """

        # Fallback (no Gemini)
        if self.model is None:
            return self._rule_based_answer(question, context)

        prompt = self._build_prompt(question, context)

        response = self.model.generate_content(prompt)
        return response.text

    def _build_prompt(self, question: str, context: dict) -> str:
        return f"""
You are a cloud governance assistant.

Facts (DO NOT CHANGE):
- VM Name: {context['vm_name']}
- Decision: {context['decision']}
- Reason: {context['reason']}
- Monthly Savings: ₹{context['monthly_savings']}

User Question:
{question}

Rules:
- Explain using only the facts
- Do not invent policies
- Be concise and clear
"""

    def _rule_based_answer(self, question: str, context: dict) -> str:
        decision = context["decision"]

        if decision == "AUTO-STOP":
            return (
                f"The VM '{context['vm_name']}' was marked for stopping because "
                f"{context['reason']}. This prevents approximately "
                f"₹{context['monthly_savings']} in monthly cost leakage."
            )

        return (
            f"The VM '{context['vm_name']}' was not stopped because "
            f"{context['reason']}. No automation was applied."
        )
