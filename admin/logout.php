<?php
require_once __DIR__ . '/includes/bootstrap.php';

logout_admin();
header('Location: ' . ADMIN_BASE_PATH . '/index.php');
exit;
