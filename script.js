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

  // Lantern flicker (radius jitter)
  if (!reduceMotion) {
    setInterval(() => root.style.setProperty("--r", 160 + Math.random() * 25 + "px"), 120);
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
})();
