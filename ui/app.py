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

    .vm-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 28px;
        box-shadow: 0 10px 28px rgba(0,0,0,0.08);
    }

    .policy-card {
        background-color:#f5f8ff;
        border-left:6px solid #4f6ef7;
        padding:18px;
        border-radius:12px;
        margin-bottom:20px;
    }

    .demo-banner {
        background:#e8f5e9;
        border-left:6px solid #2e7d32;
        padding:14px;
        border-radius:10px;
        margin-bottom:24px;
        font-size:14px;
    }

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
    **Prevent cloud cost leakage using policy-driven governance.**

    This system continuously evaluates virtual machines,
    identifies **sustained low-utilization resources**, estimates cost impact,
    and **recommends safe stop actions** using explainable rules.
    """
)

# --------------------------------------------------
# Demo Mode Banner (STEP 2)
# --------------------------------------------------
st.markdown(
    """
    <div class="demo-banner">
        🟢 <b>Demo Mode Enabled</b><br>
        Execution is <b>simulated</b>. Policy decisions, cost analysis, and execution plans are real.
        Destructive actions are intentionally gated for safety.
    </div>
    """,
    unsafe_allow_html=True
)

# --------------------------------------------------
# Policy Summary Card (STEP 1)
# --------------------------------------------------
st.markdown(
    """
    <div class="policy-card">
        <h4>🛡️ Auto-Stop Governance Policy</h4>
        A virtual machine is recommended for stopping only when <b>all</b> conditions are met:
        <ul>
            <li>CPU utilization remains below <b>5%</b></li>
            <li>VM has been idle for more than <b>24 hours</b></li>
            <li>Environment is <b>non-production</b></li>
            <li>No <code>do-not-stop</code> protection tag is present</li>
        </ul>
    </div>
    """,
    unsafe_allow_html=True
)

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
        st.markdown("#### 🛡️ Policy Evaluation")
        st.write(vm["reason"])
        st.write(f"**Decision:** `{vm['decision'].value}`")

    with col2:
        st.markdown("#### 💰 Cost Impact")
        st.write(f"Monthly cost: ₹{vm['monthly_cost']:.0f}")
        st.write(f"Preventable waste: ₹{vm['savings']:.0f}")

    # -------- Cost trend graph --------
    with st.expander("📊 Cost Accumulation Over Time"):
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

    # -------- Action (still gated) --------
    if vm["decision"] == Decision.AUTO_STOP:
        if st.button("Approve & Generate Execution Plan", key=f"stop-{vm['name']}"):
            explanation = (
                f"Execution plan generated.\n\n"
                f"Reason: {vm['reason']}\n"
                f"Estimated monthly savings: ₹{vm['savings']:.0f}\n"
                f"Mode: DRY-RUN (no live resources modified)"
            )
            with st.spinner("Validating governance rules..."):
                executor.execute({
                    "resource_name": vm["name"],
                    "decision": Decision.AUTO_STOP
                })
            st.success(explanation)

    st.markdown("</div>", unsafe_allow_html=True)

# --------------------------------------------------
# Floating chatbot
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
