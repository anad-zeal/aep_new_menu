
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

/**
 * Clean up the previous module (remove event listeners, etc.)
 */
function clearModule() {
    if (AppState.currentModule && typeof AppState.currentModule.destroy === 'function') {
        AppState.currentModule.destroy();
    }
    AppState.currentModule = null;
}

/**
 * Handle Menu Interaction (Open/Close)
 */
function closeMenu() {
    nav.classList.remove('open');
}

function openMenu() {
    nav.classList.add('open');
}

// ==========================================
// 3. Router / Navigation Handler
// ==========================================
function handleNavigation(action, payload = null) {
    // 1. Clean up previous content
    clearModule();

    // 2. Load new content based on action
    switch(action) {
        case 'gallery':
            console.log(`Loading Gallery: ${payload}`);
            AppState.currentModule = new Gallery(rootElementId);
            AppState.currentModule.init(payload); // payload is 'black-and-white', etc.
            break;
            
        case 'bio':
            console.log("Loading Biography");
            AppState.currentModule = new Biography(rootElementId);
            AppState.currentModule.init();
            break;
            
        case 'contact':
            console.log("Loading Contact");
            AppState.currentModule = new Contact(rootElementId);
            AppState.currentModule.init();
            break;
            
        case 'home':
        default:
            document.getElementById(rootElementId).innerHTML = "<div class='welcome-message'>Select a gallery to begin.</div>";
            break;
    }

    // 3. Always close menu after making a selection
    closeMenu();
}

// ==========================================
// 4. Event Listeners
// ==========================================

// --- Menu Toggles ---

// Open Menu
if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent immediate closing
        openMenu();
    });
}

// Close Menu (X button)
if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
}

// Close Menu (Click Outside)
document.addEventListener('click', (e) => {
    // If menu is open, AND we didn't click inside the menu, AND we didn't click the toggle button
    if (nav.classList.contains('open') && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
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

console.log("App Initialized");