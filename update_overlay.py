import glob
import re

html_files = glob.glob('*.html')

overlay_html = """
    <!-- Global Background Layer -->
    <div class="global-bg-layer">
        <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800" alt="Background Vibe">
    </div>"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove hero-overlay from index.html if present
    content = re.sub(r'<div class="hero-overlay">\s*<img[^>]*>\s*</div>', '', content)
    
    # Inject global bg layer directly after <body> wrapper if not injected
    if '<div class="global-bg-layer">' not in content:
        content = re.sub(r'(<body[^>]*>)', r'\1' + overlay_html, content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated HTML files for background layer.")
