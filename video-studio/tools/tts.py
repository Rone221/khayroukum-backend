import json, os, sys, wave
import numpy as np
from piper import PiperVoice, SynthesisConfig
voice = PiperVoice.load(os.environ.get("PIPER_MODEL", "models/fr_FR-tom-medium.onnx"))
cfg = SynthesisConfig(length_scale=1.1, noise_scale=0.55, noise_w_scale=0.7)
PAUSE = 0.32
for i, text in enumerate(json.load(open(sys.argv[1])), 1):
    chunks = list(voice.synthesize(text, syn_config=cfg))
    sr = chunks[0].sample_rate
    parts = []
    for k, c in enumerate(chunks):
        parts.append(c.audio_int16_array)
        if k < len(chunks) - 1: parts.append(np.zeros(int(sr * PAUSE), dtype=np.int16))
    with wave.open(f"{sys.argv[2]}/s{i}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.concatenate(parts).tobytes())
