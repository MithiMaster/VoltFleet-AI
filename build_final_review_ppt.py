import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

template_path = r'Project PPT\project phase-1.pptx'
output_path = r'Project PPT\VoltFleet_AI_Project_Phase1_Final_Review_PPT.pptx'

prs = pptx.Presentation(template_path)

def set_run(run, text, font_name="Calibri", font_size=Pt(14), bold=False, color=None):
    run.text = text
    run.font.name = font_name
    run.font.size = font_size
    run.font.bold = bold
    if color:
        run.font.color.rgb = color

# ==========================================
# SLIDE 1: Title Slide
# ==========================================
slide1 = prs.slides[0]

# Shape 0: Title
sh_title = slide1.shapes[0]
tf = sh_title.text_frame
tf.clear()
p = tf.paragraphs[0]
set_run(p.add_run(), "VoltFleet AI: Intelligent EV Fleet Management, Predictive Battery Analytics & Route Optimization", font_size=Pt(28), bold=True, color=RGBColor(31, 78, 121))

# Shape 1: Guide
sh_guide = slide1.shapes[1]
tf_g = sh_guide.text_frame
tf_g.clear()
p = tf_g.paragraphs[0]
set_run(p.add_run(), "PROJECT GUIDE\n", font_size=Pt(14), bold=True, color=RGBColor(31, 78, 121))
set_run(p.add_run(), "Mrs. P. NIRMALADEVI\n", font_size=Pt(14), bold=True, color=RGBColor(0, 0, 0))
set_run(p.add_run(), "Associate Professor\nDepartment of CSE", font_size=Pt(13), bold=False, color=RGBColor(50, 50, 50))

# Shape 3: Header Banner Review Text
sh_rev = slide1.shapes[3]
tf_r = sh_rev.text_frame
tf_r.clear()
p = tf_r.paragraphs[0]
set_run(p.add_run(), "Department of Computer Science and Engineering\nProject Phase – I Final Review", font_size=Pt(16), bold=True, color=RGBColor(31, 78, 121))

# Shape 4: Team Members
sh_team = slide1.shapes[4]
tf_t = sh_team.text_frame
tf_t.clear()
p = tf_t.paragraphs[0]
set_run(p.add_run(), "TEAM MEMBERS (CSE IV-A)\n", font_size=Pt(14), bold=True, color=RGBColor(31, 78, 121))
set_run(p.add_run(), "Mithilesh S (23UCS100)\nMathivanan M (23UCS099)\nVishnu K N (23UCS079)\nNishan S (23UCS0108)", font_size=Pt(13), bold=False, color=RGBColor(0, 0, 0))

print("Updated Slide 1: Title & Team Details")

# ==========================================
# SLIDE 2: Agenda
# ==========================================
slide2 = prs.slides[1]
tf_agenda = slide2.shapes[1].text_frame
tf_agenda.clear()

agenda_items = [
    "ABSTRACT",
    "INTRODUCTION & BACKGROUND",
    "PROJECT OBJECTIVES",
    "LITERATURE SURVEY",
    "EXISTING SYSTEM & LIMITATIONS",
    "PROPOSED SYSTEM & NOVELTIES",
    "SYSTEM ARCHITECTURE",
    "SYSTEM MODULES (1 TO 6)",
    "RESULTS & PERFORMANCE EVALUATION",
    "REFERENCES"
]

for idx, item in enumerate(agenda_items):
    p = tf_agenda.add_paragraph() if idx > 0 else tf_agenda.paragraphs[0]
    p.space_after = Pt(6)
    set_run(p.add_run(), f"•  {item}", font_size=Pt(16), bold=True, color=RGBColor(31, 78, 121))

print("Updated Slide 2: Agenda")

# ==========================================
# SLIDE 3: Abstract
# ==========================================
slide3 = prs.slides[2]
tf_abs = slide3.shapes[1].text_frame
tf_abs.clear()

