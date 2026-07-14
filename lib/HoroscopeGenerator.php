<?php

declare(strict_types=1);

require_once __DIR__ . '/Rng.php';
require_once __DIR__ . '/Astro.php';
require_once __DIR__ . '/Zodiac.php';
require_once __DIR__ . '/Couple.php';
require_once __DIR__ . '/Content.php';

/**
 * Baut das komplette Tages-Horoskop — deterministisch geseedet aus Datum
 * UND Paar-Fingerabdruck (coupleKey). Gleiches Datum + gleiches Paar
 * ⇒ gleiches Horoskop, für immer. Keine Datenbank nötig.
 *
 * Ändert das Paar seine Stammdaten, ändert sich der coupleKey und damit
 * (gewollt) die gesamte Zeitlinie — eingefrorene Tage mit fremdem Key
 * werden verworfen und neu generiert.
 */
final class HoroscopeGenerator
{
    public static function day(string $date, array $couple): array
    {
        $key = Couple::key($couple);
        $a   = Couple::person($couple, 'a');
        $b   = Couple::person($couple, 'b');

        return [
            'date'             => $date,
            'weekday'          => Astro::weekdayName($date),
            'displayDate'      => Astro::displayDate($date),
            'generatorVersion' => APP_VERSION,
            'coupleKey'        => $key,
            'astro'            => self::astro($date, $key, $a, $b),
            'a'                => self::person($date, $key, $a, $b),
            'b'                => self::person($date, $key, $b, $a),
            'couple'           => self::couple($date, $key, $a, $b),
        ];
    }

    // ------------------------------------------------------------------ Astro

    private static function astro(string $date, string $key, array $a, array $b): array
    {
        $rng  = new Rng($date . '|astro|' . $key);
        $moon = Astro::moon($date);
        $sun  = Astro::sun($date);

        $moon['text'] = $rng->pick(Content::MOON_TEXTS[$moon['group']]);

        $trend = $sun['trendMin'];
        if ($trend > 0) {
            $trendText = str_replace('{MIN}', (string) $trend, $rng->pick(Content::SUN_LONGER));
        } elseif ($trend < 0) {
            $trendText = str_replace('{MIN}', (string) abs($trend), $rng->pick(Content::SUN_SHORTER));
        } else {
            $trendText = $rng->pick(Content::SUN_EQUAL);
        }
        $sun['trendText'] = $trendText;

        // Saison: Heimspiel, Doppel-Heimspiel oder neutraler Boden.
        $season = Astro::season($date);
        if ($season['sign'] === $a['sign'] && $season['sign'] === $b['sign']) {
            $text = self::fill($rng->pick(Content::SEASON_BOTH), $rng, $sun, ['{SIGN}' => $a['sign'], '{SIGN_PLURAL}' => $a['signPlural']]);
        } elseif ($season['sign'] === $a['sign'] || $season['sign'] === $b['sign']) {
            $home = ($season['sign'] === $a['sign']) ? $a : $b;
            $text = self::fill($rng->pick(Content::SEASON_HOME), $rng, $sun, ['{NAME}' => $home['name'], '{SIGN}' => $home['sign']]);
        } else {
            $text = $rng->pick(Content::SEASON_GENERIC);
        }
        $season['text'] = $text;

        $mercury = Astro::mercury($date);
        $mercury['text'] = $mercury['retro']
            ? str_replace('{BIS}', (string) $mercury['until'], $rng->pick(Content::MERCURY_TEXTS))
            : null;

        $digit = Astro::numerologyDigit($date);

        return [
            'moon'       => $moon,
            'sun'        => $sun,
            'season'     => $season,
            'mercury'    => $mercury,
            'weather'    => self::fill($rng->pick(Content::WEATHER), $rng, $sun),
            'fact'       => $rng->pick(Content::FACTS),
            'numerology' => ['digit' => $digit, 'text' => Content::NUMEROLOGY[$digit]],
        ];
    }

    // ----------------------------------------------------------------- Person

