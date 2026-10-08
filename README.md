# ⚡ VoltFleet AI - Intelligent Electric Vehicle Fleet Management Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?style=flat&logo=python)](https://python.org)
[![Machine Learning](https://img.shields.io/badge/ML-Scikit--Learn-F7931E.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

**VoltFleet AI** is an end-to-end intelligent fleet management ecosystem designed for commercial Electric Vehicle (EV) fleets. It combines **real-time IoT telematics simulation**, **machine learning-powered range prediction**, **driver safety behavior scoring**, **smart charging depot management**, and **predictive maintenance** into a responsive dashboard.

---

## 🌟 Key Features

- **🗺️ Live Telematics & Fleet Map**: Real-time vehicle location, battery State of Charge (SoC), operational status, and route history rendered on interactive maps with Leaflet.
- **🔋 AI-Powered Range Prediction**: High-precision Random Forest Regressor predicting remaining driving range based on battery capacity, speed, AC usage, ambient temperature, road gradients, and route topography.
- **🏆 Driver Safety & Eco-Scoring**: Machine learning-based driver behavior analysis tracking speed variance, harsh braking, acceleration spikes, and trip efficiency.
- **⚡ Smart Charging & Grid Management**: Optimal charging schedules, peak-tariff avoidance, and hub availability optimization.
- **🛠️ Predictive Maintenance & Alerts**: Automated fault detection for thermal anomalies, high degradation rates, and critical SoC warnings with instant alert triggers.
- **📊 Business Intelligence & Reporting**: Exportable fleet metrics, carbon emissions savings, energy consumption statistics, and financial revenue reports.
- **🔐 Secure Role-Based Authentication**: JWT-secured endpoints supporting Fleet Managers and Drivers with optional email OTP verification.

---

## 🏗️ System Architecture

```
VoltFleet AI
├── backend/                  # FastAPI REST API & Telematics Engine
│   ├── routers/              # Modular API Endpoints (Auth, Vehicles, Drivers, Alerts, Charging, etc.)
│   ├── auth.py               # Password hashing & JWT Token handling
│   ├── config.py             # Environment configurations
│   ├── database.py           # SQLAlchemy ORM (SQLite / PostgreSQL with TimescaleDB)
│   ├── ml_model.py           # ML inference engine for Range & Driver scoring
│   ├── models.py             # Database schemas & relationship definitions
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── simulator.py          # Real-time background telemetry generator
│   └── main.py               # FastAPI application entrypoint & auto-seeder
│
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Reusable UI widgets, KPI cards, charts, and maps
│   │   ├── routes/           # Pages (Dashboard, Fleet, Vehicles, Drivers, Charging, AI Scoring, etc.)
│   │   └── lib/              # Auth context, API client, and helpers
│   ├── package.json
│   └── vite.config.ts
│
├── driver_realtime_data.csv               # Empirical telemetry dataset for ML training
├── unified_ev_fleet_dataset_final.xlsx    # Master fleet dataset for database initialization
├── range_model.pkl                        # Serialized Random Forest range prediction model
├── performance_model.pkl                  # Serialized Linear Regression driver score model
└── train_range_model.py                   # Script to train & serialize range prediction model
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18.x or higher (and npm / pnpm)
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/MithiMaster/VoltFleet-AI.git
cd VoltFleet-AI
```

---

### 2. Backend Setup & Execution

#### Step A: Create and Activate a Virtual Environment
```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

#### Step B: Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```

#### Step C: Configure Environment Variables
Copy the example environment file:
```bash
# Windows (PowerShell)
Copy-Item backend\.env.example backend\.env

# Linux / macOS
cp backend/.env.example backend/.env
```

*(By default, the backend runs out-of-the-box using local SQLite `voltgrid.db` and auto-seeds vehicles, drivers, and initial telemetry from `unified_ev_fleet_dataset_final.xlsx` on first launch.)*

#### Step D: Run the Backend Server
From the root directory:
```bash
uvicorn backend.main:app --reload --port 8000
```

- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 3. Frontend Setup & Execution

#### Step A: Navigate to Frontend Directory
```bash
cd frontend
```

#### Step B: Install Node Packages
```bash
npm install
```

#### Step C: Launch Frontend Development Server
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:8080](http://localhost:8080) (or `http://localhost:5173`)

---

## 🔑 Default Login Credentials

Upon startup, the database is pre-seeded with sample fleet managers and drivers:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Fleet Manager (Admin)** | `you@fleet.com` | `password` |
| **Driver 1** | `maya@voltgrid.com` | *(OTP or pre-configured)* |
| **Driver 2** | `diego@voltgrid.com` | *(OTP or pre-configured)* |

---

## 🧪 Training the Machine Learning Models

To re-train or fine-tune the EV Range Prediction model using the real-world telematics dataset:
```bash
python train_range_model.py
```
This updates `range_model.pkl` with:
- Features: `current_battery_pct`, `battery_capacity_kwh`, `current_speed_kmh`, `ac_status`, `outside_temperature_c`, `route_type_encoded`, `elevation_encoded`
- High $R^2$ accuracy score and low Mean Absolute Error (MAE).

---

## 🛠️ Tech Stack Details

- **Backend**: FastAPI, SQLAlchemy, SQLite / PostgreSQL (TimescaleDB ready), Pydantic v2, Passlib (bcrypt), PyJWT
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, TanStack Router, Recharts, Leaflet, Lucide React, Radix UI
- **Data & ML**: Pandas, NumPy, Scikit-learn, OpenPyXL

---

## 📄 License
This project is licensed under the MIT License.
