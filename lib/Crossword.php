<?php

declare(strict_types=1);

require_once __DIR__ . '/Rng.php';

/**
 * Sonntagsrätsel: ein kleines, freies Kreuzworträtsel mit Lösungswort.
 *
 * Rein deterministisch aus dem übergebenen Rng — gleicher Seed, gleiches
 * Gitter. Mehrere Layout-Versuche, der kompakteste mit den meisten
 * Kreuzungen gewinnt. Regeln wie im Zeitschriften-Rätsel: Wörter berühren
 * sich nur an Kreuzungen, nie seitlich, nie Stirn an Stirn.
 */
final class Crossword
{
    public const MAX_SIZE = 11;          // maximale Kantenlänge (Handy-tauglich)
    private const ATTEMPTS = 40;         // Layout-Versuche pro Rätsel
    private const TARGET_WORDS = 10;
    private const MIN_WORDS = 7;
    private const CANDIDATES = 34;       // Pool-Stichprobe je Versuch

    /** Kreuzworträtsel-Schreibweise: Großbuchstaben, Ä→AE, Ö→OE, Ü→UE, ß→SS. */
    public static function normalize(string $word): string
    {
        $up = strtr(mb_strtoupper($word, 'UTF-8'), ['Ä' => 'AE', 'Ö' => 'OE', 'Ü' => 'UE', 'ẞ' => 'SS', 'ß' => 'SS']);

        return (string) preg_replace('/[^A-Z]/', '', $up);
    }

    /**
     * @param list<array{0:string,1:string}> $pool      [Antwort (normalisiert), Frage]
     * @param list<array{0:string,1:string}> $personal  persönliche Einträge — werden bevorzugt eingebaut
     * @param list<string>                   $solutions normalisierte Lösungswörter in Wunsch-Reihenfolge
     * @return array{rows:int, cols:int, grid:list<string>, words:list<array<string,mixed>>,
     *               loesung:array{wort:string, felder:list<array{0:int,1:int}>}}|null
     */
    public static function build(Rng $rng, array $pool, array $personal, array $solutions): ?array
    {
        $best = null;
        $bestScore = -INF;

        for ($attempt = 0; $attempt < self::ATTEMPTS; $attempt++) {
            $layout = self::layout($rng, $pool, $personal);
            if ($layout === null || count($layout['words']) < self::MIN_WORDS) {
                continue;
            }

            foreach ($solutions as $word) {
                $cells = self::assignSolution($rng, $layout['cells'], $word);
                if ($cells === null) {
                    continue;
                }
                [$h, $w] = [$layout['maxR'] - $layout['minR'] + 1, $layout['maxC'] - $layout['minC'] + 1];
                $score = count($layout['words']) * 6 + $layout['crossings'] * 3
                    - ($h * $w) * 0.08 - abs($h - $w) * 0.6 + $layout['personal'] * 4;
                if ($score > $bestScore) {
                    $bestScore = $score;
                    $best = $layout + ['solution' => $word, 'solutionCells' => $cells];
                }
                break; // erstes passendes Lösungswort je Layout genügt
            }
        }

        return $best === null ? null : self::export($best);
    }

    // --------------------------------------------------------------- Layout

    /** Ein Layout-Versuch: Startwort in die Mitte, dann Wort für Wort anlegen. */
    private static function layout(Rng $rng, array $pool, array $personal): ?array
    {
        $cand = array_merge($rng->sample($personal, count($personal)), $rng->sample($pool, self::CANDIDATES));

        // Doppelte Antworten raus (z. B. Name = Pool-Wort)
        $seen = [];
        $cand = array_values(array_filter($cand, static function ($e) use (&$seen) {
            if (isset($seen[$e[0]])) {
                return false;
            }
            $seen[$e[0]] = true;

            return true;
        }));

        // Startwort: ein langes aus dem Pool-Teil
        $long = array_values(array_filter($cand, static fn ($e) => strlen($e[0]) >= 6 && strlen($e[0]) <= 9));
        if ($long === []) {
            return null;
        }
        $first = $rng->pick($long);

        $L = [
            'cells' => [],      // "r,c" => Buchstabe
            'dirs' => [],       // "r,c" => ['a' => bool, 'd' => bool]
            'words' => [],
            'minR' => 0, 'maxR' => 0, 'minC' => 0, 'maxC' => strlen($first[0]) - 1,
            'crossings' => 0,
            'personal' => 0,
        ];
        $personalSet = array_flip(array_column($personal, 0));
        self::put($L, $first, 0, 0, 'a', isset($personalSet[$first[0]]));

        // Persönliche zuerst, dann lange vor kurzen (mit etwas Würfelglück)
        $rest = array_values(array_filter($cand, static fn ($e) => $e[0] !== $first[0]));
        usort($rest, static function ($x, $y) use ($personalSet) {
            $px = isset($personalSet[$x[0]]) ? 1 : 0;
            $py = isset($personalSet[$y[0]]) ? 1 : 0;

            return [$py, strlen($y[0])] <=> [$px, strlen($x[0])];
        });

        // Zwei Durchgänge: Wörter, die anfangs nirgends passen, bekommen eine zweite Chance.
        for ($pass = 0; $pass < 2 && count($L['words']) < self::TARGET_WORDS; $pass++) {
            $left = [];
            foreach ($rest as $entry) {
                if (count($L['words']) >= self::TARGET_WORDS) {
                    break;
                }
                $spot = self::bestSpot($rng, $L, $entry[0]);
                if ($spot === null) {
                    $left[] = $entry;
                    continue;
                }
                self::put($L, $entry, $spot[0], $spot[1], $spot[2], isset($personalSet[$entry[0]]));
                $L['crossings'] += $spot[3];
            }
            $rest = $left;
        }

        return $L;
    }

