export default class Biography {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    async init() {
        this.container.innerHTML = '<div class="loader"></div>';

        try {
            const response = await fetch('json-files/biography.json');
            const data = await response.json();
            this.render(data);
        } catch (error) {
            console.error(error);
            this.container.innerHTML = "<p>Error loading biography.</p>";
        }
    }

    render(data) {
        // data is an array, we take the first item
        const section = data[0];

        // Build paragraphs HTML
        const paragraphsHTML = section.content.paragraphs
            .map(text => `<p>${text}</p>`)
            .join('');

        this.container.innerHTML = `
            <div class="text-module">
                <h2>${section.title}</h2>
                <div class="${section.content.attributes.class}">
                    ${paragraphsHTML}
                </div>
            </div>
        `;
    }

    destroy() {
        this.container.innerHTML = '';
    }
}