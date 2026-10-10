const carousel = document.querySelector<HTMLElement>('[data-carousel]');

if (carousel) {
  const track = carousel.querySelector<HTMLUListElement>('.research-track')!;
  const controls = carousel.querySelector<HTMLElement>('.carousel-controls')!;
  const previous = controls.querySelector<HTMLButtonElement>('[data-previous]')!;
  const next = controls.querySelector<HTMLButtonElement>('[data-next]')!;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const tolerance = 2;
  let maximum = 0;
  let stops: number[] = [];
  let requestedPosition: number | null = null;
  let updateFrame = 0;
  let momentumFrame = 0;
  let pointerFocus = false;
  let suppressClick = false;
  let drag: {
    id: number; x: number; y: number; left: number; active: boolean;
    lastLeft: number; lastTime: number; velocity: number;
  } | null = null;

  const clamp = (position: number) => Math.max(0, Math.min(maximum, position));
  const setDisabled = (button: HTMLButtonElement, disabled: boolean) => {
    const value = String(disabled);
    if (button.getAttribute('aria-disabled') !== value) button.setAttribute('aria-disabled', value);
  };
  const update = () => {
    updateFrame = 0;
    const current = clamp(track.scrollLeft);
    controls.hidden = maximum <= tolerance;
    setDisabled(previous, current <= tolerance);
    setDisabled(next, current >= maximum - tolerance);
    if (requestedPosition !== null && Math.abs(current - requestedPosition) <= tolerance) requestedPosition = null;
  };
  const scheduleUpdate = () => { if (!updateFrame) updateFrame = requestAnimationFrame(update); };
  const stopMotion = () => {
    cancelAnimationFrame(momentumFrame);
    momentumFrame = 0;
    if (requestedPosition !== null) track.scrollTo({ left: track.scrollLeft, behavior: 'instant' });
    requestedPosition = null;
  };
  const measure = () => {
    endDrag();
    stopMotion();
    maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    const start = track.getBoundingClientRect().left + track.clientLeft;
    stops = Array.from(track.children, slide => clamp(slide.getBoundingClientRect().left - start + track.scrollLeft));
    update();
  };
  const go = (position: number) => {
    cancelAnimationFrame(momentumFrame);
    momentumFrame = 0;
    requestedPosition = clamp(position);
    track.scrollTo({ left: requestedPosition, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    scheduleUpdate();
  };
  const step = (direction: number) => {
    const current = requestedPosition ?? clamp(track.scrollLeft);
    go(direction > 0
      ? stops.find(position => position > current + tolerance) ?? maximum
      : stops.findLast(position => position < current - tolerance) ?? 0);
  };
  const coast = (initialVelocity: number) => {
    if (reducedMotion.matches || Math.abs(initialVelocity) < 0.05) return;
    let velocity = Math.max(-2, Math.min(2, initialVelocity));
    let position = track.scrollLeft;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(now - lastTime, 48);
      lastTime = now;
      const decay = Math.exp(-elapsed / 180);
      position = clamp(position + velocity * 180 * (1 - decay));
      velocity *= decay;
      track.scrollLeft = position;
      if (Math.abs(velocity) > 0.02 && position > 0 && position < maximum) {
        momentumFrame = requestAnimationFrame(tick);
      } else {
        momentumFrame = 0;
      }
    };
    momentumFrame = requestAnimationFrame(tick);
  };

  previous.addEventListener('click', () => { if (previous.getAttribute('aria-disabled') !== 'true') step(-1); });
  next.addEventListener('click', () => { if (next.getAttribute('aria-disabled') !== 'true') step(1); });
  track.addEventListener('scroll', scheduleUpdate, { passive: true });
  track.addEventListener('wheel', stopMotion, { passive: true });

  // Touch and trackpad gestures retain the browser's native scrolling and inertia.
  // Capture the mouse only after a horizontal drag, so ordinary links still click.
  track.dataset.draggable = '';
  track.addEventListener('pointerdown', event => {
    pointerFocus = true;
    suppressClick = false;
    stopMotion();
    if (event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary ||
        event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || maximum <= tolerance) return;
    const bounds = track.getBoundingClientRect();
    if (event.clientY >= bounds.top + track.clientTop + track.clientHeight) return; // Native scrollbar.
    drag = {
      id: event.pointerId, x: event.clientX, y: event.clientY, left: track.scrollLeft,
      active: false, lastLeft: track.scrollLeft, lastTime: event.timeStamp, velocity: 0,
    };
    window.addEventListener('pointermove', moveDrag);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  });
  const moveDrag = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dy) > 6 && Math.abs(dy) > Math.abs(dx)) { endDrag(); return; }
      if (Math.abs(dx) < 6) return;
      drag.active = true;
      suppressClick = true;
      track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');
    }
    event.preventDefault();
    const left = clamp(drag.left - dx);
    const elapsed = Math.max(1, event.timeStamp - drag.lastTime);
    const velocity = (left - drag.lastLeft) / elapsed;
    drag.velocity = elapsed > 80 ? velocity : drag.velocity * 0.4 + velocity * 0.6;
    drag.lastLeft = left;
    drag.lastTime = event.timeStamp;
    track.scrollLeft = left;
  };
  const endDrag = (event?: PointerEvent) => {
    if (!drag || (event && event.pointerId !== drag.id)) return;
    const ended = drag;
    drag = null;
    window.removeEventListener('pointermove', moveDrag);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(ended.id)) track.releasePointerCapture(ended.id);
    if (ended.active && event?.type === 'pointerup' && event.timeStamp - ended.lastTime < 80) coast(ended.velocity);
  };
  track.addEventListener('lostpointercapture', endDrag);
  const pause = () => {
    endDrag();
    stopMotion();
    cancelAnimationFrame(updateFrame);
    update();
  };
  window.addEventListener('blur', pause);
  window.addEventListener('pagehide', pause);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else scheduleUpdate();
  });
  track.addEventListener('dragstart', event => event.preventDefault());
  track.addEventListener('selectstart', event => { if (drag?.active) event.preventDefault(); });
  track.addEventListener('click', event => {
    if (suppressClick && event.detail > 0) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, { capture: true });

  document.addEventListener('keydown', () => { pointerFocus = false; }, { capture: true });
  track.addEventListener('keydown', event => {
    if (event.target !== track || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); go(event.key === 'Home' ? 0 : maximum);
    }
  });
  track.addEventListener('focusin', event => {
    if (pointerFocus || !(event.target instanceof HTMLElement)) return;
    const slide = event.target.closest<HTMLElement>('.research-slide');
    if (!slide) return;
    const bounds = slide.getBoundingClientRect(), viewport = track.getBoundingClientRect();
    if (bounds.left < viewport.left - tolerance || bounds.right > viewport.right + tolerance) {
      stopMotion();
      // Keyboard focus reveals only the missing part; a mouse click never shifts its target.
      const distance = bounds.left < viewport.left ? bounds.left - viewport.left : bounds.right - viewport.right;
      track.scrollTo({ left: clamp(track.scrollLeft + distance), behavior: 'instant' });
    }
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stopMotion(); });
  new ResizeObserver(measure).observe(track);
  measure();
}
