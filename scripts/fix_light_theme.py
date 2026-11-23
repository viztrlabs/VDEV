import pathlib, re, sys, json

# Project root (two levels up from this script)
root = pathlib.Path(__file__).resolve().parents[1]

# File extensions to process (source and style files)
extensions = {'.tsx', '.ts', '.js', '.jsx', '.css', '.html'}

# Mapping of dark hex literals to light theme values (from theme-light.md)
mapping = {
    '#09090B': '#fcf8f9',  # background surface
    '#FAFAFA': '#1c1b1c',  # text on background
    '#18181B': '#f0edee',  # card / surface container
    '#27272A': '#e5e2e3',  # border
    '#3ECF8E': '#006970',  # accent / primary (original greenish cyan)
    '#0c0c0f': '#f0edee',  # fallback dark bg -> light card bg
    # keep muted gray as is
}

# Compile regex patterns (case‑insensitive)
patterns = {re.compile(re.escape(k), re.IGNORECASE): v for k, v in mapping.items()}

changed_files = []

for path in root.rglob('*'):
    if path.suffix.lower() in extensions:
        try:
            text = path.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        original = text
        for pat, repl in patterns.items():
            text = pat.sub(repl, text)
        if text != original:
            path.write_text(text, encoding='utf-8')
            changed_files.append(str(path.relative_to(root)))

print(json.dumps({"changed": changed_files}, ensure_ascii=False))
