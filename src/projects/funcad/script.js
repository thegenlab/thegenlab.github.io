"use strict";

const SIMS = [
  { slug: "rack", title: "Folding drying rack", agent: "Fable", featured: true },
  { slug: "indexing", title: "Four-station indexing table", agent: "Fable" },
  { slug: "wiper", title: "Four-bar windshield wiper", agent: "Grok" },
  { slug: "scissor", title: "Scissor lift", agent: "Fable" },
  { slug: "clamp", title: "Toggle clamp", agent: "Fable" },
  { slug: "hook", title: "Folding wall hook", agent: "Kimi" },
  { slug: "mirror", title: "Tilting mirror stand", agent: "Grok" },
  { slug: "trolley", title: "Folding shopping trolley", agent: "Fable" },
  { slug: "reducer", title: "Three-stage gear reducer", agent: "Fable" },
  { slug: "beater", title: "Hand-cranked egg beater", agent: "Fable" },
  { slug: "crank", title: "Crank-slider pushrod", agent: "Fable" },
  { slug: "engine", title: "Twin-cylinder engine linkage", agent: "Grok" },
];

const MODELS = [
  { label: "Astra", value: 22, meta: "118 min · $42.55", color: "var(--astra)" },
  { label: "Kimi", value: 14, meta: "173 min · $3.62", color: "var(--kimi)" },
  { label: "Fable", value: 32, meta: "118 min · $11.45", color: "var(--fable)" },
  { label: "Grok", value: 19, meta: "165 min · $13.40", color: "var(--grok)" },
  { label: "Grok + history", value: 36, meta: "≤8 tries · $24.43", color: "var(--grok)", striped: true },
];

const WORKFLOWS = [
  { label: "Requirements only", note: "agent picks its checks", astra: 1, grok: 3 },
  { label: "Simulation tools", note: "simulator, no harness", astra: 8, grok: 10 },
  { label: "Full harness", note: "requirement-level tests", astra: 22, grok: 19, highlight: true },
  { label: "Binary feedback", note: "pass/fail only", astra: 0, grok: 8 },
];

const FAMILIES = [
  ["BM01", "Hinged toolbox", "topology geometry"],
  ["BM02", "Rack-and-pinion gate", "motion topology contact"],
  ["BM03", "Four-bar windshield wiper", "motion topology"],
  ["BM04", "Hand-cranked egg beater", "motion topology"],
  ["BM05", "Automatically locking utility knife", "contact topology"],
  ["BM06", "Folding drying rack", "topology geometry"],
  ["BM07", "Pedal-driven cargo bicycle", "motion topology complexity"],
  ["BM08", "Pedal-operated trash bin", "contact complexity"],
  ["BM09", "Purely mechanical alarm clock", "complexity contact"],
  ["BM10", "Kitchen tongs", "contact"],
  ["BM11", "Retractable ballpoint pen", "complexity"],
  ["BM12", "Nail clipper", "motion contact"],
  ["BM13", "One-way ratcheting screwdriver", "motion contact"],
  ["BM14", "Linearly actuated scissor lift", "motion topology"],
  ["BM15", "Equal-arm balance", "contact complexity"],
  ["BM16", "Toggle clamp or press", "topology contact"],
  ["BM17", "Dry piston-pump mechanism", "motion"],
  ["BM18", "Three-digit mechanical combination lock", "complexity contact"],
  ["BM19", "Two-digit mechanical counter", "complexity"],
  ["BM20", "Three-ball batch dispenser", "contact complexity"],
  ["BM21", "Gravity-powered timer", "motion complexity"],
  ["BM22", "Crank-slider pushrod", "motion"],
  ["BM23", "Gravity-pawl ratchet turntable", "motion contact"],
  ["BM24", "Sliding-bolt door", "contact topology"],
  ["BM25", "Three-stage gear reducer", "motion topology"],
  ["BM42", "Desktop display turntable", "motion"],
  ["BM45", "Small swing door", "topology"],
  ["BM47", "Tilting desktop mirror stand", "motion geometry"],
  ["BM49", "Folding wall hook", "topology contact"],
  ["BM50", "Spring clothespin", "contact"],
  ["BM51", "Mechanical scissors", "motion contact"],
  ["BM52", "Ratchet hand winch", "motion contact"],
  ["BM53", "Spring latch door handle lock", "contact topology"],
  ["BM54", "Reversible dual-pawl ratchet wrench", "motion contact"],
  ["BM56", "Full-cycle ratchet crimping pliers", "motion contact geometry"],
  ["BM57", "Geneva indexing table with overload clutch", "motion topology complexity"],
  ["BM58", "Shopping trolley with a folding handle", "topology complexity"],
  ["BM59", "Mechanical 4×4×4 twist puzzle cube", "topology geometry"],
  ["BM60", "Twin-cylinder engine linkage", "motion topology"],
  ["BM62", "Four-station intermittent indexing table", "motion topology complexity"],
  ["W05", "Synchronized parallel gripper", "contact topology"],
  ["W07", "Releasable reduction winch with reverse locking", "motion contact"],
  ["W09", "Baby stroller", "complexity geometry"],
  ["W10", "Height-adjustable tilting worktable", "topology complexity"],
  ["W11", "Coin sorting and counting machine", "contact complexity"],
  ["W12", "Music box with interchangeable tunes", "complexity contact"],
].map(([id, title, tags]) => ({ id, title, tags: tags.split(" ") }));

