const carousel = document.querySelector('[data-picture-carousel]');

if (carousel) {
  const viewport = carousel.querySelector('[data-carousel-viewport]');
  const slides = [...viewport.children];
  const controls = carousel.querySelector('[data-carousel-controls]');
  const previous = carousel.querySelector('[data-carousel-previous]');
  const next = carousel.querySelector('[data-carousel-next]');
  const status = carousel.querySelector('[data-carousel-status]');
  const fullSize = carousel.querySelector('[data-carousel-fullsize]');
  const pages = carousel.querySelector('[data-carousel-pages]');
  const pageButtons = [...pages.querySelectorAll('[data-carousel-page]')];
  let current = 0;
  let scrollFrame;

  function update(index) {
    current = index;
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    status.textContent = `${current + 1} / ${slides.length}`;
    fullSize.href = slides[current].querySelector('img').src;
    fullSize.setAttribute('aria-label', `Open page ${current + 1} at full size`);
    pageButtons.forEach((button, page) => {
      if (page === current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  function show(index) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    viewport.scrollTo({
      left: target * viewport.clientWidth,
      behavior: 'instant',
    });
  }

  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  pageButtons.forEach((button, index) => button.addEventListener('click', () => show(index)));
  viewport.addEventListener('keydown', (event) => {
    const keys = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
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

  carousel.classList.add('is-enhanced');
  controls.hidden = false;
  update(0);
  fullSize.hidden = false;
}
