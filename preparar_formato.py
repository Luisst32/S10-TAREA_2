from pathlib import Path
from docx import Document

base = Path(__file__).parent
template = next(base.glob('formato_*.docx'))
output = base / 'Entrega_Catalogo_parte_1.docx'
doc = Document(template)
replacements = {
    'TEMA:': 'Catálogo de productos con favoritos y acceso por roles',
    'AUTORES:': 'Integrante 1 / Integrante 2 (completar nombres)',
    'ASIGNATURA:': 'Completar asignatura',
    'DOCENTE:': 'Completar docente',
    'FECHA DE ENTREGA:': '20 de noviembre de 2026',
}
for paragraph in doc.paragraphs:
    for label, value in replacements.items():
        if paragraph.text.startswith(label) and len(paragraph.runs) >= 2:
            paragraph.runs[1].text = value
doc.save(output)
print(output)
