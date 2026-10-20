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
  let scrollFrame;
  let timer;
  let playing = !reducedMotion.matches;
  let inView = false;
  let hovering = false;

  function schedule() {
    clearTimeout(timer);
    if (!playing || !inView || hovering || document.hidden) return;
    timer = setTimeout(() => {
      show((current + 1) % slides.length);
      schedule();
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
    playback();
  }

  function update(index) {
    current = index;
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

  function show(index) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    viewport.scrollTo({
      left: target * viewport.clientWidth,
      behavior: 'instant',
    });
    update(target);
  }

  previous.addEventListener('click', () => { pause(); show(current - 1); });
  next.addEventListener('click', () => { pause(); show(current + 1); });
  pageButtons.forEach((button, index) => button.addEventListener('click', () => { pause(); show(index); }));
  toggle.addEventListener('click', () => {
    playing = !playing;
    if (playing) hovering = false;
    playback();
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
  viewport.addEventListener('pointerdown', pause);
  viewport.addEventListener('wheel', pause, { passive: true });
  viewport.addEventListener('keydown', (event) => {
    const keys = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    pause();
    show(keys[event.key]);
  });
  viewport.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const index = Math.round(viewport.scrollLeft / viewport.clientWidth);
      if (index !== current) update(Math.max(0, Math.min(slides.length - 1, index)));
    });
  }, { passive: true });
  new ResizeObserver(() => {
    viewport.scrollTo({ left: current * viewport.clientWidth, behavior: 'instant' });
  }).observe(viewport);
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