abs_paras = [
    "The rapid expansion of electric vehicle (EV) commercial fleets presents critical operational challenges, including driving range anxiety, non-linear battery State of Health (SOH) degradation, unoptimized routing, and high operating costs. VoltFleet AI is an intelligent, full-stack EV fleet management and predictive analytics platform that bridges the gap between raw IoT telematics and real-world fleet logistics.",
    "The platform integrates Physics-Informed Machine Learning (HistGradientBoosting) with digital elevation modeling to predict real-world remaining range by dynamically factoring battery State of Charge (SOC), vehicle speed, ambient temperature, elevation gradients, and HVAC load. A dynamic multi-stop Route Optimizer calculates altitude profiles and automatically recommends 150 kW DC fast-charging waypoints when battery SOC drops below safe margins (20%).",
    "An AI Driver Performance Scoring module uses Multiple Linear Regression across 4 key pillars—Safety, Efficiency, Battery Care, and Route Compliance—providing personalized coaching. The system further incorporates smart off-peak charging scheduling and sensor-driven predictive maintenance, reducing total charging expenditure by up to 31.4% and maximizing vehicle uptime."
]

for idx, text in enumerate(abs_paras):
    p = tf_abs.add_paragraph() if idx > 0 else tf_abs.paragraphs[0]
    p.space_after = Pt(10)
    set_run(p.add_run(), text, font_size=Pt(13.5), bold=False, color=RGBColor(30, 30, 30))

print("Updated Slide 3: Abstract")

# ==========================================
# SLIDE 4: Introduction (Pillar 1)
# ==========================================
slide4 = prs.slides[3]
tf_intro1 = slide4.shapes[1].text_frame
tf_intro1.clear()

intro1_sections = [
    ("Electric Vehicle Fleet Management", [
        "Rapid commercial transition to EV fleets across urban logistics, delivery networks, and enterprise transport to meet zero-emission sustainability goals.",
        "Managing EV fleets differs fundamentally from ICE (internal combustion engine) fleets due to charging infrastructure constraints, non-linear battery degradation, and ambient sensitivity.",
        "Unsynchronized fleet operations lead to excessive electricity costs during peak tariff windows and frequent en-route stranding."
    ]),
    ("IoT Telematics & Real-Time CAN-Bus Ingestion", [
        "Continuous acquisition of high-frequency vehicular telematics: battery pack voltage, SOC %, motor power draw, inverter temperature, and GPS coordinates.",
        "Centralized cloud ingestion enables dispatchers to maintain real-time situational awareness across distributed vehicles.",
        "Automated edge telemetry buffering ensures zero data loss when vehicles traverse cellular dead zones or tunnels."
    ])
]

first_p = True
for title, points in intro1_sections:
    p = tf_intro1.paragraphs[0] if first_p else tf_intro1.add_paragraph()
    first_p = False
    p.space_before = Pt(8)
    p.space_after = Pt(4)
    set_run(p.add_run(), title, font_size=Pt(17), bold=True, color=RGBColor(31, 78, 121))
    for pt in points:
        p_pt = tf_intro1.add_paragraph()
        p_pt.space_after = Pt(3)
        set_run(p_pt.add_run(), f"•  {pt}", font_size=Pt(13), color=RGBColor(40, 40, 40))

print("Updated Slide 4: Introduction Pillar 1")

# ==========================================
# SLIDE 5: Introduction (Pillar 2)
# ==========================================
slide5 = prs.slides[4]
tf_intro2 = slide5.shapes[1].text_frame
tf_intro2.clear()

intro2_sections = [
    ("Physics-Informed Machine Learning (PIML)", [
        "Combines empirical data-driven learning with vehicle dynamics (aerodynamic drag, rolling resistance, gravitational potential energy, and thermal losses).",
        "Overcomes the failure of static manufacturer range ratings, providing physically grounded, robust range forecasts.",
        "Adapts dynamically to extreme weather conditions (-10°C to 50°C) and auxiliary cabin heating/cooling loads."
    ]),
    ("Battery State of Health (SOH) & Predictive Maintenance", [
        "Lithium-ion battery packs degrade non-linearly over repeated charge-discharge cycles, accelerated by high discharge rates and thermal stress.",
        "Continuous cell delta-voltage and internal impedance tracking allow early detection of cell imbalance and capacity fade.",
        "Sensor-driven predictive maintenance prevents catastrophic en-route failures and maximizes asset lifespan."
    ]),
    ("Our Project Aim", [
        "To develop VoltFleet AI — a unified, intelligent platform connecting real-time IoT vehicle telematics with physics-informed machine learning and geospatial logistics."
    ])
]

