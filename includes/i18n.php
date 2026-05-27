<?php
/**
 * i18n Helper for PHP
 * Usage: t('nav.home') or t('greeting', ['name' => 'João'])
 */

$_i18n_cache = null;
$_i18n_lang = null;

/**
 * Get current language
 */
function i18n_get_lang(): string {
  global $_i18n_lang;
  if ($_i18n_lang) return $_i18n_lang;
  
  $_i18n_lang = $_COOKIE['lang'] ?? $_GET['lang'] ?? 'pt-BR';
  $allowed = ['pt-BR', 'en-US', 'es-ES'];
  if (!in_array($_i18n_lang, $allowed, true)) {
    $_i18n_lang = 'pt-BR';
  }
  return $_i18n_lang;
}

/**
 * Set language
 */
function i18n_set_lang(string $lang): void {
  global $_i18n_lang, $_i18n_cache;
  $allowed = ['pt-BR', 'en-US', 'es-ES'];
  if (in_array($lang, $allowed, true)) {
    $_i18n_lang = $lang;
    $_i18n_cache = null; // Clear cache
    setcookie('lang', $lang, time() + 86400 * 365);
  }
}

/**
 * Load translations from languages.json
 */
function i18n_load(): array {
  global $_i18n_cache;
  if ($_i18n_cache !== null) return $_i18n_cache;
  
  $lang = i18n_get_lang();
  $path = __DIR__ . '/content/languages.json';
  
  if (!file_exists($path)) {
    $_i18n_cache = [];
    return [];
  }
  
  $all = json_decode(file_get_contents($path), true) ?: [];
  $_i18n_cache = $all[$lang] ?? [];
  return $_i18n_cache;
}

/**
 * Translate a key
 * @param string $key Translation key (e.g., 'nav.home')
 * @param array $vars Optional variables to replace {var} in translation
 * @return string Translated string or key if not found
 */
function t(string $key, array $vars = []): string {
  $trans = i18n_load();
  $text = $trans[$key] ?? $key;
  
  foreach ($vars as $k => $v) {
    $text = str_replace('{' . $k . '}', (string)$v, $text);
  }
  
  return $text;
}

/**
 * Echo translated key
 */
function et(string $key, array $vars = []): void {
  echo t($key, $vars);
}

/**
 * Get available languages
 */
function i18n_langs(): array {
  return ['pt-BR', 'en-US', 'es-ES'];
}

/**
 * Get language name
 */
function i18n_lang_name(string $lang): string {
  $names = [
    'pt-BR' => 'Português',
    'en-US' => 'English',
    'es-ES' => 'Español',
  ];
  return $names[$lang] ?? $lang;
}