const AXES = { all: "All", motion: "Motion", topology: "Topology", complexity: "Complexity", contact: "Contact", geometry: "Geometry" };

// Renders from the paper gallery: [id, family title, agent, width, height].
const GALLERY = [["BM04_astra","Hand-cranked egg beater","Astra",640,791],["BM04_grok","Hand-cranked egg beater","Grok",640,755],["BM04_kimi","Hand-cranked egg beater","Kimi",494,812],["BM08_astra","Pedal-operated bin","Astra",636,812],["BM08_grok","Pedal-operated bin","Grok",634,812],["BM08_kimi","Pedal-operated bin","Kimi",560,812],["BM11_astra","Retractable ballpoint pen","Astra",184,812],["BM11_fable","Retractable ballpoint pen","Fable",128,812],["BM11_grok","Retractable ballpoint pen","Grok",131,812],["BM14_astra","Scissor lift","Astra",640,491],["BM14_grok","Scissor lift","Grok",640,620],["BM14_kimi","Scissor lift","Kimi",640,452],["BM16_astra","Toggle clamp","Astra",478,812],["BM16_fable","Toggle clamp","Fable",640,705],["BM16_grok","Toggle clamp","Grok",640,587],["BM16_kimi","Toggle clamp","Kimi",592,812],["BM20_astra","Three-ball dispenser","Astra",640,712],["BM20_grok","Three-ball dispenser","Grok",640,555],["BM20_kimi","Three-ball dispenser","Kimi",640,369],["BM21_astra","Gravity-powered timer","Astra",476,812],["BM21_grok","Gravity-powered timer","Grok",640,795],["BM21_kimi","Gravity-powered timer","Kimi",640,726],["BM23_astra","Gravity-pawl turntable","Astra",640,321],["BM23_fable","Gravity-pawl turntable","Fable",640,337],["BM23_grok","Gravity-pawl turntable","Grok",640,399],["BM23_kimi","Gravity-pawl turntable","Kimi",640,361],["BM45_astra","Swing door","Astra",640,742],["BM45_grok","Swing door","Grok",640,686],["BM45_kimi","Swing door","Kimi",640,634],["BM49_astra","Folding wall hook","Astra",456,812],["BM49_grok","Folding wall hook","Grok",465,812],["BM49_kimi","Folding wall hook","Kimi",427,812],["BM50_astra","Spring clothespin","Astra",640,397],["BM50_fable","Spring clothespin","Fable",640,457],["BM50_grok","Spring clothespin","Grok",640,499],["BM50_kimi","Spring clothespin","Kimi",640,455],["BM52_astra","Ratchet hand winch","Astra",640,541],["BM52_fable","Ratchet hand winch","Fable",472,812],["BM52_grok","Ratchet hand winch","Grok",640,581],["BM52_kimi","Ratchet hand winch","Kimi",528,812],["BM56_astra","Ratchet crimping pliers","Astra",640,357],["BM56_grok","Ratchet crimping pliers","Grok",640,577],["BM56_kimi","Ratchet crimping pliers","Kimi",640,691],["BM59_astra","4 x 4 x 4 twist puzzle","Astra",640,698],["BM59_grok","4 x 4 x 4 twist puzzle","Grok",634,813],["BM59_kimi","4 x 4 x 4 twist puzzle","Kimi",640,698],["BM60_astra","Twin-cylinder linkage","Astra",640,635],["BM60_grok","Twin-cylinder linkage","Grok",640,691],["BM60_kimi","Twin-cylinder linkage","Kimi",640,723],["W09_astra","Baby stroller","Astra",640,462],["W09_fable","Baby stroller","Fable",640,457],["W09_grok","Baby stroller","Grok",640,457],["W09_kimi","Baby stroller","Kimi",640,527]];

