<?php

declare(strict_types=1);

/**
 * Echte Astronomie (na gut: echt genug) — Mondphase, Sonnenzeiten für Leipzig,
 * Tierkreis-Saison, Merkur-Retrograde-Fenster und deutsche Datumsformate.
 */
final class Astro
{
    private const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    private const MONTHS   = [1 => 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
                              'August', 'September', 'Oktober', 'November', 'Dezember'];

    // Synodischer Monat in Tagen; Referenz-Neumond: 2000-01-06 18:14 UTC.
    private const SYNODIC_MONTH  = 29.530588853;
    private const NEW_MOON_EPOCH = 947182440;

    /**
     * Merkur-Rückläufigkeits-Fenster (astronomisch grob, komödiantisch exakt).
     * @var array<int, array{0:string, 1:string}>
     */
    private const MERCURY_RETRO = [
        ['2026-02-26', '2026-03-20'],
        ['2026-06-29', '2026-07-23'],
        ['2026-10-24', '2026-11-13'],
        ['2027-02-09', '2027-03-03'],
        ['2027-06-10', '2027-07-04'],
        ['2027-10-07', '2027-10-28'],
    ];

    /** Tierkreis-Saisons: [Zeichen, Glyph, Start mm-dd] — Ende = Start des nächsten. */
    private const SEASONS = [
        ['Steinbock',  '♑', '12-22'],
        ['Wassermann', '♒', '01-20'],
        ['Fische',     '♓', '02-19'],
        ['Widder',     '♈', '03-21'],
        ['Stier',      '♉', '04-20'],
        ['Zwillinge',  '♊', '05-21'],
        ['Krebs',      '♋', '06-21'],
        ['Löwe',       '♌', '07-23'],
        ['Jungfrau',   '♍', '08-23'],
        ['Waage',      '♎', '09-23'],
        ['Skorpion',   '♏', '10-23'],
        ['Schütze',    '♐', '11-22'],
    ];

    public static function weekdayName(string $date): string
    {
        return self::WEEKDAYS[(int) date('w', strtotime($date . ' 12:00:00'))];
    }

    /** "Dienstag, 14. Juli 2026" */
    public static function displayDate(string $date): string
    {
        $ts = strtotime($date . ' 12:00:00');

        return sprintf(
            '%s, %d. %s %d',
            self::WEEKDAYS[(int) date('w', $ts)],
            (int) date('j', $ts),
            self::MONTHS[(int) date('n', $ts)],
            (int) date('Y', $ts)
        );
    }

    /**
     * Mondphase: Name, Emoji, Beleuchtung in Prozent, Phasengruppe.
     *
     * @return array{name:string, emoji:string, illumination:int, group:string}
     */
    public static function moon(string $date): array
    {
        $ts    = strtotime($date . ' 12:00:00 UTC');
        $age   = fmod(($ts - self::NEW_MOON_EPOCH) / 86400.0, self::SYNODIC_MONTH);
        if ($age < 0) {
            $age += self::SYNODIC_MONTH;
        }
        $frac  = $age / self::SYNODIC_MONTH;
        $illum = (int) round((1 - cos(2 * M_PI * $frac)) / 2 * 100);

        $phases = [
            ['Neumond',              '🌑', 'neu'],
            ['Zunehmende Sichel',    '🌒', 'zunehmend'],
            ['Zunehmender Halbmond', '🌓', 'zunehmend'],
            ['Zunehmender Mond',     '🌔', 'zunehmend'],
            ['Vollmond',             '🌕', 'voll'],
            ['Abnehmender Mond',     '🌖', 'abnehmend'],
            ['Abnehmender Halbmond', '🌗', 'abnehmend'],
            ['Abnehmende Sichel',    '🌘', 'abnehmend'],
        ];
        $idx = (int) floor(($frac * 8) + 0.5) % 8;
        [$name, $emoji, $group] = $phases[$idx];

        return ['name' => $name, 'emoji' => $emoji, 'illumination' => $illum, 'group' => $group];
    }

