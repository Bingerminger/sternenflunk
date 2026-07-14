# CLAUDE.md

Hinweise für Claude Code (oder andere AI-Agents) zur Arbeit mit diesem Repository.

## Project Overview

**Sternenflunk** ist die generalisierte Schwester von „Sternenfunk": ein
tägliches Paar-Horoskop für **ein beliebiges Paar**. Beim Onboarding werden
zwei Namen + zwei Sternzeichen erfasst (jede Konstellation: m/w, w/w, m/m,
gleiches Zeichen doppelt — alles gleichwertig). Humorvoll, liebevoll
frotzelnd, leicht frivol, Fake-Präzision als Humor-Werkzeug.

**Tonlage-Regeln für Content (`lib/Content.php`):**
- Liebevoll frotzeln, nie verletzen. Frivol = zwinkernd, nie explizit.
- **Generisch bleiben:** Texte müssen für jede Namens-/Zeichen-/Geschlechts-
  Kombination funktionieren. Deshalb: KEINE Pronomen für {PARTNER}/{WER},
  keine Geschlechter-Rollen, keine Berufs-/Alters-Klischees.
- Keine Witze über Körper, Alter, Kinder(-losigkeit) oder Defizite.
  Zeichen-Klischees (Sturheit, Drama, Listen) sind ok — immer als Stärke
  mit Augenzwinkern erzählt.
- Platzhalter in `{GROSSBUCHSTABEN}` füllt der Generator
  ({NAME}, {PARTNER}, {SIGN}, {SIGN_PLURAL}, {A}, {B}, {WER}, {ANDERE},
  {ZEIT}, {SUNSET}, {MIN}, {BIS}, {ORT}, {LABEL}).

## Architecture

- **Kein Build-Step, keine DB, kein Composer.** PHP ≥ 8.1 + Vanilla JS + JSON.
- Stammdaten: `data/couple.json` (via `POST api.php?action=setup`,
  Onboarding & Admin nutzen denselben Endpoint). `since` = Erstinstallation
  = Kalender-Untergrenze (Epoche); bleibt bei Stammdaten-Änderungen erhalten.
- `api.php?action=day&date=…` → generiert/liefert den Tag.
  Kein Setup = 409, Zukunft = 403, vor `since` = 404.
- **Determinismus-Invariante:** `HoroscopeGenerator::day($date, $couple)` ist
  eine reine Funktion aus Datum + coupleKey (Rng = xorshift32 mit crc32-Seed
  `"$date|sektion|$coupleKey"`). Einmal ausgelieferte Tage werden zusätzlich
  in `data/days/YYYY-MM-DD.json` eingefroren (inkl. `coupleKey`) und nur
  ausgeliefert, wenn der Key noch stimmt — sonst Neugenerierung.
  `Couple::save()` löscht bei Key-Wechsel alle eingefrorenen Tage.
- **Kompatibilitätskurve ist gestimmt** (Basis 73, Wellen 15/3.9 + 6/11.3,
  Rauschen ±8, Clamp 42–99.5): Ø ≈ 73 %, ~4–10 Jackpot- (≥ 96) und ~2–6
  Chaos-Tage (≤ 48) pro Jahr. Die Phasen sind pro Paar aus dem coupleKey
  abgeleitet (Jackpot-Tage individuell). Mechanik/Schwellen nicht anfassen.
- **Zeichen-System (`lib/Zodiac.php`):** 12 Zeichen mit Element; Chronotyp
  (Energie-Peak-Fenster) hängt am Element — Feuer früh, Erde vormittags,
  Luft nachmittags, Wasser abends. `Content::ELEMENT_COMBO` deckt mit 10
  sortierten Element-Paaren alle 144 Zeichen-Kombinationen ab
  (+ `SAME_SIGN`-Texte bei Zeichengleichheit).
- Neue Pool-Einträge in `Content.php` sind jederzeit ok (Sektionen haben
  eigene Rngs; bereits eingefrorene Tage bleiben unberührt).
- Charts sind handgerollte SVGs (`assets/js/charts.js`). Personen-Akzente
  fix: Person A `#2596ac`, Person B `#c74468`, Gold `#b37e27`
  (Chart-validiert fürs Dark-Band).
- Cache-Busting: Asset-Links in `index.html` tragen `?v=<VERSION>` — bei
  Asset-Änderungen Version in `config.php`, `VERSION` und `index.html` anheben.
- ♈–♓ rendern browserabhängig als Emoji-Kachel oder Textglyphe — die App
  erzwingt Text via U+FE0E (`glyphText()` in app.js).

## Development Commands

```bash
php -S localhost:8018    # im Projektroot; http://localhost:8018
```

- Onboarding zurücksetzen: `rm data/couple.json` (Archiv zusätzlich:
  `rm data/days/*.json`).
- Selbsttest-Muster (Determinismus, Platzhalter-Reste über alle 144 Kombis,
  Kompatibilitäts-Statistik) siehe Git-History bzw. Session-Scratchpad —
  bei Content-/Generator-Änderungen neu durchlaufen lassen.

## Deployment

| Ziel | Skript | Pfad | URL |
|---|---|---|---|
| ACC | `bash tools/deploy-acc.sh` | `***REMOVED***/sternenflunk-acc` | http://***REMOVED***/sternenflunk-acc |
| PROD | `bash tools/deploy-prod.sh` | `***REMOVED***/sternenflunk` | http://***REMOVED***/sternenflunk |

- Eigenständiges Git-Repo (`~/Code/sternenflunk`, GitHub:
  `Bingerminger/sternenflunk`, privat) — KEIN Teil des Mono-Repos,
  normal committen und pushen.
- Re-Deploys schonen `data/` am Ziel (Stammdaten + eingefrorene Tage
  überleben). Erstdeploy nimmt das `data/`-Gerüst ohne JSONs mit
  (frisches Onboarding am Ziel).
- PROD-Deploy legt vorher `***REMOVED***/sternenflunk-backup-<TS>` an
  (rsync -rl, SMB-kompatibel) — **PROD nur auf ausdrücklichen Wunsch.**

## Important Notes

- Datums-Validierung serverseitig (Regex + `checkdate`), Zukunfts-Sperre ist
  Server-Sache — der Client-Kalender ist nur Komfort.
- `data/days/`-Schreiben ist best effort (`@`): ohne Schreibrechte läuft die
  App dank Determinismus trotzdem korrekt. `data/couple.json` dagegen MUSS
  schreibbar sein (sonst 500 mit Klartext-Hinweis beim Setup).
- Kein Auth: Heimnetz-App. Jeder mit Netzzugriff kann via Zahnrad die
  Stammdaten ändern — bewusste Entscheidung, in INSTALL.md dokumentiert.
- Zeitzone: Europe/Berlin, Sonnenzeiten-Standort Leipzig — beides in
  `config.php` konfigurierbar.
- Merkur-Retro-Fenster sind bis 2027 in `lib/Astro.php` hinterlegt — bei
  Gelegenheit um Folgejahre ergänzen.
