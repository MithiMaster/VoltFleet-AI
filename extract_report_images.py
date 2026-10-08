import docx
import os

doc_path = r'Project PPT\Rough Report\VOLTFLEET AI (AutoRecovered).docx'
doc = docx.Document(doc_path)

img_dir = r'Project PPT\extracted_report_images'
os.makedirs(img_dir, exist_ok=True)

img_count = 0
for rel in doc.part.rels.values():
    if "image" in rel.target_ref:
        img_data = rel.target_part.blob
        ext = rel.target_ref.split('.')[-1]
        img_name = f"image_{img_count+1:02d}.{ext}"
        img_path = os.path.join(img_dir, img_name)
        with open(img_path, 'wb') as f:
            f.write(img_data)
        img_count += 1
        print(f"Extracted {img_name}: {len(img_data)} bytes")

print(f"Total extracted images: {img_count}")
