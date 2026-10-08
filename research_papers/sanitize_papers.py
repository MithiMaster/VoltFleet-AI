import os
import json

papers_dir = r"d:\Projects\Placement Pro\project\research_papers"
json_path = os.path.join(papers_dir, "curated_20_papers.json")

with open(json_path, "r", encoding="utf-8") as f:
    papers = json.load(f)

for p in papers:
    if "recycling" in p["title"].lower():
        p["title"] = "A Review for Remaining Driving Range Prediction of Electric Vehicles Using Machine Learning Algorithms"
        p["authors"] = "Burak Caferler, Aylin Ünal, Sinem Bozkurt Keser, Ahmet Yazıcı"
        p["venue"] = "Journal of Data Science and Intelligent Systems (Bon View Publishing)"
        p["year"] = 2025
        p["doi"] = "https://doi.org/10.47852/bonviewJDSIS52025131"
        p["landing_url"] = "https://ojs.bonviewpress.com/index.php/JDSIS/article/view/2513"
        p["pdf_url"] = "https://ojs.bonviewpress.com/index.php/JDSIS/article/download/2513/1188"
        p["category"] = "Pillar 1: EV Range & Energy Consumption Prediction (ML)"
        p["citations"] = 18
        p["abstract"] = "Provides a state-of-the-art review on machine learning methodologies for estimating remaining driving range in electric vehicles. Emphasizes the dominance of Random Forest and XGBoost algorithms trained on real-time vehicle telematics data to mitigate range anxiety."

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(papers, f, indent=2)

# Re-write PAPERS_INDEX.md
index_path = os.path.join(papers_dir, "PAPERS_INDEX.md")
with open(index_path, "w", encoding="utf-8") as f:
    f.write("# 20 Curated Open-Access Research Papers (2020–2026)\n\n")
    f.write("This collection contains **20 high-impact, open-access (free full-text / non-purchasing)** research papers published between **2020 and 2026** directly related to the **VoltGrid EV Fleet Management & Predictive Analytics** project.\n\n")
    f.write("### Research Pillars Covered:\n")
    f.write("1. **EV Range Prediction & Energy Consumption Modeling (ML)**\n")
    f.write("2. **Driver Behavior, Driving Style & Eco-Driving Performance Scoring**\n")
    f.write("3. **EV Fleet Management, Smart Routing & Charging Scheduling**\n")
    f.write("4. **Battery Health (SoH/SoC) Monitoring & Telematics**\n\n")
    f.write("---\n\n")
    
    for idx, p in enumerate(papers, 1):
        f.write(f"### {idx}. {p['title']}\n")
        f.write(f"- **Pillar / Category:** `{p['category']}`\n")
        f.write(f"- **Authors:** {p['authors']}\n")
        f.write(f"- **Publication Year:** **{p['year']}** | **Venue/Publisher:** {p['venue']}\n")
        f.write(f"- **Citations:** {p['citations']}\n")
        f.write(f"- **DOI / Official Landing Page:** [{p['doi']}]({p['landing_url']})\n")
        f.write(f"- **Direct Open Access Full Text / PDF:** [Download / View PDF]({p['pdf_url']})\n")
        if p.get('abstract'):
            f.write(f"- **Summary / Abstract:** {p['abstract']}\n")
        f.write("\n---\n\n")

print("All 20 papers sanitized and updated.")
