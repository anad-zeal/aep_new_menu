/*
 * assets/js/script.js
 * Combined Router, Page Renderer, and Cross-Fading Slideshow
 */

const DEBUG = true;
const log = (...args) => DEBUG && console.log('[AEP]', ...args);

const scrollMemory = {};
let slideshowTimer = null;
let slideshowState = { current: 0, slides: [], isPaused: false };

// --- Transitions ---
function fadeSwap(element, newContentCallback) {
  const currentHeight = element.offsetHeight;
  element.style.minHeight = `${currentHeight}px`;
  element.classList.add('fade-out');

  setTimeout(() => {
    newContentCallback();
    element.classList.remove('fade-out');
    element.classList.add('fade-in');

    // Scroll to top of container if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      element.classList.remove('fade-in');
      element.style.minHeight = '';
    }, 300);
  }, 300);
}

// --- Slideshow ---
function clearSlideshow() {
  if (slideshowTimer) {
    clearInterval(slideshowTimer);
    slideshowTimer = null;
  }
  slideshowState = { current: 0, slides: [], isPaused: false };
}

function initSlideshow(jsonFilename) {
  log(`Initializing slideshow with source: ${jsonFilename}`);
  const slideshowContainer = document.querySelector('.slideshow');
  const caption = document.getElementById('caption-text');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');

  if (!slideshowContainer) return;

  const fetchPath = `json-files/${jsonFilename}`;

  fetch(fetchPath)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${fetchPath}`);
      return res.json();
    })
    .then((data) => {
      slideshowState.slides = data;
      slideshowContainer.innerHTML = '';
      createSlides(slideshowContainer);
      setupControls(prevBtn, nextBtn, slideshowContainer);
      fadeInFirstSlide(caption);
    })
    .catch((err) => console.error(err));
}

function createSlides(container) {
  container.style.position = 'relative';
  // Adjust height based on viewport
  container.style.height = '60vh';

  slideshowState.slides.forEach(({ src }, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'slide';
    Object.assign(img.style, {
      opacity: 0,
      transition: 'opacity 1.5s ease-in-out',
      position: 'absolute',
      maxWidth: '100%',
      maxHeight: '100%',
      width: 'auto',
      height: 'auto',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 'auto',
      display: 'block',
      objectFit: 'contain',
    });
    container.appendChild(img);
  });
}

function fadeInFirstSlide(captionEl) {
  const slidesDOM = document.querySelectorAll('.slide');
  if (slidesDOM.length === 0) return;
  const firstSlide = slidesDOM[0];
  firstSlide.style.opacity = 0;
  requestAnimationFrame(() => {
    firstSlide.style.opacity = 1;
  });

  if (captionEl && slideshowState.slides[0]) {
    captionEl.textContent = slideshowState.slides[0].caption || '';
    captionEl.style.opacity = 0;
    setTimeout(() => {
      captionEl.style.transition = 'opacity 1.5s ease-in-out';
      captionEl.style.opacity = 1;
    }, 100);
  }
  setTimeout(() => {
    showSlide(0);
    startAutoPlay();
  }, 2000);
}

function showSlide(index) {
  const slidesDOM = document.querySelectorAll('.slide');
  const captionEl = document.getElementById('caption-text');
  if (captionEl) {
    captionEl.style.opacity = 0;
    setTimeout(() => {
      if (slideshowState.slides[index])
        captionEl.textContent = slideshowState.slides[index].caption || '';
      captionEl.style.opacity = 1;
    }, 500);
  }
  slidesDOM.forEach((img, i) => {
    img.style.opacity = i === index ? 1 : 0;
    img.style.zIndex = i === index ? 2 : 1;
  });
  slideshowState.current = index;
}

function nextSlide() {
  const next = (slideshowState.current + 1) % slideshowState.slides.length;
  showSlide(next);
}

function prevSlide() {
  const prev =
    (slideshowState.current - 1 + slideshowState.slides.length) % slideshowState.slides.length;
  showSlide(prev);
}

function startAutoPlay() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  slideshowTimer = setInterval(nextSlide, 5000);
}

function resetAutoPlay() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  if (!slideshowState.isPaused) startAutoPlay();
}

function setupControls(prevBtn, nextBtn, container) {
  if (nextBtn)
    nextBtn.onclick = (e) => {
      e.preventDefault();
      nextSlide();
      resetAutoPlay();
    };
  if (prevBtn)
    prevBtn.onclick = (e) => {
      e.preventDefault();
      prevSlide();
      resetAutoPlay();
    };

  container.addEventListener('mouseenter', () => {
    slideshowState.isPaused = true;
    if (slideshowTimer) clearInterval(slideshowTimer);
  });
  container.addEventListener('mouseleave', () => {
    slideshowState.isPaused = false;
    startAutoPlay();
  });
  container.addEventListener(
    'touchstart',
    () => {
      slideshowState.isPaused = true;
      if (slideshowTimer) clearInterval(slideshowTimer);
    },
    { passive: true }
  );
  container.addEventListener(
    'touchend',
    () => {
      slideshowState.isPaused = false;
      startAutoPlay();
    },
    { passive: true }
  );
}

// --- Main App ---
document.addEventListener('DOMContentLoaded', () => {
  log('Initializing site application...');
  const body = document.body;
  const targetContainer = document.getElementById('dynamic-content-area');
  const navMenu = document.getElementById('main-nav');
  let siteData = null;

  function renderCardGrid(cardGrid) {
    const sectionWrapper = document.createElement('section');
    sectionWrapper.className = 'card-grid';

    cardGrid.forEach((item) => {
      const card = document.createElement('div');
      card.className = item.type;
      const content = item.content;
      const cardContent = document.createElement('div');
      cardContent.className = content.type;
      cardContent.style.width = '100%';
      cardContent.style.height = '100%';
      cardContent.style.display = 'flex';
      cardContent.style.justifyContent = 'center';
      cardContent.style.alignItems = 'center';
      cardContent.style.flexDirection = 'column';
      cardContent.style.textAlign = 'center';

      if (content.class) cardContent.classList.add(...content.class.split(' '));
      if (content.link) {
        const linkElement = document.createElement('a');
        linkElement.href = content.link.href;
        linkElement.textContent = content.link.text;
        linkElement.className = content.link.class || 'page-link';
        const pageName = content.link.href.replace(/^\//, '').trim();
        if (pageName) linkElement.dataset.page = pageName;
        cardContent.appendChild(linkElement);
      }
      if (content.paragraph) {
        const p = document.createElement('p');
        p.textContent = content.paragraph;
        cardContent.appendChild(p);
      }
      card.appendChild(cardContent);
      sectionWrapper.appendChild(card);
    });

    fadeSwap(targetContainer, () => {
      targetContainer.innerHTML = '';
      targetContainer.appendChild(sectionWrapper);
    });
  }

  function renderContentSection(sectionData) {
    const wrapperElement = document.createElement(sectionData.tag);
    Object.entries(sectionData.attributes || {}).forEach(([k, v]) =>
      wrapperElement.setAttribute(k, v)
    );

    // Add a container for text to constrain width
    const textWrap = document.createElement('div');
    textWrap.style.maxWidth = '800px';
    textWrap.style.margin = '0 auto';
    textWrap.style.padding = '2rem';

    sectionData.paragraphs.forEach((txt) => {
      const p = document.createElement('p');
      p.textContent = txt;
      p.style.marginBottom = '1em';
      p.style.lineHeight = '1.6';
      textWrap.appendChild(p);
    });

    wrapperElement.appendChild(textWrap);

    fadeSwap(targetContainer, () => {
      targetContainer.innerHTML = '';
      targetContainer.appendChild(wrapperElement);
    });
  }

  function renderContactForm(formData) {
    const sectionWrapper = document.createElement(formData.wrapper.tag || 'div');
    sectionWrapper.classList.add('contact-wrapper'); // Ensure CSS wrapper class
    Object.entries(formData.wrapper.attributes || {}).forEach(([k, v]) =>
      sectionWrapper.setAttribute(k, v)
    );

    const formEl = document.createElement(formData.form.tag || 'form');
    Object.entries(formData.form.attributes || {}).forEach(([k, v]) => formEl.setAttribute(k, v));

    (formData.form.headers || []).forEach((header) => {
      const h = document.createElement(header.tag);
      h.textContent = header.text;
      formEl.appendChild(h);
    });

    if (formData.form.fields) {
      formData.form.fields.forEach((fieldData) => {
        const fieldSet = document.createElement(fieldData.wrapperTag || 'fieldset');
        const inputEl = document.createElement(fieldData.tag);
        if (fieldData.text) inputEl.textContent = fieldData.text;
        Object.entries(fieldData.attributes || {}).forEach(([k, v]) => {
          if (v === true) inputEl.setAttribute(k, '');
          else inputEl.setAttribute(k, v);
        });
        fieldSet.appendChild(inputEl);
        formEl.appendChild(fieldSet);
      });
    }
    sectionWrapper.appendChild(formEl);

    fadeSwap(targetContainer, () => {
      targetContainer.innerHTML = '';
      targetContainer.appendChild(sectionWrapper);
    });
  }

  function renderSlideshow(template, pageTitle, gallerySource) {
    const htmlContent = `
      <div class="slideshow" style="width:100%; height: 60vh; position: relative;">
           <div class="loading-msg" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)">Loading Gallery...</div>
      </div>
      <div class="previous">
        <button id="prev-slide" class="prev-next" aria-label="Previous">
          <img src="${template.previousButton.imgSrc}" width="40" alt="<">
        </button>
      </div>
      <div class="next">
        <button id="next-slide" class="prev-next" aria-label="Next">
          <img src="${template.nextButton.imgSrc}" width="40" alt=">">
        </button>
      </div>
      <div class="caption">
        <p id="caption-text"></p>
      </div>
      <div style="text-align:center; margin-top:2rem;">
        <a href="/artworks" data-page="artworks" style="color:var(--brand); text-decoration:none;">
            <img src="${template.rtnArrow.imgSrc}" width="30" alt="Return">
        </a>
      </div>
    `;

    fadeSwap(targetContainer, () => {
      targetContainer.innerHTML = htmlContent;
      initSlideshow(gallerySource);
    });
  }

  function renderPageContent(data, pageName) {
    if (history.state?.page) scrollMemory[history.state.page] = window.scrollY;
    clearSlideshow();
    document.title = `${data.title} | Alexis Elza`;
    if (data.slideshowTemplate) body.classList.add('slideshow-active');
    else body.classList.remove('slideshow-active');

    if (data.cardGrid) renderCardGrid(data.cardGrid);
    else if (data.contentSection) renderContentSection(data.contentSection);
    else if (data.contactForm) renderContactForm(data.contactForm);
    else if (data.slideshowTemplate)
      renderSlideshow(data.slideshowTemplate, data.title, data.slideshowTemplate.gallerySource);

    // Auto-close menu on navigate
    if (navMenu && navMenu.classList.contains('is-open')) navMenu.classList.remove('is-open');
  }

  async function loadPage(pageName, addToHistory = true) {
    if (!siteData) return;
    if (!pageName || pageName === '/' || pageName === 'index.php') pageName = 'home';

    const pageData = siteData.pages[pageName];
    if (!pageData) {
      console.error('Page not found:', pageName);
      return;
    }

    let finalData = { title: pageData.title };
    if (pageData.type === 'slideshow') {
      const templateCopy = JSON.parse(JSON.stringify(siteData.slideshowTemplate));
      templateCopy.gallerySource = pageData.gallerySource;
      finalData.slideshowTemplate = templateCopy;
    } else if (pageData.type === 'cardGrid') finalData.cardGrid = pageData.content;
    else if (pageData.type === 'contentSection') finalData.contentSection = pageData.content;
    else if (pageData.type === 'contactForm') finalData.contactForm = pageData.content;

    renderPageContent(finalData, pageName);

    if (addToHistory) {
      const urlPath = pageName === 'home' ? '/' : `/${pageName}`;
      history.pushState({ page: pageName }, finalData.title, urlPath);
    }
  }

  async function init() {
    try {
      const response = await fetch('json-files/site-data.json');
      if (!response.ok) throw new Error('Bad JSON response');
      siteData = await response.json();

      let path = window.location.pathname.replace(/^\//, '');
      if (path === 'index.html' || path === 'index.php') path = '';
      const initialPage = path || 'home';
      loadPage(initialPage, false);
    } catch (err) {
      console.error('INIT ERROR:', err);
    }
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-page]');
    if (link) {
      event.preventDefault();
      loadPage(link.dataset.page);
    }
    const btn = event.target.closest('#hamburger-btn');
    if (btn && navMenu) navMenu.classList.add('is-open');

    const close = event.target.closest('#close-nav-btn') || event.target.closest('#nav-backdrop');
    if (close && navMenu) navMenu.classList.remove('is-open');
  });

  window.addEventListener('popstate', (event) => {
    const page = event.state?.page || 'home';
    loadPage(page, false);
  });

  init();
});
