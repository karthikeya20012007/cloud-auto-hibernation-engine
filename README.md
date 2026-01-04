# ☁️ Cloud Auto-Hibernation Engine

A policy-based cloud governance system that automatically identifies idle cloud resources, explains cost leakage, and safely shuts them down using human-approved automation.

**One-line summary:**  
A policy-driven cloud auto-hibernation system that detects unused resources, explains cost impact, and safely stops them using gated automation.

---

## 📌 Problem Statement

Cloud environments—especially development and testing setups—often have resources running even when they are not being used. These idle resources silently consume budget and infrastructure capacity, leading to cloud cost leakage.

Manual shutdowns are:
- error-prone  
- inconsistent  
- hard to enforce at scale  

Existing monitoring tools show metrics but do not take action.

---

## 🎯 Objective

This project implements a **Cloud Auto-Hibernation Engine** that:

- Detects idle virtual machines using policy rules  
- Explains why a resource should or should not be stopped  
- Estimates cost leakage and savings  
- Requires explicit human approval before execution  
- Safely stops cloud VMs using restricted IAM permissions  

All decisions are explainable and deterministic — no black-box ML.

---

## 🧠 Key Design Principles

- Policy-first governance (decide before acting)  
- Human-in-the-loop approval  
- Safe-by-default execution  
- Explainability over automation  
- No accidental cloud impact  

---

## 🏗️ Architecture Overview

Data → Policies → Decision Engine → Cost Model
↓
Explainability (AI)
↓
UI Dashboard
↓
Approved Execution (GCP)

## 📁 Project Structure

cloud-auto-hibernation/
├── policies/ # Governance rules
├── engine/ # Decision engine & reasoning
├── cost/ # Cost leakage & savings model
├── data/ # Mock cloud resource data
├── experiments/ # Dry-run simulation
├── ui/ # Streamlit dashboard
├── ai/ # Gemini-based chatbot
├── execution/ # GCP VM stop logic (gated & safe)
├── tests/ # Policy & engine tests
├── requirements.txt
├── .env # Runtime configuration (ignored)
├── .gitignore
└── README.md


---

## 🧪 What the System Can Do

### ✔ Identify idle VMs
Based on:
- CPU utilization  
- Idle duration  
- Environment (dev / prod)  
- Resource tags  

### ✔ Decide actions
- **AUTO-STOP** → VM is idle and safe to stop  
- **SKIP** → Production, protected, or active VM  

### ✔ Explain decisions
Every decision includes:
- applied policy  
- reasoning  
- cost impact  

### ✔ Estimate cost impact
- Monthly cost leakage  
- Prevented savings when stopped  

### ✔ Execute safely (optional)
- Requires explicit approval  
- Gated by environment flags  
- Restricted IAM permissions  
- VM allow-list enforced  

---

## 🖥️ UI Dashboard

The Streamlit dashboard shows:
- VM name  
- Decision (AUTO-STOP / SKIP)  
- Reason for the decision  
- Estimated cost impact  
- **Approve & Stop** button (human-in-the-loop)  

By default, execution runs in **DRY-RUN mode**.

---

## 🤖 AI Explainability (Gemini)

The system includes a Gemini-powered chatbot that answers questions like:
- Why was this VM stopped?  
- Why was this VM skipped?  
- How much cost was saved?  

AI is used **only for explanation**, never for enforcement.

---

## 🔐 Security & Safety

- Execution disabled by default  
- Environment-controlled flags (`EXECUTION_ENABLED`, `DRY_RUN`)  
- VM allow-list (only one VM can be stopped)  
- GCP least-privilege IAM role (`compute.instanceAdmin.v1`)  
- `.env` and credentials excluded from version control  

---

## 🧪 Tests

Core governance logic is covered by automated tests:
- Policy behavior  
- Decision precedence  
- Deterministic outcomes  

Run tests:
```bash
pytest

▶️ How to Run
1️⃣ Setup environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

2️⃣ Run dry-run simulation
python -m experiments.run_simulation

3️⃣ Run UI dashboard
PYTHONPATH=. streamlit run ui/app.py

⚠️ Execution (Optional, Demo-Only)

To enable real VM stop (demo use only):

EXECUTION_ENABLED=true
DRY_RUN=false


Execution is still restricted by:

policy decision

VM allow-list

IAM permissions

🌍 Why This Project Matters

Cloud cost waste is a FinOps and governance problem, not a tooling problem.

This project demonstrates:

real-world cloud thinking

safety-first automation

explainable decision systems

production-grade governance patterns

🚀 Future Enhancements

Support for additional cloud resources (IPs, disks)

Scheduled policy execution

Multi-cloud support

Audit logs & dashboards

Policy configuration via UI

🏁 Final Note

This project is intentionally designed to be:

safe

explainable

demo-ready

extensible

It models how real cloud cost-optimization systems are built in industry.