const AGENT_ORDER = ["Astra", "Fable", "Grok", "Kimi"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/* ---------- Theme ---------- */

function setupTheme() {
  const toggle = $(".theme-toggle");
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => {
    const explicit = document.documentElement.dataset.theme;
    return explicit ? explicit === "dark" : media.matches;
  };
  const sync = () => toggle.setAttribute("aria-pressed", String(isDark()));
  toggle.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("funcad-theme", next); } catch (_) { /* storage is optional */ }
    sync();
    document.dispatchEvent(new CustomEvent("funcad-theme"));
  });
  media.addEventListener?.("change", () => { sync(); document.dispatchEvent(new CustomEvent("funcad-theme")); });
  sync();
}

/* ---------- Navigation ---------- */

function setupNav() {
  const nav = $("[data-nav]");
  const hero = $(".hero");
  const links = $$(".nav-links a");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const update = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    nav.classList.toggle("is-solid", heroBottom < 70);
    let current = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) current = section;
    }
    links.forEach((a) => a.classList.toggle("is-active", current !== null && a.getAttribute("href") === `#${current.id}`));
  };
  let queued = false;
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------- Reveal ---------- */

function setupReveal() {
  const items = $$("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  items.forEach((el) => io.observe(el));
}

/* ---------- Lazy, in-view video ---------- */

let videoObserver = null;
let posterObserver = null;

function loadPoster(video) {
  if (!video.getAttribute("poster") && video.dataset.poster) video.poster = video.dataset.poster;
}

function loadVideo(video) {
  loadPoster(video);
  if (!video.getAttribute("src") && video.dataset.src) video.src = video.dataset.src;
}

function startVideo(video) {
  loadVideo(video);
  const playing = video.play();
  if (playing) playing.catch(() => { video.controls = true; });
}

// Clips in a [data-sync] group share one loop length; keep each on the first
// clip's clock so the designs move side by side.
function syncLoops(group) {
  const [lead, ...rest] = $$("video", group);
  lead.addEventListener("timeupdate", () => {
    const time = lead.currentTime;
    const loop = lead.duration;
    rest.forEach((v) => {
      if (v.paused || v.seeking || !loop) return;
      const drift = Math.abs(v.currentTime - time);
      if (Math.min(drift, loop - drift) > 0.15) v.currentTime = time;
    });
  });
}

function observeVideos(root = document) {
  const videos = $$("video[data-src]", root).filter((v) => !v.closest(".overlay"));
  if (reduceMotion) {
    videos.forEach((v) => { v.controls = true; v.preload = "metadata"; loadVideo(v); });
    return;
  }
  if (!("IntersectionObserver" in window)) {
    videos.forEach((v) => { loadVideo(v); v.play().catch(() => {}); });
    return;
  }
  if (!videoObserver) {
    // Posters arrive about a screen ahead; clips load and play once in view.
    posterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadPoster(entry.target);
        posterObserver.unobserve(entry.target);
      });
    }, { rootMargin: "800px 0px" });
    videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const clips = entry.target.matches("[data-sync]") ? $$("video", entry.target) : [entry.target];
        if (entry.isIntersecting) clips.forEach(startVideo);
        else clips.forEach((v) => { if (!v.paused) v.pause(); });
      });
    }, { threshold: 0.2 });
  }
  videos.forEach((v) => posterObserver.observe(v));
  videos.filter((v) => !v.closest("[data-sync]")).forEach((v) => videoObserver.observe(v));
  new Set(videos.map((v) => v.closest("[data-sync]")).filter(Boolean)).forEach((group) => {
    syncLoops(group);
    videoObserver.observe(group);
  });
}

/* ---------- Simulation grid ---------- */

function renderSims() {
  const grid = $("#sim-grid");
  grid.innerHTML = SIMS.map((s) => `
    <figure class="media-card${s.featured ? " featured" : ""}">
      <video data-src="assets/sim/${s.slug}.mp4" data-poster="assets/sim/${s.slug}.jpg" muted loop playsinline preload="none" aria-label="Simulation replay: ${escapeHtml(s.title)} built by ${escapeHtml(s.agent)}"></video>
      <figcaption class="media-cap"><b>${escapeHtml(s.title)}</b><span class="agent" data-agent="${escapeHtml(s.agent)}">${escapeHtml(s.agent)}</span></figcaption>
    </figure>`).join("");
}

