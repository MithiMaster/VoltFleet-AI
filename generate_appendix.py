import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def build_perfect_appendix(output_path):
    doc = docx.Document()
    
    # Page setup - A4, 0.85-inch margins
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)
    section.header_distance = Inches(0.4)
    section.footer_distance = Inches(0.4)
    
    # Configure Section Starting Page Number = 57
    sectPr = section._sectPr
    pgNumType = parse_xml(f'<w:pgNumType {nsdecls("w")} w:start="57"/>')
    sectPr.append(pgNumType)
    
    # Configure Header
    header = section.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hrun = hp.add_run("VoltFleet AI — Appendix II: Source Code Implementation")
    hrun.font.name = "Times New Roman"
    hrun.font.size = Pt(8.5)
    hrun.font.italic = True
    hrun.font.color.rgb = RGBColor(107, 114, 128)
    
    # Configure Footer with Page Number starting at 57
    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fld = parse_xml(
        f'<w:fldSimple {nsdecls("w")} w:instr="PAGE">'
        f'  <w:r>'
        f'    <w:rPr>'
        f'      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>'
        f'      <w:sz w:val="22"/>'
        f'      <w:szCs w:val="22"/>'
        f'    </w:rPr>'
        f'    <w:t>57</w:t>'
        f'  </w:r>'
        f'</w:fldSimple>'
    )
    fp._p.append(fld)
    
    def style_code_table(table):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        
        # Background fill
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F8FAFC"/>')
        cell._tc.get_or_add_tcPr().append(shd)
        
        # Borders: crisp blue accent on left, subtle light gray border elsewhere
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>\n'
            f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>\n'
            f'  <w:left w:val="single" w:sz="18" w:space="0" w:color="2563EB"/>\n'
            f'  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>\n'
            f'  <w:right w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>\n'
            f'</w:tcBorders>'
        )
        cell._tc.get_or_add_tcPr().append(borders)
        
        # Cell padding
        tcMar = parse_xml(
            f'<w:tcMar {nsdecls("w")}>\n'
            f'  <w:top w:w="80" w:type="dxa"/>\n'
            f'  <w:left w:w="120" w:type="dxa"/>\n'
            f'  <w:bottom w:w="80" w:type="dxa"/>\n'
            f'  <w:right w:w="120" w:type="dxa"/>\n'
            f'</w:tcMar>'
        )
        cell._tc.get_or_add_tcPr().append(tcMar)
        
        # Prevent row split across pages
        trPr = table.rows[0]._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        return cell

    def add_code_listing(title, module_num, module_name, filepath, description, code_lines, page_break_before=False):
        if page_break_before:
            doc.add_page_break()
            
        # Listing Heading
        p_head = doc.add_paragraph()
        p_head.paragraph_format.space_before = Pt(6)
        p_head.paragraph_format.space_after = Pt(1)
        p_head.paragraph_format.keep_with_next = True
        
        r_title = p_head.add_run(title)
        r_title.bold = True
        r_title.font.name = "Times New Roman"
        r_title.font.size = Pt(10.5)
        r_title.font.color.rgb = RGBColor(17, 24, 39)
        
        r_tag = p_head.add_run(f"  [{module_num}: {module_name}]")
        r_tag.bold = True
        r_tag.font.name = "Times New Roman"
        r_tag.font.size = Pt(9)
        r_tag.font.color.rgb = RGBColor(37, 99, 235)
        
        # Subtitle: source file
        p_file = doc.add_paragraph()
        p_file.paragraph_format.space_before = Pt(0)
        p_file.paragraph_format.space_after = Pt(2)
        p_file.paragraph_format.keep_with_next = True
        r_file_lbl = p_file.add_run("Source File: ")
        r_file_lbl.font.name = "Times New Roman"
        r_file_lbl.font.size = Pt(8.5)
        r_file_lbl.bold = True
        r_file_lbl.font.color.rgb = RGBColor(75, 85, 99)
        
        r_file_val = p_file.add_run(filepath)
        r_file_val.font.name = "Consolas"
        r_file_val.font.size = Pt(8)
        r_file_val.font.color.rgb = RGBColor(51, 65, 85)
        
        # Description
        p_desc = doc.add_paragraph()
        p_desc.paragraph_format.space_before = Pt(0)
        p_desc.paragraph_format.space_after = Pt(3)
        p_desc.paragraph_format.line_spacing = 1.1
        p_desc.paragraph_format.keep_with_next = True
        
        r_desc = p_desc.add_run(description)
        r_desc.font.name = "Times New Roman"
        r_desc.font.size = Pt(9)
        r_desc.font.italic = True
        r_desc.font.color.rgb = RGBColor(75, 85, 99)
        
        # Code Table
        table = doc.add_table(rows=1, cols=1)
        table.autofit = False
        cell = style_code_table(table)
        cell.width = Inches(6.67)
        
        cp = cell.paragraphs[0]
        cp.paragraph_format.space_before = Pt(0)
        cp.paragraph_format.space_after = Pt(0)
        cp.paragraph_format.line_spacing = 1.0
        
        for i, line in enumerate(code_lines):
            if i > 0:
                cp = cell.add_paragraph()
                cp.paragraph_format.space_before = Pt(0)
                cp.paragraph_format.space_after = Pt(0)
                cp.paragraph_format.line_spacing = 1.0
            
            # Line number
            r_num = cp.add_run(f"{i+1:2d}  ")
            r_num.font.name = "Consolas"
            r_num.font.size = Pt(7.5)
            r_num.font.color.rgb = RGBColor(148, 163, 184)
            
            # Code content
            r_code = cp.add_run(line)
            r_code.font.name = "Consolas"
            r_code.font.size = Pt(7.5)
            r_code.font.color.rgb = RGBColor(30, 41, 59)
            
        # Subtle space after table
        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_before = Pt(0)
        p_after.paragraph_format.space_after = Pt(2)

    # PAGE 57: Title, Intro, and Listing 1
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(2)
    run_t = p_title.add_run("APPENDIX – II")
    run_t.font.name = "Times New Roman"
    run_t.font.size = Pt(15)
    run_t.font.bold = True
    run_t.font.color.rgb = RGBColor(17, 24, 39)
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(8)
    run_s = p_sub.add_run("SOURCE CODE IMPLEMENTATION OF CORE PROJECT MODULES")
    run_s.font.name = "Times New Roman"
    run_s.font.size = Pt(11)
    run_s.font.bold = True
    run_s.font.color.rgb = RGBColor(55, 65, 81)
    
    p_intro = doc.add_paragraph()
    p_intro.paragraph_format.space_before = Pt(0)
    p_intro.paragraph_format.space_after = Pt(8)
    p_intro.paragraph_format.line_spacing = 1.3
    r_intro = p_intro.add_run(
        "This appendix documents the essential implementation logic of the VoltFleet AI platform across its six primary architectural modules described in Chapter 6. Rather than reproducing peripheral boilerplate, each listing highlights the core computational algorithms, mathematical formulations, machine learning regression pipelines, and secure telematics ingestion routines that govern system behavior."
    )
    r_intro.font.name = "Times New Roman"
    r_intro.font.size = Pt(10)
    r_intro.font.color.rgb = RGBColor(55, 65, 81)

    # LISTING 1 (Page 57)
    code_mod1 = [
        "def simulate_vehicle_telemetry(db: Session, vehicle: Vehicle, now: datetime):",
        "    \"\"\"Simulate physics-grounded telematics state transitions for an EV unit.\"\"\"",
        "    # 1. State: Charging at Depot (DC Fast Charge Dynamic)",
        "    if vehicle.status == 'charging':",
        "        charge_rate = random.uniform(3.0, 6.0)  # SOC % increase per tick",
        "        vehicle.current_soc = min(100.0, vehicle.current_soc + charge_rate)",
        "        db.add(BatteryLog(",
        "            time=now, vehicle_id=vehicle.vehicle_id, battery_percentage=round(vehicle.current_soc, 2),",
        "            voltage=380.0 + random.uniform(-4, 4), current_draw=-45.0,  # Negative indicates charging",
        "            temperature_celsius=34.0 + random.uniform(-1, 2), soh_percentage=round(vehicle.battery_health, 2)",
        "        ))",
        "        if vehicle.current_soc >= 100.0: vehicle.status = 'idle'",
        "",
        "    # 2. State: Driving in Mission (Aerodynamic & Velocity Energy Drain)",
        "    elif vehicle.status == 'driving':",
        "        speed = max(15.0, min(110.0, vehicle.current_speed + random.uniform(-6, 6)))",
        "        vehicle.current_speed = round(speed, 1)",
        "        drain_rate = 0.45 + (speed / 100.0) * 0.75 + random.uniform(0.05, 0.20)",
        "        vehicle.current_soc = max(0.0, vehicle.current_soc - drain_rate)",
        "        db.add(SpeedLog(time=now, vehicle_id=vehicle.vehicle_id, speed_kmh=vehicle.current_speed))",
        "        db.add(BatteryLog(",
        "            time=now, vehicle_id=vehicle.vehicle_id, battery_percentage=round(vehicle.current_soc, 2),",
        "            voltage=370.0 - (100.0 - vehicle.current_soc) * 0.35, current_draw=25.0 + (speed * 0.4),",
        "            temperature_celsius=29.0 + (speed / 35.0), soh_percentage=round(vehicle.battery_health, 2)",
        "        ))",
        "        if vehicle.current_soc <= 15.0: vehicle.status = 'charging'  # Low-SOC auto-reroute"
    ]
    add_code_listing(
        "Listing 1: Real-Time Fleet Telemetry & Battery State Physics Simulator",
        "Module 1", "Fleet Command Center", "backend/simulator.py",
        "Executes background multithreaded simulation of vehicle operational cycles, computing dynamic battery SOC drain, DC fast-charging voltage variations, inverter thermal response, and critical battery transitions.",
        code_mod1,
        page_break_before=False
    )

    # PAGE 58: Listing 2 & Listing 3
    code_mod2 = [
        "oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')",
        "",
        "def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:",
        "    \"\"\"Generates signed cryptographically secure JSON Web Token (JWT).\"\"\"",
        "    to_encode = data.copy()",
        "    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))",
        "    to_encode.update({'exp': expire})",
        "    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)",
        "",
        "def verify_token_and_get_user(token: str, db: Session) -> dict:",
        "    \"\"\"Decodes JWT, validates signature, and resolves Manager or Driver role permissions.\"\"\"",
        "    exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid authentication credentials')",
        "    try:",
        "        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])",
        "        user_id, role = payload.get('id'), payload.get('role')",
        "        if not user_id or not role: raise exc",
        "    except jwt.PyJWTError: raise exc",
        "    if role == 'manager':",
        "        user = db.query(Admin).filter(Admin.admin_id == user_id).first()",
        "        return {'id': user.admin_id, 'email': user.email, 'role': 'manager'} if user else (_ for _ in ()).throw(exc)",
        "    elif role == 'driver':",
        "        user = db.query(Driver).filter(Driver.driver_id == user_id).first()",
        "        return {'id': user.driver_id, 'email': user.email, 'role': 'driver'} if user else (_ for _ in ()).throw(exc)",
        "    raise exc"
    ]
    add_code_listing(
        "Listing 2: Role-Based Cryptographic Access Control & Token Ingestion",
        "Module 2", "Role-Based Authentication", "backend/auth.py",
        "Enforces JWT token validation, role-based authorization guards (distinguishing Fleet Managers from Drivers), and encrypted credential verification for all telematics and operational endpoints.",
        code_mod2,
        page_break_before=True
    )

    code_mod3 = [
        "def calculate_haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:",
        "    \"\"\"Calculate great-circle distance on spherical Earth in kilometers.\"\"\"",
        "    R_KM = 6371.0",
        "    d_lat, d_lng = math.radians(lat2 - lat1), math.radians(lng2 - lng1)",
        "    a = math.sin(d_lat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2)**2",
        "    return R_KM * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))",
        "",
        "def optimize_ev_route(start_coords, dest_coords, battery_cap_kwh=75.0):",
        "    \"\"\"Calculates road distance, drive duration, EV energy (kWh), and battery usage %.\"\"\"",
        "    osrm = fetch_osrm_route(start_coords[0], start_coords[1], dest_coords[0], dest_coords[1])",
        "    if osrm and len(osrm.get('path_coordinates', [])) > 5:",
        "        dist_km, duration_mins = osrm['distance_km'], osrm['duration_mins']",
        "        path_coords = osrm['path_coordinates']",
        "    else:",
        "        dist_km = max(calculate_haversine_distance(start_coords[0], start_coords[1], dest_coords[0], dest_coords[1]) * 1.25, 5.0)",
        "        duration_mins = int((dist_km / 80.0) * 60)",
        "        path_coords = generate_geodesic_curved_path(start_coords[0], start_coords[1], dest_coords[0], dest_coords[1])",
        "    energy_kwh = dist_km * 0.195  # EV efficiency model (~0.195 kWh/km commercial average)",
        "    battery_usage_pct = min(round((energy_kwh / battery_cap_kwh) * 100.0, 1), 100.0)",
        "    return {'distance_km': round(dist_km, 2), 'duration_mins': duration_mins,",
        "            'energy_kwh': round(energy_kwh, 2), 'battery_usage_pct': battery_usage_pct, 'path': path_coords}"
    ]
    add_code_listing(
        "Listing 3: Dynamic Multi-Stop Route Optimizer & EV Energy Consumption Model",
        "Module 3", "Route Optimizer", "backend/routers/route_optimizer.py",
        "Calculates geodetic Haversine distances, road routing profiles via OSRM, and models commercial EV fleet energy expenditure (kWh) and battery SOC depletion percentage per mission.",
        code_mod3,
        page_break_before=False
    )

    # PAGE 59: Listing 4 & Listing 5
    code_mod4 = [
        "def compute_driver_features(driver_id: str, db: Session) -> dict:",
        "    \"\"\"Extract 7 operational telematics dimensions from real-time database logs.\"\"\"",
        "    trips = db.query(TripLog).filter(TripLog.driver_id == driver_id).all()",
        "    days = max(1, len(set(t.time.date() for t in trips))) if trips else 1",
        "    total_dist = sum(t.distance_covered_km for t in trips) if trips else 0.0",
        "    overspeed = sum(t.overspeeding_events_count for t in trips) if trips else 0",
        "    speeds = db.query(SpeedLog.speed_kmh).filter(SpeedLog.driver_id == driver_id).all()",
        "    avg_speed = sum(s[0] for s in speeds) / len(speeds) if speeds else 50.0",
        "    socs = db.query(DriverRealtimeData.current_battery_pct).filter(DriverRealtimeData.driver_id == driver_id).all()",
        "    eod_soc = sum(s[0] for s in socs) / len(socs) if socs else 45.0",
        "    revs = db.query(RevenueLog.amount).filter(RevenueLog.driver_id == driver_id).all()",
        "    return {'dist': total_dist / days, 'spd': avg_speed, 'hb': min(10.0, (overspeed * 0.40) / days),",
        "            'ha': min(10.0, (overspeed * 0.35) / days), 'soc': eod_soc, 'rev': sum(r[0] for r in revs) / days if revs else 150.0}",
        "",
        "def predict_driver_score(driver_id: str, db: Session) -> float:",
        "    \"\"\"Predicts multi-pillar composite driver performance score (0-100) via ML.\"\"\"",
        "    model = get_performance_model()  # Multi-linear regression model",
        "    f = compute_driver_features(driver_id, db)",
        "    X = [[f['dist'], f['spd'], f['hb'], f['ha'], f['soc'], f['rev'], 5.0]]",
        "    pred = float(model.predict(X)[0])",
        "    return round(max(0.0, min(100.0, pred)), 1)"
    ]
    add_code_listing(
        "Listing 4: Machine Learning AI Driver Performance Scoring Model",
        "Module 4", "Driver Analytics", "backend/ml_model.py & backend/routers/drivers.py",
        "Aggregates 7 operational driver telematics features (speed discipline, harsh braking, acceleration volatility, battery retention, and revenue), synthesizing them into an AI performance score.",
        code_mod4,
        page_break_before=True
    )

    code_mod5 = [
        "def train_and_export_range_model(csv_path='driver_realtime_data.csv'):",
        "    \"\"\"Trains physics-informed Random Forest EV Range Regressor across multi-capacity fleet.\"\"\"",
        "    df = pd.read_csv(csv_path)",
        "    route_map, elev_map = {'City': 0, 'Mixed': 1, 'Highway': 2}, {'Downhill': -1, 'Flat': 0, 'Uphill': 1}",
        "    df['route_type_encoded'] = df['route_type'].map(lambda x: route_map.get(x, 1))",
        "    df['elevation_encoded'] = df['elevation_ahead'].map(lambda x: elev_map.get(x, 0))",
        "    augmented = [df.assign(battery_capacity_kwh=c, actual_remaining_range_km=(df['actual_remaining_range_km'] * (c / df['battery_capacity_kwh'])).round(1))",
        "                 for c in [17.3, 30.0, 40.0, 50.3, 59.0, 75.0]]",
        "    df_all = pd.concat(augmented, ignore_index=True)",
        "    features = ['current_battery_pct', 'battery_capacity_kwh', 'current_speed_kmh',",
        "                'ac_status', 'outside_temperature_c', 'route_type_encoded', 'elevation_encoded']",
        "    rf = RandomForestRegressor(n_estimators=100, max_depth=16, min_samples_split=4, random_state=42)",
        "    rf.fit(df_all[features], df_all['actual_remaining_range_km'])",
        "    return rf, route_map, elev_map",
        "",
        "def predict_range(soc, speed, ac, temp, route_type, elev, cap_kwh, model, r_map, e_map):",
        "    \"\"\"Real-time remaining range inference incorporating thermal HVAC and elevation.\"\"\"",
        "    if soc <= 0.0: return 0.0",
        "    vec = [[soc, cap_kwh, speed, ac, temp, r_map.get(route_type, 1), e_map.get(elev, 0)]]",
        "    return max(0.0, round(float(model.predict(vec)[0]), 1))"
    ]
    add_code_listing(
        "Listing 5: Physics-Informed ML EV Range Predictor & Training Pipeline",
        "Module 5", "Range & Battery Analytics", "train_range_model.py & backend/ml_model.py",
        "Implements multi-capacity data augmentation, terrain/route encoding, and the Random Forest regression pipeline predicting real-time remaining EV driving range based on instantaneous telematics, HVAC load, and topography.",
        code_mod5,
        page_break_before=False
    )

    # PAGE 60: Listing 6 & Architecture Summary Table
    code_mod6 = [
        "def schedule_offpeak_charging(vehicles: List[Vehicle]) -> List[dict]:",
        "    \"\"\"Schedules depot charging allocations aligned with off-peak Time-of-Use (TOU) tariffs.\"\"\"",
        "    schedule, slot = [], 1",
        "    for v in vehicles:",
        "        if v.status in ['charging', 'idle'] or v.current_soc < 70.0:",
        "            hour = (22 + (slot // 3)) % 24  # Staggered night-time off-peak schedule (22:00 to 05:00)",
        "            rate = '150 kW' if (not v.motor_power_kw or v.motor_power_kw >= 100) else '120 kW'",
        "            schedule.append({",
        "                'schedule_id': f'SCH-{v.vehicle_id}', 'time': f'{hour:02d}:{(slot % 3) * 30:02d}',",
        "                'depot': f'Depot {\"A\" if slot % 2 == 0 else \"B\"} — Bay {((slot - 1) % 4) + 1}',",
        "                'vehicle_id': v.vehicle_id, 'duration': v.charging_time_spec or '4h', 'rate': rate",
        "            })",
        "            slot += 1",
        "    return schedule",
        "",
        "def evaluate_predictive_maintenance(vehicles: List[Vehicle]) -> List[dict]:",
        "    \"\"\"Generates condition-based maintenance actions triggered by battery State of Health (SOH).\"\"\"",
        "    work_orders = []",
        "    for v in vehicles:",
        "        if v.battery_health < 75.0:",
        "            work_orders.append({'vehicle_id': v.vehicle_id, 'severity': 'CRITICAL',",
        "                                'action': 'Urgent Battery Cell Balancing & Thermal Pack Overhaul', 'sla': '2 days'})",
        "        elif v.battery_health < 88.0:",
        "            work_orders.append({'vehicle_id': v.vehicle_id, 'severity': 'WARNING',",
        "                                'action': 'Battery Impedance Diagnostics & Inverter Service', 'sla': '5 days'})",
        "    return work_orders"
    ]
    add_code_listing(
        "Listing 6: Smart Time-of-Use Charging Dispatcher & Predictive Maintenance Planner",
        "Module 6", "Smart Charging & Maintenance", "backend/routers/charging.py & backend/routers/maintenance.py",
        "Implements automated Time-of-Use (TOU) off-peak charging schedule optimization to minimize fleet electricity costs, while evaluating battery degradation metrics to trigger proactive maintenance work orders.",
        code_mod6,
        page_break_before=True
    )

    # Closing summary: System Technology Stack & Execution Environment
    p_sum_head = doc.add_paragraph()
    p_sum_head.paragraph_format.space_before = Pt(8)
    p_sum_head.paragraph_format.space_after = Pt(2)
    p_sum_head.paragraph_format.keep_with_next = True
    r_sh = p_sum_head.add_run("System Implementation Environment & Module Verification")
    r_sh.bold = True
    r_sh.font.name = "Times New Roman"
    r_sh.font.size = Pt(10.5)
    r_sh.font.color.rgb = RGBColor(17, 24, 39)

    summary_table = doc.add_table(rows=4, cols=2)
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    summary_data = [
        ("Backend Framework & API Engine", "FastAPI (Python 3.11) with Uvicorn Asynchronous ASGI Server"),
        ("Machine Learning & Range Regression", "Scikit-Learn 1.3.2 (RandomForestRegressor, Multi-Linear Regression)"),
        ("Database & ORM Layer", "SQLite / PostgreSQL with SQLAlchemy 2.0 & Pydantic Data Validation"),
        ("Security & Telematics Encryption", "Bcrypt password hashing & PyJWT for Role-Based Access Control (RBAC)")
    ]
    for row_idx, (col1, col2) in enumerate(summary_data):
        row = summary_table.rows[row_idx]
        cell_a, cell_b = row.cells[0], row.cells[1]
        cell_a.width = Inches(2.4)
        cell_b.width = Inches(4.27)
        
        # cell shading
        shd_bg = "F1F5F9" if row_idx % 2 == 0 else "FFFFFF"
        shd_a = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{shd_bg}"/>')
        shd_b = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{shd_bg}"/>')
        cell_a._tc.get_or_add_tcPr().append(shd_a)
        cell_b._tc.get_or_add_tcPr().append(shd_b)
        
        # borders
        bxml = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>\n'
            f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>\n'
            f'  <w:left w:val="none"/>\n'
            f'  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>\n'
            f'  <w:right w:val="none"/>\n'
            f'</w:tcBorders>'
        )
        cell_a._tc.get_or_add_tcPr().append(bxml)
        bxml2 = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>\n'
            f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>\n'
            f'  <w:left w:val="none"/>\n'
            f'  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>\n'
            f'  <w:right w:val="none"/>\n'
            f'</w:tcBorders>'
        )
        cell_b._tc.get_or_add_tcPr().append(bxml2)
        
        pa = cell_a.paragraphs[0]
        pa.paragraph_format.space_before = Pt(2)
        pa.paragraph_format.space_after = Pt(2)
        ra = pa.add_run(col1)
        ra.font.name = "Times New Roman"
        ra.font.size = Pt(8.5)
        ra.bold = True
        ra.font.color.rgb = RGBColor(30, 41, 59)
        
        pb = cell_b.paragraphs[0]
        pb.paragraph_format.space_before = Pt(2)
        pb.paragraph_format.space_after = Pt(2)
        rb = pb.add_run(col2)
        rb.font.name = "Times New Roman"
        rb.font.size = Pt(8.5)
        rb.font.color.rgb = RGBColor(51, 65, 85)

    doc.save(output_path)
    print(f"Generated perfect appendix at: {output_path}")

if __name__ == "__main__":
    build_perfect_appendix(r"d:\Projects\VoltFleet AI\project\test_appendix_perfect.docx")
