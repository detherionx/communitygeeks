<?php
require __DIR__ . '/cal-common.php';
$config = cal_config('POST');
cal_limit($config, 'booking', 8);
$raw = file_get_contents('php://input', false, null, 0, 16385);
if ($raw === false || strlen($raw) > 16384) cal_fail(413, 'Request too large.');
$input = json_decode($raw, true);
if (!is_array($input)) cal_fail(400, 'Invalid request.');
$input = cal_input($input, $config);
// A repeat or concurrent submit must never create a second invitation.
$fingerprint = hash_hmac('sha256', json_encode($input), $config['api_key']);
$lock = cal_lock('submit-' . $input['id']);
$saved = json_decode(stream_get_contents($lock), true);
if ($saved) {
    if (($saved['fingerprint'] ?? '') !== $fingerprint) cal_fail(409, 'This request changed. Return to the calendar to choose a time again.');
    if (isset($saved['result'])) cal_reply(200, $saved['result']);
    cal_fail(409, 'Confirmation is uncertain. Check your email or contact Carmelito before trying another booking.');
}
$stamp = strtotime($input['slot']);
if (!in_array($input['slot'], cal_slots($config, $stamp - 1, $stamp + 86400), true)) cal_fail(409, 'That time is no longer available. Return to the calendar and select another time.');
cal_store($lock, ['fingerprint' => $fingerprint]);
// Mark before sending: a timeout is uncertain, not permission to send again.
$booking = cal_request($config, 'bookings', ['start' => $input['slot'], 'eventTypeId' => $config['event_type_id'],
    'attendee' => ['name' => $input['name'], 'email' => $input['email'], 'timeZone' => $config['timezone'], 'language' => 'en'],
    'bookingFieldsResponses' => ['notes' => $input['offer'] . "\n\n" . $input['context']]]);
if (!in_array($booking['status'] ?? '', ['accepted', 'pending'], true) || empty($booking['uid'])) throw new RuntimeException('Unknown booking result');
$result = ['ok' => true, 'status' => $booking['status'], 'start' => $input['slot']];
cal_store($lock, ['fingerprint' => $fingerprint, 'result' => $result]); fclose($lock);
cal_reply(200, $result);
