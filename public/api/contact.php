<?php
/**
 * Communitygeeks · Contact endpoint (decision C-1, 2026-09-03).
 *
 * Receives the native contact form as JSON, validates it, checks the spam
 * defences, rate-limits, prevents duplicate sends, and delivers one email to
 * the configured inbox through authenticated SMTP. Nothing is stored except
 * a hashed rate-limit counter and the idempotency key (both in the temp dir,
 * both expire). No content is logged.
 *
 * Configuration lives in contact.config.php next to this file. That file is
 * NOT in the repository and is not overwritten by deploys; copy
 * contact.config.example.php and fill it in on the server.
 */

declare(strict_types=1);

// never leak PHP notices as HTML into a JSON response (the hosting default is display_errors=On)
ini_set('display_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// ---------------------------------------------------------------- config
$configFile = __DIR__ . '/contact.config.php';
if (!is_file($configFile)) {
    respond(503, ['ok' => false, 'error' => 'not_configured']);
}
$cfg = require $configFile;
$required = ['to', 'from', 'from_name', 'allowed_origins'];
foreach ($required as $k) {
    if (!array_key_exists($k, $cfg)) respond(503, ['ok' => false, 'error' => 'not_configured']);
}
// delivery route: Resend's HTTP API when a key is configured, otherwise authenticated SMTP
$useResend = !empty($cfg['resend_api_key']);
if (!$useResend) {
    foreach (['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass'] as $k) {
        if (empty($cfg[$k])) respond(503, ['ok' => false, 'error' => 'not_configured']);
    }
}
$turnstileSecret = $cfg['turnstile_secret'] ?? '';
$rateLimit = (int)($cfg['rate_limit'] ?? 5);
$ratePeriod = (int)($cfg['rate_period'] ?? 600);

// ---------------------------------------------------------------- method + origin
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'method']);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$originOk = false;
foreach ((array)$cfg['allowed_origins'] as $allowed) {
    if ($origin === $allowed || ($origin === '' && $referer !== '' && strpos($referer, $allowed . '/') === 0)) { $originOk = true; break; }
}
if (!$originOk) respond(403, ['ok' => false, 'error' => 'origin']);

// ---------------------------------------------------------------- body
$raw = file_get_contents('php://input', false, null, 0, 16384);
if ($raw === false || strlen($raw) >= 16384) respond(413, ['ok' => false, 'error' => 'too_large']);
$in = json_decode($raw, true);
if (!is_array($in)) {
    // progressive enhancement: a plain form post arrives url-encoded
    $in = $_POST;
}
$str = static fn($k) => is_string($in[$k] ?? null) ? trim((string)$in[$k]) : '';
$name = $str('name');
$email = $str('email');
$context = $str('context');
$website = $str('website'); // honeypot
$opened = (int)($in['t'] ?? 0);
$id = preg_replace('/[^A-Za-z0-9\-]/', '', (string)($in['id'] ?? ''));
$token = $str('token');

// ---------------------------------------------------------------- silent rejections (bots)
$now = time();
if ($website !== '') respond(200, ['ok' => true]);
if ($opened > 0 && ($now - $opened < 3 || $now - $opened > 7200)) respond(200, ['ok' => true]);

// ---------------------------------------------------------------- validation
$errors = [];
if ($name === '') $errors['name'] = 'Enter your name so the reply can address you.';
elseif (mb_strlen($name) > 120) $errors['name'] = 'Please keep your name under 120 characters.';
if ($email === '') $errors['email'] = 'Enter the email address replies should go to.';
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 200) $errors['email'] = 'Enter a complete email address, like name@company.com.';
if ($context === '') $errors['context'] = 'Tell us what is going on, even in one line.';
elseif (mb_strlen($context) > 4000) $errors['context'] = 'Please keep this under 4000 characters.';
if ($errors) respond(422, ['ok' => false, 'errors' => $errors]);
// header injection guard
foreach ([$name, $email] as $v) { if (preg_match('/[\r\n]/', $v)) respond(422, ['ok' => false, 'errors' => ['name' => 'Names and addresses cannot contain line breaks.']]); }

