/*
 * assets/js/script.js
 * Combined Router, Page Renderer, and Cross-Fading Slideshow with Metadata Support
 */

const DEBUG = true;
const log = (...args) => DEBUG && console.log('[AEP]', ...args);

const scrollMemory = {};
let slideshowTimer = null;
let slideshowState = { current: 0, slides: [], isPaused: false };

// --- TRANSITIONS ---
function fadeSwap(element, newContentCallback) {
  element.classList.add('fade-out');
  setTimeout(() => {
    newContentCallback();
    element.classList.remove('fade-out');
    element.classList.add('fade-in');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => element.classList.remove('fade-in'), 300);
  }, 300);
}

// --- SLIDESHOW LOGIC ---
function clearSlideshow() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  slideshowTimer = null;
  slideshowState = { current: 0, slides: [], isPaused: false };
}

function initSlideshow(jsonFilename) {
  const slideshowContainer = document.querySelector('.slideshow');
  if (!slideshowContainer) return;

  // Cache buster included
  fetch(`json-files/${jsonFilename}?v=${new Date().getTime()}`)
    .then(res => res.json())
    .then(data => {
      slideshowState.slides = data;
      slideshowContainer.innerHTML = '';
      createSlides(slideshowContainer);
      setupControls();
      showSlide(0); 
      startAutoPlay();
    });
}

function createSlides(container) {
  slideshowState.slides.forEach(({ src }) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'slide';
    container.appendChild(img);
  });
}

function showSlide(index) {
  const slidesDOM = document.querySelectorAll('.slide');
  const metaContainer = document.getElementById('meta-container');
  const item = slideshowState.slides[index];

  if (metaContainer && item) {
    metaContainer.classList.remove('active'); 
    setTimeout(() => {
      document.getElementById('meta-title').textContent = item.title || '';
      document.getElementById('meta-medium').textContent = item.medium || '';
      document.getElementById('meta-dimensions').textContent = item.dimensions || '';
      document.getElementById('meta-description').textContent = item.description || '';
      metaContainer.classList.add('active');
    }, 400); 
  }

  slidesDOM.forEach((img, i) => {
    img.style.opacity = i === index ? 1 : 0;
    img.style.zIndex = i === index ? 2 : 1;
  });
  slideshowState.current = index;
}

function nextSlide() { showSlide((slideshowState.current + 1) % slideshowState.slides.length); }
function prevSlide() { showSlide((slideshowState.current - 1 + slideshowState.slides.length) % slideshowState.slides.length); }

function startAutoPlay() { 
  if (slideshowTimer) clearInterval(slideshowTimer);
  slideshowTimer = setInterval(nextSlide, 5000); 
}

function setupControls() {
  const nextBtn = document.getElementById('next-slide');
  const prevBtn = document.getElementById('prev-slide');
  if (nextBtn) nextBtn.onclick = () => { nextSlide(); startAutoPlay(); };
  if (prevBtn) prevBtn.onclick = () => { prevSlide(); startAutoPlay(); };
}

// --- RENDERERS ---

function renderSlideshow(targetContainer, template, gallerySource) {
  const htmlContent = `
    <div class="slideshow"></div>
    <div class="prev-arrow"><button id="prev-slide"><img src="${template.previousButton.imgSrc}"></button></div>
    <div class="next-arrow"><button id="next-slide"><img src="${template.nextButton.imgSrc}"></button></div>
    
    <div class="slideshow-metadata" id="meta-container">
      <h2 id="meta-title"></h2>
      <p id="meta-medium"></p>
      <p id="meta-dimensions"></p>
      <div id="meta-description"></div>
    </div>

    <div class="return-arrow-container">
      <a href="/artworks" data-page="artworks"><img src="${template.rtnArrow.imgSrc}"></a>
    </div>
  `;
  fadeSwap(targetContainer, () => {
    targetContainer.innerHTML = htmlContent;
    initSlideshow(gallerySource);
  });
}

// ... Keep your existing renderCardGrid, renderContentSection, renderContactForm functions here ...

