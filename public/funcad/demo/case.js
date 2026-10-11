// Interactive replay page of the comparison demo: one recorded case, or an
// animation beside the same parts in physics, on one shared clock.
import { createViewer } from "./viewer.js?v=20261011-3";

const CATALOG = {
  grippers: {
    blurb: "Two hinged grippers. No part is fixed to the ground.",
    start: "static",
    window: { static: [0, 0.35] },
    notes: { static: "Gravity only: with nothing anchored, the whole assembly falls." },
  },
  pump: {
    blurb: "A planetary piston pump. Seventeen of its 66 parts, washers, a gear and a bushing, belong to no joint.",
    start: "static",
    window: { static: [0, 1.6] },
    notes: { static: "The housing is drawn see-through. Loose parts that fall are coral." },
  },
  arm: {
    blurb: "A robotic arm. Its joints turn freely, and nothing holds them.",
    start: "static",
    notes: { static: "Under gravity the arm folds down. Coral parts move more than 10 mm." },
  },
  door: {
    blurb: "A single-hinge door. The hinge and its 90° limit are right, but door and frame touch with zero clearance.",
    start: "drive",
    notes: {
      static: "Gravity: it holds still.",
      drive: "The test push on the hinge: the door stays shut.",
      drive_scale10: "Ten times the push: it opens 0.02 rad and stops.",
      drive_nocontact: "The same push with the door–frame contact removed: it swings to its 90° limit.",
    },
  },
  ringgear: {
    blurb: "A ring gear meshing with three gears, with zero backlash between the teeth.",
    start: "drive",
    notes: {
      static: "Gravity: it holds still.",
      drive: "The test push on the ring gear: the train barely moves.",
      drive_scale10: "Ten times the push: the train turns.",
      drive_nocontact: "Removing contact between the ring gear and its mount does not help: the teeth still lock.",
    },
  },
  clock: {
    blurb: "Our mechanical alarm clock, a FunCAD design package.",
    start: "drive",
    notes: {
      static: "Gravity: no part moves more than 2.1 mm.",
      drive: "The push on the timekeeping barrel turns the gear train, and the hands move.",
    },
  },
  wiper: {
    blurb: "Our four-bar windshield wiper, a FunCAD design package.",
    start: "drive",
    notes: {
      static: "Gravity: it holds still.",
      drive: "The crank turns 1.13 rad and drives the arm through its sweep.",
    },
  },
  planetary: {
    blurb: "An animated toy planetary gear: sun, three planets, ring and carrier.",
    // It does turn, so the protocol says "moves"; the point is the overlapping teeth.
    outcome: { drive: ["Moves, teeth overlap", false] },
    notes: {
      kinematic: "The animation spins the planets on their pins by formula, with no mass and no contact.",
      drive: "In physics the pins are locked and the centres sit too close, so the teeth overlap (red).",
    },
  },
  stool: {
    blurb: "An animated toy folding stool: four crossed tubes and a seat.",
    notes: {
      kinematic: "The animation folds the X frame by formula.",
      drive: "In physics each foot is a slider that cannot tilt, so the frame stays open under the push.",
    },
  },
  wiperpair: {
    blurb: "Our four-bar windshield wiper, a FunCAD design package.",
    notes: {
      kinematic: "The animation turns the crank 1.5 rad and swings the arm 43°, past its stop.",
      drive: "In physics the same small push turns the crank 1.13 rad; the arm sweeps 29° and stops at its limit.",
    },
  },
};

const CYCLE = 4;     // seconds per playback loop
const HOLD = 0.6;    // pause on the last frame before looping
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (selector) => document.querySelector(selector);

const id = new URLSearchParams(location.search).get("id") || "";
const entry = Object.hasOwn(CATALOG, id) ? CATALOG[id] : null;
const stages = $("[data-stages]");

function fail(message) {
  stages.querySelectorAll(".case-status").forEach((el) => { el.textContent = message; });
  $("[data-title]").textContent = entry ? $("[data-title]").textContent : "Replay not found";
}

