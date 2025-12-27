<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ignition Coil | Technical Overview</title>
    <style>
    /* General Reset and Typography */
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f9f9f9;
    }

    /* Layout Container */
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
        background-color: #ffffff;
        min-height: 100vh;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
    }

    /* Typography */
    h1,
    h2 {
        color: #2c3e50;
        margin-bottom: 1rem;
    }

    h1 {
        font-size: 2.5rem;
        border-bottom: 2px solid #eee;
        padding-bottom: 10px;
        margin-bottom: 30px;
    }

    h2 {
        font-size: 1.75rem;
        margin-top: 40px;
    }

    p {
        margin-bottom: 1.5rem;
    }

    /* List Styling */
    ul {
        list-style-type: none;
        padding-left: 0;
    }

    li {
        margin-bottom: 15px;
        padding-left: 20px;
        border-left: 4px solid #3498db;
        background-color: #fdfdfd;
        padding: 10px 15px;
    }

    strong {
        color: #2980b9;
    }

    /* Images */
    figure {
        margin: 30px 0;
        text-align: center;
    }

    img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        border: 1px solid #ddd;
        display: block;
        margin: 0 auto;
    }

    figcaption {
        font-size: 0.9rem;
        color: #666;
        margin-top: 8px;
        font-style: italic;
    }

    /* Responsive Design */
    @media (max-width: 600px) {
        h1 {
            font-size: 2rem;
        }

        .container {
            padding: 20px 15px;
        }
    }
    </style>
</head>

<body>

    <main class="container">

        <header>
            <h1>Ignition Coil Overview</h1>
        </header>

        <section id="construction">
            <h2>Construction of the Ignition Coil</h2>

            <ul>
                <li><strong>Primary Coil:</strong> Made of thick copper wire with fewer turns, connected to the battery.
                </li>
                <li><strong>Secondary Coil:</strong> Made of fine wire with many more turns, responsible for generating
                    high voltage.</li>
                <li><strong>Iron Core:</strong> Central cylindrical core that enhances magnetic field strength.</li>
                <li><strong>Resin Encapsulation:</strong> The "Dry Resin Technology" helps insulate and protect internal
                    components from moisture and vibration.</li>
                <li><strong>Terminals:</strong> Two low-voltage terminals (positive and negative) and one high-voltage
                    output terminal for the spark plug.</li>
                <li><strong>Mounting Bracket:</strong> Secures the coil to the vehicle chassis.</li>
            </ul>

            <figure>
                <img src="/assets/images/misc-images/ignition-coil.jpg"
                    alt="Diagram showing the construction of an ignition coil">
                <figcaption>Internal construction of a standard ignition coil.</figcaption>
            </figure>
        </section>

        <section id="function">
            <h2>Function of the Ignition Coil</h2>
            <p>
                It transforms the 12V battery voltage into 20,000–40,000 volts needed to create a spark at the spark
                plug. This spark ignites the air-fuel mixture in the engine's combustion chamber, enabling engine
                operation.
            </p>

            <figure>
                <img src="/assets/images/misc-images/ignition-system.jpg" alt="Ignition system diagram">
                <figcaption>Overview of the ignition system function.</figcaption>
            </figure>
        </section>

    </main>

</body>

</html>