    private static function person(string $date, string $key, array $p, array $partner): array
    {
        $rng = new Rng($date . '|person-' . $p['slot'] . '|' . $key);
        $sun = Astro::sun($date);
        $ctx = [
            '{NAME}'        => $p['name'],
            '{PARTNER}'     => $partner['name'],
            '{SIGN}'        => $p['sign'],
            '{SIGN_PLURAL}' => $p['signPlural'],
        ];

        $stars = (int) $rng->weighted([2 => 10, 3 => 25, 4 => 40, 5 => 25]);

        $cats = [
            ['liebe',   'Liebe & Zuneigung', '💘', Content::LIEBE],
            ['energie', 'Körper & Energie',  '⚡', Content::ENERGIE],
            ['erfolg',  'Alltag & Erfolg',   '🎯', Content::ERFOLG],
            ['kopf',    'Kopf & Gefühl',     '🌙', Content::KOPF],
        ];

        $categories = [];
        foreach ($cats as [$catKey, $title, $icon, $pool]) {
            $categories[] = [
                'key'   => $catKey,
                'title' => $title,
                'icon'  => $icon,
                'score' => $rng->int(38, 99),
                'text'  => self::fill($rng->pick($pool), $rng, $sun, $ctx),
            ];
        }

        [$farbName, $farbHex] = $rng->pick(Content::FARBEN);
        $fensterStart = sprintf('%02d:%02d', $rng->int(9, 19), $rng->pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]));
        $fensterEnde  = date('H:i', strtotime($date . ' ' . $fensterStart) + $rng->pick([15, 20, 25]) * 60);

        $energie = self::energyCurve($rng, $p['elementKey']);

        return [
            'slot'        => $p['slot'],
            'name'        => $p['name'],
            'sign'        => $p['sign'],
            'signKey'     => $p['signKey'],
            'glyph'       => $p['glyph'],
            'emoji'       => $p['emoji'],
            'element'     => $p['element'],
            'chronoLabel' => $p['chronoLabel'],
            'stars'       => $stars,
            'starsLabel'  => Content::STAR_LABELS[$stars],
            'motto'       => self::fill($rng->pick(Content::MOTTOS), $rng, $sun, $ctx),
            'signSpruch'  => $rng->pick(Content::SIGN_SPRUECHE[$p['signKey']]),
            'categories'  => $categories,
            'glueck'      => [
                'zahl'    => $rng->int(1, 99),
                'farbe'   => ['name' => $farbName, 'hex' => $farbHex],
                'emoji'   => $rng->pick(Content::EMOJIS),
                'item'    => $rng->pick(array_merge(Content::ITEMS_COMMON, Content::ITEMS_SIGN[$p['signKey']])),
                'fenster' => $fensterStart . '–' . $fensterEnde . ' Uhr',
            ],
            'energie'     => $energie + [
                'peakText' => $rng->pick(Content::PEAK_TEXTE[$p['elementKey']]),
            ],
            'spice'       => [
                'pct'  => $rng->int(55, 99),
                'text' => self::fill($rng->pick(Content::SPICE), $rng, $sun, $ctx),
            ],
            'warnung'     => self::fill($rng->pick(Content::WARNUNG), $rng, $sun, $ctx),
        ];
    }

    /**
     * Tagesenergie in 48 Halbstunden-Schritten (0–100).
     * Der Chronotyp (Peak-/Sekundärfenster) kommt aus dem Element des Zeichens.
     *
     * @return array{points: array<int, int>, peakZeit: string, tiefZeit: string}
     */
    private static function energyCurve(Rng $rng, string $elementKey): array
    {
        $el = Zodiac::ELEMENTS[$elementKey];

        $peakHour  = $rng->float($el['peak'][0], $el['peak'][1]);
        $secondary = $rng->float($el['secondary'][0], $el['secondary'][1]);
        $amp       = $rng->float(30, 42);
        $base      = $rng->float(38, 50);

        $points = [];
        for ($i = 0; $i < 48; $i++) {
            $h = $i / 2.0;
            $main   = $amp * exp(-(($h - $peakHour) ** 2) / (2 * 2.6 ** 2));
            $second = ($amp * 0.55) * exp(-(($h - $secondary) ** 2) / (2 * 2.2 ** 2));
            $night  = ($h < 6) ? -28 * (1 - $h / 6) : 0; // nachts schläft (fast) jeder
            $val    = $base + $main + $second + $night + $rng->float(-4, 4);
            $points[] = (int) round(max(4, min(100, $val)));
        }

        $peakIdx  = (int) array_search(max($points), $points, true);
        $daySlice = array_slice($points, 12, null, true); // Tief erst nach 6 Uhr suchen
        $lowIdx   = (int) array_search(min($daySlice), $daySlice, true);

        return [
            'points'   => $points,
            'peakZeit' => self::slotTime($peakIdx),
            'tiefZeit' => self::slotTime($lowIdx),
        ];
    }

    private static function slotTime(int $slot): string
    {
        return sprintf('%02d:%02d', intdiv($slot, 2), ($slot % 2) * 30);
    }

    // ------------------------------------------------------------------- Paar

    private static function couple(string $date, string $key, array $a, array $b): array
    {
        $rng = new Rng($date . '|stern|' . $key);
        $sun = Astro::sun($date);
        $ctx = ['{A}' => $a['name'], '{B}' => $b['name']];

        // Kompatibilität: langsame Welle über die Tage + Tagesrauschen.
        // Mechanik & Verteilung wie beim gestimmten Original (Ø ≈ 73,
        // ~9 Jackpot-, ~3 Chaos-Tage/Jahr) — nur die Phasen sind pro Paar
        // verschoben, damit nicht alle Paare am selben Tag Jackpot feiern.
        $noise    = $rng->float(-8, 8);
        $dayIndex = (int) (strtotime($date) / 86400);
        $phase1   = 14 + (crc32($key) % 89);
        $phase2   = crc32($key . '#2') % 53;
        $wave     = 15 * sin(($dayIndex + $phase1) / 3.9) + 6 * sin(($dayIndex + $phase2) / 11.3);
        $pct      = round(max(42, min(99.5, 73 + $wave + $noise)), 1);

        if ($pct >= 96) {
            $special = 'jackpot';
            $text    = $rng->pick(Content::KOMPAT_JACKPOT);
        } elseif ($pct <= 48) {
            $special = 'chaos';
            $text    = $rng->pick(Content::KOMPAT_CHAOS);
        } else {
            $special = null;
            $text    = $pct >= 80
                ? $rng->pick(Content::KOMPAT_HOCH)
                : ($pct >= 62 ? $rng->pick(Content::KOMPAT_MITTEL) : $rng->pick(Content::KOMPAT_NIEDRIG));
        }
        $text = self::fill($text, $rng, $sun, $ctx);

        $kuschel = (int) round(max(35, min(99, $pct * 0.7 + $rng->float(5, 30))));
        $streit  = (int) round(max(4,  min(85, 104 - $pct + $rng->float(-12, 12))));

        // Gemeinsames Energiefenster aus beiden Kurven.
        $curveA = self::person($date, $key, $a, $b)['energie']['points'];
        $curveB = self::person($date, $key, $b, $a)['energie']['points'];
        $fenster = self::sharedWindow($curveA, $curveB);
        $fenster['text'] = $rng->pick(Content::FENSTER_TEXTE);

        $rechtWer = (string) $rng->weighted(['a' => 40, 'b' => 40, 'beide' => 13, 'universum' => 7]);
        $recht = [
            'wer'  => $rechtWer,
            'text' => match ($rechtWer) {
                'a', 'b' => self::fill($rng->pick(Content::RECHT_PERSON), $rng, $sun, [
                    '{NAME}'        => ($rechtWer === 'a' ? $a : $b)['name'],
                    '{SIGN}'        => ($rechtWer === 'a' ? $a : $b)['sign'],
                    '{SIGN_PLURAL}' => ($rechtWer === 'a' ? $a : $b)['signPlural'],
                ]),
                'beide'  => $rng->pick(Content::RECHT_BEIDE),
                default  => $rng->pick(Content::RECHT_UNIVERSUM),
            },
        ];

        $battle = [];
        foreach (Content::BATTLE_KATEGORIEN as $kat) {
            $aVal = $rng->int(30, 99);
            $bVal = $rng->int(30, 99);
            if (abs($aVal - $bVal) <= 4) {
                $kommentar = str_replace('{LABEL}', $kat['label'], $rng->pick(Content::BATTLE_UNENTSCHIEDEN));
            } else {
                $winner    = ($aVal > $bVal) ? $a : $b;
                $kommentar = strtr($rng->pick(Content::BATTLE_WIN), [
                    '{LABEL}' => $kat['label'],
                    '{NAME}'  => $winner['name'],
                    '{SIGN}'  => $winner['sign'],
                ]);
            }
            $battle[] = [
                'key'       => $kat['key'],
                'label'     => $kat['label'],
                'a'         => $aVal,
                'b'         => $bVal,
                'kommentar' => $kommentar,
            ];
        }

        // Elementar-Funk: Chemie der beiden Zeichen (bei Zeichengleichheit
        // mischen sich Spiegel-Texte in den Element-Pool).
        $comboPool = Content::ELEMENT_COMBO[Zodiac::comboKey($a['signKey'], $b['signKey'])];
        if ($a['signKey'] === $b['signKey']) {
            $comboPool = array_merge(Content::SAME_SIGN, $comboPool);
        }
        $elementText = self::fill($rng->pick($comboPool), $rng, $sun, $ctx + [
            '{SIGN}'        => $a['sign'],
            '{SIGN_PLURAL}' => $a['signPlural'],
        ]);

        return [
            'kompatibilitaet' => ['pct' => $pct, 'text' => $text, 'special' => $special],
            'kuschelIndex'    => $kuschel,
            'streitRisiko'    => $streit,
            'streitThema'     => $rng->pick(Content::STREIT_THEMEN),
            'fenster'         => $fenster,
            'recht'           => $recht,
            'dateIdee'        => self::fill($rng->pick(Content::DATE_IDEEN), $rng, $sun, $ctx),
            'gespraech'       => $rng->pick(Content::GESPRAECH),
            'mission'         => $rng->pick(Content::MISSIONEN),
            'elementarFunk'   => [
                'kombi' => $a['element'] . ' × ' . $b['element'],
                'text'  => $elementText,
            ],
            'redFlag'         => self::fill($rng->pick(Content::RED_FLAGS), $rng, $sun, $ctx),
            'greenFlag'       => self::fill($rng->pick(Content::GREEN_FLAGS), $rng, $sun, $ctx),
            'prophezeiung'    => self::fill($rng->pick(Content::PROPHEZEIUNGEN), $rng, $sun, $ctx),
            'battle'          => $battle,
        ];
    }

    /**
     * Längstes zusammenhängendes Fenster, in dem BEIDE Kurven über der Schwelle
     * liegen. Schwelle sinkt schrittweise, bis mindestens 1,5 h zusammenkommen.
     *
     * @param array<int, int> $ca
     * @param array<int, int> $cb
     * @return array{von: string, bis: string}
     */
    private static function sharedWindow(array $ca, array $cb): array
    {
        for ($threshold = 68; $threshold >= 30; $threshold -= 5) {
            $bestStart = -1;
            $bestLen   = 0;
            $curStart  = -1;
            $curLen    = 0;
            for ($i = 12; $i < 48; $i++) { // ab 6:00 Uhr — nachts zählt nicht
                if (min($ca[$i], $cb[$i]) >= $threshold) {
                    if ($curStart < 0) {
                        $curStart = $i;
                    }
                    $curLen++;
                    if ($curLen > $bestLen) {
                        $bestLen   = $curLen;
                        $bestStart = $curStart;
                    }
                } else {
                    $curStart = -1;
                    $curLen   = 0;
                }
            }
            if ($bestLen >= 3) {
                return [
                    'von' => self::slotTime($bestStart),
                    'bis' => self::slotTime(min(47, $bestStart + $bestLen)),
                ];
            }
        }

        return ['von' => '12:00', 'bis' => '12:30']; // komödiantischer Notfall
    }

    // ---------------------------------------------------------------- Helfer

    /**
     * Füllt Platzhalter in Pool-Texten. {ZEIT} wird pro Text einmal gewürfelt,
     * {WER}/{ANDERE} werden fair aus dem Paar-Kontext gelost.
     */
    private static function fill(string $text, Rng $rng, array $sun, array $ctx = []): string
    {
        if (str_contains($text, '{ZEIT}')) {
            $zeit = sprintf('%02d:%02d', $rng->int(8, 21), $rng->pick([0, 10, 15, 20, 30, 40, 45, 50]));
            $text = str_replace('{ZEIT}', $zeit, $text);
        }

        if (str_contains($text, '{WER}') && isset($ctx['{A}'], $ctx['{B}'])) {
            $werIsA = $rng->next() < 0.5;
            $text   = strtr($text, [
                '{WER}'    => $werIsA ? $ctx['{A}'] : $ctx['{B}'],
                '{ANDERE}' => $werIsA ? $ctx['{B}'] : $ctx['{A}'],
            ]);
        }

        return strtr($text, $ctx + [
            '{SUNSET}' => $sun['set'],
            '{ORT}'    => GEO_NAME,
        ]);
    }
}
