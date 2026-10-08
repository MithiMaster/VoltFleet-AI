import os
import time
import json
import requests

papers_dir = r"d:\Projects\Placement Pro\project\research_papers"
os.makedirs(papers_dir, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) EVFleetResearcher/1.0 (mailto:academic-ev-research@gmail.com)'
}

categories = [
    {
        "category": "Pillar 1: EV Range & Energy Consumption Prediction (ML)",
        "query": "electric vehicle range prediction machine learning",
        "filter": "title.search:electric vehicle,default.search:range prediction,from_publication_date:2020-01-01,to_publication_date:2026-12-31,is_oa:true",
        "needed": 5
    },
    {
        "category": "Pillar 2: Driver Behavior, Eco-Driving & Performance Scoring",
        "query": "electric vehicle driver behavior eco-driving",
        "filter": "title.search:electric vehicle,default.search:driver behavior,from_publication_date:2020-01-01,to_publication_date:2026-12-31,is_oa:true",
        "needed": 5
    },
    {
        "category": "Pillar 3: EV Fleet Management & Charging Infrastructure Optimization",
        "query": "electric vehicle fleet management charging scheduling",
        "filter": "title.search:electric vehicle,default.search:fleet management,from_publication_date:2020-01-01,to_publication_date:2026-12-31,is_oa:true",
        "needed": 5
    },
    {
        "category": "Pillar 4: EV Battery Health (SoH/SoC) & Telematics Monitoring",
        "query": "electric vehicle battery health state of health telematics",
        "filter": "title.search:electric vehicle,default.search:battery health state of health,from_publication_date:2020-01-01,to_publication_date:2026-12-31,is_oa:true",
        "needed": 5
    }
]

curated_papers = []
seen_dois = set()
seen_titles = set()

print("Fetching strictly Open Access (2020-2026) EV papers via OpenAlex API...")

for cat in categories:
    cat_name = cat["category"]
    print(f"\n--- Searching for {cat_name} ---")
    url = "https://api.openalex.org/works"
    params = {
        "filter": cat["filter"],
        "sort": "cited_by_count:desc",
        "per_page": 20
    }
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=25)
        if resp.status_code == 200:
            results = resp.json().get("results", [])
            count = 0
            for item in results:
                if count >= cat["needed"]:
                    break
                title = item.get("title")
                if not title or len(title) < 15:
                    continue
                # Ensure EV relevance in title or concept
                title_lower = title.lower()
                if "electric" not in title_lower and "ev" not in title_lower and "battery" not in title_lower:
                    continue
                
                doi = item.get("doi") or f"openalex_{item.get('id', '')}"
                if doi in seen_dois or title.lower() in seen_titles:
                    continue
                
                # Check OA and PDF link
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
                
                # Try to extract abstract from inverted index
                abstract = ""
                inv_index = item.get("abstract_inverted_index")
                if inv_index:
                    words = {}
                    for w, positions in inv_index.items():
                        for pos in positions:
                            words[pos] = w
                    abstract = " ".join(words[p] for p in sorted(words.keys()))
                
                curated_papers.append({
                    "id": len(curated_papers) + 1,
                    "category": cat_name,
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
                seen_dois.add(doi)
                seen_titles.add(title.lower())
                count += 1
                print(f"[{len(curated_papers)}/20] ({year}) {title[:60]}... | {venue}")
        else:
            print(f"API error for {cat_name}: {resp.status_code}")
    except Exception as e:
        print(f"Exception during fetch for {cat_name}: {e}")
    time.sleep(1)

print(f"\nSuccessfully curated {len(curated_papers)} Open-Access research papers (2020-2026)!")

# Save to JSON
json_path = os.path.join(papers_dir, "curated_20_papers.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(curated_papers, f, indent=2)
print(f"Saved metadata to {json_path}")

# Now attempt downloading PDFs
print("\nAttempting to download available open-access PDFs...")
download_summary = []
for p in curated_papers:
    p_id = p["id"]
    pdf_link = p["pdf_url"]
    safe_title = "".join(c for c in p['title'] if c.isalnum() or c in (' ', '_', '-')).strip()[:40].replace(' ', '_')
    filename = f"{p_id:02d}_{safe_title}.pdf"
    filepath = os.path.join(papers_dir, filename)
    
    downloaded = False
    file_size_kb = 0
    
    # Try downloading if valid direct PDF link
    if pdf_link and any(ext in pdf_link.lower() for ext in ['.pdf', 'content/pdf', 'download', 'springer', 'mdpi']):
        try:
            r = requests.get(pdf_link, headers=headers, timeout=20, allow_redirects=True)
            if r.status_code == 200 and len(r.content) > 15000 and b"%PDF" in r.content[:1024]:
                with open(filepath, "wb") as f:
                    f.write(r.content)
                file_size_kb = len(r.content) / 1024
                downloaded = True
                print(f"-> [{p_id}/20] Successfully downloaded: {filename} ({file_size_kb:.1f} KB)")
        except Exception as err:
            pass
            
    if not downloaded:
        print(f"-> [{p_id}/20] Direct download skipped/blocked by publisher; landing link available: {p['landing_url']}")
        
    download_summary.append({
        "id": p_id,
        "title": p["title"],
        "filename": filename if downloaded else None,
        "downloaded": downloaded,
        "size_kb": file_size_kb
    })
    time.sleep(1)

# Generate detailed PAPERS_INDEX.md
index_path = os.path.join(papers_dir, "PAPERS_INDEX.md")
with open(index_path, "w", encoding="utf-8") as f:
    f.write("# 20 Curated Open-Access Research Papers (2020–2026)\n\n")
    f.write("This collection includes **20 high-impact, open-access (free full-text / non-purchasing)** research papers directly related to the **VoltGrid EV Fleet Management & Predictive Analytics** project.\n\n")
    f.write("The papers span four core pillars:\n")
    f.write("1. **EV Range Prediction & Energy Consumption Modeling (ML)**\n")
    f.write("2. **Driver Behavior, Driving Style & Eco-Driving Performance Scoring**\n")
    f.write("3. **EV Fleet Management, Smart Routing & Charging Scheduling**\n")
    f.write("4. **Battery Health (SoH/SoC) Monitoring & Telematics**\n\n")
    f.write("---\n\n")
    
    for p in curated_papers:
        p_id = p["id"]
        dl_info = next((d for d in download_summary if d["id"] == p_id), None)
        pdf_status = f"[Download Local PDF](./{dl_info['filename']}) ({dl_info['size_kb']:.1f} KB)" if (dl_info and dl_info['downloaded']) else f"[Open Access Article / PDF]({p['pdf_url']})"
        
        f.write(f"### {p_id}. {p['title']}\n")
        f.write(f"- **Category:** `{p['category']}`\n")
        f.write(f"- **Authors:** {p['authors']}\n")
        f.write(f"- **Publication Year:** **{p['year']}** | **Venue/Publisher:** {p['venue']}\n")
        f.write(f"- **Citations:** {p['citations']}\n")
        f.write(f"- **DOI / Landing Page:** [{p['doi']}]({p['landing_url']})\n")
        f.write(f"- **Direct Open Access Link:** {pdf_status}\n")
        if p['abstract']:
            f.write(f"- **Abstract / Summary:** {p['abstract']}\n")
        f.write("\n---\n\n")

print("\nPAPERS_INDEX.md generated successfully!")
