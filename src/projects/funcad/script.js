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

// Every passing main-benchmark build (Table 8 single attempts and Grok + history): [id, task, agent, width, height].
const GALLERY = [["BM02_astra","Rack-and-pinion gate","Astra",434,812],["BM02_kimi","Rack-and-pinion gate","Kimi",336,812],["BM02_fable","Rack-and-pinion gate","Fable",424,812],["BM02_grok","Rack-and-pinion gate","Grok",331,812],["BM03_astra","Four-bar wiper","Astra",640,258],["BM03_kimi","Four-bar wiper","Kimi",640,697],["BM03_fable","Four-bar wiper","Fable",640,728],["BM03_grok","Four-bar wiper","Grok",640,341],["BM04_astra","Hand-cranked egg beater","Astra",640,791],["BM04_kimi","Hand-cranked egg beater","Kimi",494,812],["BM04_fable","Hand-cranked egg beater","Fable",640,581],["BM04_grok","Hand-cranked egg beater","Grok",640,755],["BM05_astra","Self-locking utility knife","Astra",640,364],["BM05_fable","Self-locking utility knife","Fable",640,332],["BM05_grok","Self-locking utility knife","Grok",640,360],["BM06_fable","Folding drying rack","Fable",640,406],["BM08_astra","Pedal-operated bin","Astra",636,812],["BM08_fable","Pedal-operated bin","Fable",638,812],["BM08_grok","Pedal-operated bin","Grok",634,812],["BM10_fable","Kitchen tongs","Fable",640,718],["BM11_fable","Retractable ballpoint pen","Fable",128,812],["BM12_astra","Nail clipper","Astra",640,514],["BM12_fable","Nail clipper","Fable",640,542],["BM13_fable","One-way ratchet screwdriver","Fable",640,413],["BM14_fable","Linearly actuated scissor lift","Fable",640,549],["BM15_astra","Equal-arm balance","Astra",640,549],["BM15_kimi","Equal-arm balance","Kimi",640,616],["BM15_fable","Equal-arm balance","Fable",640,525],["BM15_grok","Equal-arm balance","Grok",640,528],["BM16_kimi","Toggle clamp / press","Kimi",592,812],["BM16_fable","Toggle clamp / press","Fable",640,705],["BM16_grok","Toggle clamp / press","Grok",640,587],["BM17_astra","Dry piston-pump mechanism","Astra",640,489],["BM17_kimi","Dry piston-pump mechanism","Kimi",640,422],["BM17_fable","Dry piston-pump mechanism","Fable",640,495],["BM17_grok","Dry piston-pump mechanism","Grok",640,530],["BM18_astra","Three-digit combination lock","Astra",640,345],["BM18_fable","Three-digit combination lock","Fable",514,813],["BM19_astra","Two-digit mechanical counter","Astra",640,703],["BM19_fable","Two-digit mechanical counter","Fable",640,613],["BM21_astra","Gravity timer","Astra",476,812],["BM21_fable","Gravity timer","Fable",420,812],["BM21_grok","Gravity timer","Grok",640,795],["BM22_astra","Slider-crank push rod","Astra",640,373],["BM22_kimi","Slider-crank push rod","Kimi",640,332],["BM22_fable","Slider-crank push rod","Fable",640,425],["BM22_grok","Slider-crank push rod","Grok",640,384],["BM23_astra","Gravity-pawl turntable","Astra",640,321],["BM24_astra","Sliding-bolt gate","Astra",570,812],["BM24_kimi","Sliding-bolt gate","Kimi",488,812],["BM24_fable","Sliding-bolt gate","Fable",538,812],["BM24_grok","Sliding-bolt gate","Grok",580,812],["BM25_fable","Three-stage gear reducer","Fable",640,461],["BM42_astra","Desktop display turntable","Astra",640,355],["BM42_kimi","Desktop display turntable","Kimi",640,457],["BM42_fable","Desktop display turntable","Fable",640,433],["BM42_grok","Desktop display turntable","Grok",640,412],["BM45_astra","Small swing gate","Astra",640,742],["BM45_kimi","Small swing gate","Kimi",640,634],["BM45_fable","Small swing gate","Fable",640,812],["BM45_grok","Small swing gate","Grok",640,686],["BM47_astra","Tilting desktop mirror","Astra",640,388],["BM47_kimi","Tilting desktop mirror","Kimi",640,434],["BM47_fable","Tilting desktop mirror","Fable",640,604],["BM47_grok","Tilting desktop mirror","Grok",640,508],["BM49_astra","Folding wall hook","Astra",456,812],["BM49_kimi","Folding wall hook","Kimi",427,812],["BM49_fable","Folding wall hook","Fable",351,813],["BM49_grok","Folding wall hook","Grok",465,812],["BM50_fable","Spring clothespin","Fable",640,457],["BM50_grok","Spring clothespin","Grok",640,499],["BM51_astra","Scissors","Astra",640,272],["BM51_kimi","Scissors","Kimi",640,287],["BM51_fable","Scissors","Fable",640,382],["BM51_grok","Scissors","Grok",640,327],["BM53_astra","Spring-latch door lock","Astra",640,601],["BM53_grok","Spring-latch door lock","Grok",412,812],["BM56_fable","Full-cycle ratchet crimper","Fable",640,326],["BM58_astra","Folding shopping cart","Astra",640,457],["BM58_fable","Folding shopping cart","Fable",640,519],["BM60_astra","Twin-cylinder engine linkage","Astra",640,635],["BM60_kimi","Twin-cylinder engine linkage","Kimi",640,723],["BM60_fable","Twin-cylinder engine linkage","Fable",640,749],["BM60_grok","Twin-cylinder engine linkage","Grok",640,691],["BM62_fable","Four-station indexing table","Fable",640,443],["W05_fable","Synchronized parallel gripper","Fable",640,686],["W10_fable","Height- and tilt-adjustable worktable","Fable",584,812],["BM01_grokh","Hinged toolbox","Grok + history",640,476],["BM02_grokh","Rack-and-pinion gate","Grok + history",460,812],["BM03_grokh","Four-bar wiper","Grok + history",640,280],["BM04_grokh","Hand-cranked egg beater","Grok + history",640,785],["BM05_grokh","Self-locking utility knife","Grok + history",640,396],["BM06_grokh","Folding drying rack","Grok + history",640,376],["BM08_grokh","Pedal-operated bin","Grok + history",640,715],["BM10_grokh","Kitchen tongs","Grok + history",576,812],["BM12_grokh","Nail clipper","Grok + history",640,481],["BM14_grokh","Linearly actuated scissor lift","Grok + history",640,671],["BM15_grokh","Equal-arm balance","Grok + history",640,521],["BM16_grokh","Toggle clamp / press","Grok + history",640,722],["BM17_grokh","Dry piston-pump mechanism","Grok + history",640,429],["BM18_grokh","Three-digit combination lock","Grok + history",640,697],["BM21_grokh","Gravity timer","Grok + history",640,632],["BM22_grokh","Slider-crank push rod","Grok + history",640,382],["BM23_grokh","Gravity-pawl turntable","Grok + history",640,344],["BM24_grokh","Sliding-bolt gate","Grok + history",640,712],["BM25_grokh","Three-stage gear reducer","Grok + history",640,519],["BM42_grokh","Desktop display turntable","Grok + history",640,479],["BM45_grokh","Small swing gate","Grok + history",640,565],["BM47_grokh","Tilting desktop mirror","Grok + history",640,653],["BM49_grokh","Folding wall hook","Grok + history",382,813],["BM50_grokh","Spring clothespin","Grok + history",640,362],["BM51_grokh","Scissors","Grok + history",640,310],["BM52_grokh","Ratchet hand winch","Grok + history",640,674],["BM53_grokh","Spring-latch door lock","Grok + history",640,549],["BM57_grokh","Geneva indexing table with overload clutch","Grok + history",640,475],["BM58_grokh","Folding shopping cart","Grok + history",640,529],["BM59_grokh","Mechanical 4 × 4 puzzle cube","Grok + history",640,728],["BM60_grokh","Twin-cylinder engine linkage","Grok + history",640,591],["BM62_grokh","Four-station indexing table","Grok + history",640,419],["W05_grokh","Synchronized parallel gripper","Grok + history",640,401],["W07_grokh","Releasable reduction winch","Grok + history",640,634],["W09_grokh","Baby stroller","Grok + history",640,457],["W10_grokh","Height- and tilt-adjustable worktable","Grok + history",640,747]];

// Same order and colors as the results chart; "Grok + history" is Grok with up to eight attempts.
const AGENT_ORDER = ["Astra", "Kimi", "Fable", "Grok", "Grok + history"];
const AGENT_DOT = { Astra: "var(--astra)", Kimi: "var(--kimi)", Fable: "var(--fable)", Grok: "var(--grok)", "Grok + history": "var(--grok)" };
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
    <button class="chip" type="button" data-key="${key}" aria-pressed="${key === "all"}"${key === "all" ? "" : ` style="--dot: ${AGENT_DOT[key]}"`}>${key === "all" ? "" : "<i></i>"}${key === "all" ? "All agents" : key}<span class="count">${counts[key]}</span></button>`).join("");

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
