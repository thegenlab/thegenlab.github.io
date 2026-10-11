// Run the actual controller with deterministic input/frame clocks. These tests
// cover interaction regressions; rendered smoothness still needs Chrome checks.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/scripts/research-carousel.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
});

function setup({ reducedMotion = false } = {}) {
  class Target {
    listeners = new Map();
    addEventListener(type, listener) {
      if (!this.listeners.has(type)) this.listeners.set(type, new Set());
      this.listeners.get(type).add(listener);
    }
    removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
    fire(type, properties = {}) {
      const event = {
        type, target: this, defaultPrevented: false, propagationStopped: false,
        preventDefault() { this.defaultPrevented = true; },
        stopPropagation() { this.propagationStopped = true; },
        ...properties,
      };
      for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event);
      return event;
    }
  }
  class Element extends Target {
    attributes = new Map();
    dataset = {};
    classes = new Set();
    classList = { add: name => this.classes.add(name), remove: name => this.classes.delete(name) };
    captures = new Set();
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    setAttribute(name, value) { this.attributes.set(name, value); }
    setPointerCapture(id) { this.captures.add(id); }
    hasPointerCapture(id) { return this.captures.has(id); }
    releasePointerCapture(id) { this.captures.delete(id); }
  }
  const track = new Element(), controls = new Element();
  const previous = new Element(), next = new Element(), carousel = new Element();
  const document = new Target(), window = new Target(), preference = new Target();
  Object.assign(track, { clientWidth: 600, clientHeight: 400, clientLeft: 0, clientTop: 0, scrollWidth: 2400 });
  let left = 0;
  Object.defineProperty(track, 'scrollLeft', {
    get: () => left,
    set(value) {
      left = Math.max(0, Math.min(1800, value));
      track.fire('scroll');
    },
  });
  track.scrollTo = options => { track.scrollLeft = options.left; };
  track.getBoundingClientRect = () => ({ left: 0, right: 600, top: 0, bottom: 400 });
  track.children = Array.from({ length: 8 }, (_, index) => ({
    getBoundingClientRect: () => ({ left: index * 300 - left }),
  }));
  controls.querySelector = selector => selector === '[data-previous]' ? previous : next;
  carousel.querySelector = selector => selector === '.research-track' ? track : controls;
  document.querySelector = () => carousel;
  document.hidden = false;
  preference.matches = reducedMotion;
  let clock = 0, frameId = 0;
  const frames = new Map();
  runInNewContext(outputText, {
    document, window, HTMLElement: Element,
    matchMedia: () => preference,
    performance: { now: () => clock },
    requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
    ResizeObserver: class { observe() {} },
  });
  const pointer = (target, type, x, time, extra = {}) => {
    clock = time;
    return target.fire(type, {
      pointerId: 1, pointerType: 'mouse', button: 0, isPrimary: true,
      clientX: x, clientY: 100, timeStamp: time, ...extra,
    });
  };
  const frame = time => {
    clock = Math.max(clock, time);
    const scheduled = [...frames.entries()];
    for (const [id, callback] of scheduled) {
      if (frames.delete(id)) callback(time);
    }
  };
  const settle = (firstTime = clock + 16) => {
    const positions = [track.scrollLeft];
    for (let i = 0; frames.size && i < 200; i++) {
      frame(firstTime + i * (1000 / 60));
      positions.push(track.scrollLeft);
    }
    assert.equal(frames.size, 0, 'animation must stop instead of retaining a rendering loop');
    return positions;
  };
  const drag = ({ direction = 1, pause = 0 } = {}) => {
    track.scrollLeft = 400;
    pointer(track, 'pointerdown', 300, 100);
    pointer(window, 'pointermove', 300 - direction * 100, 200);
    pointer(window, 'pointerup', 300 - direction * 100, 200 + pause);
  };
  return { track, document, window, frames, pointer, frame, settle, drag };
}

for (const direction of [1, -1]) {
  test(`release cannot reverse direction when the first frame clock is 4.8ms earlier (${direction})`, () => {
    const h = setup();
    h.drag({ direction });
    const releasedAt = h.track.scrollLeft;
    h.frame(195.2); // Chrome can deliver an rAF timestamp earlier than performance.now() at release.
    assert.ok(direction * (h.track.scrollLeft - releasedAt) >= 0, 'first coast frame moved backward');
    const positions = h.settle(212);
    for (let i = 1; i < positions.length; i++) {
      assert.ok(direction * (positions[i] - positions[i - 1]) >= 0, 'coast must remain monotonic');
    }
    assert.ok(direction * (positions.at(-1) - releasedAt) > 0, 'a moving release should coast');
    assert.ok(Math.abs(positions.at(-1) - releasedAt) < 200, 'mouse coast should stay controlled');
  });
}

