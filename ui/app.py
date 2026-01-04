import json
import streamlit as st

from policies.vm_policies import (
    NeverStopProdPolicy,
    NeverStopTaggedPolicy,
    StopIdleVMPolicy,
)
from engine.policy_engine import PolicyEngine, Decision
from cost.cost_model import CostModel


st.set_page_config(page_title="Cloud Auto-Hibernation", layout="wide")

st.title("☁️ Cloud Auto-Hibernation Dashboard")
st.caption("Policy-based dry run — no real resources are stopped")

# Load VM data
with open("data/sample_vms.json") as f:
    vms = json.load(f)

# Initialize engine
policies = [
    NeverStopProdPolicy(),
    NeverStopTaggedPolicy(),
    StopIdleVMPolicy(),
]
engine = PolicyEngine(policies)

st.subheader("Virtual Machines")

total_savings = 0.0

for vm in vms:
    decision_result = engine.evaluate(vm)
    decision = decision_result["decision"]
    reason = decision_result["reason"]

    cost_model = CostModel(hourly_cost=vm["hourly_cost"])

    with st.container():
        col1, col2, col3, col4 = st.columns(4)

        col1.markdown(f"**VM Name**\n\n{vm['name']}")
        col2.markdown(f"**Decision**\n\n{decision.value}")
        col3.markdown(f"**Reason**\n\n{reason}")

        if decision == Decision.AUTO_STOP:
            savings = cost_model.monthly()
            total_savings += savings
            col4.markdown(f"**💰 Monthly Savings**\n\n₹{savings:.2f}")
        else:
            leakage = cost_model.cost_leakage(vm["idle_hours"])
            col4.markdown(f"**ℹ️ Idle Cost Risk**\n\n₹{leakage:.2f}")

        st.divider()

st.subheader("Summary")

st.success(f"✅ Total potential monthly savings: ₹{total_savings:.2f}")
st.info("This is a dry run. No cloud resources were stopped.")
