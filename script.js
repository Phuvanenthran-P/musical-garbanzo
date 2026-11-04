/* ============ EDIT ME: personalization ============ */
const CONFIG = {
  friendName: "Asif",
  myName: "Your Best Friend",          // shown as the sign-off on the last screen
  videoPath: "assets/birthday-song.mp4",
  game: { goal: 10 }                   // gifts he must catch to unlock the surprise
};
/* ============ end of personalization ============ */

// The site is click-through (no scrolling), so the scroll observers below are switched off.
window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };

(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 700px)").matches;   // fewer particles on phones

  // Personalize
  document.querySelectorAll("[data-friend]").forEach(e => e.textContent = CONFIG.friendName);
  document.querySelectorAll("[data-me]").forEach(e => e.textContent = CONFIG.myName);
  document.title = `Happy Birthday, ${CONFIG.friendName}!`;

  // Stars
  const stars = $("#stars");
  for (let i = 0; i < (small ? 25 : 60); i++) {
    const s = document.createElement("i");
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 4}s`;
    stars.appendChild(s);
  }

  // Video
  const video = $("#song"), vidErr = $("#vidError");
  video.addEventListener("error", () => { vidErr.hidden = false; video.controls = false; }, true);
  video.src = CONFIG.videoPath;

  // Effects canvas (confetti + fireworks)
  const cv = $("#fx"), ctx = cv.getContext("2d");
  let W, H, parts = [], raf = 0;
  const fit = () => { const d = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  fit(); addEventListener("resize", fit);
  const GOLDS = ["#d4af37", "#ffe08a", "#fff3c4", "#b8860b", "#ffffff"];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function confetti(n = 140) {
    if (reduced) n = 25; else if (small) n = Math.round(n * .45);
    for (let i = 0; i < n; i++) parts.push({ t: "c", x: Math.random() * W, y: -20 - Math.random() * H * .4, vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - .5) * .3, w: 6 + Math.random() * 6, h: 4 + Math.random() * 6, col: pick(GOLDS), life: 1 });
    run();
  }
  function burst(x, y) {
    const col = pick(GOLDS), n = reduced ? 15 : small ? 28 : 70;
    for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n, v = 1 + Math.random() * 4.5; parts.push({ t: "f", x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, col, life: 1 }); }
    run();
  }
  let fwTimer;
  function fireworks(count = 7) {
    clearTimeout(fwTimer); let i = 0;
    (function next() { if (i++ >= count) return; burst(W * (.15 + Math.random() * .7), H * (.12 + Math.random() * .35)); fwTimer = setTimeout(next, reduced ? 700 : 450); })();
  }
  function run() { if (!raf) raf = requestAnimationFrame(tick); }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    parts = parts.filter(p => p.life > 0 && p.y < H + 30);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.t === "f") { p.vy += .05; p.vx *= .985; p.life -= .014; ctx.globalAlpha = Math.max(p.life, 0); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 7); ctx.fill(); }
      else { p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }
    }
    ctx.globalAlpha = 1;
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!raf) ctx.clearRect(0, 0, W, H);
  }

  window.FX = { confetti, burst, fireworks };
  // Open surprise
  const sections = [...document.querySelectorAll(".screen")];
  $("#openBtn").addEventListener("click", () => {
    confetti(80);
    $("#cake").scrollIntoView({ behavior: "auto" });  // page stays locked until the candles are blown
  });

  // Dots navigation
  const dots = $("#dots");
  sections.forEach((s, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", s.dataset.title || "Start");
    b.addEventListener("click", () => s.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }));
    dots.appendChild(b);
  });

  // Reveal on scroll
  const typed = new WeakSet();
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    if (el.classList.contains("reveal")) el.classList.add("in");
    if (el.id === "wish" && !typed.has(el)) {
      typed.add(el);
      letter.querySelectorAll("p").forEach((p, i) => setTimeout(() => p.classList.add("in"), reduced ? 0 : 900 * i));
    }
    if (el.id === "finale" && !el.dataset.done) { el.dataset.done = 1; fireworks(); confetti(); }
  }), { threshold: .45 });
  sections.forEach(s => io.observe(s));
  document.querySelectorAll(".card").forEach((c, i) => { c.style.transitionDelay = i * .15 + "s"; io.observe(c); });
  const io2 = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { const i = sections.indexOf(e.target); [...dots.children].forEach((d, j) => d.classList.toggle("on", i === j)); }
  }), { threshold: .55 });
  sections.forEach(s => io2.observe(s));

  // Cake
  const cake = $("#cakeBox"), dream = $("#dream"), blow = $("#blowBtn");
  blow.addEventListener("click", () => {
    if (cake.classList.contains("out")) return;
    cake.classList.add("out"); dream.classList.add("show"); confetti(); blow.disabled = true; blow.style.opacity = .5;
  });

  // Replay
  $("#againBtn")?.addEventListener("click", () => {
    fireworks(8); confetti(160);
    cake.classList.remove("out"); dream.classList.remove("show"); blow.disabled = false; blow.style.opacity = 1;
  });

  // Start at top on reload
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);
})();

/* ============ Cinematic extras ============ */
(() => {
  "use strict";
  const $ = s => document.querySelector(s), body = document.body;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FX = window.FX || {};

  // Split headlines into animated letters
  document.querySelectorAll(".screen h2").forEach(h => {
    const t = h.textContent; h.setAttribute("aria-label", t); h.textContent = ""; h.classList.add("split");
    let i = 0;
    t.split(" ").forEach(w => {
      const ws = document.createElement("span"); ws.className = "w"; ws.setAttribute("aria-hidden", "true");
      [...w].forEach(c => { const l = document.createElement("span"); l.className = "ltr"; l.style.setProperty("--i", i++); l.textContent = c; ws.appendChild(l); });
      h.append(ws, " ");
    });
  });

  // Replayable "live" state for each screen
  const secs = [...document.querySelectorAll(".screen")];
  const live = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("live", e.isIntersecting)), { threshold: .4 });
  secs.forEach(s => live.observe(s));

  // Curtain open
  $("#openBtn").addEventListener("click", () => {
    body.classList.add("opened");
    setTimeout(() => FX.fireworks && FX.fireworks(4), reduced ? 0 : 700);
    setTimeout(() => body.classList.add("done"), reduced ? 0 : 2000);
  });

  // Spotlight follows pointer
  const glow = $("#glow");
  addEventListener("pointermove", e => { glow.style.setProperty("--x", e.clientX + "px"); glow.style.setProperty("--y", e.clientY + "px"); }, { passive: true });

  // Scroll progress + star parallax
  let tk = 0;
  addEventListener("scroll", () => {
    if (tk) return;
    tk = requestAnimationFrame(() => {
      tk = 0; const m = document.documentElement.scrollHeight - innerHeight;
      body.style.setProperty("--p", m > 0 ? scrollY / m : 0);
      if (!reduced) $("#stars").style.setProperty("--sy", scrollY);
    });
  }, { passive: true });

  // Lights go out at the cake until candles are blown
  const cake = $("#cakeBox");
  new IntersectionObserver(es => es.forEach(e => body.classList.toggle("dark", e.isIntersecting && !cake.classList.contains("out"))), { threshold: .6 }).observe($("#cake"));
  let toVideo = false;
  $("#blowBtn").addEventListener("click", () => {
    if (toVideo) return; toVideo = true;
    setTimeout(() => window.goTo && window.goTo("video"), 2200);
  });
  $("#blowBtn").addEventListener("click", () => { body.classList.remove("dark"); setTimeout(() => FX.fireworks && FX.fireworks(2), 500); });
})();

/* ============ Unlock game ============ */
(() => {
  "use strict";
  const $ = s => document.querySelector(s), FX = window.FX || {};
  const goal = (CONFIG.game && CONFIG.game.goal) || 10;
  const ov = $("#game"), cv = $("#gc"), ctx = cv.getContext("2d");
  let W, H, items = [], score = 0, run = false, last = 0, spawn = 1, bx = 0, t0 = 0;
  const keys = {};
  const fit = () => { const d = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); bx = Math.min(Math.max(bx, 55), W - 55); };
  addEventListener("resize", fit);
  const say = t => { const m = $("#gmsg"); m.textContent = t; m.classList.add("on"); clearTimeout(say.t); say.t = setTimeout(() => m.classList.remove("on"), 900); };
  const hud = () => { $("#score").textContent = `${score} / ${goal}`; $("#fill").style.width = (score / goal * 100) + "%"; };

  function start() {
    score = 0; items = []; spawn = 1; ov.hidden = false; $("#skip").hidden = true;
    fit(); bx = W / 2; hud(); run = true; last = t0 = performance.now(); requestAnimationFrame(loop);
  }
  function win() {
    if (!run) return; run = false; score = goal; hud(); say("Unlocked!");
    if (FX.confetti) FX.confetti(120);
    setTimeout(() => { ov.hidden = true; $("#openBtn").click(); }, 1200);
  }
  function loop(now) {
    if (!run) return;
    const dt = Math.min((now - last) / 1000, .05); last = now;
    spawn -= dt;
    if (spawn <= 0) { spawn = Math.max(.35, .85 - score * .04); items.push({ x: 30 + Math.random() * (W - 60), y: -30, v: 150 + score * 14 + Math.random() * 60, bad: Math.random() < .22, rot: Math.random() * 6 }); }
    if (keys.ArrowLeft || keys.a) bx -= 560 * dt;
    if (keys.ArrowRight || keys.d) bx += 560 * dt;
    bx = Math.min(Math.max(bx, 55), W - 55);
    const py = H - 80;
    items = items.filter(it => {
      it.y += it.v * dt; it.rot += dt * 2;
      if (it.y > py - 25 && it.y < py + 20 && Math.abs(it.x - bx) < 66) {
        if (it.bad) { score = Math.max(0, score - 1); say("Burnt toast! -1"); }
        else { score++; if (FX.burst) FX.burst(it.x, it.y); }
        hud(); return false;
      }
      return it.y < H + 40;
    });
    if (score >= goal) win();
    if (now - t0 > 25000) $("#skip").hidden = false;
    draw(py); requestAnimationFrame(loop);
  }
  function draw(py) {
    ctx.clearRect(0, 0, W, H);
    for (const it of items) {
      ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(Math.sin(it.rot) * .4);
      if (it.bad) {
        ctx.fillStyle = "#1f1f1f"; ctx.strokeStyle = "#8a8a8a"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, 7); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(8, 8); ctx.moveTo(8, -8); ctx.lineTo(-8, 8); ctx.stroke();
      } else {
        ctx.fillStyle = "#d4af37"; ctx.fillRect(-18, -18, 36, 36);
        ctx.fillStyle = "#fff3c4"; ctx.fillRect(-4, -18, 8, 36); ctx.fillRect(-18, -4, 36, 8);
      }
      ctx.restore();
    }
    ctx.save(); ctx.fillStyle = "#d4af37";
    ctx.beginPath(); ctx.moveTo(bx - 62, py); ctx.lineTo(bx + 62, py); ctx.lineTo(bx + 46, py + 24); ctx.lineTo(bx - 46, py + 24); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  $("#playBtn").addEventListener("click", start);
  $("#skip").addEventListener("click", win);
  ov.addEventListener("pointermove", e => { bx = e.clientX; });
  ov.addEventListener("pointerdown", e => { bx = e.clientX; });
  addEventListener("keydown", e => { keys[e.key] = true; });
  addEventListener("keyup", e => { keys[e.key] = false; });
})();

/* ============ Click-through stages ============ */
(() => {
  "use strict";
  const $ = s => document.querySelector(s), body = document.body, FX = window.FX || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const order = ["intro", "cake", "video", "finale"];  // must match section order in index.html
  const el = Object.fromEntries(order.map(i => [i, $("#" + i)]));
  let cur = null, timers = [];
  const later = (f, t) => timers.push(setTimeout(f, reduced ? 0 : t));
  const all = s => document.querySelectorAll(s);
  function enter(id) {
    if (id === "wish") all("#letter p").forEach((p, i) => later(() => p.classList.add("in"), 700 + 900 * i));
    if (id === "funny") all(".card").forEach((c, i) => later(() => c.classList.add("in"), 500 + 200 * i));
    if (id === "cake") later(() => { if (!$("#cakeBox").classList.contains("out")) body.classList.add("dark"); }, 600);
    if (id === "finale") later(() => { FX.fireworks && FX.fireworks(); FX.confetti && FX.confetti(); }, 700);
  }
  function leave(id) {
    timers.forEach(clearTimeout); timers = [];
    if (id === "video") $("#song").pause();
    if (id === "cake") body.classList.remove("dark");
    if (id === "wish") all("#letter p").forEach(p => p.classList.remove("in"));
    if (id === "funny") all(".card").forEach(c => c.classList.remove("in"));
  }
  function goTo(id) {
    if (!el[id] || cur === id) return;
    if (cur) { leave(cur); el[cur].classList.remove("active", "live"); }
    cur = id; el[id].classList.add("active", "live");
    body.style.setProperty("--p", order.indexOf(id) / (order.length - 1));
    enter(id);
  }
  window.goTo = goTo;
  // Full screen: starts on the first tap (needs a tap by browser rules); a button covers Esc / re-entry
  const root = document.documentElement, fsBtn = $("#fsBtn");
  const canFs = !!(root.requestFullscreen || root.webkitRequestFullscreen);
  const isFs = () => document.fullscreenElement || document.webkitFullscreenElement;
  const goFs = () => { try { const p = (root.requestFullscreen || root.webkitRequestFullscreen).call(root); if (p && p.catch) p.catch(() => {}); } catch (e) {} };
  const sync = () => { fsBtn.hidden = !canFs || !!isFs(); };
  sync();
  ["fullscreenchange", "webkitfullscreenchange"].forEach(ev => document.addEventListener(ev, sync));
  fsBtn.addEventListener("click", goFs);
  $("#playBtn").addEventListener("click", () => { if (canFs && !isFs()) goFs(); });
  goTo("intro");
  const song = $("#song");
  song.addEventListener("ended", () => {   // video over -> the page ends on the final card
    if (document.fullscreenElement === song && document.exitFullscreen) document.exitFullscreen();
    if (song.webkitExitFullscreen) try { song.webkitExitFullscreen(); } catch (e) {}
    goTo("finale");
  });
  song.addEventListener("error", () => { $("#vidSkip").hidden = false; }, true);   // never leave him stuck
  $("#openBtn").addEventListener("click", () => goTo("cake"));   // fired when the game is won
  all("[data-next]").forEach(b => b.addEventListener("click", () => goTo(order[order.indexOf(cur) + 1])));
})();
