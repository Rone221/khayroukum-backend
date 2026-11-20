import json, sys, glob
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[1], device="cpu", compute_type="int8")
res = {}
for i in range(1, int(sys.argv[3]) + 1):
    segs, _ = m.transcribe(f"{sys.argv[2]}/s{i}.wav", language="fr", word_timestamps=True)
    words = [(w.word.strip(), round(w.start, 2), round(w.end, 2)) for s in segs for w in s.words]
    res[i] = words
    print(i, " ".join(w[0] for w in words))
json.dump(res, open(f"{sys.argv[2]}/words.json", "w"), ensure_ascii=False)
