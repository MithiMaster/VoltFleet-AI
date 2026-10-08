import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import os
import time

papers_dir = r"d:\Projects\Placement Pro\project\research_papers"
os.makedirs(papers_dir, exist_ok=True)

queries = [
    'ti:"electric vehicle" AND (abs:"range prediction" OR abs:"energy consumption")',
    'ti:"electric vehicle" AND abs:"fleet management"',
    'ti:"electric vehicle" AND (abs:"driver behavior" OR abs:"eco-driving")'
]

papers_to_download = []
seen_ids = set()

headers = {
    'User-Agent': 'FleetResearchBot/1.0 (contact: research@placementpro.local; https://arxiv.org)'
}

for q in queries:
    params = {
        'search_query': q,
        'start': 0,
        'max_results': 2,
        'sortBy': 'relevance',
        'sortOrder': 'descending'
    }
    url = "http://export.arxiv.org/api/query?" + urllib.parse.urlencode(params, quote_via=urllib.parse.quote_plus)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
        root = ET.fromstring(data)
        for entry in root.findall('{http://www.w3.org/2005/Atom}entry'):
            id_elem = entry.find('{http://www.w3.org/2005/Atom}id')
            if id_elem is None: continue
            arxiv_id = id_elem.text.strip().split('/abs/')[-1]
            if arxiv_id in seen_ids: continue
            seen_ids.add(arxiv_id)
            title = entry.find('{http://www.w3.org/2005/Atom}title').text.strip().replace('\n', ' ')
            pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
            papers_to_download.append({
                'id': arxiv_id,
                'title': title,
                'pdf_url': pdf_url
            })
        print(f"Query succeeded: {q[:45]}... Found {len(papers_to_download)} unique papers so far.")
        time.sleep(3.5) # Polite delay
    except Exception as e:
        print(f"Error querying {q}: {e}")

print(f"\nTotal papers to download: {len(papers_to_download)}")
for p in papers_to_download:
    print(f"- [{p['id']}] {p['title']}")

print("\nStarting paper PDF downloads...")
for idx, p in enumerate(papers_to_download, 1):
    safe_title = "".join(c for c in p['title'] if c.isalnum() or c in (' ', '_', '-')).rstrip()[:45].strip().replace(' ', '_')
    filename = f"{idx:02d}_{safe_title}.pdf"
    filepath = os.path.join(papers_dir, filename)
    print(f"[{idx}/{len(papers_to_download)}] Downloading {filename}...")
    try:
        req = urllib.request.Request(p['pdf_url'], headers=headers)
        with urllib.request.urlopen(req, timeout=35) as resp:
            content = resp.read()
            with open(filepath, 'wb') as f:
                f.write(content)
        print(f"    --> Successfully downloaded ({len(content) / 1024:.1f} KB)")
    except Exception as e:
        print(f"    --> Error downloading {p['id']}: {e}")
    time.sleep(3.5)

print("\nDownload process completed!")
