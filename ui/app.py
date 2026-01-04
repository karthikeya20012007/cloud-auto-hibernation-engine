import json
import streamlit as st
import pandas as pd
import altair as alt

from dotenv import load_dotenv
load_dotenv()

from policies.vm_policies import (
    NeverStopProdPolicy,
    NeverStopTaggedPolicy,
    StopIdleVMPolicy,
)
from engine.policy_engine import PolicyEngine, Decision
from cost.cost_model import CostModel
from execution.gcp_executor import GCPExecutor
from ai.chatbot import GeminiChatbot

# --------------------------------------------------
# Page config
# --------------------------------------------------
st.set_page_config(
    page_title="Cloud Auto-Hibernation Engine",
    layout="wide"
)

# --------------------------------------------------
# Global styling (clean, modern)
# --------------------------------------------------
st.markdown(
    """
    <style>
    body {
        background-color: #f6f8fc;
    }

    /* VM cards */
    .vm-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 28px;
        box-shadow: 0 10px 28px rgba(0,0,0,0.08);
    }

    /* Floating chatbot */
    .chatbot-box {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 360px;
        background: white;
        border-radius: 16px;
        padding: 14px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.18);
        z-index: 9999;
        font-size: 14px;
    }

    .chatbot-header {
        font-weight: 600;
        margin-bottom: 8px;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# --------------------------------------------------
# Header / intro
# --------------------------------------------------
st.title("☁️ Cloud Auto-Hibernation Engine")
st.markdown(
    """
    **Stop cloud cost leakage automatically — safely and explainably.**

    This system continuously evaluates cloud VMs using governance policies,
    identifies idle resources, estimates cost impact, and **automatically stops**
    them **based on rules** — with optional human approval for safety and demos.
    """
)

st.divider()

# --------------------------------------------------
# Load mock VM data
# --------------------------------------------------
with open("data/sample_vms.json") as f:
    vms = json.load(f)

# --------------------------------------------------
# Core components
# --------------------------------------------------
policies = [
    NeverStopProdPolicy(),
    NeverStopTaggedPolicy(),
    StopIdleVMPolicy(),
]

engine = PolicyEngine(policies)
executor = GCPExecutor()
chatbot = GeminiChatbot()

# --------------------------------------------------
# Pre-compute decisions & costs
# --------------------------------------------------
vm_results = []
total_savings = 0.0

for vm in vms:
    evaluation = engine.evaluate(vm)
    decision = evaluation["decision"]
    reason = evaluation["reason"]

    cost_model = CostModel(hourly_cost=vm["hourly_cost"])
    monthly_cost = cost_model.monthly()

    if decision == Decision.AUTO_STOP:
        optimized_cost = 0.0
        savings = monthly_cost
        total_savings += savings
    else:
        optimized_cost = monthly_cost
        savings = 0.0

    vm_results.append({
        "name": vm["name"],
        "environment": vm["environment"],
        "decision": decision,
        "reason": reason,
        "monthly_cost": monthly_cost,
        "optimized_cost": optimized_cost,
        "savings": savings,
    })

# --------------------------------------------------
# Main VM view
# --------------------------------------------------
for vm in vm_results:
    st.markdown('<div class="vm-card">', unsafe_allow_html=True)

    st.markdown(f"### 🔹 `{vm['name']}`")
    st.caption(f"Environment: **{vm['environment']}**")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("#### 🛡️ Policy Explanation")
        st.write(vm["reason"])
        st.write(f"**Decision:** `{vm['decision'].value}`")

    with col2:
        st.markdown("#### 💰 Cost Snapshot")
        st.write(f"Monthly cost: ₹{vm['monthly_cost']:.0f}")
        st.write(f"Potential savings: ₹{vm['savings']:.0f}")

    # -------- Cost trend graph (3 lines) --------
    with st.expander("📊 Analyze Cost Impact Over Time"):
        weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]

        no_auto = [
            vm["monthly_cost"] * 0.25,
            vm["monthly_cost"] * 0.5,
            vm["monthly_cost"] * 0.75,
            vm["monthly_cost"],
        ]

        with_auto = [
            vm["optimized_cost"] * 0.25,
            vm["optimized_cost"] * 0.5,
            vm["optimized_cost"] * 0.75,
            vm["optimized_cost"],
        ]

        savings_trend = [
            no_auto[i] - with_auto[i] for i in range(4)
        ]

        chart_df = pd.DataFrame({
            "Week": weeks * 3,
            "Cost": no_auto + with_auto + savings_trend,
            "Metric": (
                ["Cost without Auto-Stop"] * 4 +
                ["Cost with Auto-Stop"] * 4 +
                ["Savings"] * 4
            )
        })

        chart = alt.Chart(chart_df).mark_line(point=True).encode(
            x="Week",
            y=alt.Y("Cost", title="Cost (₹)"),
            color=alt.Color("Metric", legend=alt.Legend(title="")),
            tooltip=["Metric", "Cost"]
        ).properties(height=300)

        st.altair_chart(chart, use_container_width=True)

    # -------- Action --------
    if vm["decision"] == Decision.AUTO_STOP:
        if st.button("Approve & Stop Resource", key=f"stop-{vm['name']}"):
            explanation = (
                f"This VM was stopped because it was idle and matched the auto-stop policy. "
                f"Stopping it prevents approximately ₹{vm['savings']:.0f} in monthly cost leakage."
            )
            with st.spinner("Executing policy-approved action..."):
                executor.execute({
                    "resource_name": vm["name"],
                    "decision": Decision.AUTO_STOP
                })
            st.success(explanation)

    st.markdown("</div>", unsafe_allow_html=True)

# --------------------------------------------------
# Floating chatbot (PURE HTML — no layout space)
# --------------------------------------------------
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

chat_html = """
<div class="chatbot-box">
    <div class="chatbot-header">🤖 Cloud Governance Assistant</div>
    <div style="max-height: 180px; overflow-y: auto;">
"""

for msg in st.session_state.chat_history[-6:]:
    role = "You" if msg["role"] == "user" else "Bot"
    chat_html += f"<p><b>{role}:</b> {msg['content']}</p>"

chat_html += "</div></div>"
st.markdown(chat_html, unsafe_allow_html=True)

user_q = st.text_input("Ask about policies, costs, or decisions", key="floating_chat")

if user_q:
    st.session_state.chat_history.append(
        {"role": "user", "content": user_q}
    )

    answer = chatbot.answer(
        user_q,
        {
            "vm_name": "multiple",
            "decision": "mixed",
            "reason": str(vm_results),
            "monthly_savings": total_savings
        }
    )

    st.session_state.chat_history.append(
        {"role": "assistant", "content": answer}
    )

    st.rerun()
