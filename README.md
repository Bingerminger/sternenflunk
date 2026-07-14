<p align="center">
  <img src="brand/banner.svg" alt="Sternenflunk — Wir flunkern. Die Sterne nicken dazu." width="100%">
</p>

# ✶ Sternenflunk

**Das tägliche Paar-Horoskop für euch zwei. Ja, genau euch.**
Täglich frisch geflunkert. Emotional treffsicher.

Sternenflunk ist eine selbstgehostete Mini-Web-App für genau ein Paar: Beim
ersten Start tragt ihr zwei Namen und zwei Sternzeichen ein — ab dann sendet
der Flunk jeden Tag ein Horoskop pro Person plus ein gemeinsames
Paar-Protokoll. Mit Orbit-Duett, Energie-Kurven, Liebesorakel, echten
Astronomie-Daten und einem Archiv aller vergangenen Tage. Die Zukunft bleibt
versiegelt. 🔮

> *„Endlich sagt mir jemand täglich, wann ich recht habe."*
> — Person Eins ★★★★★
>
> *„Ich wurde als ‚Vormittagsfels' klassifiziert und fühle mich gesehen."*
> — Person Zwei ★★★★★
>
> *„Wissenschaftlich haltlos."*
> — Ein Satellit, der es wissen muss ★★★★★

## Warum Sternenflunk?

Weil klassische Horoskope für Millionen geschrieben werden — und eures nur
für euch. Sternenflunk kennt eure Namen, eure Zeichen, eure Element-Chemie
und behauptet dann Dinge mit zwei Nachkommastellen. Das ist keine Astrologie.
Das ist **Flunkologie**: die Kunst, so präzise zu schwindeln, dass es sich
wie Schicksal anfühlt.

## Features

- **Onboarding in 30 Sekunden:** zwei Namen, zwei Sternzeichen, fertig.
  Alle 144 Kombinationen, jede Konstellation — Frau & Frau, Mann & Mann,
  zweimal Steinbock: Der Himmel ist da komplett entspannt.
- **Admin-Zahnrad ⚙:** Stammdaten jederzeit änderbar. Achtung: Neue
  Stammdaten = neue Zeitlinie, alles wird rückwirkend neu geflunkert.
- **Drei Ansichten:** Person Eins · Gemeinsam (Paar-Protokoll) · Person Zwei
- **Täglich neu, für immer reproduzierbar:** deterministischer Generator,
  geseedet aus Datum + Paar-Fingerabdruck. Ausgelieferte Tage werden als
  JSON eingefroren und ändern sich nie wieder.
