<?php

declare(strict_types=1);

/**
 * Der Tierkreis-Katalog: alle 12 Zeichen mit Glyphe, Element und Chronotyp.
 *
 * Der Chronotyp (Energie-Peak) hängt am Element — astrologisch kühn,
 * komödiantisch konsistent. Feuer springt früh an, Wasser lebt am Abend auf.
 */
final class Zodiac
{
    /** @var array<string, array{name:string, plural:string, glyph:string, emoji:string, element:string}> */
    public const SIGNS = [
        'widder'     => ['name' => 'Widder',     'plural' => 'Widder',       'glyph' => '♈', 'emoji' => '🐏', 'element' => 'feuer'],
        'stier'      => ['name' => 'Stier',      'plural' => 'Stiere',       'glyph' => '♉', 'emoji' => '🐂', 'element' => 'erde'],
        'zwillinge'  => ['name' => 'Zwillinge',  'plural' => 'Zwillinge',    'glyph' => '♊', 'emoji' => '👯', 'element' => 'luft'],
        'krebs'      => ['name' => 'Krebs',      'plural' => 'Krebse',       'glyph' => '♋', 'emoji' => '🦀', 'element' => 'wasser'],
        'loewe'      => ['name' => 'Löwe',       'plural' => 'Löwen',        'glyph' => '♌', 'emoji' => '🦁', 'element' => 'feuer'],
        'jungfrau'   => ['name' => 'Jungfrau',   'plural' => 'Jungfrauen',   'glyph' => '♍', 'emoji' => '🌾', 'element' => 'erde'],
        'waage'      => ['name' => 'Waage',      'plural' => 'Waagen',       'glyph' => '♎', 'emoji' => '⚖️', 'element' => 'luft'],
        'skorpion'   => ['name' => 'Skorpion',   'plural' => 'Skorpione',    'glyph' => '♏', 'emoji' => '🦂', 'element' => 'wasser'],
        'schuetze'   => ['name' => 'Schütze',    'plural' => 'Schützen',     'glyph' => '♐', 'emoji' => '🏹', 'element' => 'feuer'],
        'steinbock'  => ['name' => 'Steinbock',  'plural' => 'Steinböcke',   'glyph' => '♑', 'emoji' => '🐐', 'element' => 'erde'],
        'wassermann' => ['name' => 'Wassermann', 'plural' => 'Wassermänner', 'glyph' => '♒', 'emoji' => '🌊', 'element' => 'luft'],
        'fische'     => ['name' => 'Fische',     'plural' => 'Fische',       'glyph' => '♓', 'emoji' => '🐟', 'element' => 'wasser'],
    ];

    /**
     * Elemente inkl. Chronotyp: peak/secondary sind Stunden-Fenster für die
     * Tagesenergie-Kurve (der Rng würfelt innerhalb des Fensters).
     *
     * @var array<string, array{name:string, emoji:string, chronoLabel:string,
     *                          peak:array{0:float,1:float}, secondary:array{0:float,1:float}}>
     */
    public const ELEMENTS = [
        'feuer'  => ['name' => 'Feuer',  'emoji' => '🔥', 'chronoLabel' => 'Frühzünder',
                     'peak' => [6.5, 9.5],   'secondary' => [16.0, 18.5]],
        'erde'   => ['name' => 'Erde',   'emoji' => '⛰️', 'chronoLabel' => 'Vormittagsfels',
                     'peak' => [9.0, 12.0],  'secondary' => [15.5, 18.0]],
        'luft'   => ['name' => 'Luft',   'emoji' => '🌬️', 'chronoLabel' => 'Nachmittagsbrise',
                     'peak' => [13.5, 16.5], 'secondary' => [19.0, 21.0]],
        'wasser' => ['name' => 'Wasser', 'emoji' => '💧', 'chronoLabel' => 'Abendtiefe',
                     'peak' => [19.5, 22.5], 'secondary' => [10.5, 13.0]],
    ];

    public static function exists(string $key): bool
    {
        return isset(self::SIGNS[$key]);
    }

    /** Zeichen + Element-Metadaten in einem Rutsch. */
    public static function get(string $key): array
    {
        $sign = self::SIGNS[$key];

        return $sign + ['key' => $key, 'elementMeta' => self::ELEMENTS[$sign['element']]];
    }

    /** Katalog fürs Frontend (Onboarding-Picker). */
    public static function catalog(): array
    {
        $out = [];
        foreach (self::SIGNS as $key => $sign) {
            $out[] = [
                'key'     => $key,
                'name'    => $sign['name'],
                'glyph'   => $sign['glyph'],
                'emoji'   => $sign['emoji'],
                'element' => self::ELEMENTS[$sign['element']]['name'],
            ];
        }

        return $out;
    }

    /** Sortierter Element-Kombi-Schlüssel, z. B. "feuer+wasser". */
    public static function comboKey(string $signA, string $signB): string
    {
        $pair = [self::SIGNS[$signA]['element'], self::SIGNS[$signB]['element']];
        sort($pair);

        return implode('+', $pair);
    }
}