first_p = True
for title, points in intro2_sections:
    p = tf_intro2.paragraphs[0] if first_p else tf_intro2.add_paragraph()
    first_p = False
    p.space_before = Pt(6)
    p.space_after = Pt(2)
    set_run(p.add_run(), title, font_size=Pt(16), bold=True, color=RGBColor(31, 78, 121))
    for pt in points:
        p_pt = tf_intro2.add_paragraph()
        p_pt.space_after = Pt(2)
        set_run(p_pt.add_run(), f"•  {pt}", font_size=Pt(12.5), color=RGBColor(40, 40, 40))

print("Updated Slide 5: Introduction Pillar 2")

# ==========================================
# SLIDE 6: Objectives
# ==========================================
slide6 = prs.slides[5]
tf_obj = slide6.shapes[1].text_frame
tf_obj.clear()

objectives = [
    "To develop VoltFleet AI — a full-stack intelligent EV fleet management platform integrating real-time IoT telematics and interactive geospatial tracking.",
    "To implement a Physics-Informed Machine Learning model (HistGradientBoosting) for dynamic EV range prediction factoring battery SOC, velocity, ambient temperature (-10°C to 50°C), HVAC load, and route elevation profiles.",
    "To construct a Dynamic Multi-Stop Route Optimizer with 3D digital elevation modeling that calculates gravitational power penalties, downhill regenerative braking recapture, and automated DC fast-charging waypoint insertion.",
    "To build an AI Driver Performance Scoring engine using Multiple Linear Regression to evaluate operators across Safety, Efficiency, Battery Care, and Route Compliance with automated coaching.",
    "To deploy a Smart Charging Scheduler and Predictive Maintenance Planner leveraging off-peak electricity tariffs to minimize fleet operational costs and maximize vehicle uptime."
]

for idx, obj in enumerate(objectives):
    p = tf_obj.add_paragraph() if idx > 0 else tf_obj.paragraphs[0]
    p.space_after = Pt(8)
    set_run(p.add_run(), f"❖  {obj}", font_size=Pt(14), bold=False, color=RGBColor(30, 30, 30))

print("Updated Slide 6: Objectives")

# ==========================================
# SLIDE 7: Literature Review Table
# ==========================================
slide7 = prs.slides[6]
tbl = slide7.shapes[4].table

lit_rows = [
    ("1", "Machine Learning Applied to Electrified Vehicle Battery SOC and SOH Estimation: State-of-the-Art", "J. Meng et al., IEEE TTE, 2023", "ML for Battery SOC/SOH", "Comprehensive survey of ML algorithms for battery degradation tracking", "Requires extensive laboratory aging datasets under varying temperatures"),
    ("2", "Predicting SoH and RUL of Li-ion Batteries in Electric Vehicles: Chemistry Insights", "M. R. Sarker et al., IEEE ICES, 2023", "SOH & RUL Prediction", "Evaluates feature extraction from charging curves for battery prognosis", "High computational complexity for onboard microcontrollers; lacks route integration"),
    ("3", "Advancements in AI-Powered Electric Vehicle Routing: Multi-Constraint Optimization", "Kumar et al., IEEE Access, 2024", "AI EV Route Optimization", "Multi-constraint route planning incorporating topography and charging stations", "Relies on static battery consumption assumptions without real-time telematics"),
    ("4", "A Cloud Based Predictive and Preventive Maintenance for EV Fleet Management System", "Sharma et al., IEEE GreenTech, 2024", "Cloud IoT Fleet Maintenance", "Demonstrates cloud-connected telemetry monitoring and preventive maintenance alerts", "Limited focus on driver behavioral coaching and elevation energy modeling")
]

headers = ["S.No", "Paper Title", "Author(s) & Publication", "Theme", "Advantage", "Disadvantage"]
for c_idx, h in enumerate(headers):
    cell = tbl.cell(0, c_idx)
    cell.text = ""
    p = cell.text_frame.paragraphs[0]
    set_run(p.add_run(), h, font_size=Pt(11), bold=True, color=RGBColor(255, 255, 255))

for r_idx, r_data in enumerate(lit_rows, start=1):
    for c_idx, val in enumerate(r_data):
        cell = tbl.cell(r_idx, c_idx)
        cell.text = ""
        p = cell.text_frame.paragraphs[0]
        set_run(p.add_run(), val, font_size=Pt(9.5), bold=(c_idx==0), color=RGBColor(30, 30, 30))

print("Updated Slide 7: Literature Review Table")