// ---------------------------------------------------------------- Turnstile (optional)
if ($turnstileSecret !== '') {
    if ($token === '') respond(400, ['ok' => false, 'error' => 'challenge']);
    // cURL first: the hosting has allow_url_fopen switched off, so file_get_contents() cannot reach Cloudflare
    $fields = http_build_query(['secret' => $turnstileSecret, 'response' => $token, 'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '']);
    $verify = false;
    if (function_exists('curl_init')) {
        $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $fields, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6, CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded']]);
        $verify = curl_exec($ch); curl_close($ch);
    } elseif (ini_get('allow_url_fopen')) {
        $verify = @file_get_contents('https://challenges.cloudflare.com/turnstile/v0/siteverify', false, stream_context_create(['http' => ['method' => 'POST', 'timeout' => 6, 'header' => "Content-Type: application/x-www-form-urlencoded\r\n", 'content' => $fields]]));
    }
    $vr = $verify ? json_decode($verify, true) : null;
    if (!$vr || empty($vr['success'])) respond(400, ['ok' => false, 'error' => 'challenge']);
}

// ---------------------------------------------------------------- rate limit + idempotency (temp dir, hashed, expiring)
$store = rtrim(sys_get_temp_dir(), '/\\') . DIRECTORY_SEPARATOR . 'cg-contact';
if (!is_dir($store)) @mkdir($store, 0700, true);
$ipKey = $store . DIRECTORY_SEPARATOR . 'ip-' . hash('sha256', ($cfg['salt'] ?? 'cg') . ($_SERVER['REMOTE_ADDR'] ?? ''));
$hits = [];
if (is_file($ipKey)) { $hits = array_filter((array)json_decode((string)file_get_contents($ipKey), true), static fn($ts) => is_int($ts) && $ts > $now - $ratePeriod); }
if (count($hits) >= $rateLimit) respond(429, ['ok' => false, 'error' => 'rate_limited']);
if ($id !== '') {
    $idKey = $store . DIRECTORY_SEPARATOR . 'id-' . hash('sha256', $id);
    if (is_file($idKey) && filemtime($idKey) > $now - 86400) respond(200, ['ok' => true, 'duplicate' => true]);
}
// tidy old files occasionally
if (mt_rand(1, 20) === 1) { foreach ((array)glob($store . DIRECTORY_SEPARATOR . '*') as $f) { if (@filemtime($f) < $now - 86400) @unlink($f); } }

// ---------------------------------------------------------------- deliver
$subject = 'Contact: ' . preg_replace('/\s+/', ' ', $name);
$bodyText = "Name: {$name}\nEmail: {$email}\n\n{$context}\n\nSent from the Communitygeeks contact form.";
$GLOBALS['cg_delivery_detail'] = '';
$ok = $useResend ? resend_send($cfg, $subject, $bodyText, $email, $name) : smtp_send($cfg, $subject, $bodyText, $email, $name);
// on failure, say which route failed and why, without ever echoing credentials
if (!$ok) respond(502, ['ok' => false, 'error' => 'delivery', 'route' => $useResend ? 'resend' : 'smtp', 'detail' => (string)$GLOBALS['cg_delivery_detail']]);

$hits[] = $now; @file_put_contents($ipKey, json_encode(array_values($hits)), LOCK_EX);
if ($id !== '') @file_put_contents($idKey, '1', LOCK_EX);
respond(200, ['ok' => true]);

// ---------------------------------------------------------------- Resend HTTP API (https://resend.com/docs/api-reference/emails/send-email)
function resend_send(array $cfg, string $subject, string $text, string $replyTo, string $replyName): bool {
    if (!function_exists('curl_init')) return false;
    $payload = json_encode([
        'from' => $cfg['from_name'] . ' <' . $cfg['from'] . '>',
        'to' => [$cfg['to']],
        'reply_to' => $replyName !== '' ? $replyName . ' <' . $replyTo . '>' : $replyTo,
        'subject' => $subject,
        'text' => $text,
    ], JSON_UNESCAPED_UNICODE);
    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_POSTFIELDS => $payload, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 12,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $cfg['resend_api_key'], 'Content-Type: application/json'],
    ]);
    $res = curl_exec($ch); $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE); $curlErr = curl_error($ch); curl_close($ch);
    if ($res === false) { $GLOBALS['cg_delivery_detail'] = 'curl: ' . $curlErr; return false; }
    $data = json_decode((string)$res, true);
    if ($status < 200 || $status >= 300) { $GLOBALS['cg_delivery_detail'] = 'resend http ' . $status . ': ' . (is_array($data) ? (($data['name'] ?? '') . ' ' . ($data['message'] ?? '')) : substr((string)$res, 0, 160)); return false; }
    if (!is_array($data) || empty($data['id'])) { $GLOBALS['cg_delivery_detail'] = 'resend: unexpected response'; return false; }
    return true;
}

