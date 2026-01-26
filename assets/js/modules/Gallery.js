export default class Gallery {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.slidesData = [];
    this.slideElements = [];
    this.currentIndex = 0;

    this.timer = null;
    this.intervalTime = 5000;
    this.textTimer = null;

    this.handleKeydown = null;
  }

  async init(categorySlug) {
    document.body.classList.add('slideshow-active');

    const title = categorySlug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    try {
      const res = await fetch(`json-files/${categorySlug}-slideshow.json`);
      if (!res.ok) throw new Error(res.status);
      this.slidesData = await res.json();

      this.renderLayout(title);
      this.startSlideshow();
    } catch (e) {
      console.error(e);
      this.container.innerHTML = '<p>Error loading gallery.</p>';
    }
  }

  renderLayout(categoryTitle) {
    this.container.innerHTML = `
      <div class="gallery-module">
        <div class="logo"><p>The Life of an Artist</p></div>

        <div class="category">
          <h4>THE</h4>
          <p class="category-title">${categoryTitle}</p>
          <h4>SERIES</h4>
        </div>

        <div class="prev-arrow">
          <button aria-label="Previous slide"></button>
        </div>

        <div class="slideshow" aria-live="polite"></div>

        <div class="next-arrow">
          <button aria-label="Next slide"></button>
        </div>

        <div class="description">
          <div class="slide-title"></div>
        </div>
      </div>
    `;

    this.stage = this.container.querySelector('.slideshow');
    this.titleEl = this.container.querySelector('.slide-title');

    this.slidesData.forEach((data) => {
      const img = document.createElement('img');
      img.src = data.src;
      img.alt = data.alt || data.title || '';
      img.className = 'slide';
      this.stage.appendChild(img);
      this.slideElements.push(img);
    });

    this.activateSlide(0, true);

    this.container.querySelector('.prev-arrow button')
      .addEventListener('click', () => this.prev());

    this.container.querySelector('.next-arrow button')
      .addEventListener('click', () => this.next());

    this.handleKeydown = (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'Escape') this.destroy();
    };

    document.addEventListener('keydown', this.handleKeydown);
  }

  activateSlide(index, immediate = false) {
    this.slideElements.forEach(el => el.classList.remove('is-active'));

    const slide = this.slideElements[index];
    if (!slide) return;

    slide.classList.add('is-active');
    this.updateText(index, immediate);
    this.currentIndex = index;
  }

  updateText(index, immediate) {
    const title = this.slidesData[index]?.title || '';

    if (immediate) {
      this.titleEl.textContent = title;
      this.titleEl.style.opacity = '1';
      return;
    }

    this.titleEl.style.opacity = '0';
    clearTimeout(this.textTimer);

    this.textTimer = setTimeout(() => {
      this.titleEl.textContent = title;
      this.titleEl.style.opacity = '1';
    }, 400);
  }

  next() {
    this.resetTimer();
    this.activateSlide((this.currentIndex + 1) % this.slideElements.length);
  }

  prev() {
    this.resetTimer();
    this.activateSlide(
      (this.currentIndex - 1 + this.slideElements.length) %
      this.slideElements.length
    );
  }

  startSlideshow() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.next(), this.intervalTime);
  }

  resetTimer() {
    this.startSlideshow();
  }

  destroy() {
    clearInterval(this.timer);
    clearTimeout(this.textTimer);
    document.removeEventListener('keydown', this.handleKeydown);
    document.body.classList.remove('slideshow-active');
    this.container.innerHTML = '';
  }
}