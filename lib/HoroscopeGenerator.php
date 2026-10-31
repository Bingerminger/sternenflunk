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
            'special'          => self::specials($date, $key, $couple),
            'sternbild'        => self::sternbild($date, $key, $a, $b),
            'spiel'            => self::spiel($date, $key, $a, $b),
            'pflege'           => [
                'a' => self::pflege($date, $key, $a, $b),
                'b' => self::pflege($date, $key, $b, $a),
            ],
        ];
    }

    /**
     * Sektionen ab 2.0. Ältere eingefrorene Tage kennen sie noch nicht —
     * api.php rüstet fehlende Schlüssel nach (eigene Seeds ⇒ Bestehendes
     * bleibt bitgenau unangetastet).
     */
    public const ADDON_KEYS = ['sternbild', 'spiel', 'pflege'];

    // ------------------------------------------------- 2.0: Sternbild des Tages

    /**
     * Form-Schlüssel ⇒ [Artikel, Nomen]. Die Geometrie (Sterne + Linien)
     * liegt in assets/js/charts.js (SFCharts.constellation) unter demselben
     * Schlüssel — neue Formen bitte immer auf beiden Seiten ergänzen.
     */
    private const STERNBILD_FORMEN = [
        'herz'          => ['Das', 'Herz'],
        'tasse'         => ['Die', 'Kaffeetasse'],
        'katze'         => ['Die', 'Katze'],
        'rakete'        => ['Die', 'Rakete'],
        'sofa'          => ['Das', 'Sofa'],
        'pizza'         => ['Das', 'Pizzastück'],
        'schluessel'    => ['Der', 'Schlüssel'],
        'krone'         => ['Die', 'Krone'],
        'fisch'         => ['Der', 'Fisch'],
        'haus'          => ['Das', 'Häuschen'],
        'ballon'        => ['Der', 'Heißluftballon'],
        'teekanne'      => ['Die', 'Teekanne'],
        'schirm'        => ['Der', 'Regenschirm'],
        'socke'         => ['Die', 'Socke'],
        'pfeil'         => ['Der', 'Amorpfeil'],
        'eis'           => ['Die', 'Eistüte'],
        'papierflieger' => ['Der', 'Papierflieger'],
        'anker'         => ['Der', 'Anker'],
        'kerze'         => ['Die', 'Kerze'],
        'unendlich'     => ['Die', 'Endlosschleife'],
    ];

    private static function sternbild(string $date, string $key, array $a, array $b): array
    {
        $rng  = new Rng($date . '|sternbild|' . $key);
        $sun  = Astro::sun($date);
        $form = (string) $rng->pick(array_keys(self::STERNBILD_FORMEN));
        [$artikel, $nomen] = self::STERNBILD_FORMEN[$form];

        return [
            'form'       => $form,
            'name'       => $artikel . ' ' . $rng->pick(Content::STERNBILD_ADJEKTIVE) . ' ' . $nomen,
            'text'       => self::fill($rng->pick(Content::STERNBILD_TEXTE), $rng, $sun, ['{A}' => $a['name'], '{B}' => $b['name']]),
            'helligkeit' => round($rng->float(1.2, 6.4), 1),   // scheinbare Helligkeit in mag
            'entfernung' => $rng->int(12, 980),                // Lichtjahre, frei erfunden
            'sichtbarAb' => $sun['set'],
            'seed'       => $rng->int(1, 999_999),             // Zitter-Seed fürs Frontend
        ];
    }

    // ------------------------------------------------------ 2.0: Spielwiese

    /**
     * Rubbellose (je eins FÜR a und FÜR b), drei „Wer von euch?“-Fragen samt
     * Fazit je Einigkeits-Stand und drei Funksprüche pro Richtung.
     * Jede Teil-Sektion hat einen eigenen Seed.
     */
    private static function spiel(string $date, string $key, array $a, array $b): array
    {
        $names = ['{A}' => $a['name'], '{B}' => $b['name']];

        $rngG       = new Rng($date . '|gutschein|' . $key);
        [$gA, $gB]  = $rngG->sample(Content::GUTSCHEINE, 2);

        $rngW   = new Rng($date . '|wervonuns|' . $key);
        $fragen = $rngW->sample(Content::WER_VON_UNS, 3);
        $fazit  = [];
        foreach ([0, 1, 2, 3] as $n) {
            $fazit[] = strtr($rngW->pick(Content::WER_FAZIT[$n]), $names);
        }

        return [
            'gutschein' => ['a' => $gA, 'b' => $gB],      // 'a' = Gutschein FÜR a (von b)
            'werVonUns' => ['fragen' => $fragen, 'fazit' => $fazit],
            'funk'      => [                              // 'a' = Funksprüche VON a an b
                'a' => self::funk($date, $key, $a, $b),
                'b' => self::funk($date, $key, $b, $a),
            ],
        ];
    }

    /** @return list<string> */
    private static function funk(string $date, string $key, array $from, array $to): array
    {
        $rng = new Rng($date . '|funk-' . $from['slot'] . '|' . $key);
        $out = [];
        foreach ($rng->sample(Content::FUNK_KERN, 3) as $kern) {
            $out[] = strtr(
                $rng->pick(Content::FUNK_ANREDE) . ' ' . $kern . ' ' . $rng->pick(Content::FUNK_GRUSS),
                ['{PARTNER}' => $to['name'], '{NAME}' => $from['name']]
            );
        }

        return $out;
    }

    // ------------------------------------------------------- 2.0: Sofa-Modus

    /**
     * Genesungs-Edition für Tage, an denen jemand angeschlagen ist. Wird
     * immer mitgeneriert; ob sie erscheint, entscheidet das Paar im Frontend.
     */
    private static function pflege(string $date, string $key, array $p, array $partner): array
    {
        $rng = new Rng($date . '|pflege-' . $p['slot'] . '|' . $key);
        $sun = Astro::sun($date);
        $ctx = ['{NAME}' => $p['name'], '{PARTNER}' => $partner['name']];

        return [
            'prognose'      => self::fill($rng->pick(Content::PFLEGE_PROGNOSE), $rng, $sun, $ctx),
            'rezept'        => $rng->sample(Content::PFLEGE_REZEPT, 3),
            'auftrag'       => self::fill($rng->pick(Content::PFLEGE_AUFTRAG), $rng, $sun, $ctx),
            'tee'           => $rng->pick(Content::PFLEGE_TEE),
            'kuschelBedarf' => round($rng->float(92.0, 99.9), 1),
            'tassen'        => $rng->int(3, 7),
            'sofaG'         => round($rng->float(1.8, 4.2), 1),
        ];
    }

    // --------------------------------------------------------------- Specials

    /**
     * Eastereggs & Anlässe: Paar-Jubiläen (Tages-Meilensteine + Jahrestag der
     * Erstinstallation), fixe Kalendertage, Ostern, Freitag der 13.
     * Eigener Rng-Seed — beeinflusst keine andere Sektion. Rein deterministisch
     * aus Datum + since + coupleKey. Liefert 0–2 Einträge.
     *
     * @return array<int, array{type:string, emoji:string, title:string, text:string}>
     */
    private static function specials(string $date, string $key, array $couple): array
    {
        $rng = new Rng($date . '|special|' . $key);
        $out = [];

        // Paar-Jubiläen zuerst — die persönlichste Sorte Feiertag.
        $since = (string) ($couple['since'] ?? '');
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $since) === 1 && $date > $since) {
            $days = (int) round((strtotime($date . ' 12:00:00') - strtotime($since . ' 12:00:00')) / 86400);

            if (substr($date, 5) === substr($since, 5)) {
                $jahre = (int) substr($date, 0, 4) - (int) substr($since, 0, 4);
                if ($jahre >= 1) {
                    $jahreText = $jahre === 1 ? 'einem Jahr' : $jahre . ' Jahren';
                    $out[] = [
                        'type'  => 'anniversary',
                        'emoji' => '🎂',
                        'title' => 'Flunk-Geburtstag',
                        'text'  => str_replace('{JAHRE_TEXT}', $jahreText, $rng->pick(Content::SPECIAL_ANNIVERSARY_TEXTS)),
                    ];
                }
            } elseif (in_array($days, Content::SPECIAL_MILESTONES, true)) {
                $out[] = [
                    'type'  => 'milestone',
                    'emoji' => '🏅',
                    'title' => 'Flunk-Meilenstein',
                    'text'  => str_replace('{N}', (string) $days, $rng->pick(Content::SPECIAL_MILESTONE_TEXTS)),
                ];
            }
        }

        // Kalender-Anlässe: fixe Tage, Ostern (beweglich), Freitag der 13.
        $mmdd  = substr($date, 5);
        $year  = (int) substr($date, 0, 4);
        $anlass = Content::SPECIAL_DATES[$mmdd] ?? null;

        if ($anlass === null) {
            $easter = Astro::easterSunday($year);
            if ($date === $easter) {
                $anlass = Content::SPECIAL_EASTER_SUNDAY;
            } elseif ($date === date('Y-m-d', strtotime($easter . ' +1 day'))) {
                $anlass = Content::SPECIAL_EASTER_MONDAY;
            }
        }
        if ($anlass === null
            && (int) date('N', strtotime($date . ' 12:00:00')) === 5
            && (int) substr($date, 8) === 13) {
            $anlass = Content::SPECIAL_FRIDAY13;
        }

        if ($anlass !== null) {
            [$emoji, $title, $texts] = $anlass;
            $out[] = [
                'type'  => 'calendar',
                'emoji' => $emoji,
                'title' => $title,
                'text'  => $rng->pick($texts),
            ];
        }

        return array_slice($out, 0, 2);
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
            'numerology' => ['digit' => $digit, 'text' => $rng->pick(Content::NUMEROLOGY[$digit])],
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

        // Duell: täglich wechselnde 5er-Auswahl aus dem Kategorien-Pool.
        $battle = [];
        foreach ($rng->sample(Content::BATTLE_KATEGORIEN, 5) as $kat) {
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
