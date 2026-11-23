import pathlib, os, re, json

# Paths
project_root = pathlib.Path(__file__).resolve().parents[1]
light_path = project_root / 'theme-light.md'
dark_path = project_root / 'theme-dark.md'

def load_color_map(file_path):
    colors = {}
    in_colors = False
    pattern = re.compile(r"\s*([a-zA-Z0-9_-]+):\s*['\"]?(#[0-9A-Fa-f]{6})['\"]?")
    with open(file_path, encoding='utf-8') as f:
        for line in f:
            if line.strip().startswith('colors:'):
                in_colors = True
                continue
            if in_colors:
                if line.startswith(' ') or line.startswith('\t'):
                    m = pattern.search(line)
                    if m:
                        key, hexval = m.group(1), m.group(2).lower()
                        colors[key] = hexval
                else:
                    break
    return colors

light_colors = load_color_map(light_path)
 dark_colors = load_color_map(dark_path)

# Build mapping from light hex -> dark hex using matching keys
mapping = {}
for key, light_hex in light_colors.items():
    dark_hex = dark_colors.get(key)
    if dark_hex:
        mapping[light_hex] = dark_hex.lower()

# Also map any explicit hex literals that appear in code but are not in the map (fallback)
# e.g., '#00F0FF' (primary) appears in docs; map to dark primary '#dbfcff'
extra = {
    '#00f0ff': '#00f0ff',  # same
    '#00F0FF': '#dbfcff',
    '#006970': '#dbfcff',  # primary in light -> dark primary
    '#006d43': '#54de99',  # secondary
    '#00dbe9': '#00dbe9',
    '#006970': '#00dbe9',
    '#00F0FF': '#dbfcff',
}
for k, v in extra.items():
    mapping[k.lower()] = v.lower()

# Compile regex patterns for each light hex (case‑insensitive)
patterns = {re.compile(re.escape(k), re.IGNORECASE): v for k, v in mapping.items()}

# File extensions to process
exts = {'.tsx', '.ts', '.js', '.jsx', '.css', '.html'}

changed_files = []

for root, dirs, files in os.walk(project_root, topdown=True):
    # skip node_modules to avoid missing paths
    dirs[:] = [d for d in dirs if d != 'node_modules']
    for f in files:
        if pathlib.Path(f).suffix.lower() in exts:
            file_path = pathlib.Path(root) / f
            try:
                text = file_path.read_text(encoding='utf-8')
            except Exception:
                continue
            original = text
            for pat, repl in patterns.items():
                text = pat.sub(repl, text)
            if text != original:
                file_path.write_text(text, encoding='utf-8')
                changed_files.append(str(file_path.relative_to(project_root)))

print(json.dumps({"changed": changed_files}, ensure_ascii=False))
