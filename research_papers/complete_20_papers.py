import os
import json
import time
import requests

papers_dir = r"d:\Projects\Placement Pro\project\research_papers"
json_path = os.path.join(papers_dir, "curated_20_papers.json")

with open(json_path, "r", encoding="utf-8") as f:
    papers = json.load(f)

existing_dois = set(p.get("doi") for p in papers)
existing_titles = set(p.get("title", "").lower() for p in papers)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) EVFleetResearcher/1.0 (mailto:academic-ev-research@gmail.com)'
}

# Fetch papers for Pillar 2: Driver Behavior & Eco-Driving
url = "https://api.openalex.org/works"
params = {
    "filter": "title.search:electric vehicle,default.search:driver behavior eco-driving,from_publication_date:2020-01-01,to_publication_date:2026-12-31,is_oa:true",
    "sort": "cited_by_count:desc",
    "per_page": 20
}

added = 0
needed = 20 - len(papers)
print(f"Current count: {len(papers)}. Need to fetch {needed} more papers.")

try:
    resp = requests.get(url, params=params, headers=headers, timeout=25)
    if resp.status_code == 200:
        results = resp.json().get("results", [])
        for item in results:
            if len(papers) >= 20:
                break
            title = item.get("title")
            if not title or len(title) < 15:
                continue
            title_lower = title.lower()
            if "electric" not in title_lower and "ev" not in title_lower and "vehicle" not in title_lower:
                continue
            doi = item.get("doi") or f"openalex_{item.get('id', '')}"
            if doi in existing_dois or title_lower in existing_titles:
                continue
            
            is_oa = item.get("open_access", {}).get("is_oa", False)
            if not is_oa:
                continue
            
            pdf_url = item.get("open_access", {}).get("oa_url") or item.get("primary_location", {}).get("pdf_url")
            landing_url = item.get("primary_location", {}).get("landing_page_url") or doi
            year = item.get("publication_year")
            if not year or year < 2020 or year > 2026:
                continue
            
            venue = "Open Access Journal"
            primary_loc = item.get("primary_location") or {}
            source = primary_loc.get("source") or {}
            if source.get("display_name"):
                venue = source.get("display_name")
            
            authors_list = []
            for auth in item.get("authorships", []):
                author = auth.get("author", {})
                if author.get("display_name"):
                    authors_list.append(author.get("display_name"))
            authors_str = ", ".join(authors_list[:3]) + (" et al." if len(authors_list) > 3 else "")
            
            citations = item.get("cited_by_count", 0)
            
            abstract = ""
            inv_index = item.get("abstract_inverted_index")
            if inv_index:
                words = {}
                for w, positions in inv_index.items():
                    for pos in positions:
                        words[pos] = w
                abstract = " ".join(words[p] for p in sorted(words.keys()))
            
            papers.append({
                "id": len(papers) + 1,
                "category": "Pillar 2: Driver Behavior, Eco-Driving & Performance Scoring",
                "title": title,
                "authors": authors_str or "Research Team",
                "venue": venue,
                "year": year,
                "doi": doi,
                "landing_url": landing_url,
                "pdf_url": pdf_url or landing_url,
                "citations": citations,
                "abstract": abstract[:400] + ("..." if len(abstract) > 400 else "")
            })
            existing_dois.add(doi)
            existing_titles.add(title_lower)
            print(f"Added [{len(papers)}/20] ({year}): {title[:50]}...")
except Exception as e:
    print(f"Error fetching: {e}")

# If still need more, fetch another batch on EV range prediction
if len(papers) < 20:
    params2 = {
        "filter": "title.search:electric vehicle range,default.search:machine learning,from_publication_date:2020-01-01,to_publication_date:2026-12-31,is_oa:true",
        "sort": "cited_by_count:desc",
        "per_page": 20
    }
    try:
        resp = requests.get(url, params=params2, headers=headers, timeout=25)
        if resp.status_code == 200:
            for item in resp.json().get("results", []):
                if len(papers) >= 20: break
                title = item.get("title")
                if not title or title.lower() in existing_titles: continue
                doi = item.get("doi") or f"openalex_{item.get('id', '')}"
                if doi in existing_dois: continue
                year = item.get("publication_year")
                if not year or year < 2020 or year > 2026: continue
                pdf_url = item.get("open_access", {}).get("oa_url") or item.get("primary_location", {}).get("pdf_url")
                landing_url = item.get("primary_location", {}).get("landing_page_url") or doi
                venue = (item.get("primary_location") or {}).get("source", {}).get("display_name", "Open Access Journal")
                authors_list = [a.get("author", {}).get("display_name") for a in item.get("authorships", []) if a.get("author", {}).get("display_name")]
                authors_str = ", ".join(authors_list[:3]) + (" et al." if len(authors_list) > 3 else "")
                abstract = ""
                inv_index = item.get("abstract_inverted_index")
                if inv_index:
                    words = {}
                    for w, pos_list in inv_index.items():
                        for pos in pos_list: words[pos] = w
                    abstract = " ".join(words[p] for p in sorted(words.keys()))
                papers.append({
                    "id": len(papers) + 1,
                    "category": "Pillar 1: EV Range & Energy Consumption Prediction (ML)",
                    "title": title,
                    "authors": authors_str or "Research Team",
                    "venue": venue,
                    "year": year,
                    "doi": doi,
                    "landing_url": landing_url,
                    "pdf_url": pdf_url or landing_url,
                    "citations": item.get("cited_by_count", 0),
                    "abstract": abstract[:400] + ("..." if len(abstract) > 400 else "")
                })
                existing_dois.add(doi)
                existing_titles.add(title.lower())
                print(f"Added [{len(papers)}/20] ({year}): {title[:50]}...")
    except Exception as e:
        print(f"Error fetching batch 2: {e}")

# Save updated papers JSON
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(papers, f, indent=2)

print(f"\nFinal Total Papers: {len(papers)}")

# Generate comprehensive PAPERS_INDEX.md
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
    
    for p in papers:
        p_id = p["id"]
        f.write(f"### {p_id}. {p['title']}\n")
        f.write(f"- **Pillar / Category:** `{p['category']}`\n")
        f.write(f"- **Authors:** {p['authors']}\n")
        f.write(f"- **Publication Year:** **{p['year']}** | **Venue/Publisher:** {p['venue']}\n")
        f.write(f"- **Citations:** {p['citations']}\n")
        f.write(f"- **DOI / Official Landing Page:** [{p['doi']}]({p['landing_url']})\n")
        f.write(f"- **Direct Open Access Full Text / PDF:** [Download / View PDF]({p['pdf_url']})\n")
        if p.get('abstract'):
            f.write(f"- **Summary / Abstract:** {p['abstract']}\n")
        f.write("\n---\n\n")

print("Generated PAPERS_INDEX.md successfully.")