// ---------------------------------------------------------------- minimal SMTP client (implicit TLS on 465, or STARTTLS on 587)
function smtp_send(array $cfg, string $subject, string $text, string $replyTo, string $replyName): bool {
    $host = (string)$cfg['smtp_host']; $port = (int)$cfg['smtp_port'];
    $implicitTls = $port === 465;
    $fp = @stream_socket_client(($implicitTls ? 'ssl://' : 'tcp://') . $host . ':' . $port, $errno, $errstr, 10, STREAM_CLIENT_CONNECT, stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true]]));
    if (!$fp) { $GLOBALS['cg_delivery_detail'] = 'smtp connect ' . $host . ':' . $port . ' failed (' . $errno . ' ' . $errstr . ')'; return false; }
    stream_set_timeout($fp, 10);
    $read = static function () use ($fp): array { $code = 0; $lines = []; while (($line = fgets($fp, 1024)) !== false) { $lines[] = rtrim($line); $code = (int)substr($line, 0, 3); if (isset($line[3]) && $line[3] === ' ') break; } return [$code, $lines]; };
    $cmd = static function (string $c, array $okCodes) use ($fp, $read): bool { fwrite($fp, $c . "\r\n"); [$code, $lines] = $read(); $ok = in_array($code, $okCodes, true); if (!$ok) $GLOBALS['cg_delivery_detail'] = 'smtp ' . (strpos($c, 'AUTH') === 0 || preg_match('/^[A-Za-z0-9+\/=]+$/', $c) ? 'auth' : strtok($c, ' ')) . ' failed: ' . substr(implode(' ', $lines), 0, 140); return $ok; };
    [$code] = $read(); if ($code !== 220) { fclose($fp); return false; }
    $ehloHost = $cfg['ehlo'] ?? 'communitygeeks.ai';
    if (!$cmd('EHLO ' . $ehloHost, [250])) { fclose($fp); return false; }
    if (!$implicitTls) {
        if (!$cmd('STARTTLS', [220])) { fclose($fp); return false; }
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) { fclose($fp); return false; }
        if (!$cmd('EHLO ' . $ehloHost, [250])) { fclose($fp); return false; }
    }
    if (!$cmd('AUTH LOGIN', [334])) { fclose($fp); return false; }
    if (!$cmd(base64_encode((string)$cfg['smtp_user']), [334])) { fclose($fp); return false; }
    if (!$cmd(base64_encode((string)$cfg['smtp_pass']), [235])) { fclose($fp); return false; }
    if (!$cmd('MAIL FROM:<' . $cfg['from'] . '>', [250])) { fclose($fp); return false; }
    if (!$cmd('RCPT TO:<' . $cfg['to'] . '>', [250, 251])) { fclose($fp); return false; }
    if (!$cmd('DATA', [354])) { fclose($fp); return false; }
    $enc = static fn(string $s) => '=?UTF-8?B?' . base64_encode($s) . '?=';
    $headers = [
        'Date: ' . date(DATE_RFC2822),
        'From: ' . $enc((string)$cfg['from_name']) . ' <' . $cfg['from'] . '>',
        'To: <' . $cfg['to'] . '>',
        'Reply-To: ' . $enc($replyName) . ' <' . $replyTo . '>',
        'Subject: ' . $enc($subject),
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $ehloHost . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        'X-Mailer: communitygeeks-contact/1',
    ];
    $data = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($text), 76, "\r\n");
    $data = str_replace("\r\n.", "\r\n..", $data);
    fwrite($fp, $data . "\r\n.\r\n");
    [$code] = $read();
    $cmd('QUIT', [221]); fclose($fp);
    return $code === 250;
}
