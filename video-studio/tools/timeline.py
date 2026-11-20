import json, re, subprocess, sys, unicodedata
from difflib import SequenceMatcher
S = sys.argv[1]
script = json.load(open(f"{S}/script.json")); wh = json.load(open(f"{S}/vo/words.json"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s.lower()).encode("ascii", "ignore").decode())
import os
LEAD, GAP, TAIL = (float(os.environ.get(k, d)) for k, d in (("LEAD", 1.3), ("GAP", 0.75), ("TAIL", 3.2)))
dur = lambda f: float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f]))
t, scenes = LEAD, []
for i, text in enumerate(script, 1):
    d = dur(f"{S}/vo/s{i}.wav")
    toks = text.split()
    w = wh[str(i)]
    # whisper peut couper "jusqu 'à" : on fusionne ses tokens normalisés vides
    a, b = [norm(x) for x in toks], [norm(x[0]) for x in w]
    times = [None] * len(toks)
    for blk in SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = (w[blk.b + k][1], w[blk.b + k][2])
    # interpolation des mots non alignés
    for k in range(len(toks)):
        if times[k] is None:
            prev = next((times[j][1] for j in range(k - 1, -1, -1) if times[j]), 0.0)
            nxt_i = next((j for j in range(k + 1, len(toks)) if times[j]), None)
            nxt = times[nxt_i][0] if nxt_i is not None else d
            n = (nxt_i if nxt_i is not None else len(toks)) - k
            step = (nxt - prev) / (n + 0.0001)
            times[k] = (prev, prev + step)
    scenes.append({"index": i, "audioStart": round(t, 3), "audioDur": round(d, 3),
                   "words": [{"w": tok, "s": round(t + s, 3), "e": round(t + e, 3)} for tok, (s, e) in zip(toks, times)]})
    t += d + GAP
total = t - GAP + TAIL
for k, sc in enumerate(scenes):
    sc["start"] = 0.0 if k == 0 else round(sc["audioStart"] - 0.3, 3)
for k, sc in enumerate(scenes):
    sc["end"] = round(scenes[k + 1]["start"], 3) if k + 1 < len(scenes) else round(total, 3)
json.dump({"total": round(total, 3), "scenes": scenes}, open(f"{S}/timeline.json", "w"), ensure_ascii=False, indent=1)
# piste audio maîtresse : chaque segment placé à son instant exact
inputs, filt = [], []
for k, sc in enumerate(scenes):
    inputs += ["-i", f"{S}/vo/s{sc['index']}.wav"]
    ms = int(sc["audioStart"] * 1000)
    filt.append(f"[{k}:a]aresample=48000,adelay={ms}|{ms}[a{k}]")
mix = "".join(f"[a{k}]" for k in range(len(scenes)))
filt.append(f"{mix}amix=inputs={len(scenes)}:normalize=0,apad,atrim=0:{total:.3f},highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=120,loudnorm=I=-15:TP=-1.5:LRA=9[out]")
subprocess.run(["ffmpeg","-loglevel","error","-y",*inputs,"-filter_complex",";".join(filt),"-map","[out]","-ac","2","-c:a","aac","-b:a","192k",f"{S}/narration.m4a"], check=True)
print("total", round(total, 2), [ (sc["start"], sc["end"]) for sc in scenes])
