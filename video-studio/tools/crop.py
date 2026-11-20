import sys, glob, numpy as np
from PIL import Image
from scipy import ndimage
out = sys.argv[1]
for f in sorted(glob.glob(sys.argv[2] + "/p-00[0-5].jpg")):
    im = Image.open(f).convert("RGB"); a = np.asarray(im).astype(int)
    bg = np.array([253, 246, 230]); diff = np.abs(a - a[5, 5]).sum(2) > 40
    diff[:260] = False  # titre
    lab, n = ndimage.label(ndimage.binary_closing(diff, iterations=3))
    boxes = [b for b in ndimage.find_objects(lab) if (b[0].stop - b[0].start) > 150 and (b[1].stop - b[1].start) > 150]
    boxes.sort(key=lambda b: (round(b[0].start / 120), b[1].start))
    page = f.rsplit("-", 1)[1][:3]
    for k, b in enumerate(boxes):
        im.crop((b[1].start, b[0].start, b[1].stop, b[0].stop)).save(f"{out}/p{page}_{k:02d}.png")
    print(page, len(boxes), [(b[1].stop - b[1].start, b[0].stop - b[0].start) for b in boxes][:6])
