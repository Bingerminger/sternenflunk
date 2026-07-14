<?php

declare(strict_types=1);

require_once __DIR__ . '/Zodiac.php';

/**
 * Stammdaten des Paares: zwei Namen, zwei Sternzeichen, ein Startdatum.
 *
 * Gespeichert in data/couple.json. Der coupleKey fließt in alle Rng-Seeds —
 * ändert sich das Paar, ändert sich deterministisch das gesamte Programm.
 * Eingefrorene Tage mit fremdem coupleKey werden beim Ausliefern verworfen
 * und neu generiert; save() räumt sie zusätzlich direkt weg.
 */
final class Couple
{
    public const NAME_MAX = 24;

    /** @return ?array{a:array{name:string,sign:string}, b:array{name:string,sign:string}, since:string} */
    public static function load(): ?array
    {
        if (!is_file(COUPLE_FILE)) {
            return null;
        }
        $raw = file_get_contents(COUPLE_FILE);
        $c   = ($raw !== false) ? json_decode($raw, true) : null;

        if (!is_array($c)
            || !is_string($c['a']['name'] ?? null) || !is_string($c['a']['sign'] ?? null)
            || !is_string($c['b']['name'] ?? null) || !is_string($c['b']['sign'] ?? null)
            || !is_string($c['since'] ?? null)
            || !Zodiac::exists($c['a']['sign']) || !Zodiac::exists($c['b']['sign'])) {
            return null; // kaputte Datei ⇒ wie "nicht eingerichtet" behandeln
        }

        return ['a' => ['name' => $c['a']['name'], 'sign' => $c['a']['sign']],
                'b' => ['name' => $c['b']['name'], 'sign' => $c['b']['sign']],
                'since' => $c['since']];
    }

    /**
     * Validiert + speichert die Stammdaten (atomar). `since` bleibt beim
     * Re-Setup erhalten — die Zeitrechnung startet mit der Erstinstallation.
     *
     * @param array{name?:mixed, sign?:mixed} $a
     * @param array{name?:mixed, sign?:mixed} $b
     * @throws InvalidArgumentException bei Validierungsfehlern (Klartext, user-tauglich)
     * @throws RuntimeException wenn data/ nicht beschreibbar ist
     */
    public static function save(array $a, array $b): array
    {
        $clean = [
            'a' => ['name' => self::cleanName($a['name'] ?? '', 'Person Eins'), 'sign' => self::cleanSign($a['sign'] ?? '', 'Person Eins')],
            'b' => ['name' => self::cleanName($b['name'] ?? '', 'Person Zwei'), 'sign' => self::cleanSign($b['sign'] ?? '', 'Person Zwei')],
        ];

        $previous = self::load();
        $clean['since']     = $previous['since'] ?? date('Y-m-d');
        $clean['updatedAt'] = date('c');

        if (!is_dir(DATA_DIR) && !@mkdir(DATA_DIR, 0775, true)) {
            throw new RuntimeException('Datenordner data/ lässt sich nicht anlegen (Schreibrechte prüfen).');
        }

        $tmp = COUPLE_FILE . '.tmp.' . getmypid();
        $json = json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        if (@file_put_contents($tmp, $json, LOCK_EX) === false || !@rename($tmp, COUPLE_FILE)) {
            @unlink($tmp);
            throw new RuntimeException('data/couple.json lässt sich nicht schreiben (Schreibrechte prüfen).');
        }

        // Neues Paar ⇒ neue Zeitlinie: eingefrorene Tage des alten Schlüssels entsorgen.
        if ($previous !== null && self::key($previous) !== self::key($clean)) {
            foreach (glob(DAYS_DIR . '/*.json') ?: [] as $file) {
                @unlink($file);
            }
        }

        return $clean;
    }

    /** Kurzer, stabiler Fingerabdruck des Paares — Bestandteil aller Rng-Seeds. */
    public static function key(array $couple): string
    {
        $norm = mb_strtolower(trim($couple['a']['name'])) . '|' . $couple['a']['sign'] . '|'
              . mb_strtolower(trim($couple['b']['name'])) . '|' . $couple['b']['sign'];

        return substr(sha1($norm), 0, 12);
    }

    /** Personen-Objekt inkl. Tierkreis-Metadaten für Generator & API. */
    public static function person(array $couple, string $slot): array
    {
        $p    = $couple[$slot];
        $sign = Zodiac::get($p['sign']);

        return [
            'slot'        => $slot,
            'name'        => $p['name'],
            'signKey'     => $p['sign'],
            'sign'        => $sign['name'],
            'signPlural'  => $sign['plural'],
            'glyph'       => $sign['glyph'],
            'emoji'       => $sign['emoji'],
            'element'     => $sign['elementMeta']['name'],
            'elementKey'  => $sign['element'],
            'chronoLabel' => $sign['elementMeta']['chronoLabel'],
        ];
    }

    private static function cleanName(mixed $name, string $who): string
    {
        if (!is_string($name)) {
            throw new InvalidArgumentException("$who braucht einen Namen.");
        }
        // Steuerzeichen raus, Whitespace normalisieren.
        $name = trim(preg_replace('/[\p{C}]+/u', '', $name) ?? '');
        $name = preg_replace('/\s+/u', ' ', $name) ?? '';

        if ($name === '') {
            throw new InvalidArgumentException("$who braucht einen Namen — die Sterne rufen ungern „Hallo, du da“.");
        }
        if (mb_strlen($name) > self::NAME_MAX) {
            throw new InvalidArgumentException("Der Name von $who ist länger als " . self::NAME_MAX . ' Zeichen — die Sterne kürzen nicht gern.');
        }

        return $name;
    }

    private static function cleanSign(mixed $sign, string $who): string
    {
        if (!is_string($sign) || !Zodiac::exists($sign)) {
            throw new InvalidArgumentException("$who braucht ein Sternzeichen aus dem Tierkreis (nicht aus dem Bastelladen).");
        }

        return $sign;
    }
}
