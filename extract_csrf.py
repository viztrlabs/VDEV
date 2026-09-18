import re
import json

with open(r'C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev\signin_page.html', 'r') as f:
    html = f.read()

# Search for csrf-related content
for m in re.findall(r'.{0,30}csrf.{0,30}', html[:10000]):
    print(m)

# Also check for any hidden form fields
for m in re.findall(r'type="hidden"[^>]*name="([^"]+)"[^>]*value="([^"]+)"', html[:10000]):
    print(f"Hidden field: {m[0]}={m[1][:50]}")