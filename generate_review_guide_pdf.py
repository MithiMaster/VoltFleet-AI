import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
import fitz  # PyMuPDF to inspect the generated PDF

# Custom NumberedCanvas to draw running header & footer with "Page X of Y"
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        page_w, page_h = A4
        margin = 36
        
        # Running Header (Pages > 1)
        if self._pageNumber > 1:
            self.drawString(margin, page_h - 24, "VoltFleet AI — Semester Project Review & Viva Defense Guide")
            self.drawRightString(page_w - margin, page_h - 24, "Department of CSE | SMVEC")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(margin, page_h - 28, page_w - margin, page_h - 28)

        # Running Footer (All pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(margin, 28, page_w - margin, 28)
        
        footer_left = "VoltFleet AI: Intelligent EV Fleet Management, Predictive Battery Analytics & Route Optimization"
        self.drawString(margin, 17, footer_left)
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(page_w - margin, 17, page_str)
        self.restoreState()


def build_review_guide_pdf(output_pdf_path):
    margin = 36
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=36,
        bottomMargin=36
    )

    printable_w = A4[0] - 2 * margin  # 595.27 - 72 = 523.27 pt

    styles = getSampleStyleSheet()

    # Color Palette
    PRIMARY = colors.HexColor("#1F4E79")      # Deep Navy Blue
    SECONDARY = colors.HexColor("#0284C7")    # Cerulean Blue
    DARK_TEXT = colors.HexColor("#0F172A")    # Slate 900
    BODY_TEXT = colors.HexColor("#334155")    # Slate 700
    BG_LIGHT = colors.HexColor("#F8FAFC")     # Slate 50
    ALERT_BG = colors.HexColor("#EFF6FF")     # Soft Blue Fill
    HIGHLIGHT_TAG = colors.HexColor("#0F766E") # Dark Teal

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=PRIMARY,
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=SECONDARY,
        spaceAfter=6
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#64748B")
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=8,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=SECONDARY,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=BODY_TEXT,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'BulletItem',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=BODY_TEXT,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2.5
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1E3A8A")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10.5,
        textColor=DARK_TEXT,
        alignment=0
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10.5,
        textColor=DARK_TEXT,
        alignment=0
    )

    qa_q_style = ParagraphStyle(
        'QA_Question',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=PRIMARY,
        spaceBefore=5,
        spaceAfter=2,
        keepWithNext=True
    )

    qa_a_style = ParagraphStyle(
        'QA_Answer',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=BODY_TEXT,
        leftIndent=8,
        spaceAfter=4
    )

    story = []

    # =========================================================================
    # PAGE 1: TITLE, INTRO PITCH & TECHNOLOGY STACK
    # =========================================================================
    story.append(Paragraph("VoltFleet AI: Intelligent EV Fleet Management, Predictive Battery Analytics & Route Optimization", title_style))
    story.append(Paragraph("Comprehensive Viva Defense & Semester Project Review Preparation Guide", subtitle_style))
    
    meta_text = (
        "<b>Department:</b> Computer Science & Engineering | <b>Batch:</b> 2023–2027 | <b>Class:</b> CSE IV-A | <b>Team No:</b> 12<br/>"
        "<b>Team Members:</b> Mithilesh S (23UCS100 - Lead), Mathivanan M (23UCS099), Vishnu K N (23UCS079), Nishan S (23UCS108)<br/>"
        "<b>Project Guide:</b> Mrs. P. NIRMALADEVI, Associate Professor | <b>Institution:</b> Sri Manakula Vinayagar Engineering College"
    )
    story.append(Paragraph(meta_text, meta_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=4, spaceAfter=6))

    # Section 1: Opening Pitch
    story.append(Paragraph("1. High-Impact Opening Pitch (Deliver This to Boost Your Marks)", h1_style))
    
    pitch_text = (
        "<b>[Opening Hook — The 90-Second Viva Pitch]:</b><br/>"
        "\"Respected Examiner and Faculty members, good morning.<br/>"
        "Today, commercial logistics is rapidly transitioning to Electric Vehicles (EVs) to meet carbon-neutral sustainability goals. "
        "However, commercial fleet operators face three critical operational bottlenecks:<br/>"
        "<b>1. Severe Range Anxiety & Mid-Transit Stranding:</b> Static dashboard range estimators fail to factor in elevation profiles, ambient temperatures, and HVAC loads.<br/>"
        "<b>2. Rapid, Unmonitored Battery Degradation:</b> Aggressive driving behaviors and erratic thermal cycling accelerate lithium-ion capacity fade.<br/>"
        "<b>3. High Operating Charging Costs:</b> Uncoordinated charging during peak grid tariff hours inflates fleet energy bills by 30% to 40%.<br/><br/>"
        "To solve these challenges, our team engineered <b>VoltFleet AI</b> — an intelligence-driven, full-stack fleet management platform connecting real-time IoT CAN-bus telematics with <b>Physics-Informed Machine Learning (HistGradientBoosting & Random Forest)</b> and <b>Digital Elevation Modeling</b>.<br/><br/>"
        "<b>Quantified Results:</b> Our platform reduces fleet charging expenditure by up to <b>31.4%</b> via automated Time-of-Use off-peak scheduling, extends battery pack lifespan by <b>18% to 22%</b> through multi-pillar driver coaching, and eliminates en-route stranding via topography-aware route optimization with automated 150 kW DC fast-charging stop recommendations.\""
    )
    
    box_table = Table([[Paragraph(pitch_text, callout_style)]], colWidths=[printable_w])
    box_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ALERT_BG),
        ('BOX', (0, 0), (-1, -1), 1, SECONDARY),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(box_table)
    story.append(Spacer(1, 4))

    # Section 2: Tech Stack
    story.append(Paragraph("2. Complete Technology Stack & Technical Justifications", h1_style))

    tech_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Technology Used", table_header_style), Paragraph("Technical Justification & Architectural Value", table_header_style)],
        [Paragraph("Frontend UI", table_cell_bold), Paragraph("React 18, Vite, TypeScript, Tailwind CSS, Radix UI", table_cell_style), Paragraph("Single-page application (SPA) with compile-time type safety. Vite provides sub-second HMR; Radix UI delivers accessible, headless components styled with modern dark-mode design tokens.", table_cell_style)],
        [Paragraph("State & Data", table_cell_bold), Paragraph("TanStack Query (React Query)", table_cell_style), Paragraph("Manages asynchronous server state, automatic cache invalidation, and background polling of high-frequency telematics streams with optimistic UI updates.", table_cell_style)],
        [Paragraph("Geospatial Map", table_cell_bold), Paragraph("Leaflet.js + OpenStreetMap (OSM)", table_cell_style), Paragraph("Zero-API-key mapping solution. Eliminates vendor lock-in and high recurring costs of Google Maps API while allowing custom vehicle SVG heading rotations and route polylines.", table_cell_style)],
        [Paragraph("Backend API", table_cell_bold), Paragraph("FastAPI (Python 3.11) + Uvicorn ASGI", table_cell_style), Paragraph("Asynchronous, non-blocking Python web framework. Provides native OpenAPI/Swagger docs, high throughput, and seamless integration with Python's data science ecosystem.", table_cell_style)],
        [Paragraph("Data Persistence", table_cell_bold), Paragraph("SQLAlchemy 2.0 ORM + SQLite / PostgreSQL", table_cell_style), Paragraph("Enterprise ORM ensuring ACID transactional integrity across multi-entity schemas (Vehicles, Drivers, TripLogs, BatteryLogs, SpeedLogs, AlertLogs).", table_cell_style)],
        [Paragraph("Schema Validation", table_cell_bold), Paragraph("Pydantic v2", table_cell_style), Paragraph("High-speed parsing and schema validation at HTTP endpoints; rejects malformed telematics packets before database insertion.", table_cell_style)],
        [Paragraph("Security & Auth", table_cell_bold), Paragraph("PyJWT + Passlib (Bcrypt)", table_cell_style), Paragraph("Stateless cryptographic Role-Based Access Control (RBAC) with 12 adaptive salt rounds, enforcing strict authorization boundaries between Fleet Managers and Commercial Drivers.", table_cell_style)],
        [Paragraph("Machine Learning", table_cell_bold), Paragraph("Scikit-Learn 1.3.2, NumPy, Pandas", table_cell_style), Paragraph("HistGradientBoosting & Random Forest Regressor for non-linear range estimation; Multiple Linear Regression for composite 4-pillar driver behavior scoring.", table_cell_style)],
        [Paragraph("Routing & Topography", table_cell_bold), Paragraph("OSRM + Haversine Engine + DEM", table_cell_style), Paragraph("Turn-by-turn road geometries combined with Digital Elevation Modeling (DEM) calculating gravitational climbing power penalties and downhill regenerative energy recovery.", table_cell_style)],
        [Paragraph("Report Engine", table_cell_bold), Paragraph("In-Memory Buffers (ReportLab, OpenPyXL, CSV)", table_cell_style), Paragraph("Generates downloadable PDF, Excel, and CSV audit logs directly in memory (io.BytesIO) without local disk I/O bottlenecks.", table_cell_style)]
    ]

    t_tech = Table(tech_data, colWidths=[65, 130, printable_w - 195])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_tech)

    # =========================================================================
    # PAGE 2: EXISTING VS PROPOSED & TECHNOLOGIES COMPARISON
    # =========================================================================
    story.append(PageBreak())
    
    story.append(Paragraph("3. Existing System vs. Proposed System (Key Differentiators)", h1_style))
    story.append(Paragraph("This side-by-side comparison highlights the limitations of current market solutions and the innovative contributions of VoltFleet AI:", body_style))

    comp_data = [
        [Paragraph("Dimension", table_header_style), Paragraph("Existing / Conventional Systems", table_header_style), Paragraph("Proposed System (VoltFleet AI)", table_header_style)],
        [Paragraph("Core Architecture", table_cell_bold),
         Paragraph("Legacy GPS tracking retrofitted from Internal Combustion Engine (ICE) vehicles; captures basic coordinate pins without battery chemistry awareness.", table_cell_style),
         Paragraph("Native EV-first architecture tracking CAN-bus cell voltages, SOH degradation, inverter thermals, and motor power draw.", table_cell_style)],
        [Paragraph("Range Estimation", table_cell_bold),
         Paragraph("Static dashboard calculations using historical average fuel/energy ratios. Completely ignores weather (-10°C to 50°C), vehicle speed, and elevation.", table_cell_style),
         Paragraph("Physics-Informed Machine Learning (HistGradientBoosting / RF) factoring SOC %, battery capacity, speed, temperature, HVAC load, and route elevation.", table_cell_style)],
        [Paragraph("Navigation & Routing", table_cell_bold),
         Paragraph("Standard 2D shortest-distance or fastest-time routing (Google Maps style) with no visibility into battery SOC depletion curves.", table_cell_style),
         Paragraph("3D Topographical Route Optimizer factoring uphill gravity drain, downhill regenerative braking, and auto-inserting 150 kW DC fast-charging waypoints.", table_cell_style)],
        [Paragraph("Driver Analytics", table_cell_bold),
         Paragraph("Crude metrics evaluating harsh braking and speeding designed for diesel trucks; offers zero personalized coaching.", table_cell_style),
         Paragraph("4-Pillar ML Driver Engine evaluating Safety, Efficiency (km/kWh), Battery Thermal Care, and Route Compliance with actionable AI coaching tips.", table_cell_style)],
        [Paragraph("Depot Charging", table_cell_bold),
         Paragraph("Uncoordinated, on-demand charging. Vehicles plug in during expensive peak electricity tariff windows, causing grid demand spikes.", table_cell_style),
         Paragraph("Smart Time-of-Use (ToU) Tariff Scheduler that staggers high-power depot charging during low-cost overnight windows (22:00–05:00), cutting costs by 31.4%.", table_cell_style)],
        [Paragraph("Maintenance Strategy", table_cell_bold),
         Paragraph("Reactive maintenance (servicing only after breakdown) or fixed odometer intervals, leading to unexpected en-route battery failure.", table_cell_style),
         Paragraph("Condition-Based Predictive Maintenance: Tracks cell delta-voltages and SOH degradation (<75%) to auto-trigger critical work orders before failure.", table_cell_style)],
        [Paragraph("Tool Integration", table_cell_bold),
         Paragraph("Fragmented across multiple disconnected vendor subscriptions (separate GPS, spreadsheets, driver payroll, and billing tools).", table_cell_style),
         Paragraph("Unified full-stack command center integrating telematics, predictive models, interactive maps, charging dispatch, and reporting.", table_cell_style)]
    ]

    t_comp = Table(comp_data, colWidths=[75, 215, printable_w - 290])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 8))

    story.append(Paragraph("4. Technologies Comparison: Existing Systems vs. VoltFleet AI", h1_style))
    story.append(Paragraph("Clear technological contrast to demonstrate modernization and technical maturity:", body_style))

    tech_comp_data = [
        [Paragraph("Domain", table_header_style), Paragraph("Technologies Used in Existing Systems", table_header_style), Paragraph("Technologies in VoltFleet AI (Proposed)", table_header_style)],
        [Paragraph("Client User Interface", table_cell_bold), Paragraph("Server-rendered HTML/PHP, ASP.NET, or Java Swing desktop apps", table_cell_style), Paragraph("React 18 SPA, Vite, TypeScript, Tailwind CSS, Radix UI", table_cell_style)],
        [Paragraph("API Architecture", table_cell_bold), Paragraph("Monolithic synchronous REST (Flask / PHP / CGI scripts)", table_cell_style), Paragraph("Asynchronous ASGI FastAPI (Python 3.11) with Uvicorn", table_cell_style)],
        [Paragraph("Geospatial Engine", table_cell_bold), Paragraph("Proprietary APIs (Google Maps Platform) requiring costly billing keys", table_cell_style), Paragraph("Leaflet.js + OpenStreetMap (Zero-API-key, fully self-hosted)", table_cell_style)],
        [Paragraph("Analytics & Prediction", table_cell_bold), Paragraph("Static hardcoded SQL queries and simple spreadsheet averages", table_cell_style), Paragraph("Scikit-Learn ML: HistGradientBoosting, Random Forest, Multi-Linear Reg.", table_cell_style)],
        [Paragraph("Data & State Layer", table_cell_bold), Paragraph("Flat CSV files or legacy ODBC SQL without validation schemas", table_cell_style), Paragraph("SQLAlchemy 2.0 ORM, Pydantic v2 schemas, SQLite / PostgreSQL", table_cell_style)],
        [Paragraph("Security & Access", table_cell_bold), Paragraph("Session cookies or unencrypted credentials in plaintext tables", table_cell_style), Paragraph("PyJWT (Stateless Bearer Tokens) + Bcrypt salted password hashing (RBAC)", table_cell_style)]
    ]

    t_tech_comp = Table(tech_comp_data, colWidths=[85, 210, printable_w - 295])
    t_tech_comp.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_tech_comp)

    # =========================================================================
    # PAGE 3: SYSTEM ARCHITECTURE & 8-STEP WORKFLOW
    # =========================================================================
    story.append(PageBreak())
    
    story.append(Paragraph("5. System Architecture Explanation & Data Flow", h1_style))
    story.append(Paragraph("VoltFleet AI is engineered on a <b>Decoupled 5-Tier Architecture</b> ensuring high scalability, modularity, and microservice independence:", body_style))

    arch_points = [
        "<b>Tier 1: Presentation Layer (Client Dashboard):</b> Built with React 18, TypeScript, and Vite. Implements reactive data tables, Leaflet map views, real-time KPI strips, What-If simulation sliders, and Recharts analytics graphs.",
        "<b>Tier 2: API Gateway & Security Layer:</b> Powered by FastAPI routers and Uvicorn. Enforces CORS policies, validates incoming JSON payloads with Pydantic v2 schemas, and authenticates requests via signed JSON Web Tokens (JWT) distinguishing Manager and Driver roles.",
        "<b>Tier 3: Core Business Logic Layer:</b> Houses application microservices: multithreaded vehicle simulator, OSRM road routing engine, Time-of-Use depot charging scheduler, and in-memory binary report streaming engine.",
        "<b>Tier 4: Intelligence & Machine Learning Layer:</b> Houses our trained AI models: the Physics-Informed Range Regressor (HistGradientBoosting / Random Forest), the 4-Pillar Driver Performance Scoring engine, and the battery SOH degradation diagnostics engine.",
        "<b>Tier 5: Data & Persistence Layer:</b> Relational database managed via SQLAlchemy 2.0 ORM containing relational schemas for Companies, Admins, Drivers, Vehicles, TripLogs, BatteryLogs, SpeedLogs, AlertLogs, and MaintenanceTickets."
    ]
    for pt in arch_points:
        story.append(Paragraph(f"• {pt}", bullet_style))

    story.append(Spacer(1, 3))
    story.append(Paragraph("<b>End-to-End Data Ingestion Pipeline:</b> In physical deployment, on-vehicle IoT edge gateways read high-frequency CAN-bus frames (packet rate: 1 Hz). In our validated testbed, <code>simulator.py</code> runs a dedicated background daemon simulating physical battery depletion, regenerative braking, velocity fluctuations, and DC fast charging. Every sensor tick is validated by Pydantic, stored in SQLAlchemy tables, and instantly broadcast to the frontend via TanStack Query polling.", body_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("6. Project Operational Workflow (8-Step Execution Lifecycle)", h1_style))
    
    workflow_steps = [
        ("Step 1: Stakeholder Onboarding & Authentication", "Fleet Managers register their company and onboard commercial drivers. Passwords are encrypted using Bcrypt (12 adaptive salt rounds). Dual RBAC grants managers full administrative access while drivers receive scoped shift views."),
        ("Step 2: Fleet Asset Registration", "Fleet vehicles (e.g., Tata Curvv EV 55 kWh, Nexon EV 40.5 kWh, commercial vans 75 kWh) are registered with battery pack capacities, motor power ratings, max ranges, and service histories."),
        ("Step 3: Real-Time Telematics Acquisition", "Continuous telematics ingestion streams vehicle speed, battery pack voltage, SOC %, motor current draw, inverter temperature, and GPS coordinates into the database with transactional integrity."),
        ("Step 4: Live Command Center Monitoring", "Dispatchers monitor the fleet on a zero-API-key Leaflet night-highway map. Vehicles are rendered with dynamic status markers (Active, In Transit, Charging, Idle, Alert) alongside fleet-wide KPI summaries."),
        ("Step 5: Topographical Route Optimization", "When a dispatch route is configured, the route optimizer queries OSRM for road paths and calculates Digital Elevation Modeling (DEM) profiles, factoring climbing power draw and downhill regenerative energy recapture."),
        ("Step 6: Physics-Informed Range Inference", "The ML range model evaluates instantaneous battery SOC, payload, speed, outside temperature (-10°C to 50°C), and HVAC load. If remaining SOC drops below 20%, the system automatically injects 150 kW DC charging waypoints."),
        ("Step 7: Post-Trip Driver Scoring & AI Coaching", "Telemetry is synthesized across 7 operational features into a 0–100 score evaluating Safety, Efficiency, Battery Care, and Route Compliance, outputting personalized coaching recommendations."),
        ("Step 8: Smart Depot Charging & Report Generation", "Depot charging is queued during off-peak Time-of-Use tariff windows (22:00 to 05:00) reducing electricity costs by up to 31.4%. The reporting microservice streams executive PDF, Excel, and CSV audit reports.")
    ]

    for title, desc in workflow_steps:
        story.append(Paragraph(f"<b>{title}:</b> {desc}", bullet_style))

    # =========================================================================
    # PAGE 4: 6 CORE MODULES & ML BENCHMARK EVALUATION
    # =========================================================================
    story.append(PageBreak())
    
    story.append(Paragraph("7. Detailed Breakdown of the 6 Core Project Modules", h1_style))

    modules = [
        ("Module 1: Live Interactive Fleet Command Center", [
            "Central operational dashboard equipped with high-contrast, zero-API-key Leaflet.js night-highway map tiles.",
            "Real-time vehicle telemetry pins display instantaneous operational status (Active, In Transit, Charging, Idle), battery SOC %, SOH %, speed, and inverter temperature.",
            "Dynamic Fleet KPI strip continuously aggregates total mileage, active vehicle count, and fleet average efficiency (km/kWh) in real time."
        ]),
        ("Module 2: Role-Based Authentication & Telematics Ingestion", [
            "Dual Role-Based Access Control (RBAC) securely partitions administrative Fleet Managers from Commercial Drivers.",
            "Cryptographic security with bcrypt password hashing (12 adaptive salt rounds) and signed JSON Web Tokens (PyJWT).",
            "Asynchronous telematics ingestion pipeline handles high-throughput vehicle sensor payloads with transactional ACID integrity in SQLite/PostgreSQL."
        ]),
        ("Module 3: Dynamic Multi-Stop Route Optimizer & Global Elevation Engine", [
            "Interactive multi-stop route planner integrated with OpenStreetMap and global coordinates database.",
            "Digital Elevation Modeling (DEM) calculates topographical altitude profiles, uphill climbing penalties, and downhill regenerative energy recovery.",
            "Automated DC fast-charging stop recommendation ensures battery SOC never drops below safe margins (20%) along cross-city transit."
        ]),
        ("Module 4: Machine Learning AI Driver Performance Scoring Engine", [
            "Multiple Linear Regression model synthesizes 7 operational telematics features: daily distance, average speed, harsh braking, harsh acceleration, end-of-day battery retention, shift income, and maintenance wear.",
            "Evaluates operators across 4 key pillars: Safety, Efficiency, Battery Care, and Route Compliance with personalized AI coaching."
        ]),
        ("Module 5: Physics-Informed ML Battery Range Predictor & Health Analytics", [
            "HistGradientBoosting & Random Forest regression models predict real-world remaining range by factoring battery capacity, SOC %, speed, outside temp (-10°C to 50°C), HVAC load, and terrain gradients.",
            "Interactive What-If Range Simulator allows dispatchers to simulate mission feasibility before departure and flags potential range deficits.",
            "Battery State of Health (SOH) analytics tracks cell delta-voltages, internal impedance growth, and triggers thermal runaway warnings (>45°C)."
        ]),
        ("Module 6: Smart Time-of-Use Charging Scheduler & Predictive Maintenance Planner", [
            "Off-Peak Tariff Optimization algorithms schedule depot charging during low-cost electricity windows (22:00–05:00), cutting total charging bills by up to 31.4%.",
            "Predictive maintenance tracking monitors odometer milestones and sensor anomalies, auto-generating service tickets for brake pads and battery insulation overhaul."
        ])
    ]

    for mod_title, points in modules:
        story.append(Paragraph(mod_title, h2_style))
        for pt in points:
            story.append(Paragraph(f"• {pt}", bullet_style))

    story.append(Spacer(1, 6))

    story.append(Paragraph("8. Machine Learning Benchmark Results (Trained on VoltFleet EV Dataset)", h1_style))
    story.append(Paragraph("Our machine learning models were systematically benchmarked against four candidate classifiers and regressors on the unified EV fleet dataset:", body_style))

    ml_data = [
        [Paragraph("Model Evaluated", table_header_style), Paragraph("Accuracy", table_header_style), Paragraph("Precision", table_header_style), Paragraph("Recall", table_header_style), Paragraph("F1-Score", table_header_style), Paragraph("ROC-AUC", table_header_style)],
        [Paragraph("Random Forest (VoltFleet Primary)", table_cell_bold), Paragraph("97.60%", table_cell_style), Paragraph("97.58%", table_cell_style), Paragraph("99.73%", table_cell_style), Paragraph("98.64%", table_cell_style), Paragraph("0.9966", table_cell_bold)],
        [Paragraph("Logistic Regression (Baseline)", table_cell_style), Paragraph("98.40%", table_cell_style), Paragraph("98.55%", table_cell_style), Paragraph("99.63%", table_cell_style), Paragraph("99.09%", table_cell_style), Paragraph("0.9959", table_cell_style)],
        [Paragraph("K-Nearest Neighbors (KNN)", table_cell_style), Paragraph("94.32%", table_cell_style), Paragraph("94.98%", table_cell_style), Paragraph("98.72%", table_cell_style), Paragraph("96.81%", table_cell_style), Paragraph("0.9433", table_cell_style)],
        [Paragraph("Gaussian Naive Bayes", table_cell_style), Paragraph("92.24%", table_cell_style), Paragraph("94.54%", table_cell_style), Paragraph("96.71%", table_cell_style), Paragraph("95.61%", table_cell_style), Paragraph("0.9563", table_cell_style)]
    ]

    t_ml = Table(ml_data, colWidths=[150, 70, 70, 70, 70, 73])
    t_ml.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_ml)
    story.append(Spacer(1, 3))
    story.append(Paragraph("<b>Examiner Interpretation:</b> Random Forest delivers outstanding performance with an ROC-AUC of <b>0.9966</b> and an exceptional Recall of <b>99.73%</b>. In commercial fleet transit, high recall is vital because a False Negative (predicting an unfeasible trip as feasible) leads to vehicle stranding on the highway.", body_style))

    # =========================================================================
    # PAGE 5: TOP 5 EXAMINER VIVA QUESTIONS & FINAL REVIEW CHECKLIST
    # =========================================================================
    story.append(PageBreak())
    
    story.append(Paragraph("9. Top Examiner Viva Defense Questions & Bulletproof Answers", h1_style))
    story.append(Paragraph("These are the most common questions external examiners ask during final project reviews:", body_style))

    qa_list = [
        ("Q1: Why did you use Physics-Informed Machine Learning instead of a standard Deep Neural Network?",
         "Deep neural networks act as black boxes and require extensive onboard computation. Crucially, unconstrained neural networks can generate physically absurd outputs (such as negative remaining range or infinite motor efficiency). By employing a Physics-Informed approach with Random Forest / HistGradientBoosting and physical boundary constraints (aerodynamic drag, rolling resistance, gravitational potential energy, and battery chemistry limits), our model guarantees physically valid range predictions while running efficiently on standard server and edge hardware."),
         
        ("Q2: Why did you choose Leaflet and OpenStreetMap instead of Google Maps API?",
         "Commercial fleet management requires continuous GPS telemetry polling every 1 to 5 seconds across dozens of vehicles. Proprietary mapping solutions like Google Maps Platform impose strict request quotas and per-call billing tiers that scale unfavorably. Leaflet coupled with OpenStreetMap provides a lightweight, zero-API-key, completely open-source mapping engine that eliminates recurring operational costs and avoids vendor lock-in while fully supporting custom SVG vehicle marker rotations and route polylines."),
         
        ("Q3: How does elevation affect EV energy consumption and how do you calculate it?",
         "EV battery packs add substantial mass (typically 1,800 to 2,500 kg). When climbing an incline, the electric motor must overcome gravitational potential energy (m * g * Δh), which can increase consumption by 25% to 40%. Conversely, downhill descents enable regenerative braking, where the motor acts as an alternator to pump electrical energy back into the battery pack. Our Route Optimizer uses Digital Elevation Modeling (DEM) along OSRM road coordinates, applying climbing power penalties and crediting kinetic regenerative recapture."),
         
        ("Q4: What is the fundamental difference between State of Charge (SOC) and State of Health (SOH)?",
         "State of Charge (SOC) represents the instantaneous fuel gauge of the battery pack—the percentage of currently available electrical charge (0% to 100%). State of Health (SOH) represents the long-term degradation and maximum storage capacity of the battery pack compared to its factory condition (100% degrading down to 75%). When an EV battery's SOH degrades below 75%–80%, it exhibits high internal impedance and capacity fade, requiring depot overhaul or second-life stationary energy storage repurposing."),
         
        ("Q5: How does your system achieve a 31.4% cost reduction in fleet charging?",
         "Commercial utility power grids operate dynamic Time-of-Use (ToU) tariffs where peak electricity (afternoons/evenings) costs up to 2.5 times more than off-peak electricity (overnight from 22:00 to 05:00). VoltFleet AI's Smart Charging Scheduler cross-references next-day vehicle departure schedules, required recharge kilowatt-hours, and local tariff windows, automatically staggering 150 kW DC charging sessions into the cheapest overnight slots to avoid peak tariff penalties and demand surcharges.")
    ]

    for q, a in qa_list:
        story.append(Paragraph(q, qa_q_style))
        story.append(Paragraph(f"<b>Answer:</b> {a}", qa_a_style))

    story.append(Spacer(1, 4))

    story.append(Paragraph("10. Key Numbers, Physical Formulae & Final Review Checklist", h1_style))

    checklist_items = [
        "<b>Key Metrics to Quote:</b> <b>31.4%</b> charging cost reduction | <b>18%–22%</b> battery life extension | <b>97.60%</b> accuracy & <b>0.9966</b> AUC on Random Forest benchmark | <b>20% SOC</b> safety margin cutoff for DC charging insertion.",
        "<b>Gravitational Potential Energy Formula:</b> ΔE_elevation = (m * g * Δh) / η_motor (for climbs) and E_regen = m * g * |Δh| * η_regen (for downhill recovery).",
        "<b>Driver Scoring Pillars:</b> Safety (overspeeding/harsh acceleration) + Efficiency (km/kWh) + Battery Care (thermal discharge spikes) + Route Compliance.",
        "<b>Presentation Demeanor:</b> Maintain eye contact, demonstrate the live interactive Leaflet map and What-If simulator, and emphasize that VoltFleet AI bridges the gap between raw hardware telematics and intelligent commercial fleet logistics."
    ]

    for item in checklist_items:
        story.append(Paragraph(f"[✓] {item}", bullet_style))

    story.append(Spacer(1, 8))
    
    # Signature / Guide Endorsement Box
    sign_table_data = [
        [Paragraph("<b>Student Presenter:</b><br/>Mithilesh S (23UCS100)<br/>Department of CSE, SMVEC", table_cell_style),
         Paragraph("<b>Project Guide:</b><br/>Mrs. P. NIRMALADEVI, M.Tech., (Ph.D.)<br/>Associate Professor, Dept of CSE", table_cell_style),
         Paragraph("<b>External Examiner:</b><br/>Name & Designation:<br/>Signature with Date:", table_cell_style)]
    ]
    t_sign = Table(sign_table_data, colWidths=[printable_w/3, printable_w/3, printable_w/3])
    t_sign.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#94A3B8")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
    ]))
    story.append(t_sign)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF at: {output_pdf_path}")


if __name__ == "__main__":
    out_path = os.path.join(r"d:\Projects\VoltFleet AI\project", "VoltFleet_AI_Project_Review_Viva_Guide.pdf")
    build_review_guide_pdf(out_path)
    
    if os.path.exists(out_path):
        doc = fitz.open(out_path)
        print(f"Verified PDF: Total pages = {len(doc)}, File size = {os.path.getsize(out_path)} bytes")
