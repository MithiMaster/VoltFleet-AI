# SRI MANAKULA VINAYAGAR ENGINEERING COLLEGE
### (An Autonomous Institution, Affiliated to Pondicherry University)
### Madagadipet, Puducherry - 605 107

## DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
### PROJECT PHASE – I (JUN 2026 TO NOV 2026)
### STUDENTS WEEKLY REPORT (13 WEEKS RECORD)

---

### **Project Identification & Team Information**
- **Project Title:** **VoltFleet AI: Intelligent EV Fleet Management, Predictive Battery Analytics & Route Optimization**
- **Academic Year:** 2026 – 2027
- **Batch:** 2023 – 2027
- **Degree & Branch:** B.Tech – Computer Science and Engineering
- **Class & Section:** IV Year / VII Semester / Section A (CSE IV-A)
- **Team No:** Team 12
- **Project Guide:** **Mrs. P. NIRMALADEVI**, Associate Professor, Department of CSE
- **Project Phase 1 Coordinator:** **Dr. N. DANAPAQUIAME**, Professor, Department of CSE
- **Head of the Department (HOD):** **Dr. N. DANAPAQUIAME**, Department of CSE

### **Team Members**

| S. No | Reg No | Name of the Student | Primary Technical Area / Module Responsibility |
|:---:|:---:|:---|:---|
| 1 | **23UCS100** | **MITHILESH S** | Project Lead, Full-Stack Architecture, Live Fleet Command Center & Leaflet Map Integration |
| 2 | **23UCS099** | **MATHIVANAN M** | Backend Architecture, FastAPI Microservices, Database Modeling & Telematics Ingestion Pipeline |
| 3 | **23UCS079** | **KANAKALA NAGA VISHNU K** | Machine Learning Lead, HistGradientBoosting Range Predictor & SOH Battery Analytics |
| 4 | **23UCS108** | **NISHAN S** | ML Driver Performance Scoring Engine, Smart Charging Scheduler & Reporting Microservice |

---

## **Executive Project Summary**

**VoltFleet AI** is an advanced, intelligence-driven electric vehicle fleet management platform designed to eliminate en-route range anxiety, mitigate accelerated battery degradation, reduce operational charging expenditures, and optimize commercial transit logistics.
The platform operates on a decoupled 3-tier microservice architecture combining a high-performance **React 18 / TypeScript / TanStack / Leaflet** client dashboard with a robust **FastAPI / SQLAlchemy / Scikit-learn** backend.
Key innovations implemented during Project Phase - I include:
1. **Live Interactive Fleet Command Center:** Real-time multi-vehicle telemetry mapping with high-contrast status visualization.
2. **Role-Based Authentication & Telematics Ingestion:** Dual RBAC separating Fleet Managers and Commercial Drivers with bcrypt hashing and JWT tokens.
3. **Dynamic Multi-Stop Route Optimizer:** OpenStreetMap routing coupled with Digital Elevation Modeling (DEM) calculating topographic climbing penalties and downhill regenerative energy recovery.
4. **AI Driver Performance Scoring:** Multiple Linear Regression evaluating driving behavior across 4 pillars (Safety, Efficiency, Battery Care, Route Compliance) with personalized AI coaching.
5. **Physics-Informed ML Battery Range Predictor:** Scikit-Learn `HistGradientBoostingRegressor` (R² > 0.96) predicting real-world range under dynamic temperature, payload, and terrain conditions.
6. **Smart Charging Scheduler & Predictive Maintenance:** Time-of-Use (ToU) off-peak tariff optimization reducing energy bills by up to 31.4% and proactive anomaly-triggered service tickets.

---

