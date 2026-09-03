<?php
/**
 * Copy this file to contact.config.php ON THE SERVER (same folder as
 * contact.php) and fill in the values. contact.config.php is ignored by git
 * and protected by the .htaccess in this folder. Never commit real values.
 *
 * Mail routing (checked 2026-09-03): communitygeeks.de receives mail at
 * Google, communitygeeks.ai has a Hetzner mailbox. Send FROM the Hetzner
 * mailbox on communitygeeks.ai (SPF-aligned with Hetzner's SMTP) TO the
 * communitygeeks.de inbox. Reply-To is set to the visitor automatically.
 */
return [
    // where messages land
    'to'        => 'carmelito@communitygeeks.de',
    // the sender address and display name. The domain of 'from' must be one
    // the delivery route is allowed to send for (verified in Resend, or a
    // real Hetzner mailbox for SMTP).
    'from'      => 'contact@communitygeeks.ai',
    'from_name' => 'Communitygeeks contact form',

    // ---- Delivery route A (used when set): Resend HTTP API.
    // Create the key at resend.com → API Keys (sending access is enough) and
    // verify communitygeeks.ai under Domains (add the DNS records at Hetzner).
    'resend_api_key' => '',

    // ---- Delivery route B (used when resend_api_key is empty): authenticated SMTP.
    // Hetzner mailbox: host 'mail.your-server.de', 465 (TLS) or 587 (STARTTLS),
    // user = full address. Resend also offers SMTP: host 'smtp.resend.com',
    // port 465, user 'resend', password = the API key.
    'smtp_host' => 'mail.your-server.de',
    'smtp_port' => 465,
    'smtp_user' => 'contact@communitygeeks.ai',
    'smtp_pass' => 'REPLACE-ME',
    'ehlo'      => 'communitygeeks.ai',
    // requests are accepted only from these page origins
    'allowed_origins' => ['https://communitygeeks.ai', 'https://www.communitygeeks.ai'],
    // Cloudflare Turnstile secret key; leave '' to run without Turnstile
    // (honeypot, timing trap and rate limit still apply). The public site key
    // goes into src/_data/contact.json.
    'turnstile_secret' => '',
    // abuse limits: submissions per IP per period (seconds)
    'rate_limit'  => 5,
    'rate_period' => 600,
    // any random string; used to hash IPs in the rate-limit store
    'salt' => 'REPLACE-WITH-RANDOM',
];
