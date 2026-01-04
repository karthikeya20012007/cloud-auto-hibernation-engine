import json
import streamlit as st

from policies.vm_policies import (
    NeverStopProdPolicy,
    NeverStopTaggedPolicy,
    StopIdleVMPolicy,
)
from engine.policy_engine import PolicyEngine, Decision
from cost.cost_model import CostModel
from execution.gcp_executor import GCPExecutor

st.set_page_config(page_title="Cloud Auto-Hibernation", layout="wide")

st.title("☁️ Cloud Auto-Hibernation Dashboard")
st.caption("Policy-based governance with human approval")

# Load VM data
with open("data/sample_vms.json") as f:
    vms = json.load(f)

# Initialize components
policies = [
    NeverStopProdPolicy(),
    NeverStopTaggedPolicy(),
    StopIdleVMPolicy(),
]
engine = PolicyEngine(policies)
executor = GCPExecutor()

st.subheader("Virtual Machines")

total_savings = 0.0

for vm in vms:
    decision_result = engine.evaluate(vm)
    decision = decision_result["decision"]
    reason = decision_result["reason"]

    cost_model = CostModel(hourly_cost=vm["hourly_cost"])

    with st.container():
        col1, col2, col3, col4, col5 = st.columns([2, 2, 3, 2, 2])

        col1.markdown(f"**VM Name**\n\n{vm['name']}")
        col2.markdown(f"**Decision**\n\n{decision.value}")
        col3.markdown(f"**Reason**\n\n{reason}")

        if decision == Decision.AUTO_STOP:
            savings = cost_model.monthly()
            total_savings += savings
            col4.markdown(f"**💰 Monthly Savings**\n\n₹{savings:.2f}")

            if col5.button(
                "✅ Approve & Stop",
                key=f"stop-{vm['name']}"
            ):
                with st.spinner("Executing action..."):
                    executor.execute(decision_result)
                st.success(f"Execution triggered for {vm['name']}")
        else:
            leakage = cost_model.cost_leakage(vm["idle_hours"])
            col4.markdown(f"**ℹ️ Idle Cost Risk**\n\n₹{leakage:.2f}")
            col5.markdown("—")

        st.divider()

st.subheader("Summary")
st.success(f"✅ Total potential monthly savings: ₹{total_savings:.2f}")

st.info(
    "Execution is gated by environment flags, VM allowlist, and IAM. "
    "By default, actions run in DRY-RUN mode."
)
