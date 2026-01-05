export default class Contact {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    init() {
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="text-module">
                <h2>Contact</h2>
                <p style="margin-bottom: 2rem; color: #888;">
                    Interested in purchasing a piece or discussing a project? 
                    Please fill out the form below.
                </p>

                <form class="contact-form" id="contactForm">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                    </div>

                    <button type="submit" class="btn-submit">Send Message</button>
                </form>

                <div class="contact-info">
                    <p>Direct Email: <a href="mailto:elza@elzalive.com" style="color:var(--accent)">elza@elzalive.com</a></p>
                </div>
            </div>
        `;

        // Bind form submission (Mock functionality for now)
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Thank you! This form will be connected to your email backend shortly.");
            // Later we will connect this to a PHP handler
        });
    }

    destroy() {
        this.container.innerHTML = '';
    }
}