import docx
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

doc = docx.Document()
section = doc.sections[0]
sectPr = section._sectPr

# Set start page to 57
pgNumType = parse_xml(f'<w:pgNumType {nsdecls("w")} w:start="57"/>')
sectPr.append(pgNumType)

# Footer page number
footer = section.footer
p = footer.paragraphs[0]
p.alignment = docx.enum.text.WD_ALIGN_PARAGRAPH.CENTER
fld = parse_xml(f'<w:fldSimple {nsdecls("w")} w:instr="PAGE"/>')
p._p.append(fld)

print("SectPr XML:", sectPr.xml[:300])
print("Footer XML:", p._p.xml)
doc.save("test_out.docx")
print("Saved test_out.docx successfully")
