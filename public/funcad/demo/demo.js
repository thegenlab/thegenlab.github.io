// Comparison demo pages: the shared theme toggle and in-view clips, as on the
// project page. Posters load about a screen ahead; clips load and play in view.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupTheme() {
  const toggle = document.querySelector(".theme-toggle");
  if (!toggle) return;
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
  });
  media.addEventListener?.("change", sync);
  sync();
}

function loadPoster(video) {
  if (!video.getAttribute("poster") && video.dataset.poster) video.poster = video.dataset.poster;
}

function loadVideo(video) {
  loadPoster(video);
  if (!video.getAttribute("src") && video.dataset.src) video.src = video.dataset.src;
}

function startVideo(video) {
  loadVideo(video);
  video.play().catch(() => { video.controls = true; });
}

// Clips in a [data-sync] group share one loop length; keep each on the first
// clip's clock so the two views stay side by side.
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

function setupClips() {
  const videos = $$("video[data-src]");
  if (reduceMotion) {
    videos.forEach((v) => { v.controls = true; v.preload = "metadata"; loadVideo(v); });
    return;
  }
  if (!("IntersectionObserver" in window)) {
    videos.forEach((v) => { loadVideo(v); v.play().catch(() => {}); });
    return;
  }
  const posters = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      loadPoster(entry.target);
      posters.unobserve(entry.target);
    });
  }, { rootMargin: "800px 0px" });
  const players = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const clips = entry.target.matches("[data-sync]") ? $$("video", entry.target) : [entry.target];
      if (entry.isIntersecting) clips.forEach(startVideo);
      else clips.forEach((v) => { if (!v.paused) v.pause(); });
    });
  }, { threshold: 0.2 });
  videos.forEach((v) => posters.observe(v));
  videos.filter((v) => !v.closest("[data-sync]")).forEach((v) => players.observe(v));
  new Set(videos.map((v) => v.closest("[data-sync]")).filter(Boolean)).forEach((group) => {
    syncLoops(group);
    players.observe(group);
  });
}

setupTheme();
setupClips();
