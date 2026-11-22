import json, sys, wave, numpy as np, subprocess
from piper import PiperVoice, SynthesisConfig
from faster_whisper import WhisperModel
S = sys.argv[1]; lines = json.load(open(f"{S}/tts_script.json"))
voice = PiperVoice.load("/home/user/MoneyPrinterTurbo/models/piper/fr_FR-tom-medium.onnx"); m = WhisperModel("small", device="cpu", compute_type="int8")
cfg = SynthesisConfig(length_scale=1.2, noise_scale=0.6, noise_w_scale=0.8)
FX = "aresample=48000,asetrate=48000*0.93,aresample=48000,atempo=1.0752688,lowshelf=f=120:g=5,equalizer=f=300:t=q:w=1.2:g=-2.5,equalizer=f=2800:t=q:w=1.5:g=2.5,highshelf=f=9000:g=-1.5,acompressor=threshold=-24dB:ratio=3.5:attack=6:release=180:makeup=2.5,aecho=0.85:0.55:55|97|143:0.16|0.1|0.06"
for idx, need in [(6, ["avoir mal", "indemne"]), (9, ["yasmina", "khalil"])]:
    for attempt in range(8):
        chunks = list(voice.synthesize(lines[idx - 1], syn_config=cfg)); sr = chunks[0].sample_rate; parts = []
        for k, c in enumerate(chunks):
            parts.append(c.audio_int16_array)
            if k < len(chunks) - 1: parts.append(np.zeros(int(sr * .6), dtype=np.int16))
        with wave.open(f"{S}/raw/s{idx}.wav", "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.concatenate(parts).tobytes())
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{S}/raw/s{idx}.wav", "-af", FX, "-ac", "1", f"{S}/vo/s{idx}.wav"], check=True)
        txt = " ".join(s.text for s in m.transcribe(f"{S}/vo/s{idx}.wav", language="fr")[0]).lower()
        ok = all(n in txt for n in need); print(idx, attempt, ok, txt.strip())
        if ok: break
