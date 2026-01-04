export default class Gallery {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.slides = [];
        this.currentIndex = 0;
        this.cache = {}; // Simple image cache
    }

    /**
     * Initialize the gallery with a specific category
     * @param {string} categorySlug - corresponds to json filename prefix
     */
    async init(categorySlug) {
        this.renderLoading();
        
        try {
            const response = await fetch(`json-files/${categorySlug}-slideshow.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            this.slides = await response.json();
            
            if (this.slides.length === 0) {
                this.container.innerHTML = '<p>No images found in this gallery.</p>';
                return;
            }

            this.currentIndex = 0;
            this.renderLayout();
            this.loadSlide(this.currentIndex);
        } catch (error) {
            console.error("Gallery Load Error:", error);
            this.container.innerHTML = `<p>Error loading gallery: ${error.message}</p>`;
        }
    }

    renderLoading() {
        this.container.innerHTML = '<div class="gallery-module"><div class="loader" style="position:relative; margin:auto;"></div></div>';
    }

    renderLayout() {
        // Build the basic HTML structure
        this.container.innerHTML = `
            <div class="gallery-module">
                <div class="gallery-stage" id="gallery-stage">
                    <div class="loader" id="stage-loader"></div>
                    <button class="gallery-nav-btn prev-btn">&lsaquo;</button>
                    <img id="main-image" src="" alt="Gallery Image">
                    <button class="gallery-nav-btn next-btn">&rsaquo;</button>
                    
                    <div class="gallery-info">
                        <h3 id="image-title"></h3>
                        <p id="image-caption"></p>
                    </div>
                </div>

                <div class="gallery-thumbs" id="gallery-thumbs">
                    <!-- Thumbnails generated here -->
                </div>
            </div>
        `;

        // Cache DOM elements
        this.mainImage = document.getElementById('main-image');
        this.imageTitle = document.getElementById('image-title');
        this.imageCaption = document.getElementById('image-caption');
        this.stageLoader = document.getElementById('stage-loader');
        this.thumbsContainer = document.getElementById('gallery-thumbs');

        // Render Thumbnails
        this.slides.forEach((slide, index) => {
            const btn = document.createElement('button');
            btn.innerHTML = `<img src="${slide.src}" alt="thumb">`;
            btn.onclick = () => this.loadSlide(index);
            this.thumbsContainer.appendChild(btn);
        });

        // Event Listeners for Nav
        this.container.querySelector('.prev-btn').addEventListener('click', () => this.prev());
        this.container.querySelector('.next-btn').addEventListener('click', () => this.next());
        
        // Keyboard Nav
        this.handleKeydown = (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        };
        document.addEventListener('keydown', this.handleKeydown);
    }

    loadSlide(index) {
        // Bounds check
        if (index < 0) index = this.slides.length - 1;
        if (index >= this.slides.length) index = 0;

        this.currentIndex = index;
        const slideData = this.slides[index];

        // UI Updates
        this.stageLoader.style.display = 'block';
        this.mainImage.classList.remove('loaded');
        this.mainImage.style.opacity = '0';

        // Update Text
        this.imageTitle.textContent = slideData.title || 'Untitled';
        this.imageCaption.textContent = slideData.caption || '';

        // Load Image
        const img = new Image();
        img.src = slideData.src;
        
        img.onload = () => {
            this.mainImage.src = slideData.src;
            this.mainImage.alt = slideData.alt || slideData.title;
            this.stageLoader.style.display = 'none';
            this.mainImage.style.opacity = '1';
            this.mainImage.classList.add('loaded');
        };

        // Update Thumbnails Active State
        const thumbs = this.thumbsContainer.children;
        Array.from(thumbs).forEach((t, i) => {
            if (i === index) t.classList.add('active');
            else t.classList.remove('active');
        });
        
        // Scroll thumbnail into view
        thumbs[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    next() {
        this.loadSlide(this.currentIndex + 1);
    }

    prev() {
        this.loadSlide(this.currentIndex - 1);
    }

    // Clean up event listeners when module is destroyed (SPA requirement)
    destroy() {
        document.removeEventListener('keydown', this.handleKeydown);
        this.container.innerHTML = '';
    }
}