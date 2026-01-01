export default class Slideshow {
  constructor(container, gallery) {
    this.container = container;
    this.gallery = gallery;
    this.index = 0;
  }

  init() {
    if (!this.gallery) {
      this.container.innerHTML = "<p>Gallery not found</p>";
      return;
    }

    this.render();
    this.bind();
  }

  destroy() {
    this.container.innerHTML = "";
    document.removeEventListener("keydown", this.keyHandler);
  }

  render() {
    this.container.innerHTML = `
      <section class="slideshow">
        <h1>${this.gallery.title}</h1>

        <div class="slides">
          ${this.gallery.images.map((img, i) => `
            <img
              src="${img.src}"
              alt="${img.alt}"
              class="${i === 0 ? "active" : ""}"
            />
          `).join("")}
        </div>

        <button class="prev">‹</button>
        <button class="next">›</button>
      </section>
    `;

    this.slides = this.container.querySelectorAll(".slides img");
  }

  bind() {
    this.container.querySelector(".prev")
      .addEventListener("click", () => this.show(this.index - 1));

    this.container.querySelector(".next")
      .addEventListener("click", () => this.show(this.index + 1));

    this.keyHandler = e => {
      if (e.key === "ArrowLeft") this.show(this.index - 1);
      if (e.key === "ArrowRight") this.show(this.index + 1);
    };

    document.addEventListener("keydown", this.keyHandler);
  }

  show(i) {
    this.slides[this.index].classList.remove("active");
    this.index = (i + this.slides.length) % this.slides.length;
    this.slides[this.index].classList.add("active");
  }
}