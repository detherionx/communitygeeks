<?php
declare(strict_types=1);
ini_set('display_errors', '0');

function cal_reply(int $code, array $body): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}
function cal_fail(int $code, string $message): void {
    cal_reply($code, ['ok' => false, 'message' => $message]);
}
set_exception_handler(function (Throwable $error): void {
    cal_fail(503, 'Scheduling is temporarily unavailable. Please contact Carmelito.');
});
function cal_config(string $method): array {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method);
        cal_fail(405, 'Unsupported request method.');
    }
    $path = __DIR__ . '/cal.config.php';
    if (!is_file($path)) cal_fail(503, 'Online scheduling is not configured. Please contact Carmelito.');
    $config = require $path;
    if (!is_array($config) || !is_string($config['api_key'] ?? null) ||
        !preg_match('/^cal_[A-Za-z0-9_-]+$/D', $config['api_key']) ||
        strpos($config['api_key'], 'REPLACE_ME') !== false ||
        !is_int($config['event_type_id'] ?? null) || $config['event_type_id'] < 1 ||
        ($config['timezone'] ?? '') !== 'Europe/Berlin') {
        cal_fail(503, 'Online scheduling is not configured. Please contact Carmelito.');
    }
    if ($method === 'POST') {
        if (!in_array($_SERVER['HTTP_ORIGIN'] ?? '', $config['allowed_origins'] ?? [], true)) cal_fail(403, 'Request origin is not allowed.');
        if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') cal_fail(415, 'Send JSON.');
    }
    return $config;
}
function cal_lock(string $key) {
    // honey: local files suit one PHP host; use shared storage before adding hosts.
    $dir = sys_get_temp_dir() . '/communitygeeks-cal';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) throw new RuntimeException('Storage unavailable');
    $file = fopen($dir . '/' . hash('sha256', $key) . '.json', 'c+');
    if (!$file || !flock($file, LOCK_EX)) throw new RuntimeException('Lock unavailable');
    return $file;
}
function cal_store($file, array $data): void {
    rewind($file);
    if (!ftruncate($file, 0) || fwrite($file, json_encode($data)) === false || !fflush($file)) throw new RuntimeException('Storage unavailable');
}
function cal_limit(array $config, string $kind, int $limit): void {
    $key = hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', $config['api_key']);
    $file = cal_lock($kind . $key);
    $state = json_decode(stream_get_contents($file), true) ?: [];
    $hits = array_values(array_filter($state, fn($time) => is_int($time) && $time > time() - 900));
    if (count($hits) >= $limit) {
        fclose($file); header('Retry-After: 900'); cal_fail(429, 'Too many scheduling requests. Please try again in 15 minutes.');
    }
    $hits[] = time(); cal_store($file, $hits); fclose($file);
}
function cal_request(array $config, string $path, ?array $body = null): array {
    $curl = curl_init('https://api.cal.com/v2/' . $path);
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 12, CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $config['api_key'], 'Content-Type: application/json',
            'cal-api-version: ' . ($body === null ? '2024-09-04' : '2026-02-25')]]);
    if ($body !== null) curl_setopt_array($curl, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($body)]);
    $raw = curl_exec($curl); $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
    if ($raw === false) throw new RuntimeException('Upstream unavailable');
    $data = json_decode($raw, true);
    if ($status < 200 || $status >= 300 || !is_array($data) || ($data['status'] ?? '') !== 'success') throw new RuntimeException('Upstream unavailable');
    return $data['data'] ?? [];
}
function cal_slots(array $config, int $start, int $end): array {
    $data = cal_request($config, 'slots?' . http_build_query(['eventTypeId' => $config['event_type_id'],
        'start' => gmdate('Y-m-d\TH:i:s\Z', $start), 'end' => gmdate('Y-m-d\TH:i:s\Z', $end),
        'timeZone' => $config['timezone'], 'format' => 'range']));
    $slots = [];
    foreach ($data as $day) foreach ($day as $slot) {
        $timestamp = strtotime($slot['start'] ?? '');
        if ($timestamp !== false && $timestamp > time() && $timestamp >= $start && $timestamp <= $end) {
            $slots[] = gmdate('Y-m-d\TH:i:s\Z', $timestamp);
        }
    }
    $slots = array_values(array_unique($slots)); sort($slots); return $slots;
}
function cal_input(array $input, array $config): array {
    foreach (['name' => 120, 'email' => 200, 'context' => 4000, 'offer' => 160, 'slot' => 30, 'id' => 80] as $key => $max) {
        if (!is_string($input[$key] ?? null) || strlen(trim($input[$key])) < 1 || strlen($input[$key]) > $max) cal_fail(422, 'Check your details and selected time.');
        $input[$key] = trim($input[$key]);
    }
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $input['name'] . $input['email']) ||
        !preg_match('/^[A-Za-z0-9_-]{16,80}$/D', $input['id']) || !empty($input['website']) ||
        ($input['eventTypeId'] ?? null) !== $config['event_type_id'] ||
        !preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/D', $input['slot'])) cal_fail(422, 'Check your details and selected time.');
    $stamp = strtotime($input['slot']);
    if (!$stamp || gmdate('Y-m-d\TH:i:s\Z', $stamp) !== $input['slot'] || $stamp <= time() || $stamp > time() + 30 * 86400) cal_fail(422, 'Choose a future available time within the next 30 days.');
    return $input;
}