/* ---------- Tabs ---------- */

function setupTabs() {
  const tabs = $$('[role="tab"]');
  const select = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      $$("video", panel).forEach((v) => { if (!on) v.pause(); });
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      select(tabs[(index + step + tabs.length) % tabs.length], true);
    });
  });
}

/* ---------- Gallery ---------- */

function setupGallery() {
  const grid = $("#gallery");
  const filters = $("#gallery-filters");
  const more = $("#gallery-more");
  const LIMIT = 15;
  let agent = "all";
  let expanded = false;
  // Interleave agents so the first rows show a mix of builders.
  const byAgent = AGENT_ORDER.map((a) => GALLERY.filter((g) => g[2] === a));
  const ordered = [];
  for (let i = 0; ordered.length < GALLERY.length; i++) byAgent.forEach((list) => { if (list[i]) ordered.push(list[i]); });

  grid.innerHTML = ordered.map(([id, title, who, w, h]) => `
    <button class="g-item" type="button" data-agent="${escapeHtml(who)}" data-full="assets/gallery/large/${escapeHtml(id)}.webp" data-caption="${escapeHtml(title)} · ${escapeHtml(who)}">
      <img src="assets/gallery/${escapeHtml(id)}.webp" width="${w}" height="${h}" loading="lazy" decoding="async" alt="${escapeHtml(title)} built by ${escapeHtml(who)}" />
      <span class="g-cap"><b title="${escapeHtml(title)}">${escapeHtml(title)}</b></span>
      <span class="agent" data-agent="${escapeHtml(who)}">${escapeHtml(who)}</span>
    </button>`).join("");

  const counts = { all: GALLERY.length };
  AGENT_ORDER.forEach((a) => { counts[a] = GALLERY.filter((g) => g[2] === a).length; });
  filters.innerHTML = ["all", ...AGENT_ORDER].map((key) => `
    <button class="chip" type="button" data-key="${key}" aria-pressed="${key === "all"}"${key === "all" ? "" : ` style="--dot: var(--${key.toLowerCase()})"`}>${key === "all" ? "" : "<i></i>"}${key === "all" ? "All agents" : key}<span class="count">${counts[key]}</span></button>`).join("");

  const apply = () => {
    let shown = 0;
    $$(".g-item", grid).forEach((item) => {
      const match = agent === "all" || item.dataset.agent === agent;
      const visible = match && (expanded || agent !== "all" || shown < LIMIT);
      if (visible) shown += 1;
      item.hidden = !visible;
    });
    more.hidden = agent !== "all" || expanded;
  };
  filters.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-key]");
    if (!chip) return;
    agent = chip.dataset.key;
    $$(".chip", filters).forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    apply();
  });
  more.addEventListener("click", () => { expanded = true; apply(); });
  more.textContent = `Show all ${GALLERY.length} builds`;
  apply();
}

/* ---------- Families ---------- */

function setupFamilies() {
  const wrap = $("#families");
  const filters = $("#family-filters");
  wrap.innerHTML = FAMILIES.map((f) => `<span class="family" data-tags="${f.tags.join(" ")}"><code>${f.id}</code>${escapeHtml(f.title)}</span>`).join("");
  filters.innerHTML = Object.entries(AXES).map(([key, label]) => `<button class="chip" type="button" data-key="${key}" aria-pressed="${key === "all"}">${label}</button>`).join("");
  filters.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-key]");
    if (!chip) return;
    const key = chip.dataset.key;
    $$(".chip", filters).forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    $$(".family", wrap).forEach((f) => f.classList.toggle("dim", key !== "all" && !f.dataset.tags.split(" ").includes(key)));
  });
}

/* ---------- Results ---------- */