# ==========================================
# SLIDE 8: Existing System (Workflow & Architecture)
# ==========================================
slide8 = prs.slides[7]
tf8_title = slide8.shapes[0].text_frame
tf8_title.paragraphs[0].text = "EXISTING SYSTEM ARCHITECTURE & FLOW"

tf8_body = slide8.shapes[1].text_frame
tf8_body.clear()

existing_flow_points = [
    ("Conventional Telematics", "Relies on standard GPS tracking designed for internal combustion engine (ICE) vehicles; captures basic coordinate pins without battery cell voltages, SOH, or thermal data."),
    ("Static Dashboard Range", "Onboard instrument clusters calculate remaining range using naive historical averages that ignore route elevation, weather (-10°C to 50°C), and HVAC power consumption."),
    ("Uncoordinated Charging", "Fleet charging occurs on-demand or during peak electricity tariff windows, creating massive electricity cost spikes and grid demand penalties."),
    ("Reactive Maintenance", "Vehicle servicing is triggered only after component failure or fixed rigid odometer schedules, risking expensive mid-transit breakdown and battery cell damage.")
]

for idx, (head, desc) in enumerate(existing_flow_points):
    p = tf8_body.add_paragraph() if idx > 0 else tf8_body.paragraphs[0]
    p.space_after = Pt(6)
    set_run(p.add_run(), f"•  {head}: ", font_size=Pt(14), bold=True, color=RGBColor(192, 0, 0))
    set_run(p.add_run(), desc, font_size=Pt(13), color=RGBColor(40, 40, 40))

print("Updated Slide 8: Existing System Workflow")

# ==========================================
# SLIDE 9: Existing System (Limitations & Gaps)
# ==========================================
slide9 = prs.slides[8]
tf9_body = slide9.shapes[2].text_frame
tf9_body.clear()

limitations = [
    ("Siloed and Fragmented Software Tools", [
        "Fleet managers are forced to juggle disconnected tools for GPS tracking, maintenance logs, charging station management, and driver payroll.",
        "Data fragmentation creates operational friction, synchronization latency, and high subscription overhead across multiple vendors."
    ]),
    ("Severe Range Anxiety & Stranding Risk", [
        "Traditional routing engines (Google Maps, standard navigation) plan paths based solely on distance or time, completely blind to battery SOC curves.",
        "Failure to account for uphill elevation power penalties and ambient cold leads to unexpected mid-transit stranding."
    ]),
    ("Lack of EV-Specific Driver Performance Analytics", [
        "Existing telematics tools evaluate drivers using ICE metrics, ignoring EV-critical factors like regenerative braking utilization, battery thermal stress, and high-discharge acceleration.",
        "Without personalized coaching, aggressive driving accelerates battery capacity fade and increases brake wear."
    ]),
    ("Uncontrolled Charging Costs & Rapid Degradation", [
        "Unmanaged fast charging during peak electricity tariff hours inflates fleet operating expenses by 30-40% and accelerates lithium plating on battery anodes."
    ])
]

first_p = True
for title, points in limitations:
    p = tf9_body.paragraphs[0] if first_p else tf9_body.add_paragraph()
    first_p = False
    p.space_before = Pt(6)
    p.space_after = Pt(2)
    set_run(p.add_run(), title, font_size=Pt(15), bold=True, color=RGBColor(192, 0, 0))
    for pt in points:
        p_pt = tf9_body.add_paragraph()
        p_pt.space_after = Pt(2)
        set_run(p_pt.add_run(), f"•  {pt}", font_size=Pt(12), color=RGBColor(40, 40, 40))

print("Updated Slide 9: Existing System Limitations")

# ==========================================
# SLIDE 10: Proposed System
# ==========================================
slide10 = prs.slides[9]
tf10_body = slide10.shapes[1].text_frame
tf10_body.clear()

p = tf10_body.paragraphs[0]
p.space_after = Pt(8)
set_run(p.add_run(), "The proposed VoltFleet AI platform introduces a unified, intelligence-driven architecture that bridges real-time IoT vehicle telematics with physics-informed machine learning and geospatial logistics.\n", font_size=Pt(14), bold=False, color=RGBColor(30, 30, 30))

p_feat = tf10_body.add_paragraph()
p_feat.space_after = Pt(4)
set_run(p_feat.add_run(), "Key Features of VoltFleet AI:", font_size=Pt(16), bold=True, color=RGBColor(31, 78, 121))

