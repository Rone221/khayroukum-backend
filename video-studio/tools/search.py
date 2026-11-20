"""Cherche des vidéos Pexels par requête et produit une planche d'aperçus numérotés."""
import json, sys, io, urllib.parse, urllib.request
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; queries = sys.argv[2:]
F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
def get(url, binary=False):
    req = urllib.request.Request(url, headers={"Authorization": "proxy-injected", "User-Agent": "video-tool"})
    with urllib.request.urlopen(req, timeout=60) as r: return r.read() if binary else json.loads(r.read())
for q in queries:
    res = []
    for orient in ("portrait", ""):
        d = get("https://api.pexels.com/videos/search?" + urllib.parse.urlencode({"query": q, "per_page": 10, **({"orientation": orient} if orient else {})}))
        res += [v for v in d["videos"] if v["id"] not in {x["id"] for x in res}]
        if len(res) >= 10: break
    res = res[:10]
    sheet = Image.new("RGB", (5 * 216, 2 * 400), "black"); dr = ImageDraw.Draw(sheet)
    meta = []
    for i, v in enumerate(res):
        try:
            im = Image.open(io.BytesIO(get(v["image"], True))).convert("RGB"); im.thumbnail((216, 384))
            sheet.paste(im, ((i % 5) * 216, (i // 5) * 400))
        except Exception as e: pass
        dr.rectangle([(i % 5) * 216, (i // 5) * 400 + 366, (i % 5) * 216 + 216, (i // 5) * 400 + 400], fill="black")
        dr.text(((i % 5) * 216 + 6, (i // 5) * 400 + 370), f"{i} {v['duration']}s {v['width']}x{v['height']}", font=F, fill="yellow")
        meta.append({"i": i, "id": v["id"], "dur": v["duration"], "w": v["width"], "h": v["height"], "url": v["url"], "user": v["user"]["name"],
                     "files": sorted([f for f in v["video_files"] if f.get("height")], key=lambda f: f["height"] * f["width"])})
    slug = q.replace(" ", "_")
    sheet.save(f"{out}/{slug}.jpg"); json.dump(meta, open(f"{out}/{slug}.json", "w"))
    print(q, len(res))
