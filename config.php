<?php

declare(strict_types=1);

/**
 * Sternenflunk — zentrale Konfiguration.
 */

const APP_NAME    = 'Sternenflunk';
const APP_VERSION = '2.2.1';

// Zeitzone für "heute" und alle Tagesgrenzen.
const APP_TIMEZONE = 'Europe/Berlin';

// Standort für Sonnenauf-/-untergang und Orts-Gags ({ORT} in Textpools).
const GEO_LAT  = 51.3397;
const GEO_LON  = 12.3731;
const GEO_NAME = 'Leipzig';

// Datenablage: Stammdaten des Paares + eingefrorene Tage.
const DATA_DIR    = __DIR__ . '/data';
const DAYS_DIR    = DATA_DIR . '/days';
const COUPLE_FILE = DATA_DIR . '/couple.json';

date_default_timezone_set(APP_TIMEZONE);
