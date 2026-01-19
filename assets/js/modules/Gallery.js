export default class Gallery {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.slidesData = [];
        this.slideElements = [];
        this.currentIndex = 0;

        // Automation
        this.timer = null;
        this.intervalTime = 5000;

        // Text Fade Timer
        this.textTimer = null;

        this.categoryTitle = "";
    }

    /**
     * Initialize the gallery
     * @param {string} categorySlug - e.g. 'black-and-white'
     */
    async init(categorySlug) {
        // Pretty print title from slug
        this.categoryTitle = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        this.renderLoading();

        try {
            const response = await fetch(`json-files/${categorySlug}-slideshow.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.slidesData = await response.json();

            if (this.slidesData.length === 0) {
                this.container.innerHTML = '<p style="text-align:center; padding:2rem;">No images found.</p>';
                return;
            }

            this.renderLayout();
            this.startSlideshow();

        } catch (error) {
            console.error("Gallery Load Error:", error);
            this.container.innerHTML = `<p style="text-align:center; padding:2rem;">Error loading gallery.</p>`;
        }
    }

    renderLoading() {
        this.container.innerHTML = '<div class="gallery-module-wrapper"><div class="loader"></div></div>';
    }

    renderLayout() {
        // 1. Create the DOM Structure
        // Updates: 
        // - Separated .logo and .category divs to match grid-template-areas
        // - Added <h4> tags for "collection" and "series"
        this.container.innerHTML = `
            <div class="gallery-module">

                <!-- Logo Area -->
                <div class="logo">
                    <p class="logo">The Life of an Artist</p>
                </div>

                <!-- Category Area -->
                <div class="category">
                    <div class="category-wrapper">
                        <h4>the</h4>
                        <p class="category">${this.categoryTitle}</p>
                        <h4>series</h4>
                    </div>
                </div>

                <!-- Nav -->
                <div class="prev-arrow">
                    <button class="gallery-nav-btn prev-btn" aria-label="Previous Slide"><</button>
                </div>

                <!-- Slides Container -->
                <div class="gallery-stage" id="gallery-stage">
                    <!-- Images injected here -->
                </div>

                <!-- Nav -->
                <div class="next-arrow">
                    <button class="gallery-nav-btn next-btn" aria-label="Next Slide">></button>
                </div>

                <!-- Footer / Description -->
                <div class="description">
                    <h3 class="slide-title"></h3>
                </div>
            </div>
        `;

        // 2. Cache Elements
        const stage = document.getElementById('gallery-stage');
        this.titleEl = this.container.querySelector('.slide-title');

        // 3. Create ALL Image Elements immediately (Stacking)
        this.slidesData.forEach((data, index) => {
            const img = document.createElement('img');
            img.src = data.src;
            img.alt = data.alt || data.title;
            // NOTE: We do NOT add .active here. We wait for DOM paint.
            stage.appendChild(img);
            this.slideElements.push(img);
        });

        // 4. Trigger First Slide Fade-In
        // We use a small timeout to ensure the browser registers opacity:0 first.
        setTimeout(() => {
            if (this.slideElements[0]) {
                this.slideElements[0].classList.add('active');
                
                // Trigger Title Fade-In
                const firstData = this.slidesData[0];
                this.titleEl.textContent = firstData.title || '';
                this.titleEl.style.opacity = '1';
            }
        }, 50); // 50ms delay triggers the transition

        // 5. Bind Events
        this.container.querySelector('.prev-btn').addEventListener('click', () => {
            this.resetTimer();
            this.prev();
        });

        this.container.querySelector('.next-btn').addEventListener('click', () => {
            this.resetTimer();
            this.next();
        });

        // Keyboard Nav
        this.handleKeydown = (e) => {
            if (e.key === 'ArrowLeft') { this.resetTimer(); this.prev(); }
            if (e.key === 'ArrowRight') { this.resetTimer(); this.next(); }
        };
        document.addEventListener('keydown', this.handleKeydown);
    }

    updateSlide(newIndex) {
        // Remove active class from current
        const currentImg = this.slideElements[this.currentIndex];
        if (currentImg) currentImg.classList.remove('active');

        // Add active class to new
        const nextImg = this.slideElements[newIndex];
        if (nextImg) nextImg.classList.add('active');

        // Update Text (false = animate the fade)
        this.updateText(newIndex, false);

        this.currentIndex = newIndex;
    }

    /**
     * Updates the title text with a fade out/in effect
     * @param {number} index - Index of data
     * @param {boolean} immediate - If true, skip fade (for first load)
     */
    updateText(index, immediate) {
        const data = this.slidesData[index];
        const newTitle = data.title || '';

        // Immediate load
        if (immediate) {
            this.titleEl.textContent = newTitle;
            this.titleEl.style.opacity = '1';
            return;
        }

        // --- Crossfade Logic ---
        if (this.textTimer) clearTimeout(this.textTimer);

        // 1. Fade Out
        this.titleEl.style.opacity = '0';

        // 2. Wait for fade out, Swap text, Fade In
        this.textTimer = setTimeout(() => {
            this.titleEl.textContent = newTitle;
            this.titleEl.style.opacity = '1';
        }, 500); 
    }

    next() {
        let newIndex = this.currentIndex + 1;
        if (newIndex >= this.slidesData.length) newIndex = 0;
        this.updateSlide(newIndex);
    }

    prev() {
        let newIndex = this.currentIndex - 1;
        if (newIndex < 0) newIndex = this.slidesData.length - 1;
        this.updateSlide(newIndex);
    }

    startSlideshow() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.next();
        }, this.intervalTime);
    }

    resetTimer() {
        clearInterval(this.timer);
        this.startSlideshow();
    }

    destroy() {
        clearInterval(this.timer);
        if (this.textTimer) clearTimeout(this.textTimer);
        document.removeEventListener('keydown', this.handleKeydown);
        this.container.innerHTML = '';
        this.slideElements = [];
    }
}