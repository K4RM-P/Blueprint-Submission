# Contact sheet: top crop of several screenshots side by side. Usage: sheet.py out.png cropH scale files...
import sys
from PIL import Image, ImageDraw
out, ch, sc = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
ims = []
for f in sys.argv[4:]:
    im = Image.open(f); im = im.crop((0, 0, im.width, min(ch, im.height)))
    im = im.resize((int(im.width * sc), int(im.height * sc))); ims.append((f, im))
W = sum(i.width for _, i in ims) + 10 * len(ims); H = max(i.height for _, i in ims) + 20
sheet = Image.new("RGB", (W, H), "white"); d = ImageDraw.Draw(sheet); x = 0
for f, i in ims:
    sheet.paste(i, (x, 20)); d.text((x + 4, 4), f.split("/")[-1], fill="black"); x += i.width + 10
sheet.save(out)