    /** @return array{0:int,1:int,2:string,3:int}|null [r, c, dir, Kreuzungen] */
    private static function bestSpot(Rng $rng, array $L, string $word): ?array
    {
        $len = strlen($word);
        $best = null;
        $bestScore = -INF;

        foreach ($L['cells'] as $pos => $letter) {
            $dirs = $L['dirs'][$pos];
            if ($dirs['a'] && $dirs['d']) {
                continue; // schon eine Kreuzung
            }
            $dir = $dirs['a'] ? 'd' : 'a';
            [$r0, $c0] = array_map('intval', explode(',', $pos));
            for ($i = 0; $i < $len; $i++) {
                if ($word[$i] !== $letter) {
                    continue;
                }
                $r = $dir === 'd' ? $r0 - $i : $r0;
                $c = $dir === 'a' ? $c0 - $i : $c0;
                $x = self::check($L, $word, $r, $c, $dir);
                if ($x === null) {
                    continue;
                }
                [$cross, $area, $aspect] = $x;
                $score = $cross * 10 - $area * 0.12 - $aspect * 1.5 + $rng->float(0, 2.5);
                if ($score > $bestScore) {
                    $bestScore = $score;
                    $best = [$r, $c, $dir, $cross];
                }
            }
        }

        return $best;
    }

    /**
     * Prüft eine Platzierung nach Kreuzworträtsel-Regeln.
     *
     * @return array{0:int,1:int,2:int}|null [Kreuzungen, Fläche danach, |Höhe−Breite|]
     */
    private static function check(array $L, string $word, int $r, int $c, string $dir): ?array
    {
        $len = strlen($word);
        [$dr, $dc] = $dir === 'a' ? [0, 1] : [1, 0];
        $cells = $L['cells'];

        // Stirnseiten frei: kein Verlängern fremder Wörter
        if (isset($cells[($r - $dr) . ',' . ($c - $dc)]) || isset($cells[($r + $dr * $len) . ',' . ($c + $dc * $len)])) {
            return null;
        }

        $cross = 0;
        for ($i = 0; $i < $len; $i++) {
            $rr = $r + $dr * $i;
            $cc = $c + $dc * $i;
            $pos = $rr . ',' . $cc;
            if (isset($cells[$pos])) {
                if ($cells[$pos] !== $word[$i] || $L['dirs'][$pos][$dir]) {
                    return null;
                }
                $cross++;
            } elseif (isset($cells[($rr + $dc) . ',' . ($cc + $dr)]) || isset($cells[($rr - $dc) . ',' . ($cc - $dr)])) {
                return null; // seitliche Berührung
            }
        }
        if ($cross === 0) {
            return null;
        }

        $minR = min($L['minR'], $r);
        $maxR = max($L['maxR'], $r + $dr * ($len - 1));
        $minC = min($L['minC'], $c);
        $maxC = max($L['maxC'], $c + $dc * ($len - 1));
        $h = $maxR - $minR + 1;
        $w = $maxC - $minC + 1;
        if ($h > self::MAX_SIZE || $w > self::MAX_SIZE) {
            return null;
        }

        return [$cross, $h * $w, abs($h - $w)];
    }

