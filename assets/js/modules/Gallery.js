export default class Gallery {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.slidesData = [];
        this.slideElements = [];
        this.currentIndex = 0;
        
        // Automation
        this.timer = null;
        this.intervalTime = 5000; 
        
        // Text Transition Timer
        this.textTimer = null; 
        
        this.categoryTitle = "";
    }

    async init(categorySlug) {
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
        this.container.innerHTML = '<div style="display:flex;height:100vh;justify-content:center;align-items:center;"><div class="loader"></div></div>';
    }

    renderLayout() {
        // 1. Create DOM Structure
        this.container.innerHTML = `
            <div class="gallery-module">
                <!-- Header -->
                <div class="logo"><p>The Life of an Artist</p></div>
                <div class="category"><p>${this.categoryTitle}</p></div>

                <!-- Nav -->
                <div class="prev-arrow">
                    <button class="gallery-nav-btn prev-btn" aria-label="Previous Slide"></button>
                </div>

                <!-- Slides Container -->
                <div class="gallery-stage" id="gallery-stage">
                    <div class="loader"></div>
                    <!-- Images injected here -->
                </div>

                <!-- Nav -->
                <div class="next-arrow">
                    <button class="gallery-nav-btn next-btn" aria-label="Next Slide"></button>
                </div>

                <!-- Footer / Description -->
                <div class="description">
                    <h3 id="slide-title"></h3>
                </div>
            </div>
        `;

        // 2. Cache Elements
        const stage = document.getElementById('gallery-stage');
        this.titleEl = document.getElementById('slide-title');

        // 3. Create ALL Image Elements (Stacking)
        this.slidesData.forEach((data, index) => {
            const img = document.createElement('img');
            img.src = data.src;
            img.alt = data.alt || data.title;
            
            // First image starts active
            if (index === 0) {
                img.classList.add('active');
                // Pass true to load text immediately without fading
                this.updateText(0, true);
            }
            
            stage.appendChild(img);
            this.slideElements.push(img);
        });

        // 4. Bind Events
        this.container.querySelector('.prev-btn').addEventListener('click', () => {
            this.resetTimer();
            this.prev();
        });

        this.container.querySelector('.next-btn').addEventListener('click', () => {
            this.resetTimer();
            this.next();
        });
        
        this.handleKeydown = (e) => {
            if (e.key === 'ArrowLeft') { this.resetTimer(); this.prev(); }
            if (e.key === 'ArrowRight') { this.resetTimer(); this.next(); }
        };
        document.addEventListener('keydown', this.handleKeydown);
    }

    updateSlide(newIndex) {
        // Image Crossfade
        const currentImg = this.slideElements[this.currentIndex];
        if (currentImg) currentImg.classList.remove('active');

        const nextImg = this.slideElements[newIndex];
        if (nextImg) nextImg.classList.add('active');

        // Text Crossfade (false = animate it)
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

        // If specific logic for first load (no fade)
        if (immediate) {
            this.titleEl.textContent = newTitle;
            this.titleEl.style.opacity = '1';
            return;
        }

        // --- Crossfade Logic ---
        
        // 1. Clear any pending fade timers if user clicks fast
        if (this.textTimer) clearTimeout(this.textTimer);

        // 2. Fade Out
        this.titleEl.style.opacity = '0';

        // 3. Wait for fade out (500ms matches CSS --text-fade-duration)
        this.textTimer = setTimeout(() => {
            this.titleEl.textContent = newTitle;
            // 4. Fade In
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