# Slice a full-page screenshot into viewport-height crops for close review. Usage: crop.py file.png outdir [sliceHeight]
import sys, os
from PIL import Image
f, out = sys.argv[1], sys.argv[2]
h = int(sys.argv[3]) if len(sys.argv) > 3 else 1000
im = Image.open(f)
base = os.path.splitext(os.path.basename(f))[0]
for i, y in enumerate(range(0, im.height, h)):
    im.crop((0, y, im.width, min(y + h, im.height))).save(os.path.join(out, f"{base}-{i}.png"))
    print(os.path.join(out, f"{base}-{i}.png"))
