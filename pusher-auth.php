<?php

require __DIR__ . '/vendor/autoload.php';

$pusher = new Pusher\Pusher(
    "7bf6c5f0a13626965bb0",
    "914417d21c587b3e4c6d",
    "496962",
    ['cluster' => 'eu']
);

$auth = $pusher->socket_auth($_GET['channel_name'], $_GET['socket_id']);

$callback = str_replace('\\', '', $_GET['callback']);
header('Content-Type: application/javascript');
echo($callback . '(' . $auth . ');');