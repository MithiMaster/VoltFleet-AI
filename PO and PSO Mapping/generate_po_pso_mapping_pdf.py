import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import fitz

def generate_pdf():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_pdf = os.path.join(script_dir, "VoltFleet_AI_PO_PSO_Mapping.pdf")
    header_img_path = os.path.join(script_dir, "..", "Project PPT", "college_header.png")

    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=letter,
        leftMargin=40.0,
        rightMargin=40.0,
        topMargin=32.0,
        bottomMargin=32.0
    )

    styles = getSampleStyleSheet()

    sub_hdr_style = ParagraphStyle(
        'SubHdr',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=11,
        leading=14,
        alignment=TA_CENTER
    )

    doc_title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=12,
        leading=16,
        alignment=TA_CENTER,
        spaceBefore=4,
        spaceAfter=10
    )

    section_hdr_style = ParagraphStyle(
        'SecHdr',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=10.5,
        leading=13.5,
        alignment=TA_CENTER,
        spaceBefore=6,
        spaceAfter=4
    )

    th_po_style = ParagraphStyle(
        'TH_PO',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=10,
        leading=12,
        alignment=TA_CENTER
    )

    cell_bold_center = ParagraphStyle(
        'CellBoldCenter',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=9,
        leading=11.5,
        alignment=TA_CENTER
    )

    cell_body_justify = ParagraphStyle(
        'CellBodyJustify',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=9,
        leading=11.5,
        alignment=TA_JUSTIFY
    )

    story = []

    # Add header logo if exists
    if os.path.exists(header_img_path):
        # Original is 770 x 151 (~5.1 aspect ratio). Max width ~530 pt -> height ~104 pt
        story.append(RLImage(header_img_path, width=460, height=90))
        story.append(Spacer(1, 2))

    story.append(Paragraph("Department of Computer Science and Engineering", sub_hdr_style))
    story.append(Paragraph("Mapping with Programme Outcomes and Programme Specific Outcomes", doc_title_style))

    # PO Table
    story.append(Paragraph("Applicable Program Outcomes (POs) with Justification", section_hdr_style))

    po_data = [
        [
            Paragraph("<b>PO</b>", th_po_style),
            Paragraph("<b>Applicable Outcome and Justification</b>", th_po_style)
        ],
        [
            Paragraph("<b>PO1: Engineering Knowledge</b>", cell_bold_center),
            Paragraph("Applied machine learning principles, Python, HistGradientBoosting, physics-informed vehicle dynamics (aerodynamic drag, rolling resistance, gravitational load), and IoT telematics to build the intelligent EV fleet management prototype.", cell_body_justify)
        ],
        [
            Paragraph("<b>PO2: Problem Analysis</b>", cell_bold_center),
            Paragraph("Analysed key commercial EV fleet bottlenecks, including non-linear battery degradation, static range calculation inaccuracies, peak electricity tariff expenses, and elevation-induced stranding risks.", cell_body_justify)
        ],
        [
            Paragraph("<b>PO3:<br/>Design/Development</b>", cell_bold_center),
            Paragraph("Designed full-stack modular architecture including CAN-bus/IoT telematics ingestion, physics-informed range predictor, 3D elevation route optimizer with automated 150 kW DC fast-charging stops, and live operations dashboard.", cell_body_justify)
        ],
        [
            Paragraph("<b>PO4: Investigation</b>", cell_bold_center),
            Paragraph("Conducted comparative benchmarks across ML algorithms (Random Forest 97.6%, Logistic Regression 98.4%, KNN 94.3%) and simulated commercial transit scenarios (585 km route) validating range assurance and 31.4% cost savings.", cell_body_justify)
        ],
        [
            Paragraph("<b>PO5: Engineering Tool Usage</b>", cell_bold_center),
            Paragraph("Used Python, Scikit-learn, FastAPI/Flask, React, Vite, Leaflet.js, OpenStreetMap, PostgreSQL/SQLite, VS Code, and Git for system implementation and evaluation.", cell_body_justify)
        ],
        [
            Paragraph("<b>PO7: Ethics</b>", cell_bold_center),
            Paragraph("Enforced cryptographic authentication (bcrypt hashing, JWT) and role-based access control; restricted telematics tracking strictly to vehicle operational parameters without privacy-invasive personal surveillance.", cell_body_justify)
        ],
        [
            Paragraph("<b>PO8: Individual and Team Work</b>", cell_bold_center),
            Paragraph("Modules including telematics ingestion, machine learning range prediction, geospatial route optimization, and dashboard visualization were executed collaboratively across four team members.", cell_body_justify)
        ],
        [
            Paragraph("<b>PO9: Communication</b>", cell_bold_center),
            Paragraph("The engineering design, mathematical formulation, and experimental outcomes are documented through comprehensive reports, architecture diagrams, PPT presentations, and live demonstration.", cell_body_justify)
        ],
        [
            Paragraph("<b>PO11: Life-Long Learning</b>", cell_bold_center),
            Paragraph("Required independent exploration of physics-informed ML, battery electrochemistry, digital elevation modeling, and modern WebGIS, laying the foundation for future physical CAN-bus hardware and V2G integration.", cell_body_justify)
        ]
    ]

    col_widths_po = [140, 392]
    po_table = Table(po_data, colWidths=col_widths_po, repeatRows=1)
    po_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#D9E1F2')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.7, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(po_table)
    story.append(Spacer(1, 6))

    # PSO Table
    story.append(Paragraph("Applicable Program Specific Outcomes (PSOs) with Justification", section_hdr_style))

    pso_data = [
        [
            Paragraph("<b>PSO</b>", th_po_style),
            Paragraph("<b>Applicable Outcome and Justification</b>", th_po_style)
        ],
        [
            Paragraph("<b>PSO1:<br/>Computational Skills</b>", cell_bold_center),
            Paragraph("Applied computer science and AI knowledge to engineer a modular, full-stack predictive EV analytics platform integrating gradient boosted decision trees and real-time geospatial routing.", cell_body_justify)
        ],
        [
            Paragraph("<b>PSO2:<br/>Studious Research</b>", cell_bold_center),
            Paragraph("Converted research in EV battery state-of-health estimation and elevation-aware energy consumption into an industry-ready commercial fleet management prototype supporting green logistics.", cell_body_justify)
        ]
    ]

    col_widths_pso = [140, 392]
    pso_table = Table(pso_data, colWidths=col_widths_pso, repeatRows=1)
    pso_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2EFDA')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.7, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(pso_table)

    doc.build(story)
    print(f"Successfully generated {output_pdf}")
    verify_doc = fitz.open(output_pdf)
    print(f"PO/PSO Mapping PDF Total pages: {len(verify_doc)}")