test('a brief pause before release dissipates most of the fling', () => {
  const h = setup();
  h.drag({ pause: 60 });
  const releasedAt = h.track.scrollLeft;
  h.settle();
  assert.ok(h.track.scrollLeft - releasedAt < 40, 'stale movement must not fling nearly another card');
});

test('selection is blocked while mouse drag is pending, then restored', () => {
  const h = setup();
  h.pointer(h.track, 'pointerdown', 300, 100);
  assert.equal(h.track.fire('selectstart').defaultPrevented, true);
  h.pointer(h.window, 'pointerup', 300, 110);
  assert.equal(h.track.fire('selectstart').defaultPrevented, false);
});

test('ordinary and keyboard link clicks survive; a drag cannot open its link', () => {
  const h = setup();
  h.pointer(h.track, 'pointerdown', 300, 100);
  h.pointer(h.window, 'pointermove', 298, 110);
  h.pointer(h.window, 'pointerup', 298, 120);
  assert.equal(h.track.fire('click', { detail: 1 }).defaultPrevented, false);
  h.drag();
  const draggedClick = h.track.fire('click', { detail: 1 });
  assert.equal(draggedClick.defaultPrevented, true);
  assert.equal(draggedClick.propagationStopped, true);
  assert.equal(h.track.fire('click', { detail: 0 }).defaultPrevented, false);
  h.pointer(h.track, 'pointerdown', 300, 300);
  h.pointer(h.window, 'pointerup', 300, 310);
  assert.equal(h.track.fire('click', { detail: 1 }).defaultPrevented, false);
});

for (const cancellation of ['wheel', 'hidden']) {
  test(`${cancellation} cancels momentum and leaves no animation running`, () => {
    const h = setup();
    h.drag();
    h.frame(216);
    h.frame(233);
    const position = h.track.scrollLeft;
    if (cancellation === 'wheel') h.track.fire('wheel');
    else { h.document.hidden = true; h.document.fire('visibilitychange'); }
    h.settle(250);
    assert.equal(h.track.scrollLeft, position);
  });
}

test('hiding the document ends a held drag and removes its pointer listeners', () => {
  const h = setup();
  h.pointer(h.track, 'pointerdown', 300, 100);
  h.pointer(h.window, 'pointermove', 200, 120);
  const position = h.track.scrollLeft;
  h.document.hidden = true;
  h.document.fire('visibilitychange');
  h.pointer(h.window, 'pointermove', 100, 140);
  assert.equal(h.track.scrollLeft, position);
  assert.equal(h.track.captures.size, 0);
  assert.equal(h.track.classes.has('is-dragging'), false);
  h.settle();
});

test('keyboard navigation works on the track without taking keys from nested links', () => {
  const h = setup();
  for (const [key, expected] of [['ArrowRight', 300], ['ArrowLeft', 0], ['End', 1800], ['Home', 0]]) {
    const event = h.track.fire('keydown', { key });
    assert.equal(event.defaultPrevented, true, `${key} should navigate the focused track`);
    assert.equal(h.track.scrollLeft, expected);
  }
  const nestedLink = {};
  for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
    const event = h.track.fire('keydown', { key, target: nestedLink });
    assert.equal(event.defaultPrevented, false, `${key} belongs to the nested focused element`);
    assert.equal(h.track.scrollLeft, 0);
  }
  h.settle();
});

test('touch gestures are neither captured nor canceled by mouse dragging', () => {
  const h = setup();
  const down = h.pointer(h.track, 'pointerdown', 300, 100, { pointerType: 'touch' });
  const move = h.pointer(h.window, 'pointermove', 100, 120, { pointerType: 'touch' });
  assert.equal(down.defaultPrevented, false);
  assert.equal(move.defaultPrevented, false);
  assert.equal(h.track.scrollLeft, 0);
  assert.equal(h.track.captures.size, 0);
  assert.equal(h.track.fire('selectstart').defaultPrevented, false);
  assert.equal(h.frames.size, 0);
});

test('reduced motion allows dragging without a release animation', () => {
  const h = setup({ reducedMotion: true });
  h.drag();
  const position = h.track.scrollLeft;
  h.settle();
  assert.equal(h.track.scrollLeft, position);
});