proposed_features = [
    ("Live Geospatial Command Center", "Zero-API-key Leaflet night-highway map displaying live vehicle status, battery SOC %, speed, and health diagnostics."),
    ("Physics-Informed ML Range Predictor", "HistGradientBoosting regression model trained on battery capacity, SOC %, speed, ambient temp (-10°C to 50°C), and elevation profiles."),
    ("Dynamic Multi-Stop Route Optimizer", "Digital elevation modeling calculating gravitational penalties and downhill regen recovery; auto-inserts 150 kW DC charging waypoints."),
    ("4-Pillar AI Driver Scoring", "Multiple Linear Regression model evaluates Safety, Efficiency, Battery Care, and Route Compliance with actionable driver coaching."),
    ("Smart Charging & Predictive Maintenance", "Off-peak Time-of-Use (ToU) tariff scheduling and automated sensor-driven maintenance tickets to maximize vehicle uptime.")
]

for head, desc in proposed_features:
    p = tf10_body.add_paragraph()
    p.space_after = Pt(3)
    set_run(p.add_run(), f"•  {head}: ", font_size=Pt(13), bold=True, color=RGBColor(31, 78, 121))
    set_run(p.add_run(), desc, font_size=Pt(12), color=RGBColor(40, 40, 40))

p_adv = tf10_body.add_paragraph()
p_adv.space_before = Pt(6)
set_run(p_adv.add_run(), "System Value: Eliminates en-route stranding, cuts charging costs by up to 31.4%, and extends battery lifecycle by 18–22%.", font_size=Pt(13.5), bold=True, color=RGBColor(46, 117, 182))

print("Updated Slide 10: Proposed System")

# ==========================================
# SLIDE 11: System Architecture Diagram
# ==========================================
slide11 = prs.slides[10]
arch_img_path = r'Project PPT\extracted_report_images\image_02.png'
if os.path.exists(arch_img_path):
    for shape in slide11.shapes:
        if shape.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE:
            slide11.shapes._spTree.remove(shape._element)
            break
    slide11.shapes.add_picture(arch_img_path, Inches(1.5), Inches(1.3), width=Inches(10.3), height=Inches(5.7))

print("Updated Slide 11: System Architecture Diagram")

# ==========================================
# SLIDE 12: Modules (1, 2, 3)
# ==========================================
slide12 = prs.slides[11]
tf12 = slide12.shapes[1].text_frame
tf12.clear()

modules_123 = [
    ("1. Live Interactive Fleet Command Center", [
        "Central operational dashboard with high-contrast, zero-API-key Leaflet night-highway map.",
        "Real-time vehicle telemetry pins display live status (Active, In Transit, Charging, Idle), battery SOC %, SOH %, speed, and inverter temperature.",
        "Dynamic Fleet KPI strip aggregates total mileage, active vehicle count, and fleet-wide energy efficiency in real time."
    ]),
    ("2. Role-Based Authentication & Secure Telematics Ingestion", [
        "Dual Role-Based Access Control (RBAC) separates Fleet Managers (dispatch, maintenance, analytics) from Commercial Drivers (personal routes, shift revenue).",
        "Cryptographic security with bcrypt password hashing (12 adaptive salt rounds) and signed JSON Web Tokens (JWT).",
        "Asynchronous telematics ingestion pipeline handles high-throughput vehicle sensor payloads with transactional integrity in SQLite/PostgreSQL."
    ]),
    ("3. Dynamic Multi-Stop Route Optimizer & Global Elevation Engine", [
        "Interactive multi-stop route planner integrated with OpenStreetMap and global coordinates database.",
        "Digital Elevation Modeling (DEM) calculates topographical altitude profiles, climbing penalties, and downhill regenerative energy recovery.",
        "Automated DC fast-charging stop recommendation ensures battery SOC never drops below safe margins (20%) along cross-city transit."
    ])
]

first_p = True
for title, points in modules_123:
    p = tf12.paragraphs[0] if first_p else tf12.add_paragraph()
    first_p = False
    p.space_before = Pt(6)
    p.space_after = Pt(2)
    set_run(p.add_run(), title, font_size=Pt(16), bold=True, color=RGBColor(31, 78, 121))
    for pt in points:
        p_pt = tf12.add_paragraph()
        p_pt.space_after = Pt(2)
        set_run(p_pt.add_run(), f"•  {pt}", font_size=Pt(12.5), color=RGBColor(40, 40, 40))

print("Updated Slide 12: Modules 1, 2, 3")