async function main() {
  if (!entry) {
    fail("Unknown replay. Go back to the demo and pick a case.");
    return;
  }
  const url = new URL(`data/${id}.json?v=20261011-3`, import.meta.url).href;
  const probe = await (await fetch(url)).json();
  const pair = probe.kind === "pair";

  // Navigation context: pairs belong to the animation page.
  const back = $("[data-back]");
  back.href = pair ? "../animation/" : "../";
  back.textContent = pair ? "← Animation vs. physics" : "← Datasets in physics";
  $(pair ? "[data-nav-pairs]" : "[data-nav-cases]").setAttribute("aria-current", "page");

  if (pair) {
    stages.classList.add("split");
    stages.innerHTML = `
      <div class="case-stage" data-stage="a"><span class="clip-label plain">Animation</span><span class="case-status">Loading…</span></div>
      <div class="case-stage" data-stage="b"><span class="clip-label" data-physics-label>Physics</span><span class="case-status">Loading…</span></div>`;
  }
  const containers = [...stages.querySelectorAll(".case-stage")];
  const viewers = await Promise.all(containers.map((c) => createViewer(c)));
  await Promise.all(viewers.map((v) => v.load(url)));
  containers.forEach((c) => c.querySelector(".case-status")?.remove());

  const doc = viewers[0].doc;
  document.title = `${doc.title} · FunCAD demo`;
  $("[data-title]").textContent = doc.title;
  $("[data-source]").textContent = doc.source;
  $("[data-blurb]").textContent = entry.blurb;

  // A case's phases share one view; a pair keeps the animation on the left
  // and switches the physics phase on the right.
  const switching = pair ? viewers[1] : viewers[0];
  if (pair) viewers[0].setPhase("kinematic");
  const choices = doc.phases.filter((p) => !pair || p.key !== "kinematic");
  const tabs = $("[data-phases]");
  let current = null;
  let progress = 0;
  let playing = !reduceMotion;
  let dirty = true;

  function windowOf(phase) {
    const full = [0, phase.t[phase.t.length - 1]];
    return entry.window?.[phase.key] || full;
  }

  function select(key) {
    current = switching.setPhase(key);
    progress = 0;
    dirty = true;
    tabs.querySelectorAll(".tab").forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.key === current.key)));
    const [text, ok] = entry.outcome?.[current.key] || [current.outcome, current.ok];
    const outcome = $("[data-outcome]");
    outcome.hidden = !text;
    outcome.textContent = pair ? `Physics: ${text}` : text || "";
    outcome.className = `case-outcome ${ok ? "good" : "bad"}`;
    const label = $("[data-physics-label]");
    if (label) label.className = `clip-label ${ok ? "good" : "bad"}`;
    const notes = pair ? [entry.notes.kinematic, entry.notes[current.key]] : [entry.notes[current.key]];
    $("[data-phase-note]").textContent = notes.filter(Boolean).join(" ");
    const [a, b] = windowOf(current);
    const slow = CYCLE / Math.max(1e-6, b - a);
    $("[data-speed]").textContent = slow > 1.4 ? `Slowed ${Math.round(slow)}×` : "Real time";
  }

  choices.forEach((phase) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "tab";
    tab.setAttribute("role", "tab");
    tab.dataset.key = phase.key;
    tab.textContent = phase.label;
    tab.addEventListener("click", () => select(phase.key));
    tabs.append(tab);
  });
  tabs.hidden = choices.length < 2;
  select(choices.some((p) => p.key === entry.start) ? entry.start : choices[0].key);

  const play = $("[data-play]");
  const scrub = $("[data-scrub]");
  const time = $("[data-time]");
  const syncPlay = () => {
    play.setAttribute("aria-label", playing ? "Pause" : "Play");
    play.querySelector("use").setAttribute("href", playing ? "#i-pause" : "#i-play");
  };
  play.addEventListener("click", () => { playing = !playing; syncPlay(); });
  scrub.addEventListener("input", () => { progress = scrub.value / 1000; dirty = true; });
  $("[data-reset]").addEventListener("click", () => { viewers.forEach((v) => v.resetView()); dirty = true; });
  syncPlay();

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (playing && document.visibilityState === "visible") {
      progress += dt / CYCLE;
      if (progress > 1 + HOLD / CYCLE) progress = 0;
      dirty = true;
    }
    const p = Math.min(1, progress);
    viewers.forEach((v) => {
      const [a, b] = windowOf(v.phase);
      v.renderIfNeeded(a + (b - a) * p, dirty);
    });
    if (dirty) {
      const [a, b] = windowOf(current);
      scrub.value = String(Math.round(p * 1000));
      time.textContent = `${(a + (b - a) * p).toFixed(2)} s`;
    }
    dirty = false;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main().catch(() => fail("3D replay unavailable in this browser."));
