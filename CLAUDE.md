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
- **Admin-PIN:** beim Onboarding festgelegt (4–8 Ziffern, `Couple::PIN_PATTERN`),
  als `pinHash` (`password_hash`) in couple.json. Jede Stammdaten-Änderung
  verlangt `pin` im Body (falsch → 403 wrong_pin), optional `newPin` zum
  Wechseln. Fehlt `pinHash` (Alt-Stand), verhält sich setup wie Onboarding
  und legt die PIN an (`meta.pinSet` steuert das Frontend-Formular).
  **Invariante: Die PIN ist NICHT Teil des coupleKey** — PIN-Wechsel darf
  die Zeitlinie nicht verschieben. Leichte Barriere, bewusst ohne
  Rate-Limiting/Sessions (Heimnetz).
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
- Wissensgraph: `graphify query "<frage>"` für Codebase-Fragen
  (`graphify-out/` ist gitignored, nur lokal); nach Code-Änderungen
  `graphify update .` (AST-only, kostenlos).
- Selbsttest-Muster (Determinismus, Platzhalter-Reste über alle 144 Kombis,
  Kompatibilitäts-Statistik) siehe Git-History bzw. Session-Scratchpad —
  bei Content-/Generator-Änderungen neu durchlaufen lassen.

## Deployment

- Deploy-Skripte: `bash tools/deploy-acc.sh` (ACC) bzw.
  `bash tools/deploy-prod.sh` (PROD). Die Skripte liegen NUR lokal
  (gitignored, `tools/deploy-*.sh`) — sie enthalten private Pfade/URLs
  der Ziel-Synology und gehören nicht ins Repo. In einem frischen Clone
  fehlen sie daher; die konkreten Ziele kennt der Betreiber.

- Eigenständiges Git-Repo (`~/Code/sternenflunk`, GitHub:
  `Bingerminger/sternenflunk`, öffentlich) — KEIN Teil des Mono-Repos,
  normal committen und pushen. Öffentliches Repo: keine privaten
  Infrastruktur-Details (IPs, Mounts, Hostnamen) einchecken.
- Re-Deploys schonen `data/` am Ziel (Stammdaten + eingefrorene Tage
  überleben). Erstdeploy nimmt das `data/`-Gerüst ohne JSONs mit
  (frisches Onboarding am Ziel).
- PROD-Deploy legt vorher ein Backup `…-backup-<TS>` neben dem Zielordner
  an (rsync -rl, SMB-kompatibel) — **PROD nur auf ausdrücklichen Wunsch.**
- **Dieses Verzeichnis ist der einzige Entwicklungsort.** Workflow:
  hier entwickeln → `/git-commit-acc` (Commit + Push + ACC) → nach Freigabe
  `/git-commit-prod` (Commit + Push + PROD-Deploy mit Backup). Die beiden
  Skills liegen lokal in `.claude/skills/` (gitignored, enthalten die
  privaten Synology-Ziele).
- Historie: Sternenflunk hat am 14.07.2026 das alte „Sternenfunk"
  (Hendrik/Nora-Spezialversion) abgelöst — Synology-Ordner
  `horoskop`/`horoskop-acc` damals entfernt. Am 15.07.2026 wurde auch der
  alte Projektordner `~/Code/horoskopgenerator` gelöscht; der Quellcode
  bleibt in der Historie des lokalen Mono-Repos `~/Code` abrufbar
  (`git -C ~/Code log -- horoskopgenerator/`).

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