function renderResults() {
  $("#model-bars").innerHTML = MODELS.map((m) => `
    <div class="bar">
      <span class="bar-name">${escapeHtml(m.label)}<small>${escapeHtml(m.meta)}</small></span>
      <div class="bar-track" role="img" aria-label="${escapeHtml(m.label)}: ${m.value} of 46 tasks"><div class="bar-fill${m.striped ? " striped" : ""}" style="--c: ${m.color}" data-width="${(m.value / 46) * 100}"></div></div>
      <span class="bar-num">${m.value}<small>/46</small></span>
    </div>`).join("");
  $("#ablation-bars").innerHTML = WORKFLOWS.map((w) => `
    <div class="pair-row${w.highlight ? " highlight" : ""}">
      <span>${escapeHtml(w.label)}<small>${escapeHtml(w.note)}</small></span>
      <div class="pair-bars">
        <div class="pair-bar"><div class="bar-track" role="img" aria-label="Astra: ${w.astra} of 46"><div class="bar-fill" style="--c: var(--astra)" data-width="${(w.astra / 46) * 100}"></div></div><em>${w.astra}</em></div>
        <div class="pair-bar"><div class="bar-track" role="img" aria-label="Grok: ${w.grok} of 46"><div class="bar-fill" style="--c: var(--grok)" data-width="${(w.grok / 46) * 100}"></div></div><em>${w.grok}</em></div>
      </div>
    </div>`).join("");
  const fill = () => $$("#results .bar-fill").forEach((bar) => { bar.style.width = `${bar.dataset.width}%`; });
  if (reduceMotion || !("IntersectionObserver" in window)) { fill(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { fill(); io.disconnect(); }
  }, { threshold: 0.25 });
  io.observe($(".results-grid"));
}

/* ---------- Overlays ---------- */

function makeOverlay(element, { onOpen, onClose } = {}) {
  let lastFocus = null;
  const close = () => {
    if (element.hidden) return;
    element.classList.remove("is-open");
    onClose?.();
    window.setTimeout(() => { element.hidden = true; }, 250);
    document.removeEventListener("keydown", onKey);
    lastFocus?.focus?.();
  };
  const onKey = (event) => { if (event.key === "Escape") close(); };
  const open = (...args) => {
    lastFocus = document.activeElement;
    element.hidden = false;
    onOpen?.(...args);
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => {
      element.classList.add("is-open");
      $(".overlay-close", element).focus();  // focusable only once the overlay is visible
    });
  };
  element.addEventListener("click", (event) => {
    if (event.target === element || event.target.closest(".overlay-close")) close();
  });
  return { open, close };
}

function setupLightbox() {
  const box = $("#lightbox");
  const img = $("img", box);
  const cap = $("figcaption", box);
  const overlay = makeOverlay(box, { onClose: () => { img.removeAttribute("src"); } });
  document.addEventListener("click", (event) => {
    const target = event.target.closest(".zoomable, .g-item");
    if (!target) return;
    const inner = $("img", target);
    img.src = target.dataset.full || inner.currentSrc || inner.src;
    img.alt = inner.alt;
    cap.textContent = target.dataset.caption || $("figcaption", target)?.textContent || "";
    overlay.open();
  });
  $$(".zoomable").forEach((fig) => {
    fig.tabIndex = 0;
    fig.setAttribute("role", "button");
    fig.setAttribute("aria-label", `Enlarge: ${fig.dataset.caption || $("figcaption", fig)?.textContent || "figure"}`);
    fig.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); fig.click(); } });
  });
}

function setupFilm() {
  const box = $("#film");
  const video = $("video", box);
  const overlay = makeOverlay(box, {
    onOpen: () => {
      $$(".intro-player video").forEach((v) => v.pause());  // one soundtrack at a time
      loadVideo(video);
      video.play().catch(() => {});
    },
    onClose: () => video.pause(),
  });
  $$("[data-film]").forEach((button) => button.addEventListener("click", () => overlay.open()));
}

// The narrated introduction plays only on request; its poster loads about a
// screen ahead like the clips' posters.
function setupIntro() {
  const player = $(".intro-player");
  if (!player) return;
  const video = $("video", player);
  $(".intro-play", player).addEventListener("click", () => {
    loadPoster(video);
    video.play().catch(() => {});
  });
  video.addEventListener("play", () => player.classList.add("is-playing"));
  video.addEventListener("ended", () => player.classList.remove("is-playing"));
  if (!("IntersectionObserver" in window)) {
    loadPoster(video);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    loadPoster(video);
    io.disconnect();
  }, { rootMargin: "800px 0px" });
  io.observe(player);
}

/* ---------- Offline cache ---------- */

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
  window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); }, { once: true });
}

renderSims();
renderResults();
setupGallery();
setupFamilies();
setupTheme();
setupNav();
setupReveal();
setupTabs();
setupLightbox();
setupFilm();
setupIntro();
observeVideos();
registerServiceWorker();
if (reduceMotion) $(".hero-video")?.pause();