- **Zeichen mit Charakter:** Element-Chronotypen (Feuer zündet früh, Wasser
  lebt abends auf), amtliche Zeichen-Durchsagen, zeichen-eigene Glücksbringer
  („der Blick — zählt heute als Gegenstand", Skorpion).
- **Elementar-Funk:** die tägliche Element-Chemie eurer Zeichen —
  von „Dampf!" (Feuer + Wasser) bis „Synchronschwimmen ohne Publikum"
  (Wasser + Wasser).
- **Orbit-Duett** (Signatur-Element): zwei Himmelskörper mit euren
  Zeichen-Glyphen kreisen umeinander — Abstand und Tempo entsprechen der
  Tages-Kompatibilität. An Jackpot-Tagen (≥ 96 %): Konfetti.
- **Charts, handgerollt in SVG:** Radar, Energie-Kurven mit gemeinsamem
  Energiefenster (Hover-Tooltip!), Battle-Duell, Meter. Keine Bibliotheken.
- **Echte Astronomie, ehrlich gemischt:** Mondphase, Sonnenauf-/-untergang
  (Standort konfigurierbar), Tierkreis-Saison mit Heimspiel-Logik,
  Merkur-Retrograde-Banner. Die Deutung ist geflunkert, die Daten nicht.
- **Liebesorakel:** 3 Ja/Nein-Fragen pro Tag. Antworten von „Definitiv."
  bis „Die Antwort liegt im Kühlschrank. Ernsthaft, schau nach."
- **Keine Datenbank, kein Build, kein Framework:** PHP + Vanilla JS +
  zwei JSON-Dateien. Läuft auf jedem Hoster mit PHP — auch auf dem NAS im Flur.

## Schnellstart

```bash
git clone https://github.com/Bingerminger/sternenflunk.git
cd sternenflunk
php -S localhost:8018
# → http://localhost:8018 öffnen, Onboarding ausfüllen, flunken lassen
```

Ausführliche Anleitung (Webserver, Synology, Rechte, Troubleshooting):
**[INSTALL.md](INSTALL.md)**

## API

| Aufruf | Antwort |
|---|---|
| `api.php?action=meta` | Grenzen, Stammdaten, Zeichen-Katalog (`configured: false` vor dem Onboarding) |
| `api.php?action=day` | Horoskop von heute (Server-Zeit) |
| `api.php?action=day&date=2026-07-15` | Horoskop dieses Tages — nur Vergangenheit/heute |
| `api.php?action=setup` (POST) | Stammdaten speichern: `{"a":{"name":"Kim","sign":"loewe"},"b":{"name":"Alex","sign":"fische"}}` |

Regeln: kein Setup → `409 setup_required`, Zukunft → `403 future_locked`,
vor der Einrichtung → `404 before_epoch`, kaputtes Datum → `422 bad_date`.
Ohne Schreibrechte auf `data/` läuft die Auslieferung trotzdem — der
Generator ist deterministisch, Persistenz ist nur Einfrieren.

## Stack & Struktur

```
index.html                  Shell (Topbar, Tabs, Onboarding, Admin, Kalender)
api.php                     GET day/meta · POST setup
config.php                  Zeitzone, Standort, Version
lib/Rng.php                 Deterministischer Zufall (xorshift32, crc32-Seed)
lib/Zodiac.php              12 Zeichen + Elemente + Chronotypen
lib/Couple.php              Stammdaten: laden, validieren, speichern, coupleKey
lib/Astro.php               Mond, Sonne, Saison, Merkur, Numerologie
lib/Content.php             Alle Textpools (die Flunk-Redaktion)
lib/HoroscopeGenerator.php  Baut den Tag aus Pools + Astronomie + Paar
assets/                     CSS (Cosmic Dark) + JS (Charts, Widgets, App)
data/couple.json            Stammdaten des Paares (entsteht beim Onboarding)
data/days/                  Eingefrorene Tage (YYYY-MM-DD.json)
tools/deploy-acc.sh         Deploy → Synology ACC (+ Smoke-Check)
tools/deploy-prod.sh        Deploy → Synology PROD (mit Backup)
```

## Die Flunk-Physik (Determinismus)

Jedes Horoskop ist eine reine Funktion aus **Datum + coupleKey** (Hash aus
Namen + Zeichen). Gleicher Tag, gleiches Paar ⇒ exakt dasselbe Horoskop, für
immer — ganz ohne Datenbank. Einmal ausgelieferte Tage werden zusätzlich in
`data/days/` eingefroren. Ändert ihr die Stammdaten, ändert sich der
coupleKey: alte Einfrierungen werden verworfen und die gesamte Zeitlinie neu
geflunkert. Die Kompatibilitätskurve ist gestimmt auf Ø ≈ 73 % mit ~9
Jackpot- und ~3 Chaos-Tagen pro Jahr — welche Tage das sind, ist pro Paar
verschieden. Euer Jackpot gehört nur euch.

## FAQ

**Ist das echte Astrologie?**
Nein. Es ist bessere.

**Berücksichtigt ihr Aszendenten?**
Der Aszendent wurde in einer frühen Version berücksichtigt und hat sich
unmöglich benommen. Er sitzt jetzt draußen.

**Kann ich dem Horoskop vertrauen?**
Zu 87,3 %. Der Wert wurde nach demselben Verfahren ermittelt wie alle anderen.

**Was passiert mit unseren Daten?**
Sie liegen als eine (1) JSON-Datei auf eurem eigenen Server und langweilen
sich. Kein Tracking, keine Cloud, keine Cookies außer dem Tab-Gedächtnis.

## Lizenz & Ernsthaftigkeit

Privates Spaßprojekt. Keine Sterne wurden für diese App befragt.
Alle Prognosen sind frei erflunkert — Ähnlichkeiten mit eurem tatsächlichen
Dienstag sind rein kosmetisch, aber statistisch erstaunlich häufig.
