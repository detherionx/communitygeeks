<?php
declare(strict_types=1);

$uri = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$routes = [
    '/api/cal-slots.php' => __DIR__ . '/../public/api/cal-slots.php',
    '/api/cal-booking.php' => __DIR__ . '/../public/api/cal-booking.php',
];

if (isset($routes[$uri])) {
    require $routes[$uri];
    return true;
}

if (str_starts_with($uri, '/api/')) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"ok":false,"message":"Not found."}';
    return true;
}

return false;