function renderCardGrid(targetContainer, cardGrid) {
  const sectionWrapper = document.createElement('section');
  sectionWrapper.className = 'card-grid';
  cardGrid.forEach((item) => {
    const card = document.createElement('div');
    card.className = item.type;
    const content = item.content;
    const cardContent = document.createElement('div');
    cardContent.className = content.type;
    cardContent.style.width = '100%'; cardContent.style.height = '100%'; cardContent.style.display = 'flex';
    cardContent.style.justifyContent = 'center'; cardContent.style.alignItems = 'center';
    cardContent.style.flexDirection = 'column'; cardContent.style.textAlign = 'center';

    if (content.class) cardContent.classList.add(...content.class.split(' '));
    if (content.link) {
      const linkElement = document.createElement('a');
      linkElement.href = content.link.href;
      linkElement.textContent = content.link.text;
      linkElement.className = content.link.class || 'page-link';
      linkElement.dataset.page = content.link.href.replace(/^\//, '').trim() || 'home';
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

function renderContentSection(targetContainer, sectionData) {
  const wrapperElement = document.createElement(sectionData.tag);
  const textWrap = document.createElement('div');
  textWrap.style.maxWidth = '800px'; textWrap.style.margin = '0 auto'; textWrap.style.padding = '2rem';
  sectionData.paragraphs.forEach((txt) => {
    const p = document.createElement('p'); p.textContent = txt;
    p.style.marginBottom = '1em'; p.style.lineHeight = '1.6';
    textWrap.appendChild(p);
  });
  wrapperElement.appendChild(textWrap);
  fadeSwap(targetContainer, () => {
    targetContainer.innerHTML = '';
    targetContainer.appendChild(wrapperElement);
  });
}

function renderContactForm(targetContainer, formData) {
  const sectionWrapper = document.createElement('div');
  sectionWrapper.className = 'contact-wrapper';
  const formEl = document.createElement('form');
  const fields = formData.content?.fields || [];
  fields.forEach((fieldData) => {
    const fieldSet = document.createElement('fieldset');
    (fieldData.children || []).forEach((child) => {
       const childEl = document.createElement(child.tag);
       if (child.text) childEl.textContent = child.text;
       Object.entries(child.attributes || {}).forEach(([k, v]) => childEl.setAttribute(k, v === true ? '' : v));
       fieldSet.appendChild(childEl);
    });
    formEl.appendChild(fieldSet);
  });
  sectionWrapper.appendChild(formEl);
  fadeSwap(targetContainer, () => {
    targetContainer.innerHTML = '';
    targetContainer.appendChild(sectionWrapper);
  });
}

// --- MAIN CONTROLLER ---
document.addEventListener('DOMContentLoaded', () => {
  const targetContainer = document.getElementById('dynamic-content-area');
  let siteData = null;

  async function loadPage(pageName, addToHistory = true) {
    if (!siteData) return;
    const pageData = siteData.pages[pageName] || siteData.pages['home'];
    clearSlideshow();

    if (pageData.type === 'slideshow') {
      const template = JSON.parse(JSON.stringify(siteData.slideshowTemplate));
      template.gallerySource = pageData.gallerySource;
      renderSlideshow(targetContainer, template, template.gallerySource);
    } else if (pageData.type === 'cardGrid') renderCardGrid(targetContainer, pageData.content);
    else if (pageData.type === 'contentSection') renderContentSection(targetContainer, pageData.content);
    else if (pageData.type === 'contactForm') renderContactForm(targetContainer, pageData.content);

    if (addToHistory) history.pushState({ page: pageName }, pageData.title, pageName === 'home' ? '/' : `/${pageName}`);
  }

  async function init() {
    const response = await fetch('json-files/site-data.json');
    siteData = await response.json();
    let path = window.location.pathname.replace(/^\//, '') || 'home';
    loadPage(path, false);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-page]');
    if (link) { e.preventDefault(); loadPage(link.dataset.page); }
  });

  window.addEventListener('popstate', (e) => loadPage(e.state?.page || 'home', false));
  init();
});