<?php

declare(strict_types=1);

/**
 * Deterministischer Zufall (xorshift32), geseedet aus einem String.
 *
 * Gleicher Seed → gleiche Sequenz, für immer. Dadurch ist jedes Horoskop
 * pro Datum reproduzierbar, ohne dass etwas gespeichert werden MUSS.
 * Pro Sektion wird ein eigener Rng benutzt, damit neue Pools an einer
 * Stelle nicht die Ergebnisse aller anderen Sektionen verschieben.
 */
final class Rng
{
    private int $state;

    public function __construct(string $seed)
    {
        $h = crc32($seed);
        $this->state = ($h === 0) ? 0x9E3779B9 : $h;
    }

    /** Gleichverteilte Float-Zahl in [0, 1). */
    public function next(): float
    {
        $x = $this->state;
        $x ^= ($x << 13) & 0xFFFFFFFF;
        $x ^= ($x >> 17);
        $x ^= ($x << 5) & 0xFFFFFFFF;
        $this->state = $x & 0xFFFFFFFF;

        return $this->state / 4294967296.0;
    }

    /** Ganzzahl in [$min, $max] (inklusive). */
    public function int(int $min, int $max): int
    {
        return $min + (int) floor($this->next() * ($max - $min + 1));
    }

    /** Float in [$min, $max). */
    public function float(float $min, float $max): float
    {
        return $min + $this->next() * ($max - $min);
    }

    /** Ein Element aus einer nicht-leeren Liste. */
    public function pick(array $list): mixed
    {
        return $list[$this->int(0, count($list) - 1)];
    }

    /**
     * N verschiedene Elemente aus einer Liste (deterministisches Teil-Shuffle).
     *
     * @return array<int, mixed>
     */
    public function sample(array $list, int $n): array
    {
        $pool = array_values($list);
        $take = min($n, count($pool));
        $out  = [];
        for ($i = 0; $i < $take; $i++) {
            $idx   = $this->int(0, count($pool) - 1);
            $out[] = $pool[$idx];
            array_splice($pool, $idx, 1);
        }

        return $out;
    }

    /** Gewichteter Pick: ['wert' => Gewicht, ...] */
    public function weighted(array $weights): string|int
    {
        $total = array_sum($weights);
        $roll  = $this->next() * $total;
        foreach ($weights as $value => $weight) {
            $roll -= $weight;
            if ($roll <= 0) {
                return $value;
            }
        }

        return array_key_last($weights);
    }
}
