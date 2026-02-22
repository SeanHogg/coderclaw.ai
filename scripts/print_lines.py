import sys

path = sys.argv[1]
start = int(sys.argv[2])
end = int(sys.argv[3])
with open(path, encoding='utf-8') as f:
    for i, line in enumerate(f, start=1):
        if start <= i <= end:
            sys.stdout.write(f"{i}: {line}")
