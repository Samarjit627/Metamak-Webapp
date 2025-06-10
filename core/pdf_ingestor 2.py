# pdf_ingestor.py – Ingest DFM rules or tips from PDFs into Axis5 knowledge pool

import fitz  # PyMuPDF
import json
import re

# Settings
pdf_path = "sample_dfm_book.pdf"
source_name = "DFM Design Guide, Section A1"
material_hint = "steel"
process_hint = "sheet metal"
output_file = "axis5_knowledge_pool.jsonl"

# Read PDF text
doc = fitz.open(pdf_path)
entries = []
id_counter = 100

for page in doc:
    text = page.get_text()
    for line in text.split("\n"):
        line = line.strip()
        if len(line) > 40 and not line.startswith("Page"):
            id_counter += 1
            entries.append({
                "id": f"pdf_{id_counter}",
                "text": line,
                "source": source_name,
                "tag": "dfm_rule",
                "material": material_hint,
                "process": process_hint
            })

doc.close()

# Append to output
with open(output_file, "a") as f:
    for e in entries:
        f.write(json.dumps(e) + "\n")

print(f"✅ Ingested {len(entries)} entries from PDF to {output_file}")
