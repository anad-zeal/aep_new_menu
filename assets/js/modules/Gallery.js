export default class Gallery {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.slides = [];
        this.currentIndex = 0;
    }

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
        this.container.innerHTML = '<div class="gallery-module"><div class="loader"></div></div>';
    }

    renderLayout() {
        // Build the simplified HTML structure (No thumbs div)
        this.container.innerHTML = `
            <div class="gallery-module">
                <div class="gallery-stage" id="gallery-stage">
                    <div class="loader" id="stage-loader"></div>
                    
                    <button class="gallery-nav-btn prev-btn">&lsaquo;</button>
                    <img id="main-image" src="" alt="Gallery Image">
                    <button class="gallery-nav-btn next-btn">&rsaquo;</button>
                    
                    <div class="gallery-info">
                        <h3 id="image-title"></h3>
                        <p id="image-captions"></p>
                    </div>
                </div>
            </div>
        `;

        // Cache DOM elements
        this.mainImage = document.getElementById('main-image');
        this.imageTitle = document.getElementById('image-title');
        this.imageCaption = document.getElementById('image-caption');
       // this.stageLoader = document.getElementById('stage-loader');

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
        this.imageTitle.textContent = slideData.title || '';
       // this.imageCaption.textContent = slideData.caption || '';

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
    }

    next() {
        this.loadSlide(this.currentIndex + 1);
    }

    prev() {
        this.loadSlide(this.currentIndex - 1);
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeydown);
        this.container.innerHTML = '';
    }
}