    /**
     * Sonnenzeiten + Tageslichtdauer für den konfigurierten Standort.
     *
     * @return array{rise:string, set:string, dayLength:string, trendMin:int, location:string}
     */
    public static function sun(string $date): array
    {
        $today     = self::sunTimes($date);
        $yesterday = self::sunTimes(date('Y-m-d', strtotime($date . ' -1 day')));

        $lenToday = $today['set'] - $today['rise'];
        $lenYest  = $yesterday['set'] - $yesterday['rise'];
        $trendMin = (int) round(($lenToday - $lenYest) / 60);

        $h = intdiv($lenToday, 3600);
        $m = intdiv($lenToday % 3600, 60);

        return [
            'rise'      => date('H:i', $today['rise']),
            'set'       => date('H:i', $today['set']),
            'dayLength' => sprintf('%d Std %02d Min', $h, $m),
            'trendMin'  => $trendMin,
            'location'  => GEO_NAME,
        ];
    }

    /** @return array{rise:int, set:int} */
    private static function sunTimes(string $date): array
    {
        $info = date_sun_info(strtotime($date . ' 12:00:00'), GEO_LAT, GEO_LON);
        // Polartag/-nacht gibt es in Leipzig nicht; Fallback nur der Vollständigkeit halber.
        $rise = is_int($info['sunrise']) ? $info['sunrise'] : strtotime($date . ' 06:00:00');
        $set  = is_int($info['sunset'])  ? $info['sunset']  : strtotime($date . ' 20:00:00');

        return ['rise' => $rise, 'set' => $set];
    }

    /** @return array{sign:string, glyph:string} */
    public static function season(string $date): array
    {
        $mmdd = date('m-d', strtotime($date . ' 12:00:00'));
        $current = self::SEASONS[0]; // Steinbock deckt den Jahreswechsel ab.
        foreach (self::SEASONS as $season) {
            if ($season[2] !== '12-22' && $mmdd >= $season[2]) {
                $current = $season;
            }
        }
        if ($mmdd >= '12-22') {
            $current = self::SEASONS[0];
        }

        return ['sign' => $current[0], 'glyph' => $current[1]];
    }

    /** @return array{retro:bool, until:?string} */
    public static function mercury(string $date): array
    {
        foreach (self::MERCURY_RETRO as [$start, $end]) {
            if ($date >= $start && $date <= $end) {
                return ['retro' => true, 'until' => date('d.m.', strtotime($end))];
            }
        }

        return ['retro' => false, 'until' => null];
    }

    /**
     * Ostersonntag eines Jahres als 'YYYY-MM-DD' (anonyme Gauß-Formel,
     * gregorianisch) — bewusst ohne ext/calendar-Abhängigkeit.
     */
    public static function easterSunday(int $year): string
    {
        $a = $year % 19;
        $b = intdiv($year, 100);
        $c = $year % 100;
        $d = intdiv($b, 4);
        $e = $b % 4;
        $f = intdiv($b + 8, 25);
        $g = intdiv($b - $f + 1, 3);
        $h = (19 * $a + $b - $d - $g + 15) % 30;
        $i = intdiv($c, 4);
        $k = $c % 4;
        $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7;
        $m = intdiv($a + 11 * $h + 22 * $l, 451);
        $month = intdiv($h + $l - 7 * $m + 114, 31);
        $day   = (($h + $l - 7 * $m + 114) % 31) + 1;

        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    /** Numerologische Quersumme des Datums, reduziert auf 1–9. */
    public static function numerologyDigit(string $date): int
    {
        $sum = array_sum(array_map('intval', str_split(str_replace('-', '', $date))));
        while ($sum > 9) {
            $sum = array_sum(array_map('intval', str_split((string) $sum)));
        }

        return max(1, $sum);
    }
}