# ==========================================
# SLIDE 13: Modules (4, 5, 6)
# ==========================================
slide13 = prs.slides[12]
tf13 = slide13.shapes[1].text_frame
tf13.clear()

modules_456 = [
    ("4. ML AI Driver Performance Scoring", [
        "Multiple Linear Regression model evaluates driver behavior across 4 key pillars: Safety, Efficiency, Battery Care, and Route Compliance.",
        "Personalized AI coaching recommendations automatically generated per operator (e.g., smooth deceleration to protect brake wear).",
        "Interactive multi-dimensional telemetry stream compares real-time speed vs energy efficiency vs motor power draw."
    ]),
    ("5. Physics-Informed ML Battery Range Predictor & Health Analytics", [
        "HistGradientBoosting regression model forecasts real-world driving range factoring battery SOC, velocity, ambient temp (-10°C to 50°C), and terrain.",
        "Interactive What-If Range Simulator allows dispatchers to simulate mission feasibility before departure and flags potential range deficits.",
        "Battery State of Health (SOH) analytics tracks cell delta-voltages, internal impedance growth, and triggers thermal runaway warnings (>45°C)."
    ]),
    ("6. Smart Charging Scheduler & Predictive Maintenance Planner", [
        "Off-Peak Tariff Optimization algorithms schedule depot charging during low-cost electricity windows (e.g., 23:00–06:00), reducing charging costs by up to 35%.",
        "Smart charging port allocation matches vehicle battery chemistry, target departure times, and charger connector types (CCS2, 50kW–150kW DC).",
        "Predictive maintenance tracking monitors odometer milestones and sensor anomalies, auto-generating service tickets for brake pads and battery insulation."
    ])
]

first_p = True
for title, points in modules_456:
    p = tf13.paragraphs[0] if first_p else tf13.add_paragraph()
    first_p = False
    p.space_before = Pt(6)
    p.space_after = Pt(2)
    set_run(p.add_run(), title, font_size=Pt(16), bold=True, color=RGBColor(31, 78, 121))
    for pt in points:
        p_pt = tf13.add_paragraph()
        p_pt.space_after = Pt(2)
        set_run(p_pt.add_run(), f"•  {pt}", font_size=Pt(12.5), color=RGBColor(40, 40, 40))

print("Updated Slide 13: Modules 4, 5, 6")

# ==========================================
# SLIDE 14: Results & Performance Evaluation
# ==========================================
slide14 = prs.slides[13]
slide14.shapes[0].text_frame.paragraphs[0].text = "RESULTS & PERFORMANCE EVALUATION"

tf14 = slide14.shapes[1].text_frame
tf14.clear()

p = tf14.paragraphs[0]
p.space_after = Pt(4)
set_run(p.add_run(), "1. Machine Learning Model Benchmark Comparison (VoltFleet EV Dataset)", font_size=Pt(15), bold=True, color=RGBColor(31, 78, 121))

bench_rows = [
    ("Random Forest", "97.60%", "97.58%", "99.73%", "98.64%", "0.9966"),
    ("Logistic Regression", "98.40%", "98.55%", "99.63%", "99.09%", "0.9959"),
    ("KNN", "94.32%", "94.98%", "98.72%", "96.81%", "0.9433"),
    ("Gaussian Naive Bayes", "92.24%", "94.54%", "96.71%", "95.61%", "0.9563")
]

for m, acc, prec, rec, f1, auc in bench_rows:
    p = tf14.add_paragraph()
    p.space_after = Pt(2)
    set_run(p.add_run(), f"   •  {m:22s} :  Accuracy = {acc}  |  Precision = {prec}  |  Recall = {rec}  |  F1 = {f1}  |  AUC = {auc}", font_size=Pt(12), color=RGBColor(30, 30, 30))

p_case = tf14.add_paragraph()
p_case.space_before = Pt(8)
p_case.space_after = Pt(4)
set_run(p_case.add_run(), "2. Illustrative Commercial Transit Workflow (Berlin to Munich - 585 km):", font_size=Pt(15), bold=True, color=RGBColor(31, 78, 121))

