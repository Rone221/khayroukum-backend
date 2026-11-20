// Aperçu / rendu des pages WebGL (servies en http, WebGL logiciel SwiftShader)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
(async () => {
  const [mode, url, out, ...rest] = process.argv.slice(2);
  const b = await chromium.launch({ args: ARGS }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForFunction(() => window.ready, null, { timeout: 120000 }); await p.evaluate(() => window.ready);
  if (mode === 'preview') { for (const t of rest) { await p.evaluate(t => render(t), +t); await p.screenshot({ path: `${out}/pv_${t}.png` }); } }
  else {
    const [audio, fpsA, fromA, toA] = rest, fps = +fpsA || 30, total = await p.evaluate(() => TL.total);
    const n = Math.ceil(total * fps), from = +(fromA || 0), to = Math.min(n, +(toA || n));
    const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = from; i < to; i++) { await p.evaluate(t => render(t), i / fps); const buf = await p.screenshot({ type: 'jpeg', quality: 94 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`frame ${i}/${to} (${((Date.now() - t0) / 1000).toFixed(0)}s)`); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  console.log('errors', errs.slice(0, 5)); await b.close();
})();