def generate_docx():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_docx = os.path.join(script_dir, "VoltFleet_AI_PO_PSO_Mapping.docx")
    header_img_path = os.path.join(script_dir, "..", "Project PPT", "college_header.png")

    doc = docx.Document()
    # Set 0.5 in margins
    for sec in doc.sections:
        sec.top_margin = Inches(0.5)
        sec.bottom_margin = Inches(0.5)
        sec.left_margin = Inches(0.6)
        sec.right_margin = Inches(0.6)

    if os.path.exists(header_img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_after = Pt(2)
        p_img.paragraph_format.space_before = Pt(0)
        p_img.add_run().add_picture(header_img_path, width=Inches(6.8))

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_after = Pt(2)
    r = p_dept.add_run("Department of Computer Science and Engineering")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)

    p_map = doc.add_paragraph()
    p_map.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_map.paragraph_format.space_after = Pt(8)
    r = p_map.add_run("Mapping with Programme Outcomes and Programme Specific Outcomes")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)

    def set_cell_bg(cell, hex_color):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    def set_cell_margins(cell, top=60, bottom=60, left=100, right=100):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    p_po_hdr = doc.add_paragraph()
    p_po_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_po_hdr.paragraph_format.space_after = Pt(4)
    r = p_po_hdr.add_run("Applicable Program Outcomes (POs) with Justification")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    po_rows = [
        ("PO1: Engineering Knowledge", "Applied machine learning principles, Python, HistGradientBoosting, physics-informed vehicle dynamics (aerodynamic drag, rolling resistance, gravitational load), and IoT telematics to build the intelligent EV fleet management prototype."),
        ("PO2: Problem Analysis", "Analysed key commercial EV fleet bottlenecks, including non-linear battery degradation, static range calculation inaccuracies, peak electricity tariff expenses, and elevation-induced stranding risks."),
        ("PO3: Design/Development", "Designed full-stack modular architecture including CAN-bus/IoT telematics ingestion, physics-informed range predictor, 3D elevation route optimizer with automated 150 kW DC fast-charging stops, and live operations dashboard."),
        ("PO4: Investigation", "Conducted comparative benchmarks across ML algorithms (Random Forest 97.6%, Logistic Regression 98.4%, KNN 94.3%) and simulated commercial transit scenarios (585 km route) validating range assurance and 31.4% cost savings."),
        ("PO5: Engineering Tool Usage", "Used Python, Scikit-learn, FastAPI/Flask, React, Vite, Leaflet.js, OpenStreetMap, PostgreSQL/SQLite, VS Code, and Git for system implementation and evaluation."),
        ("PO7: Ethics", "Enforced cryptographic authentication (bcrypt hashing, JWT) and role-based access control; restricted telematics tracking strictly to vehicle operational parameters without privacy-invasive personal surveillance."),
        ("PO8: Individual and Team Work", "Modules including telematics ingestion, machine learning range prediction, geospatial route optimization, and dashboard visualization were executed collaboratively across four team members."),
        ("PO9: Communication", "The engineering design, mathematical formulation, and experimental outcomes are documented through comprehensive reports, architecture diagrams, PPT presentations, and live demonstration."),
        ("PO11: Life-Long Learning", "Required independent exploration of physics-informed ML, battery electrochemistry, digital elevation modeling, and modern WebGIS, laying the foundation for future physical CAN-bus hardware and V2G integration.")
    ]

    table = doc.add_table(rows=len(po_rows) + 1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    table.columns[0].width = Inches(2.0)
    table.columns[1].width = Inches(5.2)

    # Header
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = "PO"
    hdr_cells[1].text = "Applicable Outcome and Justification"
    for c in hdr_cells:
        set_cell_bg(c, "D9E1F2")
        set_cell_margins(c)
        c.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        for p in c.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            for run in p.runs:
                run.font.bold = True
                run.font.name = "Times New Roman"
                run.font.size = Pt(10.5)

    for idx, (po_name, po_just) in enumerate(po_rows, start=1):
        row_cells = table.rows[idx].cells
        row_cells[0].text = po_name
        row_cells[1].text = po_just
        for c in row_cells:
            set_cell_margins(c)
            c.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            for p in c.paragraphs:
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.space_before = Pt(2)
                for run in p.runs:
                    run.font.name = "Times New Roman"
                    run.font.size = Pt(10)
        # Left cell bold & centered
        for run in row_cells[0].paragraphs[0].runs:
            run.font.bold = True
        row_cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        row_cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # PSO Table
    p_pso_hdr = doc.add_paragraph()
    p_pso_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_pso_hdr.paragraph_format.space_before = Pt(8)
    p_pso_hdr.paragraph_format.space_after = Pt(4)
    r = p_pso_hdr.add_run("Applicable Program Specific Outcomes (PSOs) with Justification")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    pso_rows = [
        ("PSO1: Computational Skills", "Applied computer science and AI knowledge to engineer a modular, full-stack predictive EV analytics platform integrating gradient boosted decision trees and real-time geospatial routing."),
        ("PSO2: Studious Research", "Converted research in EV battery state-of-health estimation and elevation-aware energy consumption into an industry-ready commercial fleet management prototype supporting green logistics.")
    ]

    pso_table = doc.add_table(rows=len(pso_rows) + 1, cols=2)
    pso_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    pso_table.autofit = False

    pso_table.columns[0].width = Inches(2.0)
    pso_table.columns[1].width = Inches(5.2)

    hdr_cells_pso = pso_table.rows[0].cells
    hdr_cells_pso[0].text = "PSO"
    hdr_cells_pso[1].text = "Applicable Outcome and Justification"
    for c in hdr_cells_pso:
        set_cell_bg(c, "E2EFDA")
        set_cell_margins(c)
        c.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        for p in c.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            for run in p.runs:
                run.font.bold = True
                run.font.name = "Times New Roman"
                run.font.size = Pt(10.5)

    for idx, (pso_name, pso_just) in enumerate(pso_rows, start=1):
        row_cells = pso_table.rows[idx].cells
        row_cells[0].text = pso_name
        row_cells[1].text = pso_just
        for c in row_cells:
            set_cell_margins(c)
            c.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            for p in c.paragraphs:
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.space_before = Pt(2)
                for run in p.runs:
                    run.font.name = "Times New Roman"
                    run.font.size = Pt(10)
        for run in row_cells[0].paragraphs[0].runs:
            run.font.bold = True
        row_cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        row_cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # Set borders for tables
    def set_table_borders(t):
        tblPr = t._tbl.tblPr
        tblBorders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
            f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
            f'<w:insideH w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
            f'<w:insideV w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
            f'<w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
            f'<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(tblBorders)

    set_table_borders(table)
    set_table_borders(pso_table)

    doc.save(output_docx)
    print(f"Successfully generated {output_docx}")

if __name__ == "__main__":
    generate_pdf()
    generate_docx()
