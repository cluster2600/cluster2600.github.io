const carousel = document.querySelector('[data-picture-carousel]');

if (carousel) {
  const viewport = carousel.querySelector('[data-carousel-viewport]');
  const slides = [...viewport.children];
  const controls = carousel.querySelector('[data-carousel-controls]');
  const previous = carousel.querySelector('[data-carousel-previous]');
  const next = carousel.querySelector('[data-carousel-next]');
  const toggle = carousel.querySelector('[data-carousel-toggle]');
  const status = carousel.querySelector('[data-carousel-status]');
  const fullSize = carousel.querySelector('[data-carousel-fullsize]');
  const stories = [...carousel.querySelectorAll('[data-carousel-story]')];
  const pages = carousel.querySelector('[data-carousel-pages]');
  const pageButtons = [...pages.querySelectorAll('[data-carousel-page]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  let requestId = 0;
  let loading = false;
  let pendingAutomatic = false;
  let swipeStart;
  let playing = !reducedMotion.matches;
  let inView = false;
  let hovering = false;

  function schedule() {
    clearTimeout(timer);
    if (!playing || !inView || hovering || loading || document.hidden) return;
    timer = setTimeout(() => {
      show((current + 1) % slides.length, true);
    }, 5000);
  }

  function playback() {
    toggle.textContent = playing ? 'Pause' : 'Play';
    toggle.setAttribute('aria-label', playing ? 'Pause automatic slideshow' : 'Start automatic slideshow');
    status.setAttribute('aria-live', playing ? 'off' : 'polite');
    schedule();
  }

  function pause() {
    playing = false;
    if (loading && pendingAutomatic) {
      requestId += 1;
      loading = false;
      pendingAutomatic = false;
      viewport.removeAttribute('aria-busy');
    }
    playback();
  }

  function update(index) {
    current = index;
    slides.forEach((slide, page) => { slide.hidden = page !== current; });
    slides[current].querySelector('img').loading = 'eager';
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    status.textContent = `${current + 1} / ${slides.length}`;
    fullSize.href = slides[current].querySelector('img').src;
    fullSize.setAttribute('aria-label', `Open page ${current + 1} at full size`);
    stories.forEach((story) => {
      story.hidden = story.id !== slides[current].dataset.story;
    });
    pageButtons.forEach((button, page) => {
      if (page === current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    slides[(current + 1) % slides.length].querySelector('img').loading = 'eager';
  }

  async function show(index, automatic = false) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    const selectedRequest = ++requestId;
    const image = slides[target].querySelector('img');
    loading = true;
    pendingAutomatic = automatic;
    clearTimeout(timer);
    viewport.setAttribute('aria-busy', 'true');
    image.loading = 'eager';
    if (image.complete && !image.naturalWidth) image.src = image.getAttribute('src');
    try {
      await image.decode();
    } catch {
      if (selectedRequest !== requestId) return;
      loading = false;
      pendingAutomatic = false;
      viewport.removeAttribute('aria-busy');
      pause();
      status.textContent = `Photo ${target + 1} could not load. Select it again to retry.`;
      return;
    }
    if (selectedRequest !== requestId) return;
    update(target);
    loading = false;
    pendingAutomatic = false;
    viewport.removeAttribute('aria-busy');
    schedule();
  }

  previous.addEventListener('click', () => { pause(); show(current - 1); });
  next.addEventListener('click', () => { pause(); show(current + 1); });
  pageButtons.forEach((button, index) => button.addEventListener('click', () => { pause(); show(index); }));
  toggle.addEventListener('click', () => {
    if (playing) pause();
    else {
      playing = true;
      hovering = false;
      playback();
    }
  });
  carousel.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    hovering = true;
    schedule();
  });
  carousel.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    hovering = false;
    schedule();
  });
  carousel.addEventListener('focusin', (event) => {
    if (event.target !== toggle) pause();
  });
  viewport.addEventListener('pointerdown', (event) => {
    pause();
    if (event.pointerType !== 'mouse' && event.isPrimary) {
      swipeStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
      viewport.setPointerCapture(event.pointerId);
    }
  });
  viewport.addEventListener('pointerup', (event) => {
    if (!swipeStart || swipeStart.id !== event.pointerId) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = undefined;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      show(current + (dx < 0 ? 1 : -1));
    }
  });
  viewport.addEventListener('pointercancel', () => { swipeStart = undefined; });
  viewport.addEventListener('wheel', pause, { passive: true });
  viewport.addEventListener('keydown', (event) => {
    const keys = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    pause();
    show(keys[event.key]);
  });
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
    schedule();
  }, { threshold: 0.35 }).observe(viewport);
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) pause();
  });

  carousel.classList.add('is-enhanced');
  controls.hidden = false;
  update(0);
  fullSize.hidden = false;
  playback();
}
