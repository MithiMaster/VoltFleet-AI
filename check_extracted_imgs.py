import docx
import os
from PIL import Image

doc = docx.Document(r'Project PPT\Rough Report\VOLTFLEET AI (AutoRecovered).docx')

img_dir = r'Project PPT\extracted_report_images'
for f in os.listdir(img_dir):
    fpath = os.path.join(img_dir, f)
    if f.endswith('.emf'):
        print(f"{f}: size={os.path.getsize(fpath)} (EMF vector graphic)")
    else:
        try:
            im = Image.open(fpath)
            print(f"{f}: format={im.format}, size={im.size}, mode={im.mode}")
        except Exception as e:
            print(f"{f}: error {e}")
