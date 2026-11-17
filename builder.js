// The Summoning Circle: turns the form into a stand-alone haunted portfolio
// (one HTML file with its own styles and lantern script), shows it in a
// sandboxed preview, and lets the visitor download it.
(() => {
  const form = document.getElementById("builder-form");
  const preview = document.getElementById("builder-preview");
  const status = document.getElementById("builder-status");
  if (!form || !preview) return;

  const escapeHTML = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Only allow ordinary web links, so a pasted "javascript:" URL can't run code.
  const safeUrl = (value) => {
    try {
      const url = new URL(String(value).trim());
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch {
      return "";
    }
  };
  const safeEmail = (value) => (/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(value.trim()) ? value.trim() : "");

  const readForm = () => {
    const data = Object.fromEntries(new FormData(form));
    const projects = data.projects
      .split("\n")
      .map((line) => line.split("|").map((part) => part.trim()))
      .filter(([name]) => name)
      .slice(0, 12)
      .map(([name, description = "", link = ""]) => ({ name, description, link: safeUrl(link) }));
    const skills = data.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 30);
    return {
      name: data.name.trim() || "A Mysterious Developer",
      tagline: data.tagline.trim(),
      about: data.about.trim(),
      skills,
      projects,
      email: safeEmail(data.email || ""),
      github: safeUrl(data.github || ""),
    };
  };

  // In the preview the lantern starts off, so the whole page is visible at once.
  const buildPage = (d, { preview = false } = {}) => {
    const projectCards = d.projects.map((p) => `
        <article class="card">
          <h3>${escapeHTML(p.name)}</h3>
          ${p.description ? `<p>${escapeHTML(p.description)}</p>` : ""}
          ${p.link ? `<a href="${escapeHTML(p.link)}" rel="noopener">Visit</a>` : ""}
        </article>`).join("");
    const skills = d.skills.map((s) => `<li>${escapeHTML(s)}</li>`).join("");
    const contact = [
      d.email ? `<a href="mailto:${escapeHTML(d.email)}">Email</a>` : "",
      d.github ? `<a href="${escapeHTML(d.github)}" rel="noopener">GitHub</a>` : "",
    ].join(" ");

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHTML(d.name)} | Haunted Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Creepster&family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet">
<style>
  :root { --bg: #07060b; --ink: #d9d4c7; --dim: #8a8478; --accent: #ff7a1a; --glow: rgba(255,150,40,.55); --r: 170px; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: "IM Fell English", Georgia, serif; font-size: 1.1rem; line-height: 1.7; }
  #darkness { position: fixed; inset: 0; z-index: 50; pointer-events: none;
    background: radial-gradient(circle var(--r) at var(--x,50%) var(--y,40%), transparent 0%, rgba(0,0,0,.3) 55%, rgba(0,0,0,.82) 100%); transition: opacity .4s; }
  body.lit #darkness { opacity: 0; }
  header { min-height: 90vh; display: grid; place-content: center; text-align: center; padding: 2rem; }
  h1 { font-family: Creepster, cursive; font-weight: 400; font-size: clamp(3rem, 11vw, 7rem); margin: .2em 0; color: #f3e9d2;
    text-shadow: 0 0 12px var(--glow), 0 0 40px var(--glow); animation: flicker 5s infinite; }
  @keyframes flicker { 0%,18%,22%,62%,64%,100% { opacity: 1; } 20%,63% { opacity: .35; } 21% { opacity: .8; } }
  .whisper, .tagline { color: var(--dim); font-style: italic; }
  button { font: inherit; color: var(--ink); background: transparent; border: 1px solid var(--accent); padding: .4rem 1.1rem; cursor: pointer; }
  button:hover, button:focus-visible { background: var(--accent); color: #000; }
  main { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
  section { margin-bottom: 4.5rem; }
  h2 { font-family: Creepster, cursive; font-weight: 400; font-size: clamp(2rem, 6vw, 3rem); color: var(--accent); margin: 0 0 1rem; text-shadow: 0 0 14px var(--glow); }
  h2 small { font-family: "IM Fell English", serif; font-size: 1rem; color: var(--dim); margin-left: .6rem; letter-spacing: .15em; text-transform: uppercase; }
  .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); }
  .card { border: 1px solid #2c2736; background: rgba(15,12,22,.85); padding: 1.1rem; transition: transform .3s, box-shadow .3s, border-color .3s; }
  .card:hover, .card:focus-within { transform: translateY(-4px) rotate(-.4deg); border-color: var(--accent); box-shadow: 0 0 25px var(--glow); }
  .card h3 { margin: 0 0 .3rem; color: #f3e9d2; }
  .skills { list-style: none; display: flex; flex-wrap: wrap; gap: .6rem; padding: 0; }
  .skills li { border: 1px solid #3a3346; padding: .2rem .9rem; border-radius: 99px; }
  a { color: var(--accent); }
  a:focus-visible, button:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  .links { display: flex; gap: 1.5rem; font-size: 1.3rem; }
  footer { text-align: center; color: var(--dim); padding: 2rem 1rem 4rem; font-size: .9rem; }
.toast { position: fixed; left: 50%; bottom: 1.5rem; z-index: 100; transform: translate(-50%, 1rem); max-width: calc(100% - 2rem);
  background: #120f19; color: #f3e9d2; border: 1px solid var(--accent); box-shadow: 0 0 20px var(--glow); padding: .6rem 1.1rem;
  font-size: 1rem; opacity: 0; pointer-events: none; transition: opacity .3s, transform .3s; }
.toast.show { opacity: 1; transform: translate(-50%, 0); }
  @media (prefers-reduced-motion: reduce) { h1 { animation: none; } .toast { transition: none; } }
</style>
</head>
<body${preview ? ' class="lit"' : ""}>
<div id="darkness" aria-hidden="true"></div>
<header>
  <p class="whisper">Enter, if you dare...</p>
  <h1>${escapeHTML(d.name)}</h1>
  ${d.tagline ? `<p class="tagline">${escapeHTML(d.tagline)}</p>` : ""}
  <p><button id="lantern" type="button" aria-pressed="${preview ? "false" : "true"}">Lantern: ${preview ? "off" : "on"}</button></p>
</header>
<main>
  ${d.about ? `<section aria-labelledby="a"><h2 id="a">The Library <small>About</small></h2><p>${escapeHTML(d.about)}</p></section>` : ""}
  ${projectCards ? `<section aria-labelledby="p"><h2 id="p">The Cellar <small>Projects</small></h2><div class="grid">${projectCards}
  </div></section>` : ""}
  ${skills ? `<section aria-labelledby="s"><h2 id="s">The Attic <small>Skills</small></h2><ul class="skills">${skills}</ul></section>` : ""}
  ${contact.trim() ? `<section aria-labelledby="c"><h2 id="c">The Séance <small>Contact</small></h2><p class="links">${contact}</p></section>` : ""}
</main>
<footer>Summoned with <a href="https://wanjikuk60.github.io/Kiroween/" rel="noopener">The Haunted Portfolio</a> by Wanjiku Kamande.</footer>
<script>
  const root = document.documentElement;
  const move = (x, y) => { root.style.setProperty("--x", x + "px"); root.style.setProperty("--y", y + "px"); };
  addEventListener("pointermove", (e) => move(e.clientX, e.clientY), { passive: true });
  addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
  move(innerWidth / 2, innerHeight * 0.4);
  const btn = document.getElementById("lantern");
  btn.addEventListener("click", () => {
    const lit = document.body.classList.toggle("lit");
    btn.textContent = "Lantern: " + (lit ? "off" : "on");
    btn.setAttribute("aria-pressed", String(!lit));
  });
  // Email links: mailto only works when an email app is set up, so open Gmail and copy the address instead
  const toast = document.createElement("div");
  toast.className = "toast"; toast.setAttribute("role", "status"); toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
  let toastTimer;
  const showToast = (text) => {
    toast.textContent = text; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 4000);
  };
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fall back below */ }
    const area = document.createElement("textarea");
    area.value = text; area.setAttribute("readonly", ""); area.style.position = "fixed"; area.style.opacity = "0";
    document.body.appendChild(area); area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    area.remove();
    return ok;
  };
  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.addEventListener("click", async (event) => {
      const address = decodeURIComponent(link.getAttribute("href").slice(7).split("?")[0]);
      // Open a Gmail "New message" with the address filled in, and copy it for other email services
      event.preventDefault();
      window.open("https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(address), "_blank", "noopener");
      showToast((await copyText(address)) ? "📋 Opening Gmail. Address copied too: " + address : "✉️ Email me at " + address);
    });
  });
<\/script>
</body>
</html>`;
  };

  let timer;
  const refresh = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { preview.srcdoc = buildPage(readForm(), { preview: true }); }, 250);
  };

  form.addEventListener("input", refresh);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readForm();
    const blob = new Blob([buildPage(data)], { type: "text/html" });
    const link = document.createElement("a");
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my";
    link.href = URL.createObjectURL(blob);
    link.download = `${slug}-haunted-portfolio.html`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    status.textContent = `Summoned! Saved as ${link.download}. Upload it to GitHub Pages to share it.`;
  });

  preview.srcdoc = buildPage(readForm(), { preview: true });

  // Shared with deploy.js, which publishes the same page to GitHub Pages.
  window.HauntedBuilder = { buildPage, readForm };
})();
