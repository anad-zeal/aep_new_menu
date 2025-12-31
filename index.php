<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alexis Elza | Portfolio</title>

    <!-- Fonts (Google Fonts fallbacks for the ones mentioned in CSS) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Bonheur+Royale&family=Inter:wght@300;400&family=Montserrat:wght@300;400;500&display=swap"
        rel="stylesheet">

    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    <!-- Main Styles -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>

<body>

    <!-- Header / Branding -->
    <header class="site-header">
        <div class="hero">
            <div class="sub-title">The Life of an Artist</div>
            <div class="page-title">Artist Portfolio</div>
        </div>

        <!-- Hamburger Button -->
        <button id="hamburger-btn" class="hamburger-btn" aria-label="Open Navigation">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </button>
    </header>

    <!-- Navigation (Included from separate file) -->
    <?php include 'includes/menu.php'; ?>

    <!-- Main Dynamic Content Area -->

    <main id="dynamic-content-area">
        <!-- JS will inject content here -->
    </main>

    <!-- Footer -->
    <footer class="site-footer">
        <p>&copy; <?php echo date("Y"); ?> Alexis Elza. All rights reserved.</p>
    </footer>

    <!-- Main Logic -->
    <script src="assets/js/script.js"></script>
</body>

</html>