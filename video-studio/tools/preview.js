const { chromium } = require('playwright');
(async () => {
  const [dir, out, ...times] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + dir + '/index.html'); await p.evaluate(() => window.ready);
  for (const t of times) { await p.evaluate(t => render(t), +t); await p.screenshot({ path: `${out}/pv_${t}.png` }); }
  console.log('errors', errs); await b.close();
})();