    private static function put(array &$L, array $entry, int $r, int $c, string $dir, bool $personal): void
    {
        [$word, $clue] = $entry;
        [$dr, $dc] = $dir === 'a' ? [0, 1] : [1, 0];
        $len = strlen($word);
        for ($i = 0; $i < $len; $i++) {
            $pos = ($r + $dr * $i) . ',' . ($c + $dc * $i);
            $L['cells'][$pos] = $word[$i];
            $L['dirs'][$pos] ??= ['a' => false, 'd' => false];
            $L['dirs'][$pos][$dir] = true;
        }
        $L['words'][] = ['antwort' => $word, 'frage' => $clue, 'r' => $r, 'c' => $c, 'dir' => $dir, 'len' => $len];
        $L['minR'] = min($L['minR'], $r);
        $L['maxR'] = max($L['maxR'], $r + $dr * ($len - 1));
        $L['minC'] = min($L['minC'], $c);
        $L['maxC'] = max($L['maxC'], $c + $dc * ($len - 1));
        if ($personal) {
            $L['personal']++;
        }
    }

    // ------------------------------------------------------------ Lösungswort

    /**
     * Ordnet jedem Buchstaben des Lösungsworts ein eigenes Feld zu
     * (Backtracking, gewürfelte Reihenfolge ⇒ verstreute Markierungen).
     *
     * @param array<string,string> $cells
     * @return list<string>|null Positionen "r,c" in Wortreihenfolge
     */
    private static function assignSolution(Rng $rng, array $cells, string $word): ?array
    {
        $byLetter = [];
        foreach ($cells as $pos => $letter) {
            $byLetter[$letter][] = $pos;
        }
        $options = [];
        for ($i = 0, $n = strlen($word); $i < $n; $i++) {
            $list = $byLetter[$word[$i]] ?? [];
            if ($list === []) {
                return null;
            }
            $options[] = $rng->sample($list, count($list));
        }

        $used = [];
        $out = [];
        $solve = static function (int $k) use (&$solve, &$used, &$out, $options): bool {
            if ($k === count($options)) {
                return true;
            }
            foreach ($options[$k] as $pos) {
                if (isset($used[$pos])) {
                    continue;
                }
                $used[$pos] = true;
                $out[$k] = $pos;
                if ($solve($k + 1)) {
                    return true;
                }
                unset($used[$pos]);
            }

            return false;
        };

        return $solve(0) ? array_values($out) : null;
    }

    // ----------------------------------------------------------------- Export

    /** Auf 0-basierte Koordinaten schieben, nummerieren, ausgeben. */
    private static function export(array $L): array
    {
        $rows = $L['maxR'] - $L['minR'] + 1;
        $cols = $L['maxC'] - $L['minC'] + 1;
        $grid = array_fill(0, $rows, str_repeat('#', $cols));
        foreach ($L['cells'] as $pos => $letter) {
            [$r, $c] = array_map('intval', explode(',', $pos));
            $grid[$r - $L['minR']][$c - $L['minC']] = $letter;
        }

        // Nummern in Lesereihenfolge an jedem Wortanfang
        $starts = [];
        foreach ($L['words'] as $w) {
            $starts[($w['r'] - $L['minR']) * 100 + ($w['c'] - $L['minC'])] = true;
        }
        ksort($starts);
        $nr = [];
        $i = 1;
        foreach (array_keys($starts) as $k) {
            $nr[$k] = $i++;
        }

        $words = [];
        foreach ($L['words'] as $w) {
            $r = $w['r'] - $L['minR'];
            $c = $w['c'] - $L['minC'];
            $words[] = [
                'nr'      => $nr[$r * 100 + $c],
                'dir'     => $w['dir'],
                'r'       => $r,
                'c'       => $c,
                'len'     => $w['len'],
                'frage'   => $w['frage'],
                'antwort' => $w['antwort'],
            ];
        }
        usort($words, static fn ($x, $y) => [$x['dir'] === 'a' ? 0 : 1, $x['nr']] <=> [$y['dir'] === 'a' ? 0 : 1, $y['nr']]);

        $felder = [];
        foreach ($L['solutionCells'] as $pos) {
            [$r, $c] = array_map('intval', explode(',', $pos));
            $felder[] = [$r - $L['minR'], $c - $L['minC']];
        }

        return [
            'rows'    => $rows,
            'cols'    => $cols,
            'grid'    => $grid,
            'words'   => $words,
            'loesung' => ['wort' => $L['solution'], 'felder' => $felder],
        ];
    }
}