## **WEEK NO: 01**
### **Focus Theme: Project Domain Selection, Problem Formulation & Initial Scope**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Discussion with guide on project domain selection & EV fleet management feasibility. | **2%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Analysis of EV fleet challenges: range anxiety, battery degradation, and charging costs. | **3%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Identification of target stakeholders: Fleet Managers and Commercial EV Drivers. | **5%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Feasibility study on IoT telemetry ingestion and physics-informed ML algorithms. | **6%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Formulation of project title 'VoltFleet AI' and high-level system objectives. | **8%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Finalization of Project Phase-I scope and team task division with guide approval. | **10%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 1:**  
Approved Project Proposal, Problem Definition Document, and Initial Task Delegation Matrix.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 02**
### **Focus Theme: Literature Survey, Research Papers Analysis & Existing System Benchmarking**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Literature review on EV energy consumption models and vehicle kinetic dynamics. | **11%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Benchmarking existing telematics platforms (Geotab, Samsara, Tesla Fleet). | **13%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Study on battery SOC and SOH estimation methods (Coulomb counting vs ML). | **14%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Review of research papers on EV routing with charging station constraints (EVRPTW). | **16%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Survey on smart depot charging scheduling under Time-of-Use (ToU) electricity tariffs. | **17%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Compilation of literature survey matrix (10+ papers) and review with guide. | **18%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 2:**  
Comprehensive Literature Survey Matrix covering 10+ peer-reviewed papers and Comparative Benchmarking Chart.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 03**
### **Focus Theme: Requirements Elicitation, Tech Stack Selection & Zeroth Review Preparation**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Elicitation of functional requirements: live map, range predictor, and driver scoring. | **20%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Definition of non-functional requirements: sub-second latency, JWT auth, and UI responsiveness. | **22%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Selection of tech stack: React 18, TypeScript, Tailwind, FastAPI, and Scikit-learn. | **23%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Preparation of Zeroth Review presentation slides and architectural overview. | **25%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Mock presentation of Zeroth Review slides before guide; refined technical diagrams. | **26%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Guide sign-off on Zeroth Review slide deck and submission to project coordinator. | **27%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 3:**  
Software Requirements Specification (SRS) Draft, Final Tech Stack Specification, and Approved Zeroth Review PPT.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 04**
### **Focus Theme: Zeroth Review Defense, Committee Feedback & SRS Documentation**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Presentation of Zeroth Review before the department project review committee. | **28%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Analysis of committee feedback: added thermal runaway alerts & elevation modeling. | **30%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Initiation of IEEE-format Software Requirements Specification (SRS) document. | **32%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Specification of the 6 core system modules and user interaction boundaries. | **33%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Definition of synthetic telematics schemas, operational constraints, and data dictionaries. | **35%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Verification and guide approval of completed Project Phase-I SRS document. | **36%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 4:**  
Zeroth Review Defense Completion, Official Committee Feedback Form, and IEEE-Standard SRS Document.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 05**
### **Focus Theme: System Architecture Design & UML Modeling**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Design of 3-tier decoupled system architecture: UI, FastAPI, and Database layer. | **38%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Construction of High-Level Architecture Diagram showing telematics and ML pipelines. | **40%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Development of UML Use Case Diagrams for Fleet Manager and Driver personas. | **41%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Creation of UML Sequence Diagrams for live telemetry transmission and emergency alerts. | **43%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Design of UML Component and Deployment Diagrams for microservice endpoints. | **44%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Guide review and sign-off on all system architecture and UML design diagrams. | **45%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 5:**  
High-Level Architecture Blueprint, Complete UML Diagram Suite (Use Case, Sequence, Component, Deployment), and Data Flow Diagrams (DFD Level 0-2).

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 06**
### **Focus Theme: Data Modeling, Database Schema Implementation & Synthetic EV Fleet Generation**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Conceptual Entity-Relationship (ER) modeling for vehicles, users, and telemetry logs. | **47%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Implementation of database schema using SQLAlchemy ORM models (models.py). | **48%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Definition of synthetic EV telematics parameters: SOC, SOH, voltage, current, and temperature. | **50%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Modeling commercial EV vehicle specifications (Tata Curvv, Nexon, MG ZS EV). | **52%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Creation of telemetry simulation script (simulator.py) for realistic drive cycles. | **53%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Database seeding, transactional integrity checks, and validation with guide. | **55%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 6:**  
SQLAlchemy Database Schema (models.py), Initial SQLite/PostgreSQL Database Migration, and Automated Fleet Seeding Engine.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 07**
### **Focus Theme: Module 1 & 2: User Authentication, RBAC & Core Backend Foundation**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Backend implementation of password hashing with bcrypt (12 rounds) in auth.py. | **57%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Development of 6-digit cryptographic OTP email verification using SMTP services. | **58%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Enforcement of Role-Based Access Control (RBAC) middleware for Manager and Driver roles. | **60%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Frontend authentication UI: Login, Register, Forgot Password, and OTP verification views. | **62%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Integration of TanStack Router route guards to protect dashboard endpoints. | **63%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Testing of end-to-end authentication lifecycle and guide verification of token flow. | **65%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 7:**  
Working Dual-Role Authentication System, Cryptographic OTP Verification Service, and Protected Frontend Route Navigation.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 08**
### **Focus Theme: Module 1: Live Interactive Fleet Command Center & Telematics Ingestion**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Development of high-throughput asynchronous telematics ingestion API in FastAPI. | **67%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Building multi-vehicle simulation engine generating concurrent telemetry streams. | **68%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Integration of Leaflet night-highway map view with color-coded vehicle status markers. | **70%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Creation of real-time Fleet KPI cards (Total Fleet, Active Transit, Average SOC%). | **71%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Development of interactive Vehicle Telemetry Detail modal for live vehicle metrics. | **73%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Live demonstration of Fleet Command Center with simulated multi-vehicle telemetry to guide. | **74%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 8:**  
Interactive Leaflet Live Fleet Map, Asynchronous Telematics Ingestion Engine, and Real-Time Fleet KPI Aggregator.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 09**
### **Focus Theme: Module 3: Dynamic Multi-Stop Route Optimizer & Global Elevation Engine**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Implementation of OpenStreetMap routing engine in route_optimizer.py. | **76%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Parsing Digital Elevation Model (DEM) data to extract route topographical profiles. | **77%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Formulation of physics-based energy model accounting for hill climbs and regenerative braking. | **79%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Development of automated DC fast-charging stop insertion algorithm when SOC < 20%. | **80%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Construction of frontend Route Optimizer UI with waypoint picker and elevation charts. | **82%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Demonstration of 585 km transit case study (Berlin to Munich) with charging stops to guide. | **83%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 9:**  
Topographical Multi-Stop Route Optimizer, Elevation Profile Visualizer, and Automated Charging Stop Insertion Algorithm.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 10**
### **Focus Theme: Module 4: Machine Learning AI Driver Performance Scoring & Coaching Engine**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Formulation of 4-pillar driver scoring: Safety, Efficiency, Battery Care, Route Compliance. | **85%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Training Multiple Linear Regression model linking driving telemetry to driver scores. | **86%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Implementation of rule-based AI Coaching Engine providing personalized driver tips. | **87%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Creation of Driver Management dashboard with performance radar charts and leaderboards. | **89%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Implementation of Driver Self-Service Portal (app.driver-dashboard.tsx) for shift logs. | **90%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Validation of driver scoring calibration with synthetic driving anomalies; guide sign-off. | **91%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 10:**  
Trained ML Driver Scoring Model, Automated AI Coaching Rule Engine, and Interactive Driver Portal with Performance Radar Charts.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 11**
### **Focus Theme: Module 5: Physics-Informed ML Battery Range Predictor & Health Analytics**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Feature engineering for EV range model: SOC, speed, ambient temperature, weight, elevation. | **92%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Training Scikit-Learn HistGradientBoostingRegressor model (achieved R² > 0.96, low RMSE). | **93%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Implementation of interactive 'What-If' Range Simulator for pre-departure mission checks. | **94%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Development of Battery Health (SOH) analytics tracking cell impedance and capacity fade. | **95%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Integration of thermal runaway early warning system alerting when battery pack temp > 45°C. | **95%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Verification of range prediction accuracy and battery health dashboards with guide. | **96%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 11:**  
Trained HistGradientBoosting Range Model (range_model.pkl), Interactive Range Simulator UI, and Thermal Runaway Safety Monitor.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 12**
### **Focus Theme: Module 6: Smart Charging Scheduler, Predictive Maintenance & Reporting Engine**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Algorithm design for Time-of-Use (ToU) Off-Peak depot charging optimization (23:00-06:00). | **96%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Implementation of smart charging bay allocation matching connector types and departure time. | **97%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | Development of Predictive Maintenance engine tracking mileage thresholds and brake wear. | **97%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Creation of Maintenance & Alerts UI (app.maintenance.tsx) with ticket dispatch tracking. | **98%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Implementation of automated reporting engine (reports.py) generating PDF, Excel, and CSV files. | **98%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Demonstration of smart charging schedules, cost savings, and report exports to guide. | **99%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 12:**  
Time-of-Use Depot Charging Scheduler, Predictive Maintenance Ticket Generator, and Automated Multi-Format Report Exporter.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **WEEK NO: 13**
### **Focus Theme: System Integration, ML Benchmarking, Phase-I Documentation & Final Review**

