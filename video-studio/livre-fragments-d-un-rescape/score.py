"""Musique originale de bande-annonce, synthétisée (ré mineur), calée sur le minutage."""
import sys, numpy as np, wave
from scipy.signal import fftconvolve, butter, sosfilt
SR = 44100; T = float(sys.argv[2]); N = int(SR * T); out = sys.argv[1]
L = np.zeros(N); Rr = np.zeros(N); rng = np.random.default_rng(7)
t_all = np.arange(N) / SR
def note(n): return 440 * 2 ** ((n - 69) / 12)
def add(sig, t0, pan=0.0, gain=1.0):
    i0 = int(t0 * SR); i1 = min(N, i0 + len(sig)); s = sig[:i1 - i0] * gain
    L[i0:i1] += s * np.sqrt(.5 * (1 - pan)); Rr[i0:i1] += s * np.sqrt(.5 * (1 + pan))
def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na) ** 2
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e
def pad(midis, dur, a=2.5, r=3.0, bright=6):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for m in midis:
        for det in (-0.0035, 0.0, 0.0041):
            f = note(m) * (1 + det); vib = 1 + .002 * np.sin(2 * np.pi * .23 * t + m)
            for h in range(1, bright + 1): s += np.sin(2 * np.pi * f * h * t * vib + h) / (h ** 1.6)
    return s / (len(midis) * 3) * env(n, a, r) * (0.75 + .25 * np.sin(2 * np.pi * t / 7.3))
def piano(m, dur=4.0, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = note(m); s = np.zeros(n)
    for h, (amp, dec) in enumerate([(1, 1.6), (.5, 1.1), (.28, .8), (.16, .55), (.08, .4), (.05, .3)], 1):
        s += amp * np.sin(2 * np.pi * f * h * (1 + .0004 * h * h) * t) * np.exp(-t / dec)
    s *= (1 - np.exp(-t * 400)); return s * vel * .22
def thump(f0=58):
    n = int(.5 * SR); t = np.arange(n) / SR; f = f0 * (1 - .35 * t / .5)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .09) * 1.1
def boom():
    n = int(4.5 * SR); t = np.arange(n) / SR; f = 75 * np.exp(-t * 1.2) + 28
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.3)
    nz = rng.standard_normal(n) * np.exp(-t / .35); nz = sosfilt(butter(2, [60, 2200], 'bandpass', fs=SR, output='sos'), nz)
    return sub * 1.4 + nz * .9
def riser(dur=3.2):
    n = int(dur * SR); t = np.arange(n) / SR; nz = rng.standard_normal(n); out = np.zeros(n); seg = 2048
    for i in range(0, n, seg):
        p = i / n; lo, hi = 300 + 4000 * p ** 2, 900 + 9000 * p ** 2
        out[i:i + seg] = sosfilt(butter(2, [lo, hi], 'bandpass', fs=SR, output='sos'), nz[i:i + seg])
    tone = np.sin(2 * np.pi * np.cumsum(110 * 2 ** (2.5 * t / dur)) / SR) * .3
    return (out * .6 + tone) * (t / dur) ** 2.2

# --- arrangement ---
TITLE = float(sys.argv[3])                      # instant du titre (impact)
# battements de cœur (intro), qui s'effacent
for k in range(14):
    tt = .3 + k * 1.05; g = 1.0 if tt < 12 else max(0, 1 - (tt - 12) / 3)
    add(thump(), tt, 0, .55 * g); add(thump(50), tt + .28, 0, .32 * g)
# bourdon grave ré + la
add(pad([26, 33, 38], TITLE + 1, a=4, r=1.5, bright=4), 0, 0, .55)
# nappes : Dm Bb F C (puis lumière après le titre)
prog = [[50, 53, 57, 62], [46, 50, 53, 58], [41, 48, 53, 57], [48, 52, 55, 60]]
tt = 9.0; k = 0
while tt < TITLE - 1:
    add(pad(prog[k % 4], 7.6, a=2.2, r=2.2), tt, (-.2, .2)[k % 2], .42 * min(1, (tt - 6) / 8)); tt += 7.2; k += 1
# motif de piano mélancolique (ré mineur)
motif = [74, 72, 69, 67, 69, 65, 64, 62]
tt = 13.0; i = 0
while tt < TITLE - 3.6:
    m = motif[i % len(motif)] - (12 if (i // 8) % 2 else 0); add(piano(m, vel=.9 + .2 * np.sin(i)), tt, .3 * np.sin(i), 1.0)
    if i % 4 == 0: add(piano(m - 12, vel=.6), tt, -.3, 1.0)
    tt += 1.05 if i % 4 != 3 else 1.6; i += 1
# montée + impact sur le titre
add(riser(3.4), TITLE - 3.4, 0, .55); add(boom(), TITLE, 0, 1.0)
# après le titre : nappe lumineuse (Bb - F - C - Dm), plus large
post = [[46, 53, 58, 62, 65], [41, 53, 57, 60, 65], [48, 55, 60, 64, 67], [50, 57, 62, 65, 69]]
tt = TITLE + .2; k = 0
while tt < T:
    add(pad(post[k % 4], 7.0, a=1.2 if k == 0 else 2.0, r=2.5, bright=7), tt, (-.25, .25)[k % 2], .5); tt += 6.4; k += 1
# piano de conclusion, plus lent
tt = TITLE + 4.0; for_notes = [69, 72, 74, 77, 76, 74, 72, 69, 74, 69, 67, 69]
for j, m in enumerate(for_notes):
    if tt > T - 3: break
    add(piano(m, 5.0, .85), tt, .25 * np.sin(j), 1.0); tt += 1.6
# réverbération (deux réponses impulsionnelles décorrélées)
def ir(seed, dur=3.2):
    n = int(dur * SR); g = np.random.default_rng(seed).standard_normal(n) * np.exp(-np.arange(n) / SR / .9); g[:int(.012 * SR)] = 0; return g / np.sqrt((g ** 2).sum())
wetL = fftconvolve(L, ir(1))[:N]; wetR = fftconvolve(Rr, ir(2))[:N]
L2 = L * .75 + wetL * .55; R2 = Rr * .75 + wetR * .55
fade = np.ones(N); fade[-int(3 * SR):] = np.linspace(1, 0, int(3 * SR)) ** 1.5; fade[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
st = np.stack([L2 * fade, R2 * fade], 1); st /= np.abs(st).max() / .9
with wave.open(out, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok', T)
