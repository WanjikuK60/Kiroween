(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Lantern follows pointer
  const move = (x, y) => {
    root.style.setProperty("--x", x + "px");
    root.style.setProperty("--y", y + "px");
  };
  addEventListener("pointermove", (e) => move(e.clientX, e.clientY), { passive: true });
  addEventListener("pointerdown", (e) => move(e.clientX, e.clientY), { passive: true });
  // Touch scrolling cancels pointer events, so follow the finger with touch events too
  const touch = (e) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); };
  addEventListener("touchstart", touch, { passive: true });
  addEventListener("touchmove", touch, { passive: true });
  move(innerWidth / 2, innerHeight * 0.4);

  // Lantern flicker (radius jitter). Skipped while the lantern is off.
  if (!reduceMotion) {
    setInterval(() => {
      if (body.classList.contains("lantern-off")) return;
      root.style.setProperty("--r", 160 + Math.random() * 25 + "px");
    }, 120);
  }

  const lanternBtn = document.getElementById("lantern-toggle");
  lanternBtn.addEventListener("click", () => {
    const off = body.classList.toggle("lantern-off");
    lanternBtn.textContent = "Lantern: " + (off ? "off" : "on");
    lanternBtn.setAttribute("aria-pressed", String(!off));
  });

  // Rooms fade in as you reach them
  const rooms = document.querySelectorAll(".room");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  rooms.forEach((r) => io.observe(r));

  // Drifting fog on canvas
  const canvas = document.getElementById("fog");
  const ctx = canvas.getContext("2d");
  let puffs = [];
  const resize = () => {
    canvas.width = innerWidth; canvas.height = innerHeight;
    puffs = Array.from({ length: 14 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: 120 + Math.random() * 220, vx: 0.1 + Math.random() * 0.25,
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of puffs) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, "rgba(150,150,180,.18)");
      g.addColorStop(1, "rgba(150,150,180,0)");
      ctx.fillStyle = g;
      ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      if (!reduceMotion) { p.x += p.vx; if (p.x - p.r > canvas.width) p.x = -p.r; }
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  };
  addEventListener("resize", () => { resize(); if (reduceMotion) draw(); });
  resize(); draw();

  // Occasional ghost flyby
  const ghost = document.getElementById("ghost");
  if (!reduceMotion) {
    const haunt = () => {
      ghost.style.top = 10 + Math.random() * 70 + "%";
      ghost.classList.remove("fly"); void ghost.offsetWidth; ghost.classList.add("fly");
      setTimeout(haunt, 15000 + Math.random() * 15000);
    };
    setTimeout(haunt, 6000);
  }

  // Wind ambience generated with WebAudio (no audio files, off by default)
  const soundBtn = document.getElementById("sound-toggle");
  let audio, gain;
  const startWind = () => {
    audio = new (window.AudioContext || window.webkitAudioContext)();
    const len = audio.sampleRate * 2;
    const buf = audio.createBuffer(1, len, audio.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    const src = audio.createBufferSource(); src.buffer = buf; src.loop = true;
    const filter = audio.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 500;
    const lfo = audio.createOscillator(); lfo.frequency.value = 0.15;
    const lfoGain = audio.createGain(); lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(filter.frequency);
    gain = audio.createGain(); gain.gain.value = 0.4;
    src.connect(filter).connect(gain).connect(audio.destination);
    src.start(); lfo.start();
  };
  soundBtn.addEventListener("click", () => {
    const on = soundBtn.getAttribute("aria-pressed") !== "true";
    if (on && !audio) startWind();
    if (audio) on ? audio.resume() : audio.suspend();
    soundBtn.setAttribute("aria-pressed", String(on));
    soundBtn.textContent = "Wind: " + (on ? "on" : "off");
  });
  // Lights: a readable parchment theme that turns off the lantern and fog
  const lightsBtn = document.getElementById("lights-toggle");
  const setLights = (on) => {
    body.classList.toggle("lights-on", on);
    lightsBtn.textContent = "Lights: " + (on ? "on" : "off");
    lightsBtn.setAttribute("aria-pressed", String(on));
    try { localStorage.setItem("haunted-lights", on ? "on" : "off"); } catch { /* storage blocked */ }
  };
  lightsBtn.addEventListener("click", () => setLights(!body.classList.contains("lights-on")));
  try { if (localStorage.getItem("haunted-lights") === "on") setLights(true); } catch { /* storage blocked */ }

  // Ghost hunt: three hidden ghosts unlock a secret message
  const ghosts = document.querySelectorAll(".hidden-ghost");
  const ghostCount = document.getElementById("ghost-count");
  const secret = document.getElementById("secret");
  const secretClose = document.getElementById("secret-close");
  let lastFocus = null;
  const found = new Set();
  const openSecret = () => {
    lastFocus = document.activeElement;
    secret.hidden = false;
    secretClose.focus();
  };
  const closeSecret = () => {
    secret.hidden = true;
    if (lastFocus) lastFocus.focus();
  };
  ghosts.forEach((g) => g.addEventListener("click", () => {
    if (found.has(g.dataset.ghost)) return;
    found.add(g.dataset.ghost);
    g.classList.add("found");
    g.setAttribute("aria-label", "Ghost found");
    ghostCount.textContent = found.size === ghosts.length
      ? "All " + ghosts.length + " ghosts found! 🎉"
      : "Ghosts found: " + found.size + " of " + ghosts.length;
    if (found.size === ghosts.length) setTimeout(openSecret, 700);
  }));
  secretClose.addEventListener("click", closeSecret);
  secret.addEventListener("click", (e) => { if (e.target === secret) closeSecret(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !secret.hidden) closeSecret(); });

  // Portraits flip on hover or focus; tapping flips them on touch screens
  document.querySelectorAll(".card.flip").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      card.classList.toggle("flipped");
    });
  });

  // Potion filters for the projects
  const potions = document.querySelectorAll(".potion");
  const cards = document.querySelectorAll(".card.flip");
  const filterStatus = document.getElementById("filter-status");
  potions.forEach((p) => p.addEventListener("click", () => {
    const tag = p.dataset.filter;
    potions.forEach((q) => q.setAttribute("aria-pressed", String(q === p)));
    let shown = 0;
    cards.forEach((c) => {
      const match = tag === "all" || c.dataset.tags.split(" ").includes(tag);
      c.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    filterStatus.textContent = tag === "all" ? "" : "Showing " + shown + " of " + cards.length + " projects.";
  }));
})();
