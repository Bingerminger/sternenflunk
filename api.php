<?php

declare(strict_types=1);

/**
 * Sternenflunk-API.
 *
 *   GET  api.php?action=day[&date=YYYY-MM-DD]  → Horoskop des Tages (Standard: heute)
 *   GET  api.php?action=meta                   → Kalender-Grenzen, Stammdaten, Zeichen-Katalog
 *   POST api.php?action=setup                  → Stammdaten speichern (Onboarding & Admin)
 *                                                Body: {"a":{"name":…,"sign":…},"b":{…},
 *                                                       "pin":…[,"newPin":…]}
 *
 * Regeln:
 *  - Ohne Stammdaten liefert action=day 409 setup_required — erst das Paar,
 *    dann die Prophezeiung.
 *  - Die Admin-PIN wird beim Onboarding festgelegt (gehasht gespeichert) und
 *    bei jeder Stammdaten-Änderung verlangt (falsch → 403 wrong_pin).
 *    Leichte Barriere gegen Mitbewohner, kein Hochsicherheitsschloss.
 *  - Zukunft ist gesperrt (Überraschungsschutz), Vergangenheit ab Einrichtung offen.
 *  - Einmal generierte Tage werden als JSON eingefroren (data/days/). Ändert das
 *    Paar seine Stammdaten, passt der coupleKey nicht mehr und der Tag wird
 *    verworfen und neu generiert — Setup räumt zusätzlich selbst auf.
 *  - Ohne Schreibrechte auf data/days/ läuft der Rest trotzdem: deterministisch.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/HoroscopeGenerator.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$action = $_GET['action'] ?? 'day';
$today  = date('Y-m-d');

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(int $status, string $code, string $message): never
{
    respond($status, ['ok' => false, 'error' => ['code' => $code, 'message' => $message]]);
}

/** Gemeinsamer Meta-Block für meta/setup-Antworten. */
function metaPayload(?array $couple, string $today): array
{
    return [
        'ok'          => true,
        'appName'     => APP_NAME,
        'version'     => APP_VERSION,
        'serverToday' => $today,
        'configured'  => $couple !== null,
        'pinSet'      => $couple !== null && !empty($couple['pinHash']),
        'epoch'       => $couple['since'] ?? null,
        'couple'      => $couple === null ? null : [
            'a'     => Couple::person($couple, 'a'),
            'b'     => Couple::person($couple, 'b'),
            'since' => $couple['since'],
        ],
        'signs'       => Zodiac::catalog(),
    ];
}

// ------------------------------------------------------------------ Setup

if ($action === 'setup') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        fail(405, 'method_not_allowed', 'Stammdaten nimmt der Kosmos nur per POST entgegen.');
    }

    $raw  = file_get_contents('php://input', length: 16384);
    $body = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($body) || !is_array($body['a'] ?? null) || !is_array($body['b'] ?? null)) {
        fail(422, 'bad_body', 'Erwartet wird JSON mit den Feldern a und b (je name + sign) plus pin.');
    }

    $existing = Couple::load();
    $pinSet   = $existing !== null && !empty($existing['pinHash']);

    try {
        if (!$pinSet) {
            // Onboarding (oder Alt-Stand ohne PIN): neue PIN wird festgelegt.
            $pinHash = Couple::hashPin($body['pin'] ?? null);
        } else {
            // Admin-Änderung: erst die PIN, dann die Sterne.
            if (!Couple::verifyPin($existing, $body['pin'] ?? null)) {
                fail(403, 'wrong_pin', 'Falsche PIN — die Stammdaten bleiben versiegelt. Die Sterne petzen nicht.');
            }
            $newPin  = $body['newPin'] ?? null;
            $pinHash = (is_string($newPin) && $newPin !== '')
                ? Couple::hashPin($newPin)
                : $existing['pinHash'];
        }

        $couple = Couple::save($body['a'], $body['b'], $pinHash);
    } catch (InvalidArgumentException $e) {
        fail(422, 'invalid_input', $e->getMessage());
    } catch (RuntimeException $e) {
        fail(500, 'write_failed', $e->getMessage());
    }

    respond(200, metaPayload($couple, $today));
}

$couple = Couple::load();

if ($action === 'meta') {
    respond(200, metaPayload($couple, $today));
}

if ($action !== 'day') {
    fail(400, 'unknown_action', 'Diese Aktion kennt der Kosmos nicht.');
}

// -------------------------------------------------------------------- Day

if ($couple === null) {
    fail(409, 'setup_required', 'Der Sternenflunk kennt euch noch nicht — erst das Onboarding, dann die Prophezeiung.');
}

$date  = $_GET['date'] ?? $today;
$epoch = $couple['since'];

if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m) || !checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
    fail(422, 'bad_date', 'Das ist kein Datum, das die Sterne kennen (Format: JJJJ-MM-TT).');
}

if ($date > $today) {
    fail(403, 'future_locked', 'Die Zukunft bleibt aus Überraschungsgründen versiegelt. 🔮 Komm an dem Tag wieder!');
}

if ($date < $epoch) {
    fail(404, 'before_epoch', 'Vor dem ' . date('d.m.Y', strtotime($epoch)) . ' hat der Sternenflunk für euch noch nicht gesendet.');
}

// Eingefrorenen Tag ausliefern — aber nur, wenn er zum aktuellen Paar gehört.
$file      = DAYS_DIR . '/' . $date . '.json';
$coupleKey = Couple::key($couple);
$day       = null;
$freeze    = false;

if (is_file($file)) {
    $raw     = file_get_contents($file);
    $decoded = ($raw !== false) ? json_decode($raw, true) : null;
    if (is_array($decoded)
        && ($decoded['date'] ?? null) === $date
        && ($decoded['coupleKey'] ?? null) === $coupleKey) {
        $day = $decoded;

        // Nachrüsten: Tage aus der Zeit vor 2.0 bekommen die neuen Sektionen
        // dazu. `+=` ergänzt nur fehlende Schlüssel — Eingefrorenes bleibt,
        // wie es war (die neuen Sektionen haben ohnehin eigene Seeds).
        if (array_diff_key(array_flip(HoroscopeGenerator::ADDON_KEYS), $day) !== []) {
            $day   += HoroscopeGenerator::day($date, $couple);
            $freeze = true;
        }
    }
}

if ($day === null) {
    $day    = HoroscopeGenerator::day($date, $couple);
    $freeze = true;
}

if ($freeze) {
    // Einfrieren — best effort: ohne Schreibrechte einfach weitersenden.
    if (is_dir(DAYS_DIR) || @mkdir(DAYS_DIR, 0775, true)) {
        $tmp = $file . '.tmp.' . getmypid();
        if (@file_put_contents($tmp, json_encode($day, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX) !== false) {
            @rename($tmp, $file);
        }
    }
}

respond(200, [
    'ok'          => true,
    'appName'     => APP_NAME,
    'version'     => APP_VERSION,
    'serverToday' => $today,
    'epoch'       => $epoch,
    'day'         => $day,
]);
