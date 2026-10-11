/* «Период полураспада» — интерактив, v2 (night atlas). D3 v7. Все данные — window.DATA (data.js). */
(function () {
  'use strict';
  const D = window.DATA;
  const C = {
    amber: '#c9931f', blue: '#8a857a', green: '#f7f2e8', red: '#6f6c65', violet: '#f3dca0',
    accent: '#e2a83a', accent2: '#f0c46a', pale: '#f3dca0', white: '#f7f2e8', ink: '#ece6d9', ink2: '#aaa59a', ink3: '#6f6c65', grey: '#8a857a', grey2: '#b9b3a6',
    rule: 'rgba(236,230,217,.13)', rule2: 'rgba(236,230,217,.3)', grid: 'rgba(236,230,217,.07)', bg: '#06070b'
  };
  const MONO = 'JetBrains Mono, IBM Plex Mono, ui-monospace, Menlo, monospace';
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
  const fmt1 = n => n.toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  const tip = document.getElementById('tip');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showTip(html, ev) { tip.innerHTML = html; tip.classList.add('on'); moveTip(ev); }
  function moveTip(ev) {
    const x = ev.clientX, y = ev.clientY, w = tip.offsetWidth, h = tip.offsetHeight;
    let tx = x + 14, ty = y + 14;
    if (tx + w > window.innerWidth - 10) tx = x - w - 14;
    if (ty + h > window.innerHeight - 10) ty = y - h - 14;
    tip.style.left = tx + 'px'; tip.style.top = ty + 'px';
  }
  function hideTip() { tip.classList.remove('on'); }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const monoText = (sel, size) => sel.attr('font-family', MONO).attr('font-size', size || 10.5);

  /* =============== HERO: the facade (993 windows = 992 600 researchers, 1990) =============== */
  (function hero() {
    const canvas = document.getElementById('skyline');
    const ctx = canvas.getContext('2d');
    const hero = document.getElementById('hero');
    const title = document.getElementById('hero-title'), sub = document.getElementById('hero-sub'), scaleEl = document.getElementById('hero-scale');
    const readout = document.getElementById('hero-counter');
    const elYear = document.getElementById('hc-year'), elNum = document.getElementById('hc-num'), elCap = document.getElementById('hc-cap'), elWin = document.getElementById('hc-win');
    const series = D.rd.filter(r => r.researchers).map(r => [r.year, r.researchers]);
    const TOTAL = Math.round(series[0][1] / 1000);
    const caps = [
      [1990, 'В последний год СССР в науке России работало 1,9 млн человек, из них 992,6 тысячи — исследователи. Каждое горящее окно — тысяча из них.'],
      [1993, 'За три года наука потеряла треть исследователей — почти 350 тысяч человек.'],
      [1995, 'Почти половина окон погасла. «В первой половине девяностых уехала почти половина сотрудников», — вспоминал директор одного из институтов Пущино.'],
      [2000, 'В год, когда Обнинск стал первым официальным наукоградом, исследователей было уже меньше половины от 1990-го.'],
      [2010, 'Федеральную поддержку наукоградов только что урезали в 2,5 раза — с 1,44 до 0,58 млрд рублей в год.'],
      [2020, 'Ряд почти не меняется: с 2010 года — минус 6–8%. Молодые приходят, но их меньше, чем ушедших в девяностые.'],
      [2025, '340 791 исследователь — максимум за пять лет, говорит статистика. На фасаде 1990 года это всего лишь треть окон.'],
    ];
    let buildings = [], windows = [], order = [], W = 0, H = 0, dpr = 1, lit = TOTAL, target = TOTAL;

    function layout() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const skyH = H * (W < 700 ? 0.42 : W <= 1000 ? 0.44 : 0.52);
      // on narrow screens the dek sits directly under the title (measured, not guessed)
      if (W <= 1000) sub.style.top = (title.offsetTop + title.offsetHeight + 22) + 'px'; else sub.style.top = '';
      let cell = Math.sqrt((W * skyH * 0.62) / TOTAL);
      cell = Math.max(7, Math.min(22, cell));
      const gen = (cell) => {
        const r = rng(7);
        const bs = [], ws = [];
        const winW = Math.max(3, Math.round(cell * 0.46)), winH = Math.max(4, Math.round(cell * 0.6));
        const maxFloors = Math.max(6, Math.floor(skyH / cell));
        let x = -cell;
        while (x < W + cell) {
          const cols = 3 + Math.floor(r() * 7);
          const floors = Math.max(5, Math.min(maxFloors, 5 + Math.floor(r() * (maxFloors - 4))));
          const bw = cols * cell + cell, bh = floors * cell + Math.round(cell * 0.8);
          const b = { x, y: H - bh, w: bw, h: bh, cols, floors, cell, shade: 0.75 + r() * 0.35, roof: r(), wins: [] };
          bs.push(b);
          for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
            const w = { b, f, x: b.x + Math.round(cell * 0.5) + c * cell + Math.round((cell - winW) / 2), y: b.y + Math.round(cell * 0.8) + f * cell + Math.round((cell - winH) / 2), w: winW, h: winH, tone: r() };
            ws.push(w); b.wins.push(w);
          }
          x += bw + Math.round(cell * (0.2 + r() * 0.6));
        }
        return [bs, ws];
      };
      let res = gen(cell), guard = 0;
      while (res[1].length < TOTAL && guard++ < 12) { cell *= 0.93; res = gen(cell); }
      buildings = res[0]; windows = res[1];
      while (windows.length > TOTAL) {
        const tallest = buildings.reduce((a, b) => (b.floors > a.floors ? b : a));
        if (tallest.floors <= 4) break;
        tallest.floors -= 1; tallest.y += tallest.cell; tallest.h -= tallest.cell;
        tallest.wins = tallest.wins.filter(w => w.f !== 0);
        tallest.wins.forEach(w => { w.f -= 1; });
        windows = buildings.flatMap(b => b.wins);
      }
      const r2 = rng(99);
      order = windows.map((_, i) => i);
      order.sort((a, b) => (windows[a].y + r2() * H * 0.9) - (windows[b].y + r2() * H * 0.9));
      order.reverse();
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#040509'); g.addColorStop(0.55, '#06070b'); g.addColorStop(1, '#12100f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const hz = ctx.createLinearGradient(0, H * 0.35, 0, H);
      hz.addColorStop(0, 'rgba(226,168,58,0)'); hz.addColorStop(1, 'rgba(226,168,58,0.09)');
      ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H);
      buildings.forEach(b => {
        ctx.fillStyle = `rgba(12,13,19,${b.shade})`;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(b.x, b.y, 2, b.h);
        ctx.fillStyle = 'rgba(236,230,217,.05)'; ctx.fillRect(b.x, b.y, b.w, 1);
        if (b.roof > 0.7) { ctx.fillStyle = 'rgba(236,230,217,.18)'; ctx.fillRect(b.x + b.w / 2 - 0.5, b.y - b.cell * 1.6, 1, b.cell * 1.6); ctx.fillStyle = '#e2a83a'; ctx.fillRect(b.x + b.w / 2 - 1.5, b.y - b.cell * 1.6 - 2, 3, 3); }
      });
      const litSet = new Set(order.slice(0, Math.max(0, Math.round(lit))));
      windows.forEach((w, i) => {
        if (litSet.has(i)) {
          const t = w.tone;
          ctx.fillStyle = t < 0.15 ? '#fbe7bf' : t < 0.62 ? '#e2a83a' : t < 0.86 ? '#c98d2b' : '#f7f2e8';
          ctx.fillRect(w.x, w.y, w.w, w.h);
          ctx.fillStyle = 'rgba(226,168,58,.09)'; ctx.fillRect(w.x - 1, w.y - 1, w.w + 2, w.h + 2);
        } else {
          ctx.fillStyle = '#07080d'; ctx.fillRect(w.x, w.y, w.w, w.h);
        }
      });
      ctx.fillStyle = '#030406'; ctx.fillRect(0, H - 5, W, 5);
    }
    function yearToResearchers(y) {
      const i = series.findIndex(s => s[0] >= y);
      if (i <= 0) return series[0][1];
      const [y0, v0] = series[i - 1], [y1, v1] = series[i];
      return v0 + (v1 - v0) * ((y - y0) / (y1 - y0));
    }
    function onScroll() {
      const rect = hero.getBoundingClientRect();
      const total = hero.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, -rect.top / total));
      const op = p < 0.08 ? 1 : Math.max(0, 1 - (p - 0.08) / 0.08);
      title.style.opacity = op; sub.style.opacity = op; scaleEl.style.opacity = op;
      readout.classList.toggle('on', p > 0.13);
      let y;
      if (p < 0.14) y = 1990;
      else if (p < 0.58) y = 1990 + (p - 0.14) / 0.44 * 10;
      else if (p < 0.9) y = 2000 + (p - 0.58) / 0.32 * 25;
      else y = 2025;
      const val = yearToResearchers(y);
      target = val / 1000;
      elYear.textContent = Math.floor(y);
      elNum.textContent = fmt(val);
      elWin.textContent = `${Math.round(val / 1000)} / ${TOTAL}`;
      let cap = caps[0][1];
      for (const c of caps) if (y >= c[0]) cap = c[1];
      if (elCap.textContent !== cap) elCap.textContent = cap;
      tick();
    }
    let raf = null;
    function tick() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const d = target - lit;
        if (Math.abs(d) < 0.5) { lit = target; draw(); return; }
        lit += d * (prefersReduced ? 1 : 0.18);
        draw(); tick();
      });
    }
    window.addEventListener('resize', layout);
    window.addEventListener('scroll', onScroll, { passive: true });
    layout(); onScroll();
  })();

  /* =============== NAV + reveal =============== */
  (function nav() {
    const nav = document.getElementById('nav');
    const links = [...nav.querySelectorAll('.links a')];
    const secs = links.map(a => document.querySelector(a.getAttribute('href')));
    function upd() {
      nav.classList.toggle('on', window.scrollY > window.innerHeight * 4.2);
      let cur = -1;
      secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = i; });
      links.forEach((a, i) => a.classList.toggle('on', i === cur));
    }
    window.addEventListener('scroll', upd, { passive: true }); upd();
    const rv = document.querySelectorAll('figure.fig, .strip, .proto, .plate, .tl, .pull, .chead, .intro .lead');
    rv.forEach(el => el.classList.add('rv'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(el => io.observe(el));
    // anything already above the viewport (deep links, fast scrolls) is shown at once
    const sweep = () => rv.forEach(el => { if (!el.classList.contains('in') && el.getBoundingClientRect().bottom < 0) el.classList.add('in'); });
    window.addEventListener('scroll', sweep, { passive: true }); window.addEventListener('hashchange', () => setTimeout(sweep, 50)); setTimeout(sweep, 100);
  })();

  document.querySelectorAll('.tbl-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = document.getElementById(btn.dataset.tbl);
      t.classList.toggle('on');
      btn.textContent = t.classList.contains('on') ? 'Скрыть таблицу' : 'Показать таблицу';
    });
  });

  /* =============== MAP =============== */
  (function map() {
    const M = D.map;
    const types = {
      official: { label: 'Наукоград РФ · статус действует', color: C.accent },
      lost: { label: 'Статус утрачен', color: C.grey2 },
      zato_science: { label: 'Закрытый город (ЗАТО)', color: C.white },
      akademgorodok: { label: 'Академгородок', color: C.pale },
      science_town: { label: 'Город науки без статуса', color: C.ink3 },
    };
    const towns = M.towns.map(t => {
      let k = t.type;
      if (t.type === 'official_naukograd') k = /УТРАЧЕН/i.test(t.note) ? 'lost' : 'official';
      return Object.assign({ k }, t);
    });
    const chipsEl = document.getElementById('map-chips');
    const active = new Set(Object.keys(types));
    Object.entries(types).forEach(([k, v]) => {
      const b = document.createElement('button'); b.className = 'tg on'; b.innerHTML = `<i style="background:${v.color}"></i>${v.label} <span class="cnt">${towns.filter(t => t.k === k).length}</span>`;
      b.addEventListener('click', () => { active.has(k) ? active.delete(k) : active.add(k); b.classList.toggle('on', active.has(k)); update(); });
      chipsEl.appendChild(b);
    });
    const W = M.W, H = M.H;
    const svg = d3.select('#map').append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img').attr('aria-label', 'Карта городов науки России');
    const defs = svg.append('defs');
    defs.append('clipPath').attr('id', 'inset-clip').append('circle').attr('cx', 0).attr('cy', 0).attr('r', 1);
    const base = svg.append('g');
    base.append('path').attr('class', 'grat').attr('d', M.gratPath);
    base.append('path').attr('class', 'land').attr('d', M.othersPath);
    base.append('path').attr('class', 'ru').attr('d', M.ruPath);
    // frame ticks (coordinate-system feel)
    const tk = base.append('g').attr('stroke', C.rule2);
    for (let x = 60; x < W; x += 60) tk.append('line').attr('x1', x).attr('x2', x).attr('y1', H - 6).attr('y2', H);
    for (let y = 60; y < H; y += 60) tk.append('line').attr('x1', 0).attr('x2', 6).attr('y1', y).attr('y2', y);
    const refG = base.append('g').attr('class', 'ref');
    M.refPts.forEach(p => {
      refG.append('circle').attr('cx', p.x).attr('cy', p.y).attr('r', 1.6);
      const left = p.name === 'Санкт-Петербург' || p.name === 'Москва' || p.name === 'Новосибирск';
      refG.append('text').attr('x', p.x + (left ? -5 : 5)).attr('y', p.y + (p.name === 'Москва' || p.name === 'Новосибирск' ? 12 : 3)).attr('text-anchor', left ? 'end' : 'start').text(p.name.toUpperCase());
    });
    const mainG = svg.append('g');
    const mos0 = M.refPts.find(p => p.name === 'Москва');
    const mos = { x: mos0.x - 1.5, y: mos0.y + 2 };
    const insetR = 180, scale = 11, cx = W - 200, cy = 205;
    const ig = svg.append('g').attr('transform', `translate(${cx},${cy})`);
    ig.append('circle').attr('r', insetR + 3).attr('fill', '#050609').attr('stroke', C.rule2).attr('stroke-width', 1);
    const inner = ig.append('g').attr('clip-path', 'url(#inset-clip)');
    svg.select('#inset-clip circle').attr('r', insetR);
    const tr = `scale(${scale}) translate(${-mos.x},${-mos.y})`;
    inner.append('path').attr('class', 'ru').attr('d', M.ruPath).attr('transform', tr).attr('stroke-width', 0.8 / scale);
    inner.append('circle').attr('cx', (mos0.x - mos.x) * scale).attr('cy', (mos0.y - mos.y) * scale).attr('r', 2.5).attr('fill', C.ink2);
    monoText(inner.append('text').attr('x', (mos0.x - mos.x) * scale - 5).attr('y', (mos0.y - mos.y) * scale + 12).attr('text-anchor', 'end').text('МОСКВА').attr('fill', C.ink2), 9.5);
    monoText(ig.append('text').attr('y', -insetR - 10).attr('text-anchor', 'middle').attr('fill', C.ink3).text('[ ПОДМОСКОВЬЕ · ×11 ]'), 10);
    // crosshair inside the lens
    ig.append('line').attr('x1', -insetR).attr('x2', insetR).attr('y1', 0).attr('y2', 0).attr('stroke', C.rule).attr('stroke-dasharray', '2 4');
    ig.append('line').attr('y1', -insetR).attr('y2', insetR).attr('x1', 0).attr('x2', 0).attr('stroke', C.rule).attr('stroke-dasharray', '2 4');
    base.append('circle').attr('cx', mos.x).attr('cy', mos.y).attr('r', insetR / scale).attr('fill', 'none').attr('stroke', C.ink3).attr('stroke-width', .8).attr('stroke-dasharray', '2 2');
    base.append('line').attr('x1', mos.x + insetR / scale).attr('y1', mos.y).attr('x2', cx - insetR - 3).attr('y2', cy).attr('stroke', C.ink3).attr('stroke-width', .6).attr('stroke-dasharray', '2 3').attr('opacity', .7);
    const insetTowns = towns.filter(t => Math.hypot(t.x - mos.x, t.y - mos.y) * scale < insetR - 6);
    const insetG = inner.append('g');
    const OFF = { 'Долгопрудный': [-9, -2, 'end'], 'Королёв': [6, -8, 'start'], 'Реутов': [0, 15, 'middle'], 'Фрязино': [9, 3, 'start'], 'Черноголовка': [9, 4, 'start'], 'Жуковский': [9, 4, 'start'], 'Троицк': [-9, 4, 'end'], 'Обнинск': [-9, 4, 'end'], 'Протвино': [-9, -2, 'end'], 'Серпухов (городской округ)': [9, 8, 'start'], 'Пущино': [-9, 11, 'end'], 'Дубна': [0, 16, 'middle'] };

    function drawTowns(g, list, sc) {
      const sel = g.selectAll('g.town').data(list, d => d.name);
      const ent = sel.enter().append('g').attr('class', 'town').attr('transform', d => `translate(${(d.x - (sc ? mos.x : 0)) * (sc || 1)},${(d.y - (sc ? mos.y : 0)) * (sc || 1)})`);
      ent.append('circle').attr('class', 'hit').attr('r', 9).attr('fill', 'transparent');
      ent.append('circle').attr('class', 'halo').attr('r', d => d.k === 'official' ? 7 : 5).attr('stroke', d => types[d.k].color);
      // official: filled square-ish marker (a lit window); others: small dots
      ent.filter(d => d.k === 'official').append('rect').attr('x', -3).attr('y', -3).attr('width', 6).attr('height', 6).attr('fill', C.accent);
      ent.filter(d => d.k !== 'official').append('circle').attr('class', 'dot').attr('r', d => d.k === 'lost' ? 3 : 2.2).attr('fill', d => d.k === 'lost' ? C.bg : types[d.k].color).attr('stroke', d => types[d.k].color).attr('stroke-width', d => d.k === 'lost' ? 1.5 : 0);
      ent.filter(d => d.k === 'official' || d.k === 'lost').append('text').attr('class', 'lbl')
        .attr('x', d => sc && OFF[d.name] ? OFF[d.name][0] : 8).attr('y', d => sc && OFF[d.name] ? OFF[d.name][1] : 4).attr('text-anchor', d => sc && OFF[d.name] ? OFF[d.name][2] : 'start')
        .text(d => d.name.replace(' (городской округ)', ''));
      ent.on('mousemove', (ev, d) => {
        const tn = types[d.k].label;
        showTip(`<div class="t-head">${d.name}</div><div class="t-note">${d.region} · ${d.lat.toFixed(2)}° N, ${d.lon.toFixed(2)}° E</div><div class="t-row"><span style="color:${types[d.k].color}">${tn}</span></div><div class="t-note">${d.spec}</div>${d.note ? `<div class="t-note" style="margin-top:6px;font-size:11.5px">${d.note.replace(/·/g, '<br>')}</div>` : ''}`, ev);
      }).on('mouseleave', hideTip);
      return ent;
    }
    const mainTowns = drawTowns(mainG, towns, null);
    mainTowns.filter(d => insetTowns.includes(d)).select('text').remove();
    drawTowns(insetG, insetTowns, scale);
    function update() { svg.selectAll('g.town').classed('dim', d => !active.has(d.k)); }
  })();

  /* =============== GANTT =============== */
  (function gantt() {
    const kinds = { decree: ['Указ президента, до 25 лет', C.accent], gov5: ['Постановление правительства, обычно 5 лет', C.grey], gov15: ['Статус на 15 лет (закон 2015 г.)', C.pale] };
    const leg = document.getElementById('gantt-legend');
    Object.values(kinds).forEach(([l, c]) => { const s = document.createElement('span'); s.innerHTML = `<i style="background:${c}"></i>${l}`; leg.appendChild(s); });
    const s2 = document.createElement('span'); s2.innerHTML = `<i style="background:${C.white}"></i>Статус отменён / не продлён (×)`; leg.appendChild(s2);
    const s3 = document.createElement('span'); s3.innerHTML = `<i style="background:rgba(226,168,58,.14);border:1px solid ${C.accent}"></i>Окно риска: срок истекает, продления нет`; leg.appendChild(s3);
    const rows = D.status;
    const el = document.getElementById('gantt');
    const m = { t: 30, r: 20, b: 26, l: 124 };
    const rowH = 28;
    function render() {
      el.innerHTML = '';
      const W = Math.max(640, el.clientWidth), H = m.t + m.b + rows.length * rowH;
      const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      const x = d3.scaleTime().domain([new Date(1997, 0, 1), new Date(2042, 0, 1)]).range([m.l, W - m.r]);
      const today = new Date(2026, 9, 11);
      const years = d3.range(2000, 2041, 5);
      svg.append('g').attr('class', 'grid').selectAll('line').data(years).join('line').attr('x1', d => x(new Date(d, 0, 1))).attr('x2', d => x(new Date(d, 0, 1))).attr('y1', m.t - 6).attr('y2', H - m.b);
      svg.append('g').attr('class', 'axis').selectAll('text').data(years).join('text').attr('x', d => x(new Date(d, 0, 1))).attr('y', m.t - 12).attr('text-anchor', 'middle').text(d => d);
      svg.append('rect').attr('class', 'risk-band').attr('x', x(new Date(2027, 6, 1))).attr('width', x(new Date(2028, 6, 1)) - x(new Date(2027, 6, 1))).attr('y', m.t - 6).attr('height', H - m.t - m.b + 6);
      monoText(svg.append('text').attr('x', x(new Date(2028, 0, 1))).attr('y', H - 8).attr('text-anchor', 'middle').attr('fill', C.accent2).text('31.12.2027'), 10);
      rows.forEach((r, i) => {
        const y = m.t + i * rowH + rowH / 2;
        const g = svg.append('g');
        g.append('text').attr('class', 'row-label').attr('x', m.l - 12).attr('y', y + 4).attr('text-anchor', 'end').text(r.city).style('fill', r.lost ? C.ink3 : (r.risk ? C.accent2 : C.ink));
        g.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y).attr('stroke', C.grid);
        r.spans.forEach(([a, b, k]) => {
          const xa = x(new Date(a)), xb = x(new Date(b));
          const future = new Date(b) > today;
          const bar = g.append('rect').attr('x', xa).attr('y', y - 6).attr('width', Math.max(2, xb - xa)).attr('height', 12).attr('fill', kinds[k][1]);
          if (future) {
            const xs = Math.max(xa, x(today));
            g.append('rect').attr('x', xs).attr('y', y - 6).attr('width', Math.max(0, xb - xs)).attr('height', 12).attr('fill', C.bg).attr('opacity', .5).attr('pointer-events', 'none');
          }
          bar.on('mousemove', ev => showTip(`<div class="t-head">${r.city}</div><div class="t-row"><span>${kinds[k][0]}</span></div><div class="t-row"><span>${a.split('-').reverse().join('.')} — ${b.split('-').reverse().join('.')}</span></div>${r.events.length ? '<div class="t-note">' + r.events.map(e => `${e[0].split('-').reverse().join('.')}: ${e[1]}`).join('<br>') + '</div>' : ''}`, ev)).on('mouseleave', hideTip);
        });
        if (r.lost) {
          const xl = x(new Date(r.lost));
          g.append('line').attr('x1', xl - 5).attr('x2', xl + 5).attr('y1', y - 6).attr('y2', y + 6).attr('stroke', C.white).attr('stroke-width', 1.6);
          g.append('line').attr('x1', xl - 5).attr('x2', xl + 5).attr('y1', y + 6).attr('y2', y - 6).attr('stroke', C.white).attr('stroke-width', 1.6);
          g.append('line').attr('x1', xl).attr('x2', W - m.r).attr('y1', y).attr('y2', y).attr('stroke', C.ink3).attr('stroke-dasharray', '2 4').attr('opacity', .7);
        }
        if (r.risk) {
          const xe = x(new Date(r.spans[0][1]));
          monoText(g.append('text').attr('x', xe + 10).attr('y', y + 4).attr('fill', C.accent2).text('продления нет →'), 10.5);
        }
        if (r.key === 'troitsk') {
          const xm = x(new Date(2012, 6, 1));
          monoText(g.append('text').attr('x', xm).attr('y', y - 9).attr('fill', C.ink3).attr('text-anchor', 'middle').text('в Москве'), 9.5);
        }
      });
      svg.append('line').attr('class', 'today').attr('x1', x(today)).attr('x2', x(today)).attr('y1', m.t - 6).attr('y2', H - m.b);
      monoText(svg.append('text').attr('x', x(today) - 6).attr('y', H - 8).attr('text-anchor', 'end').attr('fill', C.ink2).text('СЕГОДНЯ ▸'), 10);
    }
    render(); new ResizeObserver(render).observe(el);
  })();

  /* =============== RD LINE =============== */
  (function rdline() {
    const el = document.getElementById('rdline');
    const data = D.rd;
    function render() {
      el.innerHTML = '';
      const W = Math.max(560, el.clientWidth), H = Math.min(460, Math.max(300, W * 0.46));
      const m = { t: 22, r: 24, b: 30, l: 62 };
      const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      const x = d3.scaleLinear().domain([1990, 2025]).range([m.l, W - m.r]);
      const y = d3.scaleLinear().domain([0, 2000000]).range([H - m.b, m.t]);
      svg.append('g').attr('class', 'grid').selectAll('line').data(y.ticks(4)).join('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', d => y(d)).attr('y2', d => y(d));
      svg.append('g').attr('class', 'axis').selectAll('text').data(y.ticks(4)).join('text').attr('x', m.l - 10).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(d => d === 0 ? '0' : (d / 1e6).toLocaleString('ru-RU') + ' млн');
      svg.append('g').attr('class', 'axis').selectAll('text').data(x.ticks(7)).join('text').attr('x', d => x(d)).attr('y', H - m.b + 18).attr('text-anchor', 'middle').text(d => d);
      svg.append('g').attr('class', 'axis').selectAll('line').data(x.ticks(35)).join('line').attr('x1', d => x(d)).attr('x2', d => x(d)).attr('y1', H - m.b).attr('y2', H - m.b + 4);
      const line = k => d3.line().x(d => x(d.year)).y(d => y(d[k]));
      const area = d3.area().x(d => x(d.year)).y0(H - m.b).y1(d => y(d.researchers));
      svg.append('path').datum(data).attr('d', area).attr('fill', C.accent).attr('opacity', .08);
      svg.append('path').datum(data).attr('d', line('personnel')).attr('fill', 'none').attr('stroke', C.grey2).attr('stroke-width', 1.4);
      svg.append('path').datum(data).attr('d', line('researchers')).attr('fill', 'none').attr('stroke', C.accent).attr('stroke-width', 2);
      monoText(svg.append('text').attr('x', x(1990) + 8).attr('y', y(1943400) - 7).attr('fill', C.grey2).attr('stroke', C.bg).attr('stroke-width', 4).attr('paint-order', 'stroke').text('1 943 400'), 11);
      monoText(svg.append('text').attr('x', x(1990) + 8).attr('y', y(992600) + 16).attr('fill', C.accent).text('992 600'), 11);
      monoText(svg.append('text').attr('x', x(2025) - 4).attr('y', y(673639) - 8).attr('text-anchor', 'end').attr('fill', C.grey2).text('673 639'), 11);
      monoText(svg.append('text').attr('x', x(2025) - 4).attr('y', y(340791) - 8).attr('text-anchor', 'end').attr('fill', C.accent).text('340 791 (−66%)'), 11);
      const ag = svg.append('g');
      const ann = [[1991, 'распад СССР'], [1998, 'дефолт; −58% к 1990'], [2000, 'Обнинск — первый наукоград'], [2008, 'пик поддержки наукоградов'], [2013, 'реформа РАН']];
      ann.forEach(([yr, txt], i) => {
        const r = data.find(d => d.year === yr);
        const yy = m.t + 14 + (i % 2) * 14;
        ag.append('line').attr('x1', x(yr)).attr('x2', x(yr)).attr('y1', y(r.researchers) - 4).attr('y2', yy + 4).attr('stroke', C.rule2);
        ag.append('rect').attr('x', x(yr) - 2).attr('y', y(r.researchers) - 2).attr('width', 4).attr('height', 4).attr('fill', C.ink);
        monoText(ag.append('text').attr('x', x(yr) + 5).attr('y', yy).attr('fill', C.ink2).attr('stroke', C.bg).attr('stroke-width', 4).attr('paint-order', 'stroke').text(`[ ${yr} ] ${txt}`), 10);
      });
      const cross = svg.append('g').style('display', 'none');
      cross.append('line').attr('y1', m.t).attr('y2', H - m.b).attr('stroke', C.ink3);
      const d1 = cross.append('circle').attr('r', 3.5).attr('fill', C.grey2).attr('stroke', C.bg).attr('stroke-width', 2);
      const d2 = cross.append('circle').attr('r', 3.5).attr('fill', C.accent).attr('stroke', C.bg).attr('stroke-width', 2);
      svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).attr('fill', 'transparent')
        .on('mousemove', ev => {
          const [mx] = d3.pointer(ev); const yr = Math.round(x.invert(mx)); const r = data.find(d => d.year === yr); if (!r) return;
          cross.style('display', null).select('line').attr('x1', x(yr)).attr('x2', x(yr));
          d1.attr('cx', x(yr)).attr('cy', y(r.personnel)); d2.attr('cx', x(yr)).attr('cy', y(r.researchers));
          const base = data[0];
          showTip(`<div class="t-head">${yr}</div><div class="t-row"><span style="color:#b9b3a6">Персонал</span><b>${fmt(r.personnel)}</b></div><div class="t-row"><span style="color:${C.accent}">Исследователи</span><b>${fmt(r.researchers)}</b></div><div class="t-row"><span>к 1990 году</span><span>${Math.round((r.researchers / base.researchers - 1) * 100)}%</span></div>${r.gerd ? `<div class="t-row"><span>Затраты на науку, % ВВП</span><span>${r.gerd}</span></div>` : ''}`, ev);
        }).on('mouseleave', () => { cross.style('display', 'none'); hideTip(); });
    }
    render(); new ResizeObserver(render).observe(el);
    const t = document.getElementById('rd-tbl');
    t.innerHTML = '<table><tr><th>Год</th><th>Персонал ИР</th><th>Исследователи</th><th>Организации</th><th>Затраты, % ВВП</th></tr>' + data.map(r => `<tr><td>${r.year}</td><td>${fmt(r.personnel)}</td><td>${fmt(r.researchers)}</td><td>${fmt(r.orgs)}</td><td>${r.gerd ?? '—'}</td></tr>`).join('') + '</table>';
  })();

  /* =============== AGE (scrolly) =============== */
  (function age() {
    const el = document.getElementById('agechart');
    const data = D.age.filter(a => a.basis === 'percent' || a.basis === 'persons');
    const labels = D.age_labels;
    // ordinal ramp: one hue (cream → deep), light = young; the 40–49 cohort carries the accent
    const ramp = ['#ece6d9', '#b9b3a6', '#8a857a', '#5e5b54', '#3f3d39', '#282725'];
    const leg = document.getElementById('age-legend');
    labels.forEach((l, i) => { const s = document.createElement('span'); s.innerHTML = `<i style="background:${i === 2 ? C.accent : ramp[i]}"></i>${l}${i === 2 ? ' лет' : ''}`; leg.appendChild(s); });
    let focusYear = 1994;
    const XL = (W) => d3.scaleLinear().domain([1993.5, 2025.5]).range([36, W - 10]);
    function render() {
      el.innerHTML = '';
      const W = Math.max(420, el.clientWidth), H = Math.min(440, Math.max(300, W * 0.58));
      const m = { t: 12, r: 10, b: 26, l: 36 };
      const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      const xl = XL(W);
      const bw = (xl(1) - xl(0)) * 0.8;
      const x = yr => xl(yr) - bw / 2;
      const y = d3.scaleLinear().domain([0, 100]).range([H - m.b, m.t]);
      svg.append('g').attr('class', 'axis').selectAll('text').data([0, 25, 50, 75, 100]).join('text').attr('x', m.l - 8).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(d => d);
      svg.append('g').attr('class', 'grid').selectAll('line').data([25, 50, 75]).join('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', d => y(d)).attr('y2', d => y(d));
      svg.append('g').attr('class', 'axis').selectAll('text').data(W < 560 ? [1994, 2000, 2010, 2020, 2025] : [1994, 2000, 2005, 2010, 2015, 2020, 2025]).join('text').attr('x', d => xl(d)).attr('y', H - m.b + 16).attr('text-anchor', 'middle').text(d => d);
      monoText(svg.append('text').attr('class', 'focus-year').attr('x', xl(focusYear)).attr('y', H - m.b + 16).attr('text-anchor', 'middle').attr('fill', C.accent).attr('font-weight', 700).text(focusYear), 11);
      data.forEach(d => {
        let acc = 0;
        const g = svg.append('g').attr('class', 'col').attr('data-year', d.year);
        d.shares.forEach((s, i) => {
          const y1 = y(acc), y0 = y(acc + s);
          g.append('rect').attr('x', x(d.year)).attr('y', y0 + 1).attr('width', bw).attr('height', Math.max(0, y1 - y0 - 2))
            .attr('fill', i === 2 ? C.accent : ramp[i]).attr('data-i', i)
            .on('mousemove', ev => showTip(`<div class="t-head">${d.year}</div>` + d.shares.map((v, j) => `<div class="t-row"><span style="color:${j === 2 ? C.accent : C.ink2}">${labels[j]}</span><span>${v.toFixed(1)}%${d.persons ? ' · ' + fmt(d.persons[j]) : ''}</span></div>`).join('') + (d.total ? `<div class="t-note">всего ${fmt(d.total)} исследователей</div>` : ''), ev))
            .on('mouseleave', hideTip);
          acc += s;
        });
      });
      svg.append('rect').attr('class', 'focus-box').attr('x', m.l + 4).attr('y', m.t + 2).attr('width', 210).attr('height', 22).attr('fill', C.bg).attr('opacity', .85);
      monoText(svg.append('text').attr('class', 'focus-lbl').attr('x', m.l + 12).attr('y', m.t + 17).attr('fill', C.accent).attr('font-weight', 500), 11.5);
      applyFocus();
    }
    function applyFocus() {
      const fd = data.find(d => d.year === focusYear);
      d3.select(el).select('.focus-year').text(focusYear).attr('x', XL(Math.max(420, el.clientWidth))(focusYear));
      if (fd) d3.select(el).select('.focus-lbl').text(`[ ${focusYear} ] 40–49 лет — ${fd.shares[2].toFixed(1).replace('.', ',')}%`);
      d3.select(el).selectAll('g.col').each(function () {
        const yr = +this.dataset.year; d3.select(this).attr('opacity', yr === focusYear ? 1 : 0.5);
      });
    }
    render(); new ResizeObserver(render).observe(el);
    const steps = [...document.querySelectorAll('#age-scrolly .st')];
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { steps.forEach(s => s.classList.remove('on')); e.target.classList.add('on'); focusYear = +e.target.dataset.year; applyFocus(); } });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
    steps[0].classList.add('on');
  })();

  /* =============== FUNDING =============== */
  (function funding() {
    const el = document.getElementById('funding');
    const data = D.funding;
    function render() {
      el.innerHTML = '';
      const W = Math.max(560, el.clientWidth), H = Math.min(420, Math.max(280, W * 0.42));
      const m = { t: 34, r: 16, b: 30, l: 54 };
      const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      const x = d3.scaleBand().domain(data.map(d => d.year)).range([m.l, W - m.r]).paddingInner(0.3);
      const y = d3.scaleLinear().domain([0, 1900]).range([H - m.b, m.t]);
      svg.append('g').attr('class', 'grid').selectAll('line').data([400, 800, 1200, 1600]).join('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', d => y(d)).attr('y2', d => y(d));
      svg.append('g').attr('class', 'axis').selectAll('text').data([0, 400, 800, 1200, 1600]).join('text').attr('x', m.l - 8).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(d => d);
      svg.append('g').attr('class', 'axis').selectAll('text').data(data.map(d => d.year).filter(yr => W < 640 ? yr % 4 === 0 : yr % 2 === 0)).join('text').attr('x', d => x(d) + x.bandwidth() / 2).attr('y', H - m.b + 16).attr('text-anchor', 'middle').text(d => d);
      data.forEach(d => {
        const g = svg.append('g');
        g.append('rect').attr('x', x(d.year)).attr('y', y(d.plan)).attr('width', x.bandwidth()).attr('height', y(0) - y(d.plan)).attr('fill', 'none').attr('stroke', C.ink3).attr('stroke-width', 1).attr('stroke-dasharray', d.year >= 2025 ? '3 2' : null);
        if (d.exec != null) g.append('rect').attr('x', x(d.year) + 1).attr('y', y(d.exec)).attr('width', x.bandwidth() - 2).attr('height', y(0) - y(d.exec)).attr('fill', C.accent);
        g.append('rect').attr('x', x(d.year) - 2).attr('y', m.t).attr('width', x.bandwidth() + 4).attr('height', H - m.t - m.b).attr('fill', 'transparent')
          .on('mousemove', ev => {
            const cities = d.cities ? Object.entries(d.cities).sort((a, b) => b[1] - a[1]) : null;
            const regs = d.regions ? Object.entries(d.regions) : null;
            showTip(`<div class="t-head">${d.year}</div><div class="t-row"><span>План по закону</span><b>${fmt1(d.plan)} млн ₽</b></div><div class="t-row"><span>Исполнено</span><b>${d.exec != null ? fmt1(d.exec) + ' млн ₽' : 'нет данных'}</b></div>${cities ? `<div class="t-note">${cities.length} получателей: ${cities.slice(0, 4).map(c => c[0] + ' ' + fmt1(c[1])).join(', ')}${cities.length > 4 ? '…' : ''}</div>` : ''}${regs ? `<div class="t-note">по регионам: ${regs.map(c => c[0] + ' ' + fmt1(c[1])).join(', ')}</div>` : ''}`, ev);
          }).on('mouseleave', hideTip);
      });
      svg.append('rect').attr('x', x(2010)).attr('y', y(1806.4)).attr('width', x.bandwidth()).attr('height', y(576.7) - y(1806.4)).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-dasharray', '3 3').attr('pointer-events', 'none');
      const ann = [[2008, '[ пик ] 1 503 млн', y(1503.2) - 8, 'middle', C.accent2], [2010, '[ обещали ] 1 806', y(1806.4) - 8, 'middle', C.ink], [2010, '[ дали ] 577', y(1150), 'middle', C.ink], [2024, '[ исполнено ] 262', y(309.1) - 8, 'end', C.ink]];
      ann.forEach(([yr, t, py, anchor, col]) => {
        const px = anchor === 'start' ? x(yr) + x.bandwidth() + 6 : x(yr) + x.bandwidth() / 2;
        monoText(svg.append('text').attr('x', px + (anchor === 'end' ? 6 : 0)).attr('y', py).attr('text-anchor', anchor).attr('fill', col).attr('stroke', C.bg).attr('stroke-width', 5).attr('paint-order', 'stroke').text(t), 10.5);
      });
    }
    render(); new ResizeObserver(render).observe(el);
    const t = document.getElementById('fund-tbl');
    t.innerHTML = '<table><tr><th>Год</th><th>План, млн ₽</th><th>Исполнено, млн ₽</th><th>Получателей</th></tr>' + data.map(r => `<tr><td>${r.year}</td><td>${fmt1(r.plan)}</td><td>${r.exec != null ? fmt1(r.exec) : '—'}</td><td>${r.cities ? Object.keys(r.cities).length : (r.regions ? Object.keys(r.regions).length + ' регионов' : '—')}</td></tr>`).join('') + '</table>';
  })();

  /* =============== HEATMAP =============== */
  (function heat() {
    const el = document.getElementById('heat');
    const data = D.funding.filter(d => d.cities);
    const cities = ['Королёв', 'Бийск', 'Обнинск', 'Мичуринск', 'Жуковский', 'Реутов', 'Дубна', 'Фрязино', 'Петергоф', 'Троицк', 'Протвино', 'Пущино', 'Черноголовка', 'Кольцово'];
    const years = data.map(d => d.year);
    const max = d3.max(data, d => d3.max(Object.values(d.cities)));
    const color = d3.scaleSequential(t => { const u = Math.pow(t, 0.5); return u < 0.72 ? d3.interpolateLab('#141410', '#e2a83a')(u / 0.72) : d3.interpolateLab('#e2a83a', '#fbf1d8')((u - 0.72) / 0.28); }).domain([0, max]);
    function render() {
      el.innerHTML = '';
      const W = Math.max(560, el.clientWidth), m = { t: 26, r: 10, b: 10, l: 116 };
      const cw = (W - m.l - m.r) / years.length, ch = Math.max(16, Math.min(26, cw * 1.1)), H = m.t + m.b + cities.length * ch;
      const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      svg.selectAll('text.yr').data(years).join('text').attr('class', 'yr').attr('x', (d, i) => m.l + i * cw + cw / 2).attr('y', m.t - 9).attr('text-anchor', 'middle').text(d => W < 700 ? String(d).slice(2) : d);
      cities.forEach((c, ri) => {
        svg.append('text').attr('class', 'rl').attr('x', m.l - 10).attr('y', m.t + ri * ch + ch / 2 + 4).attr('text-anchor', 'end').text(c);
        data.forEach((d, ci) => {
          const v = d.cities[c];
          const g = svg.append('g');
          g.append('rect').attr('x', m.l + ci * cw + 1).attr('y', m.t + ri * ch + 1).attr('width', cw - 2).attr('height', ch - 2)
            .attr('fill', v != null ? color(v) : '#0a0c12').attr('stroke', v == null ? C.rule : 'none');
          if (v == null) g.append('text').attr('x', m.l + ci * cw + cw / 2).attr('y', m.t + ri * ch + ch / 2 + 3).attr('text-anchor', 'middle').attr('fill', C.ink3).attr('font-size', 9).text('·');
          else if (cw > 40) g.append('text').attr('x', m.l + ci * cw + cw / 2).attr('y', m.t + ri * ch + ch / 2 + 3.5).attr('text-anchor', 'middle').attr('fill', d3.lab(color(v)).l > 58 ? '#06070b' : C.ink).attr('font-size', 10).text(Math.round(v));
          g.on('mousemove', ev => showTip(`<div class="t-head">${c}, ${d.year}</div><div class="t-row"><span>План</span><b>${v != null ? fmt1(v) + ' млн ₽' : 'нет в бюджете'}</b></div>${v != null ? `<div class="t-note">${Math.round(v / d.plan * 100)}% всех денег наукоградов в этом году</div>` : ''}`, ev)).on('mouseleave', hideTip);
        });
      });
    }
    render(); new ResizeObserver(render).observe(el);
  })();

  /* =============== POPULATION contact sheet =============== */
  (function pop() {
    const grid = document.getElementById('popgrid');
    const chips = document.getElementById('pop-chips');
    const list = D.population.filter(p => p.key !== 'yubileyny');
    let sort = 'growth';
    [['growth', 'по росту с 1989'], ['decline', 'по убыли'], ['size', 'по размеру'], ['name', 'по алфавиту']].forEach(([k, l], i) => {
      const b = document.createElement('button'); b.className = 'tg' + (i === 0 ? ' on' : ''); b.textContent = l;
      b.addEventListener('click', () => { sort = k; [...chips.children].forEach(c => c.classList.remove('on')); b.classList.add('on'); render(); });
      chips.appendChild(b);
    });
    function growth(p) { const a = p.points.find(x => x.year === 1989), b = p.points[p.points.length - 1]; return a ? b.pop / a.pop - 1 : null; }
    function render() {
      grid.innerHTML = '';
      const arr = list.slice();
      if (sort === 'growth') arr.sort((a, b) => (growth(b) ?? -9) - (growth(a) ?? -9));
      if (sort === 'decline') arr.sort((a, b) => (growth(a) ?? 9) - (growth(b) ?? 9));
      if (sort === 'size') arr.sort((a, b) => b.points[b.points.length - 1].pop - a.points[a.points.length - 1].pop);
      if (sort === 'name') arr.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      arr.forEach((p, idx) => {
        const g = growth(p); const last = p.points[p.points.length - 1];
        const card = document.createElement('div'); card.className = 'sm';
        const col = g == null ? C.ink3 : g > 0.05 ? C.accent2 : g < -0.05 ? C.grey2 : C.ink2;
        card.innerHTML = `<div class="t"><span class="nm">${p.name}</span><span class="d" style="color:${col}">${g == null ? '' : (g > 0 ? '+' : '') + Math.round(g * 100) + '%'}</span></div><div class="r">${String(idx + 1).padStart(2, '0')} · ${p.region} · ${fmt(last.pop)} (${last.year})</div>`;
        const W = 200, H = 84, m = { t: 8, r: 8, b: 14, l: 4 };
        const svg = d3.select(card).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'none');
        const x = d3.scaleLinear().domain([1959, 2025]).range([m.l, W - m.r]);
        const maxp = d3.max(p.points, d => d.pop);
        const y = d3.scaleLinear().domain([0, maxp * 1.1]).range([H - m.b, m.t]);
        const ref = p.points.find(d => d.year === 1989);
        if (ref) svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(ref.pop)).attr('y2', y(ref.pop)).attr('stroke', C.rule2).attr('stroke-dasharray', '2 3').attr('vector-effect', 'non-scaling-stroke');
        svg.append('path').datum(p.points).attr('d', d3.line().x(d => x(d.year)).y(d => y(d.pop))).attr('fill', 'none').attr('stroke', C.accent).attr('stroke-width', 1.5).attr('vector-effect', 'non-scaling-stroke');
        svg.selectAll('circle').data(p.points).join('circle').attr('cx', d => x(d.year)).attr('cy', d => y(d.pop)).attr('r', d => d.census ? 2.4 : 2).attr('fill', d => d.census ? C.accent : C.bg).attr('stroke', C.accent).attr('stroke-width', 1.2)
          .on('mousemove', (ev, d) => showTip(`<div class="t-head">${p.name}, ${d.year}</div><div class="t-row"><span>${d.census ? 'перепись' : 'оценка на 1 января'}</span><b>${fmt(d.pop)}</b></div>${ref && d.year !== 1989 ? `<div class="t-note">к 1989 году: ${(d.pop / ref.pop - 1) > 0 ? '+' : ''}${Math.round((d.pop / ref.pop - 1) * 100)}%</div>` : ''}${p.note ? `<div class="t-note">${p.note}</div>` : ''}`, ev)).on('mouseleave', hideTip);
        [1959, 1989, 2025].forEach(yr => monoText(svg.append('text').attr('x', x(yr)).attr('y', H - 2).attr('text-anchor', yr === 1959 ? 'start' : yr === 2025 ? 'end' : 'middle').attr('fill', C.ink3).text(yr), 9));
        grid.appendChild(card);
      });
    }
    render();
  })();

  /* =============== RINGS =============== */
  (function rings() {
    const el = document.getElementById('rings'), listEl = document.getElementById('ring-list');
    const palette = { unk: C.accent, lhc: C.grey, tevatron: C.grey, u70: C.amber, nica_collider: C.white, skif: C.pale, nuclotron: C.grey2, nica_booster: C.accent2, synchrophasotron: C.ink3 };
    const data = D.rings.slice().sort((a, b) => b.perimeter_m - a.perimeter_m);
    const names = { unk: 'УНК, Протвино', lhc: 'Большой адронный коллайдер, CERN', tevatron: 'Теватрон, Fermilab', u70: 'У-70, Протвино', nica_collider: 'Коллайдер NICA, Дубна', skif: 'СКИФ, Кольцово', nuclotron: 'Нуклотрон, Дубна', nica_booster: 'Бустер NICA, Дубна', synchrophasotron: 'Синхрофазотрон, Дубна' };
    const sub = { unk: '1983–1998, не достроен', lhc: 'с 2008, работает', tevatron: '1983–2011, остановлен', u70: 'с 1967, работает', nica_collider: 'пучки с 2025', skif: 'открыт в 2026', nuclotron: 'с 1993, работает', nica_booster: 'внутри магнита синхрофазотрона', synchrophasotron: '1957–2003, остановлен' };
    function render() {
      el.innerHTML = ''; listEl.innerHTML = '';
      const W = Math.max(320, el.clientWidth), H = W;
      const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      const cx = W * 0.5, cy = H * 0.5;
      const Rmax = Math.min(W, H) * 0.47;
      const rLHC = data[0].perimeter_m / (2 * Math.PI);
      const k = Rmax / rLHC;
      // coordinate cross behind the rings
      svg.append('line').attr('x1', cx - Rmax - 10).attr('x2', cx + Rmax + 10).attr('y1', cy).attr('y2', cy).attr('stroke', C.rule).attr('stroke-dasharray', '2 5');
      svg.append('line').attr('y1', cy - Rmax - 10).attr('y2', cy + Rmax + 10).attr('x1', cx).attr('x2', cx).attr('stroke', C.rule).attr('stroke-dasharray', '2 5');
      const g = svg.append('g');
      data.forEach(d => {
        const r = d.perimeter_m / (2 * Math.PI) * k;
        g.append('circle').attr('class', 'ring').attr('data-id', d.id).attr('cx', cx).attr('cy', cy).attr('r', Math.max(r, 0.6)).attr('stroke', palette[d.id]).attr('stroke-width', d.id === 'unk' ? 2 : 1.2)
          .on('mousemove', ev => { setFocus(d.id); showTip(tipHtml(d), ev); }).on('mouseleave', () => { setFocus(null); hideTip(); });
      });
      [['lhc', 'БАК · 26 659 м'], ['unk', 'УНК · 20 772 м'], ['tevatron', 'ТЕВАТРОН · 6 280 м']].forEach(([id, t]) => {
        const d = data.find(x => x.id === id); const r = d.perimeter_m / (2 * Math.PI) * k;
        svg.append('text').attr('class', 'ring-label').attr('x', cx).attr('y', cy - r + 14).attr('text-anchor', 'middle').attr('fill', id === 'unk' ? C.accent2 : C.ink2).text(t);
      });
      const mag = 7, ir = Math.min(W, H) * 0.22, icx = ir + 8, icy = H - ir - 26;
      svg.append('defs').append('clipPath').attr('id', 'loupe-clip').append('circle').attr('cx', icx).attr('cy', icy).attr('r', ir);
      const ig = svg.append('g');
      ig.append('circle').attr('cx', icx).attr('cy', icy).attr('r', ir).attr('fill', '#0a0c12').attr('stroke', C.rule2).attr('stroke-dasharray', '3 3');
      const igc = ig.append('g').attr('clip-path', 'url(#loupe-clip)');
      const small = data.filter(d => d.perimeter_m < 2000);
      small.forEach(d => {
        const r = d.perimeter_m / (2 * Math.PI) * k * mag;
        igc.append('circle').attr('class', 'ring').attr('data-id', d.id).attr('cx', icx).attr('cy', icy).attr('r', r).attr('stroke', palette[d.id]).attr('stroke-width', 1.2)
          .on('mousemove', ev => { setFocus(d.id); showTip(tipHtml(d), ev); }).on('mouseleave', () => { setFocus(null); hideTip(); });
      });
      ig.append('text').attr('class', 'ring-label').attr('x', icx).attr('y', icy - ir + 16).attr('text-anchor', 'middle').text('[ ЛУПА ×7 ]');
      if (W >= 520) ig.append('text').attr('class', 'ring-label').attr('x', icx).attr('y', icy + ir + 16).attr('text-anchor', 'middle').attr('font-size', 9.5).text('У-70 · NICA · СКИФ · нуклотрон · бустер');
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', ir / mag).attr('fill', 'none').attr('stroke', C.ink3).attr('stroke-dasharray', '2 2');
      data.forEach((d, i) => {
        const it = document.createElement('div'); it.className = 'ring-item'; it.dataset.id = d.id;
        it.innerHTML = `<span class="ix">${String(i + 1).padStart(2, '0')}</span><i style="border-color:${palette[d.id]}"></i><div class="n">${names[d.id] || d.name}<small>${sub[d.id] || d.years}</small></div><div class="v">${fmt(d.perimeter_m)} м</div>`;
        it.addEventListener('mousemove', ev => { setFocus(d.id); showTip(tipHtml(d), ev); }); it.addEventListener('mouseleave', () => { setFocus(null); hideTip(); });
        listEl.appendChild(it);
      });
    }
    function tipHtml(d) { return `<div class="t-head">${names[d.id] || d.name}</div><div class="t-row"><span>Длина кольца</span><b>${fmt(d.perimeter_m)} м</b></div><div class="t-row"><span>Диаметр</span><span>≈${fmt(d.perimeter_m / Math.PI)} м</span></div><div class="t-note">${d.note}</div><div class="t-note">${d.years}</div>`; }
    function setFocus(id) {
      d3.select(el).selectAll('.ring').each(function () { this.classList.toggle('dim', !!id && this.dataset.id !== id); });
      [...listEl.children].forEach(c => c.classList.toggle('on', c.dataset.id === id));
    }
    render(); new ResizeObserver(render).observe(el);
  })();

  /* =============== CATALOGUE (archive) =============== */
  (function cards() {
    const cat = { 'unk-protvino': 'frozen', 'obninsk-npp-1': 'museum', 'synchrophasotron-dubna': 'working', 'energia-buran': 'lost', 'tu144-zhukovsky': 'museum', 'meson-factory-troitsk': 'partial', 'dkr1000-pushchino': 'partial', 'pushchino-brain-drain': 'partial', 'skif-koltsovo': 'building', 'nica-dubna': 'working' };
    const catLabel = { frozen: ['Законсервирован', 'frozen'], museum: ['Музей / памятник', 'museum'], lost: ['Утрачен', 'lost'], partial: ['Работает частично', 'partial'], working: ['Вторая жизнь', 'working'], building: ['Вводится в эксплуатацию', 'building'] };
    const short = { 'unk-protvino': 'УНК: недостроенный коллайдер под Протвино', 'obninsk-npp-1': 'Первая в мире АЭС, Обнинск', 'synchrophasotron-dubna': 'Синхрофазотрон ОИЯИ: 36 000 тонн, внутри — бустер NICA', 'energia-buran': '«Энергия — Буран»: один полёт', 'tu144-zhukovsky': 'Ту-144: последние полёты в Жуковском', 'meson-factory-troitsk': 'Мезонная фабрика в Троицке: 600 → 502 → 300 МэВ', 'dkr1000-pushchino': 'ДКР-1000, Пущино: крест, у которого украли плечо', 'pushchino-brain-drain': 'Пущино: «уехала почти половина сотрудников»', 'skif-koltsovo': 'СКИФ, Кольцово: первая мегаустановка за десятилетия', 'nica-dubna': 'NICA, Дубна: коллайдер в ярме старого магнита' };
    const chips = document.getElementById('card-chips'), grid = document.getElementById('cards');
    let filter = 'all';
    const counts = {}; D.stories.forEach(s => counts[cat[s.id]] = (counts[cat[s.id]] || 0) + 1);
    [['all', 'Все'], ...Object.entries(catLabel).map(([k, v]) => [k, v[0]])].forEach(([k, l], i) => {
      const b = document.createElement('button'); b.className = 'tg' + (i === 0 ? ' on' : ''); b.innerHTML = `${l}${k !== 'all' ? ` <span class="cnt">${counts[k] || 0}</span>` : ''}`;
      b.addEventListener('click', () => { filter = k; [...chips.children].forEach(c => c.classList.remove('on')); b.classList.add('on'); render(); });
      chips.appendChild(b);
    });
    function render() {
      grid.innerHTML = '';
      D.stories.filter(s => filter === 'all' || cat[s.id] === filter).forEach((s, i) => {
        const c = cat[s.id]; const [lab, cls] = catLabel[c];
        const ph = s.photos[0];
        const item = document.createElement('article'); item.className = 'cat-item';
        const fv = v => { const t = String(v); return /^\d+(\.\d+)?$/.test(t) ? Number(t).toLocaleString('ru-RU', { maximumFractionDigits: 1 }).replace(/\u00a0/g, ' ') : t.replace(/(\d)\.(\d)/g, '$1,$2'); };
        const nums = s.numbers.slice(0, 4).map(n => `<div><b>${fv(n.v)} ${n.u}</b>${n.l.length > 90 ? n.l.slice(0, 88) + '…' : n.l}</div>`).join('');
        const num = String(D.stories.indexOf(s) + 1).padStart(2, '0');
        item.innerHTML = `
          <div class="ix"><span class="num">${num}</span><span>${s.city.split(' (')[0]}</span><span class="st stc-${cls}"><i></i>${lab}</span></div>
          ${ph ? `<div class="ph"><img src="${ph.file}" alt="${ph.caption.replace(/"/g, '&quot;')}" loading="lazy"><div class="cap">${ph.caption.split('. ВНИМАНИЕ')[0]} · <a href="${ph.page_url}" rel="noopener" target="_blank">${ph.author.split(' /')[0].slice(0, 28)}</a>, <a href="${ph.license_url || '#'}" rel="noopener" target="_blank">${ph.license}</a></div></div>` : ''}
          <div class="tx">
            <div class="meta">${s.year_start}–${s.year_end || '…'}${s.institution ? ' · ' + s.institution.split(' (')[0].slice(0, 60) : ''}</div>
            <h4>${short[s.id] || s.title}</h4>
            <div class="sum">${s.summary}</div>
            <div class="nums">${nums}</div>
            <details><summary>Статус на ${s.as_of} и источники</summary><p>${s.status_detail}</p>${s.sources.map(u => `<a href="${u}" rel="noopener" target="_blank">${u.replace(/^https?:\/\//, '').slice(0, 70)}</a>`).join('')}</details>
          </div>`;
        grid.appendChild(item);
      });
    }
    render();
  })();
})();
