<?php
/* root/send_email.php */

// Replace this with your actual email address
$recipient_email = "your-email@example.com";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Sanitize and Validate Inputs
    $name    = strip_tags(trim($_POST["name"] ?? ""));
    $email   = filter_var(trim($_POST["email"] ?? ""), FILTER_SANITIZE_EMAIL);
    $phone   = strip_tags(trim($_POST["phone"] ?? ""));
    $website = strip_tags(trim($_POST["website"] ?? ""));
    $message = trim($_POST["message"] ?? "");

    // 2. Simple Validation
    if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Redirect back with error
        header("Location: /contact?status=error");
        exit;
    }

    // 3. Build Email Content
    $subject = "New Portfolio Contact from $name";

    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Phone: $phone\n";
    $email_content .= "Website: $website\n\n";
    $email_content .= "Message:\n$message\n";

    // 4. Build Headers
    $email_headers = "From: $name <$email>";

    // 5. Send Email
    if (mail($recipient_email, $subject, $email_content, $email_headers)) {
        // Redirect back with success
        header("Location: /contact?status=success");
    } else {
        header("Location: /contact?status=error");
    }
} else {
    // Not a POST request
    header("Location: /contact");
}
?>