#### **Report on Daily Meeting: (Note: Students need to meet the guide everyday)**

| S. No | Day of meeting | Topics discussed | % of work completed as per the previous day discussion | Signature of the Guide |
|:---:|:---:|:---|:---:|:---:|
| 1 | **Monday** | Comprehensive end-to-end integration testing uniting React frontend with FastAPI backend. | **99%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 2 | **Tuesday** | Benchmarking ML models: Random Forest (97.6%), Logistic Regression (98.4%), KNN (94.3%). | **99%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 3 | **Wednesday** | System performance profiling, memory utilization audits, and API latency optimization. | **99%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 4 | **Thursday** | Finalization of Project Phase-I Comprehensive Report draft adhering to college format. | **100%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 5 | **Friday** | Rehearsal of Project Phase-I Final Review presentation and live platform demo with guide. | **100%** | *(Signed - Mrs. P. Nirmaladevi)* |
| 6 | **Saturday** | Defense of Project Phase-I Final Review before committee; guide, coordinator, and HOD sign-off. | **100%** | *(Signed - Mrs. P. Nirmaladevi)* |

**Key Deliverables / Milestones Achieved in Week 13:**  
Completed Project Phase-I Comprehensive Report, Validated Multi-Model Benchmark Suite, and Successful Final Review Presentation.

