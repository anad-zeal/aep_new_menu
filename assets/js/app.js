
import Gallery from './modules/Gallery.js';
import Biography from './modules/Biography.js';
import Contact from './modules/Contact.js';

// ==========================================
// 1. State Management
// ==========================================
const AppState = {
    currentModule: null
};

// DOM Elements
const rootElementId = 'app-root';
const nav = document.getElementById('main-nav');
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');

// ==========================================
// 2. Helper Functions
// ==========================================

function clearModule() {
    if (AppState.currentModule && typeof AppState.currentModule.destroy === 'function') {
        AppState.currentModule.destroy();
    }
    AppState.currentModule = null;
}

function closeMenu() {
    if(nav) nav.classList.remove('open');
}

function openMenu() {
    if(nav) nav.classList.add('open');
}

// ==========================================
// 3. Router / Navigation Handler
// ==========================================
function handleNavigation(action, payload = null) {
    // 1. Clean up previous content
    clearModule();

    // 2. TOGGLE CSS CLASS BASED ON SELECTION
    if (action === 'home') {
        // HOME STATE: Remove the class so the image comes back and text reverts
        document.body.classList.remove('viewing-content');
        
        document.getElementById(rootElementId).innerHTML = `
            <div class="site-title">
                <h1>The Life of an Artist</h1>
            </div>`;
    } 
    else {
        // CONTENT STATE: Add class to fade out image and turn text Gold
        document.body.classList.add('viewing-content');

        // Load specific modules
        switch(action) {
            case 'gallery':
                console.log(`Loading Gallery: ${payload}`);
                AppState.currentModule = new Gallery(rootElementId);
                AppState.currentModule.init(payload);
                break;
                
            case 'bio':
                AppState.currentModule = new Biography(rootElementId);
                AppState.currentModule.init();
                break;
                
            case 'contact':
                AppState.currentModule = new Contact(rootElementId);
                AppState.currentModule.init();
                break;
        }
    }

    // 3. Always close menu after making a selection
    closeMenu();
}

// ==========================================
// 4. Event Listeners
// ==========================================

// --- Menu Toggles ---
if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent immediate closing
        openMenu();
    });
}

if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
}

// Close Menu (Click Outside)
document.addEventListener('click', (e) => {
    if (nav && nav.classList.contains('open') && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
    }
});

// --- Navigation Clicks (Event Delegation) ---
document.addEventListener('click', (e) => {
    // 1. Check for Slideshow Category Buttons
    if (e.target.closest('[data-gallery]')) {
        const btn = e.target.closest('[data-gallery]');
        const galleryType = btn.dataset.gallery;
        handleNavigation('gallery', galleryType);
    }
    
    // 2. Check for Main Menu Buttons (Home, Bio, Contact)
    if (e.target.closest('[data-action]')) {
        const btn = e.target.closest('[data-action]');
        const action = btn.dataset.action;
        handleNavigation(action);
    }
});

// --- Footer Date Auto-Update ---
const yearSpan = document.getElementById('copyright-year');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

console.log("App Initialized");