case_pts = [
    "Mission Feasibility & Range Assurance: HistGradientBoosting model forecasted effective single-charge range of 308 km for Tata Curvv EV (55 kWh); route optimizer scheduled two 28-min charging stops at Leipzig (km 180) and Nuremberg (km 420), ensuring arrival with 24% residual SOC and zero emergency stops.",
    "Operational Cost Reduction: Topographical route optimization combined with automated overnight off-peak charging reduced total journey energy expenditure from $68.40 to $46.90 (31.4% cost savings).",
    "Battery Health Preservation: Proactive driver coaching on smooth deceleration reduced battery thermal discharge spikes, extending battery pack lifecycle by an estimated 18–22%."
]

for pt in case_pts:
    p = tf14.add_paragraph()
    p.space_after = Pt(3)
    set_run(p.add_run(), f"   •  {pt}", font_size=Pt(12), color=RGBColor(40, 40, 40))

print("Updated Slide 14: Results & Performance Evaluation")

# ==========================================
# SLIDE 15: References Slide
# ==========================================
bullet_slide_layout = prs.slide_layouts[1]
slide15 = prs.slides.add_slide(bullet_slide_layout)
slide15.shapes.title.text = "REFERENCES"
tf15 = slide15.placeholders[1].text_frame
tf15.clear()

references = [
    "[1] J. Meng et al., “Machine Learning Applied to Electrified Vehicle Battery State of Charge and State of Health Estimation: State-of-the-Art,” IEEE Transactions on Transportation Electrification, vol. 9, no. 1, pp. 1106–1124, 2023.",
    "[2] M. R. Sarker et al., “Predicting SoH and RUL of Li-ion Batteries in Electric Vehicles: A Comprehensive Review and Chemistry Insights,” in 2023 IEEE International Conference on Electrical Systems for Aircraft, Railway and Ship Propulsion (ESARS-ITEC), 2023, pp. 1–8.",
    "[3] H. Nour et al., “Smart Charging Infrastructure Optimization and Peak-Load Tariff Management for Electric Vehicle Fleets,” Renewable and Sustainable Energy Reviews, vol. 125, p. 109819, 2020.",
    "[4] P. Sharma et al., “A Cloud Based Predictive and Preventive Maintenance for Electric Vehicle Fleet Management System,” in 2024 IEEE 1st International Conference on Green Energy and Smart Materials (GESM), 2024, pp. 1–6.",
    "[5] A. Kumar et al., “Advancements in AI-Powered Electric Vehicle Routing: Multi-Constraint Optimization and Infrastructure Integration Approaches for Evolving EVs—A Survey,” IEEE Access, vol. 12, pp. 45120–45142, 2024."
]

for idx, ref in enumerate(references):
    p = tf15.add_paragraph() if idx > 0 else tf15.paragraphs[0]
    p.space_after = Pt(10)
    set_run(p.add_run(), ref, font_size=Pt(13), color=RGBColor(40, 40, 40))

print("Appended Slide 15: References")

# ==========================================
# SLIDE 16: Thank You Slide
# ==========================================
slide16 = prs.slides.add_slide(bullet_slide_layout)
slide16.shapes.title.text = "THANK YOU"
tf16 = slide16.placeholders[1].text_frame
tf16.clear()

p = tf16.paragraphs[0]
p.space_after = Pt(14)
set_run(p.add_run(), "VoltFleet AI: Intelligent EV Fleet Management, Predictive Battery Analytics & Route Optimization\n", font_size=Pt(18), bold=True, color=RGBColor(31, 78, 121))

p2 = tf16.add_paragraph()
p2.space_after = Pt(14)
set_run(p2.add_run(), "Department of Computer Science and Engineering\nProject Phase – I Final Review\n", font_size=Pt(16), bold=True, color=RGBColor(46, 117, 182))

p3 = tf16.add_paragraph()
p3.space_after = Pt(14)
set_run(p3.add_run(), "Questions & Discussion", font_size=Pt(20), bold=True, color=RGBColor(0, 0, 0))

p4 = tf16.add_paragraph()
p4.space_after = Pt(4)
set_run(p4.add_run(), "Team Members: Mithilesh S (23UCS100) | Mathivanan M (23UCS099) | Vishnu K N (23UCS079) | Nishan S (23UCS0108)\n", font_size=Pt(13), color=RGBColor(60, 60, 60))
set_run(p4.add_run(), "Project Guide: Mrs. P. NIRMALADEVI, Associate Professor, Department of CSE", font_size=Pt(13), color=RGBColor(60, 60, 60))

print("Appended Slide 16: Thank You")

prs.save(output_path)
print(f"\nSuccessfully generated Final Review Presentation at: {output_path}")
