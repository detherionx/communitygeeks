<?php
require __DIR__ . '/cal-common.php';
$config = cal_config('GET');
cal_limit($config, 'slots', 60);
cal_reply(200, ['ok' => true, 'eventTypeId' => $config['event_type_id'], 'timezone' => $config['timezone'],
    'slots' => cal_slots($config, time(), time() + 14 * 86400)]);
