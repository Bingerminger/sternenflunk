# Changelog

## 1.3.0 — 2026-07-17

Der Sternenflunk bekommt ein Amtsblatt: den Tagesbericht als PDF.

- **PDF-Tagesbericht (⤓ neben dem Zahnrad):** Ein Klick lädt den gerade
  angezeigten Tag — auch rückwärts navigierte Archiv-Tage — als
  mehrseitiges PDF im Look der App: Cover mit kosmischer
  Großwetterlage, Teil 1 Gemeinsam, Teil 2 & 3 für beide Personen.
  Alle Inhalte des Tages inklusive Orbit-Duett, Radar-, Energie- und
  Duell-Charts, Nachthimmel samt Saison-Nebeln und Sternenfeld.
- **Komplett hausgemacht, ohne Bibliotheken:** `assets/js/pdf.js` ist
  ein handgerollter Mini-PDF-Writer (Core-Fonts, Vektorpfade,
  Transparenz, Bilder mit Alphamaske); `assets/js/report.js` baut den
  Bericht, rastert Emojis per Canvas und bettet die Original-SVG-Charts
  1:1 ein. Läuft komplett im Browser, kein Server-Roundtrip.
- Der bisherige Teilen-Button (im Heimnetz ohne HTTPS funktionslos)
  weicht dem Bericht-Button.
- Bonus: `Beziehungswetter` und der Mond-Kommentar aus dem Tages-JSON
  sind erstmals sichtbar — auf dem Cover des Berichts.

## 1.2.0 — 2026-07-15

Die Redaktion hat aufgerüstet: mehr als doppelt so viel Flunk, Feiertage
im Programm und Konfetti im Quellcode.

- **Textpools massiv erweitert (~450 → ~1030 Einträge, Ø ×2,3):** Mottos,
  kosmisches Wetter, Klugscheißer-Fakten, alle vier Tageskategorien,
  Zeichen-Durchsagen (5 → 11 je Zeichen), Frivol-Sektion, Warnungen,
  Glücksfarben/-bringer, Kompatibilitäts-, Flaggen-, Schiedsspruch- und
  Prophezeiungs-Texte, Date-Direktiven, Gesprächsstoff, Paar-Missionen,
  Elementar-Funk (3 → 7 je Kombination) u. v. m. — Tonlage unverändert:
  liebevoll frotzelnd, Fake-Präzision, nie verletzend.
- **Specials & Eastereggs:** Neue `special`-Sektion im Tages-JSON
  (eigener Rng-Seed, deterministisch): Flunk-Meilensteine (Tag 100, 200,
  365 …), Flunk-Geburtstag (Jahrestag der Erstinstallation), Feiertage
  (Neujahr, Valentinstag, Ostern via Gauß-Formel, Weltkusstag,
  Halloween, Nikolaus, Advent-Klassiker, Silvester …), Nerd-Tage
  (Pi-Tag, Star-Wars-Tag, Handtuch-Tag, Tag der Raumfahrt),
  Sternschnuppen-Nächte (Perseiden/Geminiden) und Freitag der 13.
  Anzeige als goldenes Banner unterm Kopfbereich.
- **Mehr Abwechslung im Maschinenraum:** Tageszahl-Deutungen jetzt mit
  3 Varianten pro Ziffer; das Duell lost täglich 5 aus 10 Kategorien
  (neu: Geduld, Orientierungssinn, Elefantengedächtnis,
  Verhandlungskunst, Improvisationstalent).
- **Saison- & Feiertags-Deko (CSS):** Die Nachthimmel-Nebel wechseln
  dezent mit der Jahreszeit des angezeigten Tages; zu Anlässen gibt es
  Deko-Partikel (Schneefall, Herzen, Fledermäuse, Blüten …) und in
  Sternschnuppen-Nächten eine erhöhte Schnuppen-Rate im Starfield.
  Respektiert `prefers-reduced-motion`, funktioniert auch für
  eingefrorene Alt-Tage (Deko hängt nur am Datum).
- **Orakel aufgemöbelt:** Antwortpool 26 → 60, plus geheime
  Spezialantworten auf bestimmte Fragewörter (z. B. Pizza, Kaffee, 42).
- **UI-Easteregg:** Fünfmal aufs Logo tippen — mehr wird nicht verraten.
- Determinismus-Garantien unverändert: Kompatibilitätskurve, Seeds und
  eingefrorene Tage bleiben unangetastet; Pool-Erweiterungen wirken nur
  auf neu generierte Tage.

## 1.1.1 — 2026-07-14

Kosmetik fürs Schaufenster.

- **Screenshots repariert:** `paar.png` und `person.png` neu aufgenommen —
  der Sternenhimmel läuft jetzt durchgehend über die volle Seitenhöhe.
  (Die alten Full-Page-Aufnahmen hatten den `background-attachment: fixed`-
  Verlauf nur im ersten Viewport gerendert; Neuaufnahme mit Viewport in
  voller Inhaltshöhe, kein Code geändert.)

## 1.1.0 — 2026-07-14

Der Flunk bekommt eine Haustür.

- **Admin-PIN:** Beim Onboarding wird eine PIN (4–8 Ziffern) festgelegt;
  jede Stammdaten-Änderung über das Zahnrad verlangt sie (falsch → 403).
  Optionaler PIN-Wechsel im Admin-Formular. Gehasht gespeichert
  (`password_hash`), bewusst nicht Teil des coupleKey — ein PIN-Wechsel
  lässt die Horoskop-Zeitlinie unangetastet. Alt-Stände ohne PIN werden
  beim nächsten Speichern automatisch migriert.
- Screenshots in `docs/screenshots/` + Galerie im README.
- Doku: INSTALL.md mit ehrlichem Sicherheitsmodell („Haustür-Niveau,
  kein Tresor"), PIN-vergessen-Anleitung, Troubleshooting-Eintrag.

## 1.0.0 — 2026-07-14

Erstausgabe. Der Sternenflunk flunkert los.

- **Für jedes Paar:** Onboarding mit zwei Namen + zwei Sternzeichen
  (alle 144 Kombinationen, jede Konstellation — auch zweimal dasselbe Zeichen).
  Admin-Zahnrad zum Ändern der Stammdaten inklusive.
- Tageshoroskope pro Person und fürs Paar — deterministisch aus Datum und
  Paar-Fingerabdruck (coupleKey) generiert, als JSON eingefroren.
- Zeichen-Katalog mit Element-Chronotypen (Feuer = Frühzünder, Erde =
  Vormittagsfels, Luft = Nachmittagsbrise, Wasser = Abendtiefe),
  Zeichen-Durchsagen und zeichen-eigenen Glücksbringern.
- Elementar-Funk: Element-Chemie der beiden Zeichen (10 Kombinationen,
  Spiegel-Texte bei Zeichengleichheit).
- Orbit-Duett, Radar-Chart, Energie-Kurven mit gemeinsamem Fenster,
  Battle-Duell, Kuschel-/Streit-Meter, Bettgeflüster-Barometer.
- Echte Astronomie: Mondphase, Sonnenzeiten (Standort konfigurierbar),
  Tierkreis-Saison mit Heimspiel-Logik, Merkur-Retrograde-Banner.
- Liebesorakel (3 Fragen/Tag), Kalender-Archiv (Zukunft gesperrt),
  Teilen-Button, Mitternachts-Countdown, Jackpot-Konfetti.
- Deploy-Skripte für Synology ACC/PROD inkl. Smoke-Check und Prod-Backup.
