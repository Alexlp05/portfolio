/* ==========================================================================
   ALEXANDRE LE PORT — CV interactif
   Rendu piloté par data.js. Bibliothèques : GSAP + ScrollTrigger + Draggable,
   Lenis, Three.js — toutes optionnelles : le site reste lisible si une CDN tombe.
   ========================================================================== */
(() => {
    'use strict';

    /* ---------------------------------------------------------------------
       0. Setup & utilitaires
       --------------------------------------------------------------------- */
    const D = window.PORTFOLIO;
    if (!D) { document.body.classList.remove('is-loading'); return; }
    const P = D.profile;

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const byId = (id) => document.getElementById(id);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const debounce = (fn, ms = 150) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
    const offsetIn = (el, ancestor) => {
        let x = 0, y = 0, n = el;
        while (n && n !== ancestor) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
        return { x, y };
    };

    const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FINE = matchMedia('(pointer: fine)').matches;
    const HAS_GSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    const HAS_DRAG = HAS_GSAP && typeof window.Draggable !== 'undefined';
    const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const params = new URLSearchParams(location.search);
    const START_AUDIT = params.has('audit') || location.hash === '#audit';

    if (REDUCED || !HAS_GSAP) document.documentElement.classList.add('reduced');
    if (HAS_GSAP) {
        gsap.registerPlugin(ScrollTrigger);
        if (HAS_DRAG) gsap.registerPlugin(Draggable);
        ScrollTrigger.config({ ignoreMobileResize: true });
    }
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const chapterById = (id) => D.chapters.find((c) => c.id === id);
    const projectById = (id) => D.projects.find((p) => p.id === id);
    const allSkills = D.skillGroups.flatMap((g) => g.skills);
    const skillLabel = (id) => (allSkills.find((s) => s.id === id) || { label: id }).label;
    const LENS_LABEL = { tech: 'Tech & IA', conseil: 'Conseil & Mgmt', both: 'Hybride' };
    const fmtNum = (v, d = 0) => Number(v).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

    const todoBadge = (list) => (list && list.length)
        ? `<span class="todo" title="${esc(list.join(' · '))}">À compléter · ${list.length}</span>` : '';
    const todoList = (list) => (list && list.length)
        ? `<ul class="todo-list">${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';

    const state = { lens: 'all', audit: false };

    /* ---------------------------------------------------------------------
       1. Rendu des contenus
       --------------------------------------------------------------------- */
    function coverMarkup(p) {
        if (p.cover.type === 'image') {
            return `<img src="${esc(p.cover.src)}" alt="" loading="lazy" style="object-position:${esc(p.cover.position || '50% 50%')}">`;
        }
        return `<canvas data-gen="${esc(p.cover.gen)}" aria-hidden="true"></canvas>`;
    }

    function renderHero() {
        byId('hero-tagline').textContent = P.tagline;
        const seekTodo = (P.todo || []).filter((t) => /recherches|cherche/i.test(t));
        byId('hero-meta').innerHTML = `
            <div><span class="mono">Basé à</span><strong>${esc(P.location)}</strong></div>
            <div><span class="mono">En ce moment</span><strong>${P.now.map(esc).join('<br>')}</strong></div>
            <div><span class="mono">Je cherche</span><strong>${esc(P.seeking)} ${todoBadge(seekTodo)}</strong></div>`;
        byId('role-word').textContent = P.roles[0];
    }

    function renderStatement() {
        const accent = ['hybride', 'local', 'pilote'];
        byId('statement').innerHTML = P.statement.split(' ').map((w) => {
            const hit = accent.some((a) => norm(w).startsWith(a));
            return `<span class="sw">${hit ? `<em>${esc(w)}</em>` : esc(w)}</span>`;
        }).join(' ');
    }

    function renderStats() {
        byId('stats').innerHTML = D.stats.map((s) => {
            const isNum = typeof s.value === 'number';
            const val = isNum
                ? `<span data-count="${s.value}" data-decimals="${s.decimals || 0}">${fmtNum(s.value, s.decimals || 0)}</span>`
                : esc(s.value);
            return `<div class="stat">
                <div class="stat-value">${val}${s.suffix ? `<small>${esc(s.suffix)}</small>` : ''}</div>
                <div><p class="stat-label">${esc(s.label)}</p><p class="stat-sub">${esc(s.sub)}</p></div>
            </div>`;
        }).join('');
    }

    function renderChapters() {
        byId('chapters').innerHTML = D.chapters.map((c, i) => {
            const side = i % 2 === 0 ? 'left' : 'right';
            const n = (c.projects || []).length;
            return `<li class="chapter chapter--${side}${c.isNext ? ' chapter--next' : ''}" data-id="${c.id}" data-lens="${c.lens}">
                <span class="chapter-pin" aria-hidden="true"></span>
                <span class="chapter-year" aria-hidden="true">${esc(c.year)}</span>
                <article class="chapter-card" tabindex="0" role="button" data-tilt
                    aria-label="${esc(c.isNext ? 'Aller au contact' : `Ouvrir le chapitre : ${c.role} — ${c.org}`)}"
                    data-cursor="${c.isNext ? 'Contact' : 'Ouvrir'}">
                    <div class="chapter-top">
                        <span class="mono chapter-dates">${esc(c.dates)}</span>
                        <span class="mono chapter-type">${esc(c.type)}</span>
                        ${todoBadge(c.todo)}
                    </div>
                    <h3 class="chapter-role">${esc(c.role)}</h3>
                    <p class="chapter-org">${esc(c.org)}</p>
                    <p class="chapter-pitch">${esc(c.pitch)}</p>
                    <div class="chapter-foot">
                        ${c.isNext ? '' : `<span class="tag tag--${c.lens}">${LENS_LABEL[c.lens]}</span>`}
                        ${n ? `<span class="tag">◆ ${n} projet${n > 1 ? 's' : ''} lié${n > 1 ? 's' : ''}</span>` : ''}
                        <span class="chapter-open">${c.isNext ? 'Écrire la suite' : 'Ouvrir'} <i>→</i></span>
                    </div>
                </article>
            </li>`;
        }).join('');
    }

    function renderProjects() {
        const track = byId('lab-track');
        byId('lab-count').textContent = D.projects.length;
        track.innerHTML = D.projects.map((p, i) => `
            <article class="project-card" data-id="${p.id}" data-lens="${p.lens}" tabindex="0" role="button"
                aria-label="${esc(`Voir le projet : ${p.title}`)}" data-cursor="Voir">
                <div class="project-cover">
                    <div class="project-cover-inner">${coverMarkup(p)}</div>
                    <span class="project-index mono">${String(i + 1).padStart(2, '0')}</span>
                    <span class="project-cta" aria-hidden="true">↗</span>
                </div>
                <div class="project-info">
                    <div class="project-meta mono"><span class="project-cat">${esc(p.category)}</span><span>${esc(p.year)}</span></div>
                    <h3 class="project-title">${esc(p.title)}</h3>
                    <p class="project-pitch">${esc(p.pitch)}</p>
                    <ul class="project-stack">${p.stack.slice(0, 4).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
                    ${todoBadge(p.todo)}
                </div>
            </article>`).join('') + `
            <div class="lab-end">
                <p>Tout le code est ouvert.</p>
                <a href="${esc(P.github)}" target="_blank" rel="noopener" data-cursor="GitHub">github.com/Alexlp05 ↗</a>
            </div>`;
    }

    function evidenceItems() {
        const chapters = D.chapters.filter((c) => !c.isNext).slice().reverse().map((c) => ({
            kind: 'chapter', id: c.id, title: c.role, sub: c.org.split(' — ')[0], year: c.year, skills: c.skills || []
        }));
        const projects = D.projects.map((p) => ({
            kind: 'project', id: p.id, title: p.title, sub: p.category, year: p.year.split(' ')[p.year.split(' ').length - 1], skills: p.skills || []
        }));
        return [...chapters, ...projects];
    }

    function renderStack() {
        const items = evidenceItems();
        const count = (id) => items.filter((it) => it.skills.includes(id)).length;
        byId('skills').innerHTML = D.skillGroups.map((g) => `
            <div class="skill-group">
                <h3 class="mono">${esc(g.label)}</h3>
                <ul>${g.skills.map((s) => `<li><button type="button" class="skill" data-skill="${s.id}" data-cursor="Relier">${esc(s.label)} <sup>${count(s.id)}</sup></button></li>`).join('')}</ul>
            </div>`).join('') + `<p class="todo">Langues & certifications manquantes</p>`;
        byId('evidence').innerHTML = items.map((it) => `
            <li data-kind="${it.kind}" data-id="${it.id}" data-skills="${it.skills.join(' ')}">
                <button type="button" data-cursor="Ouvrir">
                    <span class="ev-kind">${it.kind === 'chapter' ? '●' : '◆'}</span>
                    <span><span class="ev-title">${esc(it.title)}</span><span class="ev-sub">${esc(it.sub)}</span></span>
                    <span class="ev-year mono">${esc(it.year)}</span>
                </button>
            </li>`).join('');
    }

    function renderContact() {
        const seekTodo = (P.todo || []).filter((t) => /recherches|cherche/i.test(t));
        byId('contact-sub').innerHTML = `Ingénierie & IA × Conseil & Management. Je cherche : <strong>${esc(P.seeking)}</strong>. ${todoBadge(seekTodo)}<br>Le plus simple pour en parler : un email.`;
        const mailTodo = (P.todo || []).filter((t) => /email/i.test(t));
        byId('email-btn').innerHTML = `<span class="email-text">${esc(P.email)}</span><span class="copy-ico" aria-hidden="true">⧉</span>`;
        byId('email-btn').setAttribute('aria-label', `Copier l’adresse email ${P.email}`);
        if (mailTodo.length) byId('email-btn').insertAdjacentHTML('afterend', todoBadge(mailTodo));
        byId('link-linkedin').href = P.linkedin;
        byId('link-github').href = P.github;
        const cv = byId('link-cv');
        cv.href = P.cv;
        if (location.protocol.startsWith('http')) {
            fetch(P.cv, { method: 'HEAD' }).then((r) => { if (r.ok) cv.hidden = false; }).catch(() => { });
        }
    }

    /* ---------------------------------------------------------------------
       2. Visuels génératifs (canvas) — un par projet sans photo
       --------------------------------------------------------------------- */
    const INK = '#0D0E12', IVORY = '#EDEBE6', RED = '#D9381E', RED2 = '#FF5A3C';
    const MONO = '"JetBrains Mono", ui-monospace, monospace';
    const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));

    const DIGITS = {
        0: [[14, 5], [9, 7], [7, 13], [8, 19], [12, 23], [17, 22], [20, 16], [19, 9], [14, 5]],
        2: [[8, 9], [11, 6], [16, 5], [19, 8], [18, 12], [13, 17], [8, 22], [20, 22]],
        3: [[8, 6], [18, 6], [13, 13], [18, 15], [19, 19], [15, 23], [8, 22]],
        4: [[17, 22], [17, 5], [7, 17], [21, 17]],
        5: [[19, 6], [9, 6], [8, 13], [14, 12], [19, 15], [18, 21], [13, 23], [8, 21]],
        7: [[7, 6], [21, 6], [15, 14], [12, 23]],
        8: [[14, 5], [9, 8], [11, 12], [17, 15], [19, 19], [14, 23], [9, 20], [11, 15], [17, 12], [18, 8], [14, 5]],
        9: [[18, 10], [14, 6], [9, 8], [9, 12], [14, 14], [18, 10], [18, 16], [16, 23]]
    };

    const GENS = {
        /* Mycélium qui pousse + trace électrique */
        mycelium: {
            init(it) {
                const { ctx, w, h } = it;
                ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
                const tips = [];
                const seeds = 2 + Math.round(rnd(2));
                for (let i = 0; i < seeds; i++) {
                    const x = w * rnd(0.2, 0.8), y = h * rnd(0.25, 0.6);
                    for (let k = 0; k < 6; k++) tips.push({ x, y, a: rnd(Math.PI * 2), life: rnd(160, 300) });
                    ctx.fillStyle = RED2; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 6.283); ctx.fill();
                }
                return { tips, frame: 0, fade: 0, sig: new Array(Math.ceil(w / 2)).fill(0), spike: 0 };
            },
            draw(it) {
                const { ctx, w, h } = it, s = it.state;
                if (s.fade > 0) {
                    ctx.fillStyle = 'rgba(13,14,18,0.09)'; ctx.fillRect(0, 0, w, h);
                    if (--s.fade === 0) it.state = GENS.mycelium.init(it);
                    return;
                }
                const nodes = [];
                for (let k = 0; k < 2; k++) {
                    const next = [];
                    ctx.lineWidth = 0.75; ctx.strokeStyle = 'rgba(237,235,230,0.5)';
                    ctx.beginPath();
                    for (const p of s.tips) {
                        const nx = p.x + Math.cos(p.a) * 1.4, ny = p.y + Math.sin(p.a) * 1.4;
                        ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny);
                        p.x = nx; p.y = ny; p.a += rnd(-0.18, 0.18); p.life -= 1;
                        if (p.life > 0 && nx > -4 && nx < w + 4 && ny > -4 && ny < h + 4) {
                            next.push(p);
                            if (Math.random() < 0.016 && s.tips.length < 380) {
                                next.push({ x: nx, y: ny, a: p.a + (Math.random() < 0.5 ? -1 : 1) * rnd(0.45, 1), life: p.life * 0.75 + 30 });
                                nodes.push([nx, ny]);
                            }
                        }
                    }
                    ctx.stroke();
                    s.tips = next;
                }
                ctx.fillStyle = 'rgba(255,90,60,0.9)';
                nodes.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 1.5, 0, 6.283); ctx.fill(); });

                // trace électrique
                const band = Math.min(44, h * 0.16), by = h - band - 12;
                ctx.fillStyle = 'rgba(13,14,18,0.94)'; ctx.fillRect(0, by - 8, w, band + 20);
                ctx.strokeStyle = 'rgba(237,235,230,0.12)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, by - 8); ctx.lineTo(w, by - 8); ctx.stroke();
                let v = rnd(-0.07, 0.07);
                if (s.spike <= 0 && Math.random() < 0.03) s.spike = 12;
                if (s.spike > 0) { v += Math.sin(((12 - s.spike) / 12) * Math.PI) * (0.6 + rnd(0.3)); s.spike--; }
                s.sig.shift(); s.sig.push(v);
                ctx.strokeStyle = RED2; ctx.lineWidth = 1.3; ctx.beginPath();
                s.sig.forEach((val, i) => { const x = i * 2, y = by + band / 2 - val * band * 0.5; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
                ctx.stroke();
                ctx.fillStyle = 'rgba(237,235,230,0.55)'; ctx.font = `10px ${MONO}`;
                ctx.fillText('MYCÉLIUM VIVANT · µV · LIVE', 12, by + 4);

                if (++s.frame > 1100 || s.tips.length === 0) s.fade = 45;
            }
        },

        /* Metaballs : clin d'œil au ray marching + smooth-min */
        metaballs: {
            init(it) {
                const RW = it.big ? 220 : 140, RH = Math.max(2, Math.round((RW * it.h) / it.w));
                const off = document.createElement('canvas'); off.width = RW; off.height = RH;
                const octx = off.getContext('2d');
                const balls = Array.from({ length: 6 }, () => ({ px: rnd(6.28), py: rnd(6.28), sx: rnd(0.25, 0.6), sy: rnd(0.25, 0.6), r: rnd(0.1, 0.17) }));
                return { off, octx, img: octx.createImageData(RW, RH), RW, RH, balls };
            },
            draw(it, dt, t) {
                const s = it.state, { RW, RH, img, balls } = s, d = img.data;
                const pos = balls.map((b) => [(0.5 + 0.36 * Math.sin(t * b.sx + b.px)) * RW, (0.48 + 0.32 * Math.cos(t * b.sy + b.py)) * RH, (b.r * RW) ** 2]);
                let i = 0;
                for (let y = 0; y < RH; y++) {
                    const floor = y > RH * 0.82 ? (y - RH * 0.82) / (RH * 0.18) : 0;
                    for (let x = 0; x < RW; x++) {
                        let f = 0;
                        for (let k = 0; k < pos.length; k++) { const dx = x - pos[k][0], dy = y - pos[k][1]; f += pos[k][2] / (dx * dx + dy * dy + 1); }
                        let r, g, b;
                        if (f > 1) {
                            const k2 = Math.min(1, (f - 1) / 3);
                            const rim = Math.max(0, 1 - (f - 1) * 3);
                            r = 217 + 28 * k2 + 38 * rim; g = 56 + 180 * k2 * k2 + 40 * rim; b = 30 + 195 * k2 * k2;
                        } else {
                            const glow = f * f * f;
                            r = 13 + 200 * glow; g = 14 + 40 * glow; b = 18 + 22 * glow;
                            if (floor > 0 && (x % 12 === 0 || Math.round(y * 0.6) % 6 === 0)) { r += 18 * floor; g += 18 * floor; b += 22 * floor; }
                        }
                        d[i++] = r > 255 ? 255 : r; d[i++] = g > 255 ? 255 : g; d[i++] = b > 255 ? 255 : b; d[i++] = 255;
                    }
                }
                s.octx.putImageData(img, 0, 0);
                it.ctx.imageSmoothingEnabled = true;
                it.ctx.drawImage(s.off, 0, 0, it.w, it.h);
                it.ctx.fillStyle = 'rgba(237,235,230,0.6)'; it.ctx.font = `10px ${MONO}`;
                it.ctx.fillText('SDF · smin(k) · WGSL', 14, 22);
            }
        },

        /* Terminal : LLM local qui rédige une revue */
        tokens: {
            init() {
                return {
                    n: 0, hold: 0, lines: [
                        [['$ webllm load Llama-3-8B · WebGPU ', 'dim'], ['✓', 'ok']],
                        [['$ rag index ./papers — 6 PDF · MiniLM ', 'dim'], ['✓', 'ok']],
                        [['$ persona scholar', 'dim']],
                        [['', '']],
                        [['## Revue de littérature', 'h']],
                        [['1. Introduction', 'b']],
                        [['Les réseaux mycéliens émettent des trains', '']],
                        [['de potentiels électriques spontanés ', ''], ['[source: paper_01.pdf]', 'cite']],
                        [['2. Comparaison des méthodes', 'b']],
                        [['Électrodes aiguilles vs surface : le rapport', '']],
                        [['signal/bruit diffère nettement ', ''], ['[source: paper_03.pdf]', 'cite']],
                        [['3. Conclusion', 'b']],
                        [['Un substrat crédible pour le calcul non', '']],
                        [['conventionnel ', ''], ['[source: paper_05.pdf]', 'cite']]
                    ]
                };
            },
            draw(it, dt, t) {
                const { ctx, w, h } = it, s = it.state;
                const fs = clamp(w / 36, 9, it.big ? 17 : 13), lh = fs * 1.55;
                ctx.fillStyle = '#101217'; ctx.fillRect(0, 0, w, h);
                // barre de fenêtre
                ctx.fillStyle = '#181B22'; ctx.fillRect(0, 0, w, 28);
                [RED2, '#E8B04B', '#5DBB76'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(16 + i * 14, 14, 4, 0, 6.283); ctx.fill(); });
                ctx.fillStyle = 'rgba(237,235,230,0.5)'; ctx.font = `10px ${MONO}`; ctx.fillText('localhost — 100 % local · 0 octet envoyé', 64, 18);

                const total = s.lines.reduce((a, l) => a + l.reduce((b, seg) => b + seg[0].length, 0) + 1, 0);
                if (s.n < total) s.n += dt * 70; else if ((s.hold += dt) > 2.4) { s.n = 0; s.hold = 0; }
                let left = Math.floor(s.n);
                ctx.font = `${fs}px ${MONO}`; ctx.textBaseline = 'alphabetic';
                const rendered = [];
                for (const line of s.lines) {
                    if (left <= 0) break;
                    const segs = [];
                    for (const [txt, cls] of line) {
                        const take = Math.min(txt.length, left);
                        segs.push([txt.slice(0, take), cls]); left -= take;
                        if (left <= 0) break;
                    }
                    left -= 1; rendered.push(segs);
                }
                const maxLines = Math.floor((h - 44) / lh);
                const start = Math.max(0, rendered.length - maxLines);
                let y = 28 + 14 + fs;
                let cx = 16, lastY = y;
                for (let li = start; li < rendered.length; li++) {
                    let x = 16;
                    for (const [txt, cls] of rendered[li]) {
                        if (cls === 'cite' && txt) {
                            const tw = ctx.measureText(txt).width;
                            ctx.fillStyle = 'rgba(217,56,30,0.22)'; ctx.fillRect(x - 2, y - fs + 2, tw + 4, fs + 3);
                            ctx.fillStyle = RED2;
                        } else ctx.fillStyle = cls === 'dim' ? 'rgba(237,235,230,0.45)' : cls === 'ok' ? '#5DBB76' : cls === 'h' ? IVORY : cls === 'b' ? '#C9D6EA' : 'rgba(237,235,230,0.85)';
                        ctx.font = `${cls === 'h' || cls === 'b' ? '600 ' : ''}${fs}px ${MONO}`;
                        ctx.fillText(txt, x, y);
                        x += ctx.measureText(txt).width;
                    }
                    cx = x; lastY = y; y += lh;
                }
                if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = RED2; ctx.fillRect(cx + 2, lastY - fs + 2, fs * 0.55, fs); }
            }
        },

        /* MNIST : un chiffre dessiné en 28×28 + probabilités */
        pixels: {
            init() {
                const keys = Object.keys(DIGITS);
                return { grid: new Float32Array(784), keys, digit: +keys[Math.floor(rnd(keys.length))], prog: 0, phase: 'draw', timer: 0, probs: new Array(10).fill(0.02), target: null };
            },
            draw(it, dt) {
                const { ctx, w, h } = it, s = it.state;
                const path = DIGITS[s.digit];
                if (s.phase === 'draw') {
                    const segs = path.length - 1;
                    const before = s.prog;
                    s.prog = Math.min(segs, s.prog + dt * 5.5);
                    for (let q = before; q <= s.prog; q += 0.08) {
                        const i = Math.min(segs - 1, Math.floor(q)), f = q - i;
                        const [x0, y0] = path[i], [x1, y1] = path[i + 1];
                        const px = x0 + (x1 - x0) * f, py = y0 + (y1 - y0) * f;
                        for (let gy = Math.floor(py - 2); gy <= py + 2; gy++) for (let gx = Math.floor(px - 2); gx <= px + 2; gx++) {
                            if (gx < 0 || gy < 0 || gx > 27 || gy > 27) continue;
                            const dd = Math.hypot(gx - px, gy - py);
                            if (dd < 1.9) s.grid[gy * 28 + gx] = Math.min(1, s.grid[gy * 28 + gx] + (1 - dd / 1.9) * 0.22);
                        }
                    }
                    if (s.prog >= segs) {
                        s.phase = 'predict'; s.timer = 0;
                        const top = rnd(0.86, 0.98); let rest = 1 - top;
                        s.target = Array.from({ length: 10 }, (_, k) => (k === s.digit ? top : 0));
                        const others = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((k) => k !== s.digit);
                        others.forEach((k, idx) => { const v = idx === others.length - 1 ? rest : rest * rnd(0, 0.5); s.target[k] = v; rest -= v; });
                    }
                } else if (s.phase === 'predict') {
                    s.timer += dt;
                    s.probs = s.probs.map((p, k) => p + (s.target[k] - p) * 0.12);
                    if (s.timer > 1.8) { s.phase = 'fade'; s.timer = 0; }
                } else {
                    for (let k = 0; k < 784; k++) s.grid[k] *= 0.86;
                    s.probs = s.probs.map((p) => p + (0.02 - p) * 0.15);
                    if ((s.timer += dt) > 0.6) { let nd; do { nd = +s.keys[Math.floor(rnd(s.keys.length))]; } while (nd === s.digit); Object.assign(s, { digit: nd, prog: 0, phase: 'draw', grid: new Float32Array(784) }); }
                }
                ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
                const size = Math.min(h * 0.78, w * 0.5), cell = size / 28, gx0 = w * 0.07, gy0 = (h - size) / 2;
                for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) {
                    const v = s.grid[y * 28 + x];
                    ctx.fillStyle = v > 0.02 ? `rgba(237,235,230,${0.08 + v * 0.92})` : 'rgba(237,235,230,0.045)';
                    ctx.fillRect(gx0 + x * cell + 0.5, gy0 + y * cell + 0.5, cell - 1, cell - 1);
                }
                ctx.fillStyle = 'rgba(237,235,230,0.55)'; ctx.font = `10px ${MONO}`;
                ctx.fillText('28 × 28 · INPUT', gx0, gy0 - 8);
                const bx0 = gx0 + size + w * 0.07, bw = (w - bx0 - w * 0.06) / 10, bh = size * 0.8, by = gy0 + size;
                const best = s.probs.indexOf(Math.max(...s.probs));
                s.probs.forEach((p, k) => {
                    const hh = Math.max(2, p * bh);
                    ctx.fillStyle = k === best && s.phase !== 'draw' ? RED2 : 'rgba(237,235,230,0.25)';
                    ctx.fillRect(bx0 + k * bw + 2, by - hh, bw - 4, hh);
                    ctx.fillStyle = 'rgba(237,235,230,0.6)'; ctx.fillText(String(k), bx0 + k * bw + bw / 2 - 3, by + 14);
                });
                ctx.fillStyle = 'rgba(237,235,230,0.55)';
                ctx.fillText('SOFTMAX · WEBGPU', bx0, gy0 - 8);
                if (s.phase !== 'draw') {
                    ctx.fillStyle = IVORY; ctx.font = `600 ${Math.round(size * 0.12)}px ${MONO}`;
                    ctx.fillText(`→ ${best}  ${(s.probs[best] * 100).toFixed(1)}%`, bx0, gy0 + size * 0.12);
                }
            }
        },

        /* CRM : pipeline kanban vivant */
        kanban: {
            init() {
                const cols = ['Leads', 'Prospection', 'Opportunités', 'Études'];
                const cards = []; let id = 0;
                [4, 3, 2, 2].forEach((n, c) => { for (let i = 0; i < n; i++) cards.push({ id: id++, col: c, x: null, y: null, hue: rnd(1) }); });
                return { cols, cards, id, timer: 0, moving: null };
            },
            draw(it, dt) {
                const { ctx, w, h } = it, s = it.state;
                ctx.fillStyle = '#F5F4F0'; ctx.fillRect(0, 0, w, h);
                const pad = Math.max(12, w * 0.035), top = 40, gap = pad * 0.6;
                const colW = (w - pad * 2 - gap * 3) / 4, cardH = clamp(h * 0.085, 16, 40);
                ctx.fillStyle = '#121316'; ctx.font = `600 11px ${MONO}`; ctx.fillText('VINCI JUNIOR CRM', pad, 24);
                ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(w - pad - 4, 20, 4, 0, 6.283); ctx.fill();
                s.cols.forEach((name, c) => {
                    const x = pad + c * (colW + gap);
                    ctx.fillStyle = '#E8E5DE'; roundRect(ctx, x, top, colW, h - top - pad, 10); ctx.fill();
                    ctx.fillStyle = 'rgba(18,19,22,0.6)'; ctx.font = `${Math.max(8, Math.min(10, colW / 9))}px ${MONO}`;
                    ctx.fillText(name.toUpperCase(), x + 8, top + 16);
                });
                s.timer += dt;
                if (s.timer > 1.4) {
                    s.timer = 0;
                    const movable = s.cards.filter((c) => c.col < 3);
                    const m = movable[Math.floor(rnd(movable.length))];
                    if (m) { m.col++; s.cards = s.cards.filter((c) => c !== m).concat(m); s.moving = m.id; }
                    if (s.cards.filter((c) => c.col === 3).length > 4) { const old = s.cards.find((c) => c.col === 3); s.cards = s.cards.filter((c) => c !== old); }
                    if (s.cards.filter((c) => c.col === 0).length < 2) s.cards.unshift({ id: s.id++, col: 0, x: null, y: null, hue: rnd(1) });
                }
                const slots = [0, 0, 0, 0];
                s.cards.forEach((card) => {
                    const tx = pad + card.col * (colW + gap) + 6, ty = top + 26 + slots[card.col]++ * (cardH + 6);
                    if (card.x === null) { card.x = tx; card.y = ty; }
                    card.x += (tx - card.x) * 0.12; card.y += (ty - card.y) * 0.12;
                    const isM = card.id === s.moving;
                    ctx.save();
                    if (isM) { ctx.shadowColor = 'rgba(217,56,30,0.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4; }
                    ctx.fillStyle = '#fff'; roundRect(ctx, card.x, card.y, colW - 12, cardH, 6); ctx.fill();
                    ctx.restore();
                    ctx.fillStyle = isM ? RED : card.hue > 0.5 ? '#121316' : '#8DB4EC';
                    ctx.fillRect(card.x, card.y + 4, 3, cardH - 8);
                    ctx.fillStyle = 'rgba(18,19,22,0.15)';
                    ctx.fillRect(card.x + 10, card.y + cardH * 0.3, (colW - 30) * (0.5 + card.hue * 0.4), 3);
                    ctx.fillRect(card.x + 10, card.y + cardH * 0.62, (colW - 30) * 0.35, 3);
                });
            }
        },

        /* Une Vie : une ligne de vie de 0 à 100 ans */
        life: {
            init() {
                const walk = (start, vol) => { const a = [start]; for (let i = 1; i <= 100; i++) a.push(clamp(a[i - 1] + rnd(-vol, vol) - (i > 70 ? 0.6 : 0), 5, 95)); return a; };
                const pool = [[0, 'Naissance'], [6, 'École'], [18, 'Bac'], [rnd(21, 25), 'Premier job'], [rnd(27, 35), 'Rencontre'], [rnd(36, 48), 'Krach boursier'], [rnd(45, 58), 'Promotion'], [rnd(60, 67), 'Retraite'], [rnd(78, 95), 'Épitaphe']];
                return {
                    age: 0, hold: 0, events: pool.map(([a, l], i) => ({ age: a, label: l, up: i % 2 === 0 })),
                    stats: [
                        { name: 'santé', color: IVORY, v: walk(85, 5) },
                        { name: 'bonheur', color: RED2, v: walk(60, 8) },
                        { name: 'argent', color: '#8DB4EC', v: walk(20, 7).map((x, i) => clamp(x + i * 0.5, 5, 95)) },
                        { name: 'social', color: '#B9B2A5', v: walk(30, 7) }
                    ]
                };
            },
            draw(it, dt) {
                const { ctx, w, h } = it, s = it.state;
                if (s.age < 100) s.age = Math.min(100, s.age + dt * 8.5); else if ((s.hold += dt) > 2) it.state = GENS.life.init(it);
                ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
                const x0 = 20, x1 = w - 20, base = h * 0.8, top = h * 0.2, X = (a) => x0 + (x1 - x0) * (a / 100), Y = (v) => base - 14 - (v / 100) * (base - top - 14);
                ctx.strokeStyle = 'rgba(237,235,230,0.25)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(x1, base); ctx.stroke();
                ctx.font = `9px ${MONO}`; ctx.fillStyle = 'rgba(237,235,230,0.45)';
                for (let a = 0; a <= 100; a += 10) { ctx.fillRect(X(a), base - 3, 1, 6); ctx.fillText(String(a), X(a) - 4, base + 16); }
                s.stats.forEach((st) => {
                    ctx.strokeStyle = st.color; ctx.globalAlpha = 0.85; ctx.lineWidth = 1.4; ctx.beginPath();
                    const n = Math.floor(s.age);
                    for (let a = 0; a <= n; a++) { const x = X(a), y = Y(st.v[a]); a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
                    ctx.stroke(); ctx.globalAlpha = 1;
                });
                s.events.forEach((e) => {
                    if (e.age > s.age) return;
                    const k = clamp((s.age - e.age) / 4, 0, 1), x = X(e.age), y = e.up ? top - 4 : base - 22;
                    ctx.globalAlpha = k;
                    ctx.strokeStyle = 'rgba(237,235,230,0.25)'; ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, y + 4); ctx.stroke();
                    ctx.fillStyle = IVORY; ctx.font = `10px ${MONO}`; ctx.fillText(e.label, Math.min(x + 4, w - ctx.measureText(e.label).width - 6), y);
                    ctx.globalAlpha = 1;
                });
                const ax = X(s.age);
                ctx.fillStyle = RED2; ctx.beginPath(); ctx.arc(ax, base, 5, 0, 6.283); ctx.fill();
                ctx.fillStyle = IVORY; ctx.font = `700 ${Math.round(clamp(w / 12, 22, 54))}px Syne, sans-serif`;
                ctx.fillText(`${Math.floor(s.age)} ans`, 20, Math.max(46, top - 26));
            }
        },

        /* HTMAA : impression couche par couche d'un « manège » ondulé */
        fab: {
            init() { return { layer: 0, prog: 0, max: Math.round(rnd(26, 36)), petals: Math.random() < 0.5 ? 6 : 7, hold: 0 }; },
            draw(it, dt) {
                const { ctx, w, h } = it, s = it.state;
                ctx.fillStyle = '#EFE9E0'; ctx.fillRect(0, 0, w, h);
                const cx = w / 2, cy = h * 0.74, rx = Math.min(w, h * 1.6) * 0.3, lh = Math.min(5, (h * 0.5) / s.max);
                ctx.fillStyle = 'rgba(18,19,22,0.08)'; ctx.beginPath(); ctx.ellipse(cx, cy + 10, rx * 1.35, rx * 0.5, 0, 0, 6.283); ctx.fill();
                const shape = (i, from, to) => {
                    ctx.beginPath();
                    for (let a = from; a <= to + 0.001; a += 0.05) {
                        const r = rx * (1 + 0.13 * Math.sin(s.petals * a + i * 0.12));
                        const x = cx + Math.cos(a) * r, y = cy - i * lh + Math.sin(a) * r * 0.42;
                        a === from ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                    }
                };
                for (let i = 0; i < s.layer; i++) {
                    ctx.strokeStyle = `rgba(18,19,22,${0.12 + 0.5 * (i / s.max)})`; ctx.lineWidth = 1.2;
                    shape(i, 0, Math.PI * 2); ctx.stroke();
                }
                if (s.layer < s.max) {
                    s.prog += dt * 1.9;
                    const end = Math.min(1, s.prog) * Math.PI * 2;
                    ctx.strokeStyle = RED; ctx.lineWidth = 2; shape(s.layer, 0, end); ctx.stroke();
                    const r = rx * (1 + 0.13 * Math.sin(s.petals * end + s.layer * 0.12));
                    const nx = cx + Math.cos(end) * r, ny = cy - s.layer * lh + Math.sin(end) * r * 0.42;
                    ctx.strokeStyle = 'rgba(18,19,22,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(nx, ny - 8); ctx.lineTo(nx, 0); ctx.stroke();
                    ctx.fillStyle = '#121316'; ctx.fillRect(nx - 7, ny - 20, 14, 12);
                    ctx.fillStyle = RED2; ctx.beginPath(); ctx.arc(nx, ny - 2, 2.5, 0, 6.283); ctx.fill();
                    if (s.prog >= 1) { s.prog = 0; s.layer++; }
                } else if ((s.hold += dt) > 1.8) it.state = GENS.fab.init(it);
                ctx.fillStyle = 'rgba(18,19,22,0.6)'; ctx.font = `10px ${MONO}`;
                ctx.fillText(`LAYER ${String(Math.min(s.layer + 1, s.max)).padStart(2, '0')}/${s.max} · PLA · 0.2 MM`, 14, 22);
            }
        },

        /* Clothing recommender : météo + agenda + tenue */
        weather: {
            init() {
                const kinds = ['sun', 'cloud', 'rain'];
                const days = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].map((d) => {
                    const k = kinds[Math.floor(rnd(3))], temp = Math.round(k === 'sun' ? rnd(16, 27) : k === 'cloud' ? rnd(10, 18) : rnd(6, 14));
                    return { d, k, temp, meet: Math.random() < 0.4 };
                });
                return { days, cur: 0, timer: 0 };
            },
            draw(it, dt) {
                const { ctx, w, h } = it, s = it.state;
                const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#DCE8F8'); g.addColorStop(1, '#F5F4F0');
                ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
                if ((s.timer += dt) > 1.3) { s.timer = 0; s.cur = (s.cur + 1) % 7; if (s.cur === 0) it.state = Object.assign(GENS.weather.init(it), { cur: 0 }); }
                const pad = 14, cw = (w - pad * 2) / 7, top = 40, ch = h * 0.42;
                ctx.fillStyle = '#121316'; ctx.font = `600 11px ${MONO}`; ctx.fillText('CETTE SEMAINE', pad, 24);
                const pts = [];
                s.days.forEach((d, i) => {
                    const x = pad + i * cw, active = i === s.cur;
                    ctx.fillStyle = active ? '#121316' : 'rgba(255,255,255,0.7)';
                    roundRect(ctx, x + 3, top, cw - 6, ch, 10); ctx.fill();
                    ctx.fillStyle = active ? '#F5F4F0' : 'rgba(18,19,22,0.6)'; ctx.font = `${Math.max(8, Math.min(10, cw / 5))}px ${MONO}`;
                    ctx.fillText(d.d, x + 9, top + 16);
                    const ix = x + cw / 2, iy = top + ch * 0.48, r = Math.min(cw, ch) * 0.16;
                    if (d.k === 'sun') { ctx.fillStyle = '#E8B04B'; ctx.beginPath(); ctx.arc(ix, iy, r, 0, 6.283); ctx.fill(); }
                    else {
                        ctx.fillStyle = active ? '#C9D6EA' : '#9DBFEE';
                        ctx.beginPath(); ctx.arc(ix - r * 0.6, iy, r * 0.7, 0, 6.283); ctx.arc(ix + r * 0.3, iy - r * 0.3, r * 0.9, 0, 6.283); ctx.arc(ix + r, iy + r * 0.1, r * 0.6, 0, 6.283); ctx.fill();
                        if (d.k === 'rain') { ctx.strokeStyle = '#5B8FD9'; ctx.lineWidth = 1.5; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(ix + k * r * 0.6, iy + r); ctx.lineTo(ix + k * r * 0.6 - 3, iy + r + 7); ctx.stroke(); } }
                    }
                    ctx.fillStyle = active ? '#F5F4F0' : '#121316'; ctx.font = `600 ${Math.max(10, Math.min(14, cw / 4))}px ${MONO}`;
                    ctx.fillText(`${d.temp}°`, x + 9, top + ch - 12);
                    if (d.meet) { ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(x + cw - 12, top + 13, 3, 0, 6.283); ctx.fill(); }
                    pts.push([x + cw / 2, top + ch + 26 + (28 - d.temp) * 1.6]);
                });
                ctx.strokeStyle = 'rgba(18,19,22,0.35)'; ctx.lineWidth = 1.2; ctx.beginPath();
                pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
                pts.forEach(([x, y], i) => { ctx.fillStyle = i === s.cur ? RED : '#121316'; ctx.beginPath(); ctx.arc(x, y, i === s.cur ? 4 : 2.5, 0, 6.283); ctx.fill(); });
                const d = s.days[s.cur];
                const outfit = d.k === 'rain' ? 'Imperméable + bottines' : d.temp < 12 ? 'Manteau + pull' : d.temp < 19 ? 'Veste légère' : 'T-shirt + lin';
                const label = `→ ${outfit}${d.meet ? ' · réunion : chemise' : ''}`;
                ctx.font = `600 ${Math.max(11, Math.min(15, w / 30))}px ${MONO}`;
                const tw = ctx.measureText(label).width;
                ctx.fillStyle = '#121316'; roundRect(ctx, pad, h - 44, Math.min(w - pad * 2, tw + 24), 30, 15); ctx.fill();
                ctx.fillStyle = '#F5F4F0'; ctx.fillText(label, pad + 12, h - 24);
            }
        }
    };

    function roundRect(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }

    const Gen = (() => {
        const items = new Set();
        const io = 'IntersectionObserver' in window
            ? new IntersectionObserver((entries) => entries.forEach((e) => { if (e.target.__gen) e.target.__gen.visible = e.isIntersecting; }), { rootMargin: '120px' })
            : null;
        const ro = 'ResizeObserver' in window
            ? new ResizeObserver((entries) => entries.forEach((e) => e.target.__gen && e.target.__gen.resize()))
            : null;

        function mount(canvas, opts = {}) {
            const type = canvas.dataset.gen, def = GENS[type];
            if (!def || canvas.__gen) return;
            const ctx = canvas.getContext('2d');
            const it = {
                canvas, ctx, type, w: 0, h: 0, t: 0, state: null, visible: !io, big: !!opts.big,
                dpr: Math.min(window.devicePixelRatio || 1, 1.5),
                resize() {
                    const r = canvas.getBoundingClientRect();
                    const w = Math.round(r.width), h = Math.round(r.height);
                    if (w < 2 || h < 2 || (w === this.w && h === this.h)) return;
                    this.w = w; this.h = h;
                    canvas.width = Math.round(w * this.dpr); canvas.height = Math.round(h * this.dpr);
                    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
                    this.state = def.init(this);
                    if (REDUCED) for (let i = 0; i < 160; i++) { this.t += 1 / 60; def.draw(this, 1 / 60, this.t); }
                }
            };
            canvas.__gen = it;
            items.add(it);
            io && io.observe(canvas);
            ro && ro.observe(canvas);
            it.resize();
        }
        function unmount(root) {
            $$('canvas[data-gen]', root).forEach((c) => {
                if (!c.__gen) return;
                items.delete(c.__gen); io && io.unobserve(c); ro && ro.unobserve(c); c.__gen = null;
            });
        }
        let last = performance.now();
        function loop(now) {
            const dt = Math.min(0.05, (now - last) / 1000); last = now;
            if (!REDUCED && !document.hidden) {
                items.forEach((it) => {
                    if (!it.visible || !it.state || it.w < 2) return;
                    it.t += dt;
                    GENS[it.type].draw(it, dt, it.t);
                });
            }
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
        return { mount, unmount, mountAll: (root = document, opts) => $$('canvas[data-gen]', root).forEach((c) => mount(c, opts)) };
    })();

    /* ---------------------------------------------------------------------
       3. Scroll (Lenis) & helpers
       --------------------------------------------------------------------- */
    let lenis = null;
    function initLenis() {
        if (REDUCED || typeof window.Lenis === 'undefined') return;
        lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
        if (HAS_GSAP) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
            requestAnimationFrame(raf);
        }
        lenis.stop();
    }
    function scrollToTarget(target) {
        const el = typeof target === 'string' ? $(target) : target;
        if (!el) return;
        if (lenis) lenis.scrollTo(el, { duration: 1.6, force: true });
        else el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
    }
    const layers = [];
    function setLocked(on) {
        document.documentElement.classList.toggle('is-locked', on);
        if (lenis) on ? lenis.stop() : lenis.start();
    }
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a || a.getAttribute('href').length < 2) return;
        const target = $(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        scrollToTarget(target);
    });

    /* ---------------------------------------------------------------------
       4. Curseur, magnétisme, tilt
       --------------------------------------------------------------------- */
    function initCursor() {
        if (!FINE || REDUCED) return;
        document.documentElement.classList.add('has-cursor');
        const root = $('.cursor'), dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
        let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
        root.classList.add('is-hidden');
        addEventListener('pointermove', (e) => {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
            root.classList.remove('is-hidden');
        }, { passive: true });
        document.documentElement.addEventListener('mouseleave', () => root.classList.add('is-hidden'));
        addEventListener('pointerdown', () => root.classList.add('is-down'));
        addEventListener('pointerup', () => root.classList.remove('is-down'));
        (function tick() {
            rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
            ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
            requestAnimationFrame(tick);
        })();
        document.addEventListener('pointerover', (e) => {
            const t = e.target.closest('[data-cursor], a, button, [role="button"], input');
            const text = t ? (t.dataset.cursor || '') : '';
            label.textContent = text;
            root.classList.toggle('is-label', !!text);
            root.classList.toggle('is-link', !!t && !text);
        });
    }

    function initMagnetic(root = document) {
        if (!FINE || REDUCED || !HAS_GSAP) return;
        $$('[data-magnetic]', root).forEach((el) => {
            if (el.__mag) return; el.__mag = true;
            const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
            const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - r.left - r.width / 2) * 0.28);
                yTo((e.clientY - r.top - r.height / 2) * 0.38);
            });
            el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
        });
    }

    function initTilt(selector, max = 5) {
        if (!FINE || REDUCED) return;
        $$(selector).forEach((card) => {
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
                card.style.setProperty('--mx', `${px * 100}%`);
                card.style.setProperty('--my', `${py * 100}%`);
                card.style.transform = `perspective(1000px) rotateY(${(px - 0.5) * max}deg) rotateX(${(0.5 - py) * max}deg)`;
            });
            card.addEventListener('pointerleave', () => { card.style.transform = ''; });
        });
    }

    /* ---------------------------------------------------------------------
       5. Texte : découpages & scramble
       --------------------------------------------------------------------- */
    function splitChars(el) {
        const text = el.textContent.trim();
        el.textContent = '';
        [...text].forEach((ch) => {
            const s = document.createElement('span');
            s.className = 'char';
            s.textContent = ch === ' ' ? ' ' : ch;
            el.appendChild(s);
        });
        return $$('.char', el);
    }
    function splitWords(el) {
        const words = el.textContent.trim().split(/\s+/);
        el.setAttribute('aria-label', el.textContent.trim());
        el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true"><span class="wi">${esc(w)}</span></span>`).join(' ');
        return $$('.wi', el);
    }
    function scramble(el, to, dur = 850) {
        const glyphs = 'abcdefghijklmnopqrstuvwxyz#%&*+=<>/0123456789';
        const start = performance.now();
        if (el.__scr) cancelAnimationFrame(el.__scr);
        const step = (now) => {
            const p = Math.min(1, (now - start) / dur);
            const n = Math.floor(p * to.length);
            let out = to.slice(0, n);
            for (let i = n; i < to.length; i++) out += to[i] === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)];
            el.textContent = out;
            if (p < 1) el.__scr = requestAnimationFrame(step);
        };
        el.__scr = requestAnimationFrame(step);
    }

    /* ---------------------------------------------------------------------
       6. Preloader & intro
       --------------------------------------------------------------------- */
    function runPreloader(done) {
        const pl = byId('preloader');
        if (!pl) return done();
        if (REDUCED || !HAS_GSAP) { pl.remove(); done(); return; }
        const count = byId('pl-count'), fill = $('.pl-thread-fill', pl);
        const st = { p: 0 };
        const render = () => { count.textContent = String(Math.round(st.p * 100)).padStart(3, '0'); fill.style.transform = `scaleX(${st.p})`; };
        let ready = false;
        const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
        Promise.race([Promise.all([loaded, document.fonts ? document.fonts.ready : null]), new Promise((r) => setTimeout(r, 4500))])
            .then(() => { ready = true; });
        gsap.from('.pl-line > span', { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.1 });
        const first = gsap.to(st, { p: 0.82, duration: 1.1, ease: 'power2.out', onUpdate: render });
        const finish = () => {
            gsap.to(st, {
                p: 1, duration: 0.4, ease: 'power2.inOut', onUpdate: render, onComplete: () => {
                    gsap.timeline({ onComplete: () => pl.remove() })
                        .to('.pl-line > span', { yPercent: -110, duration: 0.6, ease: 'expo.in', stagger: 0.05 })
                        .to('.pl-top, .pl-bottom, .pl-thread', { opacity: 0, duration: 0.3 }, '<')
                        .to(pl, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=0.15')
                        .add(done, '-=0.6');
                }
            });
        };
        (function check() { (ready && first.progress() === 1) ? finish() : setTimeout(check, 60); })();
    }

    /* ---------------------------------------------------------------------
       7. Hero
       --------------------------------------------------------------------- */
    let heroChars = [];
    function initHero() {
        heroChars = $$('[data-chars]').flatMap(splitChars);
        const hero = byId('hero');
        if (HAS_GSAP && !REDUCED) {
            gsap.set(heroChars, { yPercent: 115, rotate: 6 });
            gsap.set('#hero-photo', { scale: 0, rotate: -25 });
            gsap.set('.hero-role, .hero-foot, .hero-top', { opacity: 0, y: 24 });
            // écartement des lignes au scroll
            gsap.to('.hero-line--1', { xPercent: -10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
            gsap.to('.hero-line--2', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
            gsap.to('.hero-name', { opacity: 0.15, ease: 'none', scrollTrigger: { trigger: hero, start: '40% top', end: 'bottom top', scrub: true } });
        }

        // rôles qui défilent
        const roleEl = byId('role-word');
        let ri = 0;
        setInterval(() => {
            if (document.hidden) return;
            ri = (ri + 1) % P.roles.length;
            if (REDUCED) roleEl.textContent = P.roles[ri]; else scramble(roleEl, P.roles[ri]);
        }, 2800);

        // photo déplaçable qui revient en place
        if (HAS_DRAG) {
            Draggable.create('#hero-photo', {
                type: 'x,y',
                bounds: hero,
                onDrag() { gsap.to(this.target, { rotate: clamp(this.deltaX * 2, -18, 18), duration: 0.3 }); },
                onRelease() { gsap.to(this.target, { x: 0, y: 0, rotate: 0, duration: 1.4, ease: 'elastic.out(1, 0.35)' }); }
            });
        }

        // Lettres aimantées : elles se soulèvent et passent en contour rouge près du curseur
        // (translate + couleur uniquement : aucun reflow, l'espacement reste parfait)
        if (REDUCED || !FINE || !heroChars.length) return;
        let mx = -9999, my = -9999, visible = true, settled = true;
        hero.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; settled = false; });
        hero.addEventListener('pointerleave', () => { mx = my = -9999; settled = false; });
        if (HAS_GSAP) ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (s) => { visible = s.isActive; } });
        const tick = () => {
            if (!visible || settled) return;
            const radius = Math.max(120, innerWidth * 0.1);
            const away = mx < -9000;
            const ks = heroChars.map((c) => {
                if (away) return 0;
                const r = c.getBoundingClientRect();
                return clamp(1 - Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2)) / radius, 0, 1);
            });
            let moving = false;
            heroChars.forEach((c, i) => {
                const prev = c.__k || 0, k = prev + (ks[i] - prev) * 0.16;
                c.__k = Math.abs(k - ks[i]) < 0.002 ? ks[i] : k;
                if (c.__k !== ks[i]) moving = true;
                c.style.translate = c.__k ? `0 ${(-c.__k * 9).toFixed(2)}%` : '';
                c.classList.toggle('is-hot', c.__k > 0.42);
            });
            if (away && !moving) settled = true;
        };
        if (HAS_GSAP) gsap.ticker.add(tick); else (function loop() { tick(); requestAnimationFrame(loop); })();
    }
    function heroIntro() {
        if (!HAS_GSAP || REDUCED) return;
        gsap.timeline()
            .to(heroChars, { yPercent: 0, rotate: 0, duration: 1.3, ease: 'expo.out', stagger: 0.035 })
            .to('#hero-photo', { scale: 1, rotate: 0, duration: 1.6, ease: 'elastic.out(1, 0.45)' }, 0.35)
            .to('.hero-top, .hero-role, .hero-foot', { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.5);
    }

    /* ---------------------------------------------------------------------
       8. Marquee piloté par la vitesse de scroll
       --------------------------------------------------------------------- */
    function initMarquee() {
        const el = byId('marquee');
        if (!el || REDUCED || !HAS_GSAP) return;
        let x = 0, dir = -1, visible = false;
        ScrollTrigger.create({ trigger: el.parentElement, start: 'top bottom', end: 'bottom top', onToggle: (s) => { visible = s.isActive; } });
        const skew = gsap.quickTo(el, 'skewX', { duration: 0.4, ease: 'power3.out' });
        gsap.ticker.add(() => {
            if (!visible) return;
            const v = lenis ? lenis.velocity : 0;
            if (Math.abs(v) > 0.5) dir = v > 0 ? -1 : 1;
            x += (1.1 + Math.abs(v) * 0.5) * dir;
            const half = el.scrollWidth / 2;
            if (x <= -half) x += half;
            if (x > 0) x -= half;
            gsap.set(el, { x });
            skew(clamp(-v * 0.35, -10, 10));
        });
    }

    /* ---------------------------------------------------------------------
       9. Révélations au scroll
       --------------------------------------------------------------------- */
    function initReveals() {
        // Titres de section
        $$('[data-title]').forEach((title) => {
            const words = splitWords(title);
            if (!HAS_GSAP || REDUCED) return;
            gsap.from(words, {
                yPercent: 115, rotate: 5, duration: 1.2, ease: 'expo.out', stagger: 0.07,
                scrollTrigger: { trigger: title, start: 'top 88%' }
            });
        });
        if (!HAS_GSAP || REDUCED) return;

        // Statement : les mots s'allument au fil du scroll
        const sw = $$('#statement .sw');
        gsap.to(sw, {
            opacity: 1, stagger: 0.1, ease: 'none',
            scrollTrigger: { trigger: '#statement', start: 'top 80%', end: 'bottom 45%', scrub: true }
        });

        // Apparitions génériques
        gsap.from('#lens', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#thread-wrap', start: 'top 75%', once: true } });
        const targets = ['.section-kicker', '.stat', '.hybrid', '.skill-group', '.evidence li', '.contact-kicker', '.contact-sub', '.contact-actions'];
        const els = $$(targets.join(','));
        gsap.set(els, { opacity: 0, y: 40 });
        ScrollTrigger.batch(els, {
            start: 'top 90%', once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, overwrite: true })
        });

        // Compteurs
        $$('[data-count]').forEach((el) => {
            const end = parseFloat(el.dataset.count), dec = +el.dataset.decimals || 0, o = { v: 0 };
            el.textContent = fmtNum(0, dec);
            ScrollTrigger.create({
                trigger: el, start: 'top 90%', once: true,
                onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'expo.out', onUpdate: () => { el.textContent = fmtNum(o.v, dec); } })
            });
        });

        // Chapitres : glissent depuis leur côté
        $$('.chapter').forEach((li) => {
            const left = li.classList.contains('chapter--left');
            gsap.from(li, {
                x: left ? -70 : 70, opacity: 0, duration: 1.2, ease: 'expo.out',
                scrollTrigger: { trigger: li, start: 'top 88%', once: true }
            });
        });

        // Contact : le titre se resserre
        gsap.from('.contact-title .hover-word', {
            yPercent: 60, opacity: 0, rotate: () => rnd(-8, 8), duration: 1.3, ease: 'expo.out', stagger: 0.08,
            scrollTrigger: { trigger: '.contact-title', start: 'top 85%', once: true }
        });
    }

    /* ---------------------------------------------------------------------
       10. Slider « deux casquettes »
       --------------------------------------------------------------------- */
    function initHybrid() {
        const box = byId('hybrid'), handle = byId('hybrid-handle');
        let pos = 50, mode = null, sx = 0, sy = 0, teaser = null;
        const set = (p) => {
            pos = clamp(p, 3, 97);
            box.style.setProperty('--pos', `${pos}%`);
            handle.setAttribute('aria-valuenow', Math.round(pos));
            handle.setAttribute('aria-valuetext', pos < 40 ? 'Plutôt conseil' : pos > 60 ? 'Plutôt ingénieur' : 'Équilibre');
        };
        const fromX = (x) => { const r = box.getBoundingClientRect(); return ((x - r.left) / r.width) * 100; };
        const stopTeaser = () => { if (teaser) { teaser.kill(); teaser = null; } };
        box.addEventListener('pointerdown', (e) => {
            stopTeaser(); sx = e.clientX; sy = e.clientY;
            mode = e.pointerType === 'mouse' || e.target.closest('.hybrid-handle') ? 'drag' : 'pending';
            if (mode === 'drag') { box.setPointerCapture(e.pointerId); box.classList.add('is-dragging'); set(fromX(e.clientX)); }
        });
        box.addEventListener('pointermove', (e) => {
            if (mode === 'pending') {
                const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy);
                if (dx > 8 && dx > dy) { mode = 'drag'; box.setPointerCapture(e.pointerId); box.classList.add('is-dragging'); }
                else if (dy > 8) mode = null;
            }
            if (mode === 'drag') set(fromX(e.clientX));
        });
        const end = () => { mode = null; box.classList.remove('is-dragging'); };
        box.addEventListener('pointerup', end);
        box.addEventListener('pointercancel', end);
        handle.addEventListener('keydown', (e) => {
            const map = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 };
            if (map[e.key]) { e.preventDefault(); stopTeaser(); set(pos + map[e.key]); }
            if (e.key === 'Home') set(3);
            if (e.key === 'End') set(97);
        });
        set(50);
        if (HAS_GSAP && !REDUCED) {
            const o = { p: 50 };
            teaser = gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 65%', once: true }, onUpdate: () => set(o.p) })
                .to(o, { p: 22, duration: 1.1, ease: 'power3.inOut' })
                .to(o, { p: 78, duration: 1.4, ease: 'power3.inOut' })
                .to(o, { p: 50, duration: 1.1, ease: 'power3.inOut' });
        }
    }

    /* ---------------------------------------------------------------------
       11. Lentille : Tout / Tech / Conseil
       --------------------------------------------------------------------- */
    function movePill() {
        const lens = byId('lens'), btn = $(`button[data-lens="${state.lens}"]`, lens), pill = $('.lens-pill', lens);
        if (!btn) return;
        pill.style.width = `${btn.offsetWidth}px`;
        pill.style.transform = `translateX(${btn.offsetLeft}px)`;
    }
    function setLens(l) {
        state.lens = l;
        const lens = byId('lens');
        lens.dataset.active = l;
        $$('button', lens).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.lens === l)));
        movePill();
        const match = (el) => l === 'all' || el.dataset.lens === l || el.dataset.lens === 'both';
        $$('.chapter').forEach((li) => li.classList.toggle('is-dim', !li.classList.contains('chapter--next') && !match(li)));
        $$('.project-card').forEach((c) => c.classList.toggle('is-dim', !match(c)));
    }
    function initLens() {
        const lens = byId('lens');
        lens.addEventListener('click', (e) => { const b = e.target.closest('button[data-lens]'); if (b) setLens(b.dataset.lens); });
        lens.addEventListener('keydown', (e) => {
            if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
            const order = ['all', 'tech', 'conseil'];
            const i = (order.indexOf(state.lens) + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
            setLens(order[i]);
            $(`button[data-lens="${order[i]}"]`, lens).focus();
        });
        setLens('all');
        addEventListener('resize', debounce(movePill, 100));
    }

    /* ---------------------------------------------------------------------
       12. Le fil rouge : un chemin SVG qui s'enroule autour de chaque épingle
       --------------------------------------------------------------------- */
    const Thread = {
        len: 0, pins: [], progress: 0,
        build() {
            const wrap = byId('thread-wrap'), ol = byId('chapters'), svg = byId('thread-svg');
            const path = byId('thread-path'), track = byId('thread-track');
            const lis = $$('.chapter', ol);
            if (!lis.length) return;
            const W = wrap.clientWidth, H = wrap.offsetHeight;
            svg.setAttribute('width', W); svg.setAttribute('height', H);
            svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
            // offsetIn remonte toute la chaîne : un <li> transformé par GSAP devient offsetParent dans Chrome
            const pts = lis.map((li) => {
                const pin = $('.chapter-pin', li), o = offsetIn(pin, wrap);
                return { li, x: o.x + pin.offsetWidth / 2, y: o.y + pin.offsetHeight / 2 };
            });
            const mobile = W < 760;
            const R = mobile ? 9 : 13;
            const start = { x: mobile ? pts[0].x : W / 2, y: 0 };
            let d = `M ${start.x} ${start.y}`, prev = start;
            const at = [];
            pts.forEach((p, i) => {
                const dy = p.y - R - prev.y;
                const sw = mobile ? 18 : Math.min(120, W * 0.1);
                const dir = i % 2 === 0 ? 1 : -1;
                d += ` C ${prev.x + dir * sw * 0.5} ${prev.y + dy * 0.55} ${p.x - dir * sw * 0.35} ${p.y - R - dy * 0.55} ${p.x} ${p.y - R}`;
                path.setAttribute('d', d);
                at.push(path.getTotalLength());
                d += ` A ${R} ${R} 0 1 1 ${p.x} ${p.y + R} A ${R} ${R} 0 1 1 ${p.x} ${p.y - R} A ${R} ${R} 0 1 1 ${p.x} ${p.y + R}`;
                prev = { x: p.x, y: p.y + R };
            });
            d += ` C ${prev.x} ${prev.y + 50} ${prev.x + (mobile ? 10 : 40)} ${prev.y + 70} ${prev.x + (mobile ? 6 : 24)} ${Math.min(H - 4, prev.y + 110)}`;
            path.setAttribute('d', d);
            track.setAttribute('d', d);
            this.len = path.getTotalLength();
            this.pins = pts.map((p, i) => ({ li: p.li, at: at[i] }));
            path.style.strokeDasharray = `${this.len} ${this.len}`;
            this.render(HAS_GSAP && !REDUCED ? this.progress : 1);
        },
        render(p) {
            this.progress = p;
            const path = byId('thread-path'), needle = byId('thread-needle');
            if (!this.len) return;
            const drawn = this.len * p;
            path.style.strokeDashoffset = String(this.len - drawn);
            const pt = path.getPointAtLength(Math.max(0.1, drawn));
            needle.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
            needle.style.opacity = p > 0.001 && p < 0.999 ? 1 : 0;
            this.pins.forEach((pin) => pin.li.classList.toggle('is-reached', drawn >= pin.at - 2));
        }
    };
    function initThread() {
        Thread.build();
        if (HAS_GSAP && !REDUCED) {
            ScrollTrigger.create({
                trigger: '#thread-wrap', start: 'top 60%', end: 'bottom 70%',
                onUpdate: (s) => Thread.render(s.progress),
                onRefresh: (s) => Thread.render(s.progress)
            });
        }
        $$('.chapter-card').forEach((card) => {
            const open = () => {
                const id = card.closest('.chapter').dataset.id;
                if (chapterById(id)?.isNext) scrollToTarget('#contact'); else openChapter(id, card);
            };
            card.addEventListener('click', open);
            card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
        });
        initTilt('.chapter-card', 5);
    }

    /* ---------------------------------------------------------------------
       13. Lab : scroll horizontal épinglé (desktop) / swipe natif (mobile)
       --------------------------------------------------------------------- */
    let labCovering = false;
    function initLab() {
        const lab = byId('lab'), track = byId('lab-track'), bar = byId('lab-progress'), vp = $('.lab-viewport', lab);
        Gen.mountAll(track);
        $$('.project-card', track).forEach((card) => {
            const open = () => openProject(card.dataset.id, card);
            card.addEventListener('click', open);
            card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
        });
        initTilt('.project-card', 4);

        const native = () => {
            lab.classList.add('is-native');
            const onS = () => { const max = vp.scrollWidth - vp.clientWidth; bar.style.transform = `scaleX(${max > 0 ? vp.scrollLeft / max : 0})`; };
            vp.addEventListener('scroll', onS, { passive: true });
            return () => { vp.removeEventListener('scroll', onS); lab.classList.remove('is-native'); };
        };
        if (!HAS_GSAP || REDUCED) { native(); return; }

        const mm = gsap.matchMedia();
        mm.add({ desk: '(min-width: 901px) and (pointer: fine)', other: '(max-width: 900px), (pointer: coarse)' }, (ctx) => {
            if (!ctx.conditions.desk) return native();
            const dist = () => Math.max(0, track.scrollWidth - innerWidth);
            const skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3.out' });
            const tween = gsap.to(track, {
                x: () => -dist(), ease: 'none',
                scrollTrigger: {
                    trigger: lab, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8,
                    invalidateOnRefresh: true, anticipatePin: 1,
                    onUpdate: (s) => { bar.style.transform = `scaleX(${s.progress})`; skew(clamp(s.getVelocity() / -400, -5, 5)); }
                }
            });
            $$('.project-cover-inner', track).forEach((inner) => {
                gsap.fromTo(inner, { xPercent: -3, scale: 1.08 }, {
                    xPercent: 3, scale: 1.08, ease: 'none',
                    scrollTrigger: { trigger: inner.closest('.project-card'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
                });
            });
            gsap.from($$('.project-cover, .project-info', track), {
                y: 70, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.05,
                scrollTrigger: { trigger: lab, start: 'top 70%', once: true }
            });
            return () => { gsap.set(track, { x: 0, skewX: 0 }); };
        });
    }

    /* ---------------------------------------------------------------------
       14. Compétences ↔ preuves
       --------------------------------------------------------------------- */
    const Stack = {
        active: null, auto: true, timer: null, order: [],
        init() {
            const grid = byId('stack-grid'), ev = byId('evidence');
            this.order = $$('.skill', grid).filter((s) => +$('sup', s).textContent > 0).map((s) => s.dataset.skill);
            $$('.skill', grid).forEach((chip) => {
                const go = () => this.activate(chip.dataset.skill, true);
                chip.addEventListener('pointerenter', () => { if (FINE) go(); });
                chip.addEventListener('focus', go);
                chip.addEventListener('click', go);
            });
            $$('li', ev).forEach((li) => {
                const skills = li.dataset.skills.split(' ').filter(Boolean);
                li.addEventListener('pointerenter', () => $$('.skill', grid).forEach((c) => c.classList.toggle('is-related', skills.includes(c.dataset.skill))));
                li.addEventListener('pointerleave', () => $$('.skill.is-related', grid).forEach((c) => c.classList.remove('is-related')));
                $('button', li).addEventListener('click', () => (li.dataset.kind === 'chapter' ? openChapter(li.dataset.id, li) : openProject(li.dataset.id, li)));
            });
            grid.addEventListener('pointerenter', () => this.stopAuto());
            if (HAS_GSAP) {
                ScrollTrigger.create({
                    trigger: grid, start: 'top 70%', end: 'bottom 30%',
                    onToggle: (s) => (s.isActive ? this.startAuto() : clearInterval(this.timer))
                });
            } else this.activate(this.order[0]);
            addEventListener('resize', debounce(() => this.draw(false), 120));
        },
        startAuto() {
            if (!this.auto || this.timer) clearInterval(this.timer);
            if (!this.auto) return;
            let i = this.active ? this.order.indexOf(this.active) : -1;
            const next = () => { i = (i + 1) % this.order.length; this.activate(this.order[i]); };
            next();
            this.timer = setInterval(next, 2300);
        },
        stopAuto() { this.auto = false; clearInterval(this.timer); },
        activate(id, fromUser) {
            if (fromUser) this.stopAuto();
            if (this.active === id) return;
            this.active = id;
            const grid = byId('stack-grid'), ev = byId('evidence');
            $$('.skill', grid).forEach((s) => s.classList.toggle('is-active', s.dataset.skill === id));
            ev.classList.toggle('has-active', !!id);
            $$('li', ev).forEach((li) => li.classList.toggle('is-hit', !!id && li.dataset.skills.split(' ').includes(id)));
            this.draw(true);
        },
        draw(animate) {
            const grid = byId('stack-grid'), svg = byId('stack-svg');
            svg.innerHTML = '';
            if (!this.active || innerWidth <= 900) return;
            const chip = $(`.skill[data-skill="${this.active}"]`, grid);
            if (!chip) return;
            // Les lignes partent du bord de la colonne (pas de la puce) pour ne pas barrer les autres compétences
            const skills = byId('skills');
            const c = offsetIn(chip, grid);
            const x0 = c.x + chip.offsetWidth + 6, y1 = c.y + chip.offsetHeight / 2;
            const x1 = Math.max(x0, offsetIn(skills, grid).x + skills.offsetWidth + 18);
            let html = `<line class="stack-stub" x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}"/>`;
            $$('#evidence li.is-hit').forEach((li, i) => {
                const o = offsetIn(li, grid);
                const x2 = o.x - 8, y2 = o.y + li.offsetHeight / 2;
                const dx = (x2 - x1) * 0.55;
                const len = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 1.3);
                const style = animate && !REDUCED ? `--len:${len};animation-delay:${i * 70}ms` : 'stroke-dasharray:none;animation:none';
                html += `<path d="M ${x1} ${y1} C ${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}" style="${style}"/><circle cx="${x2}" cy="${y2}" r="3.5"/>`;
            });
            html += `<circle cx="${x1}" cy="${y1}" r="4.5"/>`;
            svg.innerHTML = html;
        }
    };

    /* ---------------------------------------------------------------------
       15. Contact
       --------------------------------------------------------------------- */
    function copyEmail() {
        const done = () => toast('Email copié — à coller dans votre messagerie');
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(P.email).then(done, () => { location.href = `mailto:${P.email}`; });
        } else location.href = `mailto:${P.email}`;
    }
    function initContact() {
        const btn = byId('email-btn');
        btn.addEventListener('click', copyEmail);
        const text = $('.email-text', btn);
        const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#%&';
        btn.addEventListener('pointerenter', () => {
            if (REDUCED) return;
            let it = 0;
            clearInterval(btn.__iv);
            btn.__iv = setInterval(() => {
                text.textContent = P.email.split('').map((ch, i) => (i < it ? ch : glyphs[Math.floor(Math.random() * glyphs.length)])).join('');
                if (it >= P.email.length) { clearInterval(btn.__iv); text.textContent = P.email; }
                it += 0.6;
            }, 28);
        });
        initMagnetic();
    }

    let toastTimer;
    function toast(msg) {
        const t = byId('toast');
        t.textContent = msg;
        t.classList.add('is-on');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
    }

    /* ---------------------------------------------------------------------
       16. Couches (tiroir, modal, palette) : focus, scroll, inert
       --------------------------------------------------------------------- */
    const BG = () => [byId('main'), byId('site-header'), $('.site-footer')];
    function pushLayer(el) {
        layers.forEach((l) => { l.el.inert = true; });
        layers.push({ el, focus: document.activeElement });
        BG().forEach((n) => n && (n.inert = true));
        el.hidden = false;
        setLocked(true);
    }
    function popLayer(el) {
        const i = layers.findIndex((l) => l.el === el);
        if (i < 0) return;
        const [entry] = layers.splice(i, 1);
        el.hidden = true;
        if (layers.length) layers[layers.length - 1].el.inert = false;
        else { BG().forEach((n) => n && (n.inert = false)); setLocked(false); }
        if (entry.focus && document.contains(entry.focus)) entry.focus.focus({ preventScroll: true });
    }
    const topLayer = () => layers[layers.length - 1]?.el;
    document.addEventListener('keydown', (e) => {
        const top = topLayer();
        if (!top) return;
        if (e.key === 'Escape') { e.preventDefault(); closeLayer(top); return; }
        if (e.key === 'Tab') {
            const f = $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', top).filter((n) => n.offsetParent !== null);
            if (!f.length) return;
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });
    function closeLayer(el) {
        if (el.id === 'drawer') closeChapter();
        else if (el.id === 'modal') closeProject();
        else if (el.id === 'cmdk') closeCmdk();
    }
    document.addEventListener('click', (e) => {
        const c = e.target.closest('[data-close]');
        if (c) closeLayer(c.closest('.drawer, .modal, .cmdk'));
    });

    /* ----- Tiroir : détail d'un chapitre ----- */
    function section(title, body) { return `<section class="d-section"><h3 class="mono">${title}</h3>${body}</section>`; }
    function thumbMarkup(p) {
        return p.cover.type === 'image' ? `<img src="${esc(p.cover.src)}" alt="">` : `<canvas data-gen="${esc(p.cover.gen)}"></canvas>`;
    }
    function chapterMarkup(c) {
        const projects = (c.projects || []).map(projectById).filter(Boolean);
        const list = D.chapters.filter((x) => !x.isNext);
        const i = list.indexOf(c);
        const prev = list[i - 1], next = list[i + 1];
        return `
            <div class="d-eyebrow mono"><span class="d-dates">${esc(c.dates)}</span><span>${esc(c.type)}</span>${c.place ? `<span>${esc(c.place)}</span>` : ''}<span class="tag tag--${c.lens}">${LENS_LABEL[c.lens]}</span></div>
            <h2 class="d-title" id="drawer-title">${esc(c.role)}</h2>
            <p class="d-org">${esc(c.org)}</p>
            <p class="d-pitch">${esc(c.pitch)}</p>
            ${c.context ? section('Contexte', `<p>${esc(c.context)}</p>`) : ''}
            ${c.missions && c.missions.length ? section('Missions', `<ul class="d-list">${c.missions.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>`) : ''}
            ${c.impact && c.impact.length ? section('Impact', `<div class="d-impact">${c.impact.map((m) => `<div><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('')}</div>`) : ''}
            ${c.quote ? section('Citation', `<blockquote class="d-quote">« ${esc(c.quote.text)} »<cite>${esc(c.quote.source)}</cite></blockquote>`) : ''}
            ${c.skills && c.skills.length ? section('Compétences mobilisées', `<div class="d-chips">${c.skills.map((s) => `<span>${esc(skillLabel(s))}</span>`).join('')}</div>`) : ''}
            ${projects.length ? section(`Projets liés · ${projects.length}`, `<div class="d-projects">${projects.map((p) => `
                <button type="button" class="d-project" data-open-project="${p.id}" data-cursor="Voir">
                    <span class="d-project-thumb">${thumbMarkup(p)}</span>
                    <span><strong>${esc(p.title)}</strong><small>${esc(p.category)} · ${esc(p.year)}</small></span>
                    <i aria-hidden="true">↗</i>
                </button>`).join('')}</div>`) : ''}
            ${c.todo && c.todo.length ? `<section class="d-section audit-only"><h3 class="mono">À compléter</h3>${todoList(c.todo)}</section>` : ''}
            <div class="d-next">
                ${prev ? `<button type="button" data-open-chapter="${prev.id}"><small>← Chapitre précédent</small>${esc(prev.role)}</button>` : '<span></span>'}
                ${next ? `<button type="button" data-open-chapter="${next.id}"><small>Chapitre suivant →</small>${esc(next.role)}</button>` : `<a class="d-cta" href="#contact" data-close>Écrire la suite ensemble →</a>`}
            </div>`;
    }
    function fillDrawer(c, animate) {
        const body = byId('drawer-body');
        Gen.unmount(body);
        body.innerHTML = chapterMarkup(c);
        Gen.mountAll(body);
        $('.drawer-sheet').scrollTop = 0;
        if (animate && HAS_GSAP && !REDUCED) gsap.from(body.children, { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.04, delay: 0.15 });
    }
    function openChapter(id) {
        const c = chapterById(id);
        if (!c || c.isNext) return;
        const drawer = byId('drawer');
        if (!drawer.hidden) { fillDrawer(c, true); return; }
        pushLayer(drawer);
        fillDrawer(c, true);
        if (HAS_GSAP && !REDUCED) {
            gsap.fromTo('.drawer-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.5 });
            gsap.fromTo('.drawer-sheet', { xPercent: 100 }, { xPercent: 0, duration: 0.9, ease: 'expo.out' });
        }
        $('.close-btn', drawer).focus({ preventScroll: true });
    }
    function closeChapter() {
        const drawer = byId('drawer');
        if (drawer.hidden) return;
        const finish = () => { Gen.unmount(byId('drawer-body')); popLayer(drawer); };
        if (HAS_GSAP && !REDUCED) {
            gsap.to('.drawer-backdrop', { opacity: 0, duration: 0.4 });
            gsap.to('.drawer-sheet', { xPercent: 100, duration: 0.6, ease: 'expo.in', onComplete: finish });
        } else finish();
    }
    document.addEventListener('click', (e) => {
        const oc = e.target.closest('[data-open-chapter]');
        if (oc) {
            const id = oc.dataset.openChapter;
            if (!byId('modal').hidden) { closeProject(() => openChapter(id)); return; }
            openChapter(id);
        }
        const op = e.target.closest('[data-open-project]');
        if (op) openProject(op.dataset.openProject);
    });

    /* ----- Modal : étude de cas projet ----- */
    let mediaIndex = 0, mediaList = [];
    function projectMedia(p) {
        const list = [];
        if (p.cover.type === 'gen') list.push({ gen: p.cover.gen, caption: 'Visuel génératif — une interprétation animée du projet.' });
        (p.gallery || []).forEach((g) => list.push({ src: g.src, caption: g.caption, cover: p.cover.type === 'image' && g.src === p.cover.src }));
        if (!list.length && p.cover.type === 'image') list.push({ src: p.cover.src, caption: '', cover: true });
        return list;
    }
    function projectMarkup(p) {
        const i = D.projects.indexOf(p), n = D.projects.length;
        const prev = D.projects[(i - 1 + n) % n], next = D.projects[(i + 1) % n];
        const ch = p.chapter ? chapterById(p.chapter) : null;
        mediaList = projectMedia(p);
        return `
            <div class="m-grid">
                <div class="m-media">
                    <div class="m-stage" id="m-stage"></div>
                    <p class="m-caption" id="m-caption"></p>
                    ${mediaList.length > 1 ? `<div class="m-thumbs">${mediaList.map((m, k) => `<button type="button" data-media="${k}" aria-label="Média ${k + 1}">${m.gen ? `<canvas data-gen="${m.gen}"></canvas>` : `<img src="${esc(m.src)}" alt="">`}</button>`).join('')}</div>` : ''}
                </div>
                <div class="m-info">
                    <div class="m-eyebrow mono"><span>${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}</span><span class="m-cat">${esc(p.category)}</span><span>${esc(p.year)}</span></div>
                    <h2 class="m-title" id="modal-title">${esc(p.title)}</h2>
                    <p class="m-pitch">${esc(p.pitch)}</p>
                    ${p.challenge ? `<section class="m-section"><h3 class="mono">Le défi</h3><p>${esc(p.challenge)}</p></section>` : ''}
                    ${p.built && p.built.length ? `<section class="m-section"><h3 class="mono">Ce que j’ai construit</h3><ul class="m-list">${p.built.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></section>` : ''}
                    ${p.results && p.results.length ? `<section class="m-section"><h3 class="mono">Résultats</h3><div class="m-results">${p.results.map((r) => `<div><strong>${esc(r.value)}</strong><span>${esc(r.label)}</span></div>`).join('')}</div></section>` : ''}
                    <section class="m-section"><h3 class="mono">Stack</h3><ul class="m-stack">${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></section>
                    ${p.team ? `<section class="m-section"><h3 class="mono">Équipe</h3><p>${esc(p.team)}</p></section>` : ''}
                    ${p.links && p.links.length ? `<div class="m-links">${p.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener" data-cursor="Ouvrir">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}
                    ${ch ? `<p class="m-chapter-link">Chapitre lié : <button type="button" data-open-chapter="${ch.id}" data-cursor="Ouvrir">${esc(ch.role)} — ${esc(ch.org.split(' — ')[0])}</button></p>` : ''}
                    ${p.todo && p.todo.length ? `<section class="m-section audit-only"><h3 class="mono">À compléter</h3>${todoList(p.todo)}</section>` : ''}
                </div>
            </div>
            <div class="m-foot">
                <button type="button" data-goto-project="${prev.id}" data-cursor="Préc."><small class="mono">← Projet précédent</small><strong>${esc(prev.title)}</strong></button>
                <button type="button" data-goto-project="${next.id}" data-cursor="Suiv."><small class="mono">Projet suivant →</small><strong>${esc(next.title)}</strong></button>
            </div>`;
    }
    function showMedia(k) {
        const stage = byId('m-stage');
        if (!stage || !mediaList[k]) return;
        mediaIndex = k;
        const m = mediaList[k];
        Gen.unmount(stage);
        stage.innerHTML = m.gen ? `<canvas data-gen="${m.gen}"></canvas>` : `<img src="${esc(m.src)}" alt="${esc(m.caption || '')}" class="${m.cover ? 'is-cover' : ''}">`;
        Gen.mountAll(stage, { big: true });
        byId('m-caption').textContent = m.caption || '';
        $$('.m-thumbs button').forEach((b) => b.classList.toggle('is-active', +b.dataset.media === k));
        if (HAS_GSAP && !REDUCED) gsap.fromTo(stage.firstElementChild, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' });
    }
    function fillModal(p, animate) {
        const body = byId('modal-body');
        Gen.unmount(body);
        body.innerHTML = projectMarkup(p);
        $('.modal-inner').scrollTop = 0;
        Gen.mountAll($('.m-thumbs', body) || document.createElement('div'));
        showMedia(0);
        if (animate && HAS_GSAP && !REDUCED) {
            const words = splitWords(byId('modal-title'));
            gsap.from(words, { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.05, delay: 0.35 });
            gsap.from($$('.m-info > *:not(.m-title)', body), { y: 30, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.45 });
            gsap.from('.m-media', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.3 });
        }
    }
    function openProject(id) {
        const p = projectById(id);
        if (!p) return;
        const modal = byId('modal');
        if (!modal.hidden) { fillModal(p, true); return; }
        pushLayer(modal);
        fillModal(p, true);
        document.body.classList.add('on-dark');
        byId('site-header').classList.add('on-dark');
        if (HAS_GSAP && !REDUCED) gsap.fromTo(modal, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'expo.inOut' });
        else modal.style.clipPath = 'none';
        $('.close-btn', modal).focus({ preventScroll: true });
    }
    function closeProject(then) {
        const modal = byId('modal');
        if (modal.hidden) { then && then(); return; }
        const finish = () => {
            Gen.unmount(byId('modal-body'));
            popLayer(modal);
            syncDarkHeader();
            then && then();
        };
        if (HAS_GSAP && !REDUCED) gsap.to(modal, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'expo.inOut', onComplete: finish });
        else finish();
    }
    document.addEventListener('click', (e) => {
        const g = e.target.closest('[data-goto-project]');
        if (g) { fillModal(projectById(g.dataset.gotoProject), true); return; }
        const m = e.target.closest('[data-media]');
        if (m) showMedia(+m.dataset.media);
    });
    document.addEventListener('keydown', (e) => {
        if (topLayer() !== byId('modal') || e.target.matches('input')) return;
        if (e.key === 'ArrowRight' && mediaList.length > 1) showMedia((mediaIndex + 1) % mediaList.length);
        if (e.key === 'ArrowLeft' && mediaList.length > 1) showMedia((mediaIndex - 1 + mediaList.length) % mediaList.length);
    });

    /* ----- Palette de commandes ----- */
    const Cmdk = { items: [], shown: [], sel: 0 };
    function buildCmdk() {
        const items = [];
        [['profil', '01 · Profil — En 10 secondes'], ['parcours', '02 · Le fil rouge'], ['lab', '03 · Le Lab'], ['stack', '04 · Compétences ↔ preuves'], ['contact', '05 · Contact']]
            .forEach(([id, label]) => items.push({ group: 'Aller à', ico: '↓', label, kw: id, run: () => scrollToTarget(`#${id}`) }));
        D.chapters.filter((c) => !c.isNext).slice().reverse().forEach((c) => items.push({
            group: 'Parcours', ico: '●', label: c.role, sub: `${c.org.split(' — ')[0]} · ${c.dates}`,
            kw: [c.org, c.type, c.pitch, ...(c.skills || []).map(skillLabel)].join(' '), run: () => openChapter(c.id)
        }));
        D.projects.forEach((p) => items.push({
            group: 'Projets', ico: '◆', label: p.title, sub: p.category,
            kw: [p.pitch, ...p.stack, ...(p.skills || []).map(skillLabel)].join(' '), run: () => openProject(p.id)
        }));
        allSkills.forEach((s) => items.push({
            group: 'Compétences', ico: '#', label: s.label, sub: 'voir les preuves', kw: 'skill competence',
            run: () => { scrollToTarget('#stack'); setTimeout(() => Stack.activate(s.id, true), REDUCED ? 0 : 1400); }
        }));
        items.push(
            { group: 'Actions', ico: '⧉', label: 'Copier mon email', sub: P.email, kw: 'mail contact', run: copyEmail },
            { group: 'Actions', ico: '✉', label: 'Écrire un email', sub: 'ouvrir la messagerie', kw: 'mail contact', run: () => { location.href = `mailto:${P.email}`; } },
            { group: 'Actions', ico: 'in', label: 'Ouvrir LinkedIn', kw: 'linkedin reseau', run: () => window.open(P.linkedin, '_blank', 'noopener') },
            { group: 'Actions', ico: '{}', label: 'Ouvrir GitHub', kw: 'github code', run: () => window.open(P.github, '_blank', 'noopener') },
            { group: 'Actions', ico: '◐', label: 'Lentille : tout voir', kw: 'filtre lens all', run: () => { setLens('all'); scrollToTarget('#parcours'); } },
            { group: 'Actions', ico: '◑', label: 'Lentille : Tech & IA', kw: 'filtre lens tech ingenieur', run: () => { setLens('tech'); scrollToTarget('#parcours'); } },
            { group: 'Actions', ico: '◒', label: 'Lentille : Conseil & Management', kw: 'filtre lens conseil management', run: () => { setLens('conseil'); scrollToTarget('#parcours'); } },
            { group: 'Actions', ico: '!', label: 'Mode audit : infos manquantes', sub: 'pour Alexandre', kw: 'todo audit manquant', run: () => setAudit(!state.audit) },
            { group: 'Actions', ico: '↑', label: 'Revenir en haut', kw: 'top haut debut', run: () => scrollToTarget('#hero') }
        );
        Cmdk.items = items;
    }
    function renderCmdk(q) {
        const terms = norm(q).split(/\s+/).filter(Boolean);
        Cmdk.shown = Cmdk.items.filter((it) => {
            const hay = norm(`${it.label} ${it.sub || ''} ${it.kw || ''} ${it.group}`);
            return terms.every((t) => hay.includes(t));
        });
        Cmdk.sel = 0;
        const list = byId('cmdk-list');
        if (!Cmdk.shown.length) { list.innerHTML = `<li class="cmdk-empty">Rien trouvé pour « ${esc(q)} ». Essayez « IA », « audit », « WebGPU »…</li>`; return; }
        let g = '', html = '';
        Cmdk.shown.forEach((it, i) => {
            if (it.group !== g) { g = it.group; html += `<li class="cmdk-group" role="presentation">${esc(g)}</li>`; }
            html += `<li class="cmdk-item" role="option" id="cmdk-opt-${i}" data-i="${i}" aria-selected="${i === 0}"><span class="ci-ico">${esc(it.ico)}</span><span>${esc(it.label)}</span>${it.sub ? `<span class="ci-sub">${esc(it.sub)}</span>` : ''}</li>`;
        });
        list.innerHTML = html;
        byId('cmdk-input').setAttribute('aria-activedescendant', 'cmdk-opt-0');
    }
    function moveCmdk(d) {
        if (!Cmdk.shown.length) return;
        Cmdk.sel = (Cmdk.sel + d + Cmdk.shown.length) % Cmdk.shown.length;
        $$('.cmdk-item').forEach((li) => li.setAttribute('aria-selected', String(+li.dataset.i === Cmdk.sel)));
        const cur = byId(`cmdk-opt-${Cmdk.sel}`);
        cur && cur.scrollIntoView({ block: 'nearest' });
        byId('cmdk-input').setAttribute('aria-activedescendant', `cmdk-opt-${Cmdk.sel}`);
    }
    function runCmdk(i) {
        const it = Cmdk.shown[i];
        if (!it) return;
        closeCmdk(() => it.run());
    }
    function openCmdk() {
        const el = byId('cmdk');
        if (!el.hidden) return;
        pushLayer(el);
        const input = byId('cmdk-input');
        input.value = '';
        renderCmdk('');
        input.focus();
        if (HAS_GSAP && !REDUCED) {
            gsap.fromTo('.cmdk-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo('.cmdk-box', { opacity: 0, y: -16, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'expo.out' });
        }
    }
    function closeCmdk(then) {
        const el = byId('cmdk');
        if (el.hidden) { then && then(); return; }
        const finish = () => { popLayer(el); then && setTimeout(then, 30); };
        if (HAS_GSAP && !REDUCED) {
            gsap.to('.cmdk-backdrop', { opacity: 0, duration: 0.25 });
            gsap.to('.cmdk-box', { opacity: 0, y: -10, scale: 0.98, duration: 0.25, onComplete: finish });
        } else finish();
    }
    function initCmdk() {
        buildCmdk();
        const kbd = IS_MAC ? '⌘K' : 'Ctrl K';
        $$('#cmdk-kbd, .site-footer kbd').forEach((k) => { k.textContent = kbd; });
        $$('[data-cmdk]').forEach((b) => b.addEventListener('click', openCmdk));
        const input = byId('cmdk-input');
        input.addEventListener('input', () => renderCmdk(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); moveCmdk(1); }
            if (e.key === 'ArrowUp') { e.preventDefault(); moveCmdk(-1); }
            if (e.key === 'Enter') { e.preventDefault(); runCmdk(Cmdk.sel); }
        });
        byId('cmdk-list').addEventListener('click', (e) => { const li = e.target.closest('.cmdk-item'); if (li) runCmdk(+li.dataset.i); });
        byId('cmdk-list').addEventListener('pointermove', (e) => {
            const li = e.target.closest('.cmdk-item');
            if (li && +li.dataset.i !== Cmdk.sel) { Cmdk.sel = +li.dataset.i; $$('.cmdk-item').forEach((n) => n.setAttribute('aria-selected', String(n === li))); }
        });
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); byId('cmdk').hidden ? openCmdk() : closeCmdk(); return; }
            if (e.key === '/' && !layers.length && !e.target.matches('input, textarea')) { e.preventDefault(); openCmdk(); }
        });
    }

    /* ----- Mode audit ----- */
    function renderAudit() {
        const groups = [['Profil & contact', P.todo]]
            .concat(D.chapters.map((c) => [`${c.role} — ${c.org.split(' — ')[0]}`, c.todo]))
            .concat(D.projects.map((p) => [`Projet · ${p.title}`, p.todo]))
            .filter(([, t]) => t && t.length);
        const total = groups.reduce((a, [, t]) => a + t.length, 0);
        byId('audit-panel').innerHTML = `
            <h3><span>Mode audit · ${total} infos à compléter</span><button type="button" data-audit-off>Fermer ×</button></h3>
            <p style="color:var(--muted);font-size:12px">Visible uniquement avec <code>?audit</code> dans l’URL. Tout se modifie dans <code>data.js</code>.</p>
            ${groups.map(([g, t]) => `<h4>${esc(g)}</h4><ul>${t.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`).join('')}`;
    }
    function setAudit(on) {
        state.audit = on;
        document.body.classList.toggle('audit', on);
        const panel = byId('audit-panel');
        if (on) renderAudit();
        panel.hidden = !on;
        relayout();
    }
    document.addEventListener('click', (e) => { if (e.target.closest('[data-audit-off]')) setAudit(false); });

    /* ---------------------------------------------------------------------
       17. Header, progression, HUD, horloge
       --------------------------------------------------------------------- */
    function syncDarkHeader() {
        const onDark = labCovering || !byId('modal').hidden;
        byId('site-header').classList.toggle('on-dark', onDark);
        document.body.classList.toggle('on-dark', onDark);
    }
    function initChrome() {
        const header = byId('site-header'), bar = $('.scroll-progress span'), hudP = byId('hud-progress'), hudC = byId('hud-chapter');
        const navLinks = $$('[data-nav]');
        const setActive = (id, name) => {
            navLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.nav === id));
            if (name) hudC.textContent = name;
        };
        if (HAS_GSAP) {
            ScrollTrigger.create({
                start: 0, end: 'max',
                onUpdate: (s) => {
                    const y = s.scroll();
                    bar.style.transform = `scaleX(${s.progress})`;
                    hudP.textContent = String(Math.round(s.progress * 100)).padStart(3, '0');
                    header.classList.toggle('is-solid', y > 40);
                    header.classList.toggle('is-hidden', s.direction === 1 && y > innerHeight * 0.6 && !layers.length);
                    document.body.classList.toggle('at-end', s.end - y < 140);
                }
            });
            $$('main > section').forEach((sec) => {
                ScrollTrigger.create({
                    trigger: sec, start: 'top 50%', end: 'bottom 50%',
                    onToggle: (s) => { if (s.isActive) setActive(sec.id, sec.dataset.chapter); }
                });
            });
            ScrollTrigger.create({ trigger: '#lab', start: 'top 40px', endTrigger: '#stack', end: 'top 40px', onToggle: (s) => { labCovering = s.isActive; syncDarkHeader(); } });
        } else {
            addEventListener('scroll', () => {
                const max = document.documentElement.scrollHeight - innerHeight;
                const p = max > 0 ? scrollY / max : 0;
                bar.style.transform = `scaleX(${p})`;
                header.classList.toggle('is-solid', scrollY > 40);
            }, { passive: true });
        }
        const clock = byId('clock'), tz = byId('clock-tz');
        const fmt = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        let tzName = '';
        try { tzName = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', timeZoneName: 'short' }).formatToParts(new Date()).find((x) => x.type === 'timeZoneName').value; } catch (e) { /* noop */ }
        const tickClock = () => { clock.textContent = fmt.format(new Date()); tz.textContent = tzName; };
        tickClock();
        setInterval(tickClock, 1000);
    }

    /* ---------------------------------------------------------------------
       18. Scène 3D (Three.js) — reprise de la scène d'origine, optimisée
       --------------------------------------------------------------------- */
    const Three = { intro() { } };
    function initThree() {
        if (REDUCED || typeof window.THREE === 'undefined') return;
        const canvas = byId('three-canvas');
        let renderer;
        try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
        catch (e) { return; }
        const small = innerWidth < 768 || !FINE;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5));
        renderer.setSize(innerWidth, innerHeight, false);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
        camera.position.z = 25;
        const group = new THREE.Group();
        scene.add(group);

        const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.2, transmission: 0.4, thickness: 1.5, clearcoat: 1, clearcoatRoughness: 0.1 });
        const organic = glass.clone();
        organic.roughness = 0.3;
        organic.onBeforeCompile = (shader) => {
            shader.uniforms.time = { value: 0 };
            organic.userData.shader = shader;
            shader.vertexShader = `uniform float time;\n${shader.vertexShader}`.replace('#include <begin_vertex>', `
                vec3 transformed = vec3(position);
                float n = sin(position.x * 0.4 + time) * cos(position.y * 0.4 + time) * sin(position.z * 0.4 + time);
                transformed += normal * n * 0.6;`);
        };

        const laptops = [];
        const makeLaptop = (scale, x, y, z, main) => {
            const g = new THREE.Group();
            const screenGeo = new THREE.BoxGeometry(10, 6, 0.2); screenGeo.translate(0, 3, 0);
            const screen = new THREE.Mesh(screenGeo, glass); screen.position.z = -3;
            const base = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 6), glass);
            const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), new THREE.MeshPhysicalMaterial({ color: 0xd9381e, metalness: 0.1, roughness: 0.2, transmission: 0.8, thickness: 1 }));
            core.position.set(0, 3, -0.5);
            g.add(screen, base, core);
            g.scale.setScalar(scale);
            g.position.set(x, y, z);
            if (!main) g.rotation.set(rnd(Math.PI), rnd(Math.PI), rnd(Math.PI));
            g.userData = { screen, core, baseY: y, float: rnd(0.02, 0.07), rx: main ? 0 : rnd(-0.005, 0.005), ry: main ? 0 : rnd(-0.005, 0.005), spin: { x: 0, y: 0 }, s: scale };
            group.add(g); laptops.push(g);
        };
        makeLaptop(small ? 0.8 : 1, 0, -7, 0, true);
        for (let i = 0; i < 2; i++) makeLaptop(rnd(0.2, 0.6), rnd(-30, 30), rnd(-75, 75), rnd(-20, 0), false);

        const blobGeo = new THREE.SphereGeometry(3, small ? 32 : 48, small ? 32 : 48);
        const blobs = [];
        for (let i = 0; i < (small ? 12 : 24); i++) {
            const m = new THREE.Mesh(blobGeo, organic);
            const s = rnd(0.5, 1);
            m.scale.setScalar(s);
            m.position.set(rnd(-25, 25), rnd(-75, 75), rnd(-15, 5));
            m.rotation.set(rnd(Math.PI), rnd(Math.PI), 0);
            m.userData = { rx: rnd(-0.01, 0.01), ry: rnd(-0.01, 0.01), float: rnd(0.01, 0.03), bx: m.position.x, by: m.position.y, tx: m.position.x, ty: m.position.y, spin: { x: 0, y: 0 }, s };
            group.add(m); blobs.push(m);
        }

        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const dir = new THREE.DirectionalLight(0xffeedd, 0.6); dir.position.set(5, 10, 7); scene.add(dir);
        const acc1 = new THREE.PointLight(0xd9381e, 2, 50); acc1.position.set(0, 5, 5); scene.add(acc1);
        const acc2 = new THREE.PointLight(0xff6b35, 1.5, 50); acc2.position.set(-10, -20, 5); scene.add(acc2);

        let mx = 0, my = 0, dx = 0, dy = 0, moved = false;
        const ray = new THREE.Raycaster(), mv = new THREE.Vector2(), look = new THREE.Vector3();
        addEventListener('pointermove', (e) => {
            mx = (e.clientX / innerWidth) * 2 - 1; my = -(e.clientY / innerHeight) * 2 + 1;
            mv.set(mx, my); dx += e.movementX || 0; dy += e.movementY || 0; moved = true;
        }, { passive: true });

        // Intro : apparition élastique
        [...laptops, ...blobs].forEach((o) => o.scale.setScalar(0.0001));
        Three.intro = () => {
            canvas.classList.add('is-ready');
            [...laptops, ...blobs].forEach((o) => {
                const s = o.userData.s;
                if (HAS_GSAP) gsap.to(o.scale, { x: s, y: s, z: s, duration: 2.4, ease: 'elastic.out(1, 0.4)', delay: 0.2 + rnd(1.4) });
                else o.scale.setScalar(s);
            });
        };

        let cy = 0;
        const loop = () => {
            requestAnimationFrame(loop);
            if (document.hidden || labCovering || !byId('modal').hidden) return;
            const t = performance.now() * 0.001;
            if (organic.userData.shader) organic.userData.shader.uniforms.time.value = t * 1.5;
            const max = document.documentElement.scrollHeight - innerHeight;
            const prog = max > 0 ? scrollY / max : 0;
            cy += (-prog * 100 - cy) * 0.08;
            group.rotation.y += (prog * Math.PI - group.rotation.y) * 0.08;
            dir.position.x = 5 - prog * 15; dir.position.y = 10 - prog * 15;

            if (moved) {
                ray.setFromCamera(mv, camera);
                const hit = ray.intersectObjects(group.children, true)[0];
                if (hit) {
                    let o = hit.object;
                    while (o.parent && o.parent !== group) o = o.parent;
                    if (o.userData.spin) { o.userData.spin.x += dy * 0.004; o.userData.spin.y += dx * 0.004; }
                    if (blobs.includes(o)) { o.userData.tx = o.userData.bx + mx * 5; o.userData.ty = o.userData.by + my * 5; }
                }
                moved = false; dx = 0; dy = 0;
            }
            laptops.forEach((l, i) => {
                const u = l.userData;
                l.position.y = u.baseY + Math.sin(t * 1.5 * u.float + i) * 3;
                l.rotation.x += u.rx + u.spin.x; l.rotation.y += u.ry + u.spin.y;
                u.spin.x *= 0.95; u.spin.y *= 0.95;
                u.screen.rotation.x = -0.1 - Math.abs(Math.sin(t * 0.8 + i)) * 1.5;
                u.core.rotation.x += 0.02; u.core.rotation.y += 0.03;
            });
            blobs.forEach((m, i) => {
                const u = m.userData;
                m.rotation.x += u.rx + u.spin.x; m.rotation.y += u.ry + u.spin.y;
                u.spin.x *= 0.95; u.spin.y *= 0.95;
                const fy = u.by + Math.sin(t * u.float * 50 + i) * 2;
                u.tx += (u.bx - u.tx) * 0.03; u.ty += (fy - u.ty) * 0.05;
                m.position.x += (u.tx - m.position.x) * 0.1; m.position.y += (u.ty - m.position.y) * 0.1;
            });
            camera.position.x += (mx * 3 - camera.position.x) * 0.05;
            camera.position.y += (my * 3 + cy - camera.position.y) * 0.05;
            look.set(0, cy - 5, 0);
            camera.lookAt(look);
            renderer.render(scene, camera);
        };
        loop();
        addEventListener('resize', debounce(() => {
            camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
            renderer.setSize(innerWidth, innerHeight, false);
        }, 120));
    }

    /* ---------------------------------------------------------------------
       19. Démarrage
       --------------------------------------------------------------------- */
    function relayout() {
        movePill();
        Thread.build();
        if (HAS_GSAP) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
        Stack.draw(false);
    }

    function boot() {
        scrollTo(0, 0);
        renderHero();
        renderStatement();
        renderStats();
        renderChapters();
        renderProjects();
        renderStack();
        renderContact();

        initLenis();
        initCursor();
        initHero();
        initMarquee();
        initReveals();
        initHybrid();
        initLens();
        initThread();
        initLab();
        Stack.init();
        initContact();
        initCmdk();
        initChrome();
        initThree();
        if (START_AUDIT) setAudit(true);

        const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
        fontsReady.then(relayout);
        addEventListener('load', () => setTimeout(relayout, 50));
        let lastW = innerWidth;
        addEventListener('resize', debounce(() => { if (innerWidth !== lastW) { lastW = innerWidth; relayout(); } }, 200));
        if (HAS_GSAP) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }

        runPreloader(() => {
            document.body.classList.remove('is-loading');
            if (lenis) lenis.start();
            heroIntro();
            Three.intro();
        });

        console.info('%c Alexandre Le Port — CV interactif ', 'background:#D9381E;color:#fff;padding:4px 8px;border-radius:4px',
            '\nAstuce : ajoutez ?audit à l’URL pour voir les infos manquantes. Ctrl/⌘ K pour tout explorer.');
    }

    boot();
})();
