import sys, time, numpy as np, onnxruntime as ort
from PIL import Image
sess = ort.InferenceSession(sys.argv[1], providers=["CPUExecutionProvider"])
src, out = sys.argv[2], sys.argv[3]
for name in sys.argv[4:]:
    t = time.time(); im = Image.open(f"{src}/{name}.png").convert("RGB")
    w, h = im.size; im = im.crop((3, 3, w - 3, h - 3))
    x = np.asarray(im, dtype=np.float32).transpose(2, 0, 1)[None] / 255.0
    y = sess.run(None, {"input": x})[0][0]
    Image.fromarray((np.clip(y, 0, 1).transpose(1, 2, 0) * 255).round().astype(np.uint8)).save(f"{out}/{name}.png")
    print(name, im.size, "->", (im.size[0] * 4, im.size[1] * 4), f"{time.time() - t:.1f}s", flush=True)