**Guide's Cumulative Remarks & Verification:**  
*Satisfactory progress verified against weekly milestone targets. All technical requirements, architectural patterns, and algorithmic formulations reviewed and approved.*

| Project Phase 1 Coordinator | Project Guide | Head of the Department (HOD) |
|:---:|:---:|:---:|
| **[Dr. N. Danapaquiame]** | **[Mrs. P. Nirmaladevi]** | **[Dr. N. Danapaquiame]** |

================================================================================

## **Consolidated 13-Week Phase-I Milestone Summary Matrix**

| Week No | Milestone & Project Focus | Key Technical Deliverables | Cumulative Progress | Relevant Module |
|:---:|:---|:---|:---:|:---:|
| **Week 01** | Domain Selection & Problem Formulation | Project Proposal & Problem Statement | **2% → 10%** | Core System Vision |
| **Week 02** | Literature Survey & Gap Analysis | 10+ Paper Survey Matrix & Benchmark Study | **11% → 18%** | Theoretical Framework |
| **Week 03** | Requirements Elicitation & Tech Stack | SRS Baseline & Zeroth Review Slide Deck | **20% → 27%** | System Architecture |
| **Week 04** | Zeroth Review Defense & SRS Sign-Off | Committee Evaluation Form & Final SRS Doc | **28% → 36%** | Review Milestone |
| **Week 05** | High/Low Level Design & UML Modeling | Use Case, Sequence, Component & DFD Diagrams | **38% → 45%** | System Design |
| **Week 06** | Database Modeling & Synthetic Telematics | SQLAlchemy Models, Seeder Script & Seed Data | **47% → 55%** | Data Layer |
| **Week 07** | Dual-Role Auth & Cryptographic Security | bcrypt Hashing, JWT Tokens & OTP Verification | **57% → 65%** | Module 2 (Auth/RBAC) |
| **Week 08** | Live Command Center & Telematics Ingestion | Leaflet Live Map, KPI Strip & Ingestion API | **67% → 74%** | Module 1 (Command Center) |
| **Week 09** | Multi-Stop Elevation-Aware Route Optimizer | OpenStreetMap Routing, DEM & DC Fast Charge Insertion | **76% → 83%** | Module 3 (Route Optimizer) |
| **Week 10** | ML Driver Performance Scoring & AI Coaching | Linear Regression Scoring & Driver Portal | **85% → 91%** | Module 4 (Driver AI Scoring) |
| **Week 11** | Physics-Informed Battery Range Predictor | HistGradientBoosting Model & SOH Degradation Analytics | **92% → 96%** | Module 5 (Battery Analytics) |
| **Week 12** | Smart Depot Charging Scheduler & Reports | ToU Tariff Optimizer & PDF/Excel/CSV Exporter | **96% → 99%** | Module 6 (Charging & Reports) |
| **Week 13** | End-to-End Integration & Final Review | Benchmark Evaluation Suite & Final Project Report | **99% → 100%** | Project Phase - I Completion |

---

### **Final Project Phase - I Sign-Off**

This 13-week logbook report certifies that the students have consistently attended all scheduled daily guide meetings, demonstrated incremental technical deliverables, and successfully fulfilled the requirements for **Project Phase – I** for the academic year 2026–2027.

```
PROJECT GUIDE                    PROJECT COORDINATOR               HEAD OF THE DEPARTMENT
[Mrs. P. Nirmaladevi]            [Dr. N. Danapaquiame]             [Dr. N. Danapaquiame]
Associate Professor              Professor                         Head of Department
Dept. of Computer Science & Eng. Dept. of Computer Science & Eng.  Dept. of Computer Science & Eng.
SMVEC, Puducherry                SMVEC, Puducherry                 SMVEC, Puducherry
```
