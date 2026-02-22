import sys, re

# Simple conflict resolver: keep HEAD section and drop incoming

def resolve(path):
    out_lines = []
    in_conflict = False
    keep = True
    with open(path, encoding='utf-8') as f:
        for line in f:
            if line.startswith('<<<<<<<'):
                in_conflict = True
                keep = True
                continue
            if line.startswith('=======') and in_conflict:
                keep = False
                continue
            if line.startswith('>>>>>>>') and in_conflict:
                in_conflict = False
                keep = True
                continue
            if not in_conflict or (in_conflict and keep):
                out_lines.append(line)
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(out_lines)

def list_markers(path):
    import re
    print(f"Markers in {path}:")
    with open(path, encoding='utf-8') as f:
        for i, line in enumerate(f, start=1):
            if re.search(r'(<<<<<<<|=======|>>>>>>>)', line):
                print(i, line.strip())

if __name__ == '__main__':
    for p in sys.argv[1:]:
        if p == '--check':
            continue
        resolve(p)
    # if --check present show markers for all other args
    if '--check' in sys.argv:
        for p in sys.argv[1:]:
            if p != '--check':
                list_markers(p)
