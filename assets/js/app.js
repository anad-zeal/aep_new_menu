import Gallery from './modules/Gallery.js';

// Simple State Management
const AppState = {
currentModule: null
};

// DOM Elements
const rootElementId = 'app-root';

// Function to clear current module
function clearModule() {
if (AppState.currentModule && typeof AppState.currentModule.destroy === 'function') {
AppState.currentModule.destroy();
}
AppState.currentModule = null;
}

// Router / Handler
function handleNavigation(action, payload = null) {
clearModule();

switch(action) {
case 'gallery':
console.log(`Loading Gallery: ${payload}`);
AppState.currentModule = new Gallery(rootElementId);
AppState.currentModule.init(payload); // payload is 'black-and-white', etc.
break;

case 'bio':
document.getElementById(rootElementId).innerHTML = "<h1>Biography Module (Coming Soon)</h1>";
break;

case 'contact':
document.getElementById(rootElementId).innerHTML = "<h1>Contact Module (Coming Soon)</h1>";
break;

case 'home':
default:
document.getElementById(rootElementId).innerHTML = "<div class='welcome-message'>Select a gallery to begin.</div>";
break;
}
}

// Event Delegation for Navigation
document.addEventListener('click', (e) => {
// Check for Gallery Buttons
if (e.target.closest('[data-gallery]')) {
const btn = e.target.closest('[data-gallery]');
const galleryType = btn.dataset.gallery;
handleNavigation('gallery', galleryType);
}

// Check for Main Menu Buttons
if (e.target.closest('[data-action]')) {
const btn = e.target.closest('[data-action]');
const action = btn.dataset.action;
handleNavigation(action);
}
});

// Init
console.log("App Initialized");