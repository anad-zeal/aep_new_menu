/*
 * assets/js/script.js
 * Combined Router, Page Renderer, and Cross-Fading Slideshow
 */

const DEBUG = true;
const log = (...args) => DEBUG && console.log('[AEP]', ...args);

const scrollMemory = {};
let slideshowTimer = null;
let slideshowState = { current: 0, slides: [], isPaused: false };

// --- TRANSITIONS ---
function fadeSwap(element, newContentCallback) {
const currentHeight = element.offsetHeight;
element.style.minHeight = `${currentHeight}px`;
element.classList.add('fade-out');

setTimeout(() => {
newContentCallback();
element.classList.remove('fade-out');
element.classList.add('fade-in');
window.scrollTo({ top: 0, behavior: 'smooth' });

setTimeout(() => {
element.classList.remove('fade-in');
element.style.minHeight = '';
}, 300);
}, 300);
}

// --- SLIDESHOW LOGIC ---
function clearSlideshow() {
if (slideshowTimer) {
clearInterval(slideshowTimer);
slideshowTimer = null;
}
slideshowState = { current: 0, slides: [], isPaused: false };
}

function initSlideshow(jsonFilename) {
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
slideshowState.slides.forEach(({ src }, index) => {
const img = document.createElement('img');
img.src = src;
img.className = 'slide';
img.style.opacity = 0;
img.style.transition = 'opacity 1.5s ease-in-out';
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
const metaContainer = document.getElementById('meta-container');
const item = slideshowState.slides[index];

if (metaContainer && item) {
metaContainer.classList.remove('active'); // Start fade out

setTimeout(() => {
document.getElementById('meta-title').textContent = item.title || '';
document.getElementById('meta-medium').textContent = item.medium || '';
document.getElementById('meta-dimensions').textContent = item.dimensions || '';
document.getElementById('meta-description').textContent = item.description || '';
metaContainer.classList.add('active'); // Fade back in
}, 400); 
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

// --- PAGE RENDERERS ---

function renderCardGrid(targetContainer, cardGrid) {
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

function renderContentSection(targetContainer, sectionData) {
const wrapperElement = document.createElement(sectionData.tag);
if (sectionData.attributes)
Object.entries(sectionData.attributes).forEach(([k, v]) => wrapperElement.setAttribute(k, v));
const textWrap = document.createElement('div');
textWrap.style.maxWidth = '800px';
textWrap.style.margin = '0 auto';
textWrap.style.padding = '2rem';
sectionData.paragraphs.forEach((txt) => {
const p = document.createElement('p');
p.innerHTML = txt; 
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

function renderContactForm(targetContainer, formData) {
const sectionWrapper = document.createElement(formData.wrapper.tag || 'div');
if (formData.wrapper.attributes && formData.wrapper.attributes.class)
sectionWrapper.className = formData.wrapper.attributes.class;
Object.entries(formData.wrapper.attributes || {}).forEach(([k, v]) => {
if (k !== 'class') sectionWrapper.setAttribute(k, v);
});

const formEl = document.createElement(formData.form.tag || 'form');
Object.entries(formData.form.attributes || {}).forEach(([k, v]) => formEl.setAttribute(k, v));

(formData.form.headers || []).forEach((header) => {
const h = document.createElement(header.tag);
h.textContent = header.text;
formEl.appendChild(h);
});

// Handle Nested Structure (fields -> children)
const fields = formData.content?.fields || formData.form.fields;
if (fields) {
fields.forEach((fieldData) => {
const fieldSet = document.createElement(fieldData.tag || 'fieldset');
if (fieldData.children) {
fieldData.children.forEach((child) => {
const childEl = document.createElement(child.tag);
if (child.text) childEl.textContent = child.text;
Object.entries(child.attributes || {}).forEach(([k, v]) => {
if (v === true) childEl.setAttribute(k, '');
else childEl.setAttribute(k, v);
});
fieldSet.appendChild(childEl);
});
}
formEl.appendChild(fieldSet);
});
}

sectionWrapper.appendChild(formEl);
fadeSwap(targetContainer, () => {
targetContainer.innerHTML = '';
targetContainer.appendChild(sectionWrapper);
});
}

function renderSlideshow(targetContainer, template, gallerySource) {
const htmlContent = `
<div class="slideshow">
 <div class="loading-msg" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)">Loading...</div>
</div>

<div class="prev-arrow">
<button id="prev-slide" aria-label="Previous">
<img src="${template.previousButton.imgSrc}" alt="<">
</button>
</div>
<div class="next-arrow">
<button id="next-slide" aria-label="Next">
<img src="${template.nextButton.imgSrc}" alt=">">
</button>
</div>

<!-- NEW STRUCTURED METADATA AREA -->
<div class="slideshow-metadata" id="meta-container">
<h2 id="meta-title"></h2>
<p id="meta-medium"></p>
<p id="meta-dimensions"></p>
<div id="meta-description"></div>
</div>

<div class="return-arrow-container">
<a href="/artworks" data-page="artworks"><img src="${template.rtnArrow.imgSrc}" alt="Return"></a>
</div>
`;
fadeSwap(targetContainer, () => {
targetContainer.innerHTML = htmlContent;
initSlideshow(gallerySource);
});
}

// --- MAIN CONTROLLER ---

document.addEventListener('DOMContentLoaded', () => {
log('Initializing site application...');
const body = document.body;
const targetContainer = document.getElementById('dynamic-content-area');
const navMenu = document.getElementById('main-nav');
let siteData = null;

function renderPageContent(data, pageName) {
if (history.state?.page) scrollMemory[history.state.page] = window.scrollY;
clearSlideshow();
document.title = `${data.title} | The Life of an Artist`;

// Toggle Classes
if (data.slideshowTemplate) body.classList.add('slideshow-active');
else body.classList.remove('slideshow-active');
if (pageName === 'contact') body.classList.add('contact-page-active');
else body.classList.remove('contact-page-active');

// Toggle Header Texts
const subTitleEl = document.querySelector('.hero .sub-title');
if (subTitleEl)
subTitleEl.textContent = data.slideshowTemplate
? 'The Life of an Artist'
: 'The Life of an Artist';

const pageTitleEl = document.querySelector('.hero .page-title');
if (pageTitleEl) {
if (data.slideshowTemplate) {
pageTitleEl.textContent = data.title;
} else {
pageTitleEl.textContent = '';
}
}

// Route Content
if (data.cardGrid) renderCardGrid(targetContainer, data.cardGrid);
else if (data.contentSection) renderContentSection(targetContainer, data.contentSection);
else if (data.contactForm) renderContactForm(targetContainer, data.contactForm);
else if (data.slideshowTemplate)
renderSlideshow(
targetContainer,
data.slideshowTemplate,
data.slideshowTemplate.gallerySource
);

if (navMenu && navMenu.classList.contains('is-open')) navMenu.classList.remove('is-open');
setTimeout(() => {
window.scrollTo({ top: scrollMemory[pageName] || 0, behavior: 'smooth' });
}, 50);
}

async function loadPage(pageName, addToHistory = true) {
// 1. Check if global config (arrows, templates) is ready
if (!siteData) return;
// 2. Default to home if no page provided
if (!pageName || pageName === '/' || pageName === 'index.php') pageName = 'home';

// 3. FETCH THE DEDICATED PAGE FILE
// Instead of looking in siteData.pages, we fetch the file dynamically
let pageData;
try {
const response = await fetch(`/json-files/${pageName}.json`);
if (!response.ok) throw new Error(`File not found: ${pageName}.json`);
pageData = await response.json();
} catch (err) {
console.error('Page Load Error:', err);
return; // Stop execution if file is missing
}

// 4. Prepare data for the renderer
let finalData = { title: pageData.title };

// Map the JSON "type" to the Render Object
if (pageData.type === 'slideshow') {
// Merge global template (arrows/css) with this page's specific gallery source
const templateCopy = JSON.parse(JSON.stringify(siteData.slideshowTemplate));
// Ensure your page json has "gallerySource" pointing to the list of images
templateCopy.gallerySource = pageData.gallerySource;
finalData.slideshowTemplate = templateCopy;
}
else if (pageData.type === 'cardGrid') {
finalData.cardGrid = pageData.content;
alert("cardGrid's working");
}
else if (pageData.type === 'contentSection') {
    alert("contentSection's working");
finalData.contentSection = pageData.content;
}
else if (pageData.type === 'contactForm') {
    alert("contactForm's working");
finalData.contentSe
finalData.contactForm = pageData.content;
}

// 5. Render the content
renderPageContent(finalData, pageName);

// 6. Update Navigation Active State
const menuButtons = document.querySelectorAll('.main-nav-menu a, [data-page]');
menuButtons.forEach((btn) => btn.classList.remove('active', 'is-active'));
const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
if (activeBtn) activeBtn.classList.add('active');

// 7. Push to History
if (addToHistory) {
const urlPath = pageName === 'home' ? '/' : `/${pageName}`;
history.pushState({ page: pageName }, finalData.title, urlPath);
}
}

async function init() {
try {
const response = await fetch('json-files/site-data.json');
siteData = await response.json();
let path = window.location.pathname.replace(/^\//, '');
if (path === 'index.html' || path === 'index.php') path = '';
loadPage(path || 'home', false);
} catch (err) {
console.error('INIT ERROR:', err);
}
}

document.addEventListener('click', (event) => {
const link = event.target.closest('a[data-page]');
if (link) {
    alert
event.preventDefault();
loadPage(link.dataset.page);
}
if (event.target.closest('#hamburger-btn')) if (navMenu) navMenu.classList.add('is-open');
if (event.target.closest('#close-nav-btn') || event.target.closest('#nav-backdrop'))
if (navMenu) navMenu.classList.remove('is-open');
});

window.addEventListener('popstate', (event) => {
const page = event.state?.page || 'home';
loadPage(page, false);
});

init();
});