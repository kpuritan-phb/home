import glob
import re

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update <header> to <header class="top-bar">
    content = re.sub(r'<header(?!\s+class="top-bar")', r'<header class="top-bar"', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print("Updated HTML files.")
