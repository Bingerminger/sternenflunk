# Changelog

## 2.2.1 — 2026-10-31

Wer mag, kann der Flunk-Redaktion jetzt einen Kaffee spendieren.

- **Unterstützen — wie im Energietracker:** In der Fußzeile steht neben
  „Quellcode (AGPL-3.0)" ein freiwilliger Link „☕ Kaffee für die
  Flunk-Redaktion" (Buy Me a Coffee, öffnet einen neuen Tab ohne
  Herkunftsangabe). Dazu ein Abzeichen und der Abschnitt „Unterstützen" in
  der README sowie der Sponsor-Knopf auf der GitHub-Seite
  (`.github/FUNDING.yml`). Das Flunkoskop flunkert für alle gleich gut —
  nichts in der App hängt daran.

## 2.2.0 — 2026-10-31

Zum Ausprobieren, ohne etwas zu installieren: die Live-Demo.

- **Öffentliche Demo auf GitHub Pages** —
  <https://bingerminger.github.io/sternenflunk/> mit dem Beispielpaar Kim
  (Löwe) & Alex (Fische): alle vier Ansichten, Vorspann, Spielwiese mit
  Sonntagsrätsel, PDF-Bericht und ein Archiv der letzten 60 Tage. Speichern
  ist in der Demo gesperrt, ein Banner verlinkt die eigene Installation.
- **Wie im Energietracker gebaut:** `tools/build-demo.sh` startet den echten
  PHP-Server mit frischem Datenverzeichnis, ruft `meta` und jeden Tag über
  die normale API ab und legt die Antworten unter `demo-api/` ab. Im Browser
  liest `app.js` im Demo-Modus (`data-demo` an `<html>`) aus diesem Abzug —
  eine normale Installation führt diesen Zweig nie aus.
- **Workflow `.github/workflows/pages.yml`:** baut die Demo aus dem neuesten
  Release-Tag, bei jedem Release, täglich (frisches Flunkoskop) und von Hand.

## 2.1.0 — 2026-10-31

Sonntags wird gerätselt.

- **Sonntagsrätsel:** Jeden Sonntag erscheint auf der Spielwiese ein
  kleines Kreuzworträtsel mit Lösungswort (8–10 Begriffe, höchstens 11×11
  Felder), lösbar bis Samstag. Bis zu zwei Begriffe drehen sich um euch
  (Sternzeichen, Vornamen). Ist das Lösungswort geknackt, gibt es Konfetti
  und eine Belohnung.
- **Bedienung fürs Handy:** Feld antippen, nochmal tippen wechselt die
  Richtung. Eine eigene QWERTZ-Bildschirmtastatur verdeckt das Gitter nicht;
  am Rechner geht die echte Tastatur samt Pfeiltasten, Leertaste und Enter.
  Dazu „Prüfen“ (falsche Buchstaben wackeln rot), „Buchstabe aufdecken“ und
  die Fragenliste zum Antippen. Der Fortschritt bleibt pro Woche auf dem
  Gerät gespeichert.
- **Hinweise:** Sonntags blinkt die Spielwiese, solange das Rätsel ungelöst
  ist, und der Teaser in „Gemeinsam“ kündigt es an.
- **Technik:** Neuer Generator `lib/Crossword.php`, deterministisch aus
  Sonntag + coupleKey (alle Tage einer Woche zeigen dasselbe Rätsel); neue
  Sektion `raetsel`, wird in eingefrorenen Tagen nachgerüstet. Begriffe,
  Lösungswörter und Belohnungen in `Content.php`.

## 2.0.0 — 2026-10-31

Aus dem Horoskop wird das **Flunkoskop** — mit Vorspann, Bewegung und
einer Spielwiese für zwei.

- **Lizenzwechsel auf AGPL-3.0:** Ab 2.0 steht der Code unter der GNU
  Affero General Public License v3.0 (vorher MIT). Wer eine veränderte
  Fassung weitergibt oder als Web-App betreibt, muss den Quellcode offenlegen;
  die App verlinkt dazu im Footer auf ihren Quellcode. Bis 1.3.0
  veröffentlichte Versionen bleiben MIT.
- **Flunkoskop:** Neuer Name für das, was der Sternenflunk schon immer
  war. Titel, Claim, Footer, Onboarding, Manifest und Texte sprechen jetzt
  vom Flunkoskop.
- **Sendestart-Vorspann:** Beim ersten Öffnen des Tages fliegen eure
  beiden Zeichen ins Bild, umkreisen sich, ein Sternen-Burst mit Schockwelle,
  dann Namen, Datum, Anlass und die Tages-Kompatibilität zum Hochzählen.
  Antippen überspringt, der Footer-Knopf spielt ihn erneut ab.
- **Motion Graphics überall:** Karten schweben gestaffelt ein, Zahlen
  zählen hoch, Balken füllen sich mit Lichtreflex, Energie-Kurven zeichnen
  sich selbst, das Radar wächst aus der Mitte. Dazu driftende Nebel,
  schwebende Marken-Glyphen, ein Lichtfleck, der der Maus über die Karten
  folgt, und eine echte Mondphasen-Silhouette im Ticker.
- **Orbit-Duett 2.0:** Kometenschweife, pulsierende Funkverbindung mit
  wanderndem Signal, Puls-Ring im Baryzentrum. Am Jackpot-Tag wird die
  Bahn zum Herz (mit aufsteigenden Herzchen und Gold-Schimmer), an
  Chaos-Tagen taumelt sie und die Prozentzahl hat Empfangsstörungen.
- **Beziehungs-Puls:** scrollendes EKG in den Klimadaten, Herzschlag aus
  Kuschel-Index und Streit-Risiko.
- **Sternbild des Tages:** Täglich ein neues Paar-Sternbild
  („Die Kuschelnde Kaffeetasse“) aus 20 Formen und 34 Adjektiven, das sich
  Stern für Stern selbst zeichnet — mit eurem Doppelstern und fingierten
  Messdaten. Auch im PDF-Bericht.
- **Neuer Tab „Spielwiese“:**
  - **Kosmisches Rubbellos:** je ein Gutschein füreinander unter
    Goldfolie, mit Finger oder Maus freirubbeln (57 Gutscheine).
  - **Fingerzeig-Duell „Wer von euch?“:** drei Fragen täglich, 3-2-1-
    Countdown, gleichzeitig zeigen, Einigkeit wird ausgewertet (78 Fragen).
  - **Entscheidungsrad:** „Wer kocht heute?“ und 15 weitere Fragen (oder
    eine eigene) — mit Zeiger-Ticken, Joker und Beide-Feld.
  - **Liebes-Funkspruch:** Umschlag mit Siegel öffnen, der Brief tippt sich
    selbst; per Teilen-Dialog oder Zwischenablage verschicken.
  - Das **Liebesorakel** zieht von „Gemeinsam“ auf die Spielwiese um.
- **Sofa-Modus:** Wer angeschlagen ist, tippt im eigenen Tab auf
  „Heute angeschlagen?“ — und bekommt die Sofa-Edition: Genesungs-
  Prognose, Sternen-Apotheke, Tee des Tages, Kuschelbedarf, Tee-Dosis und
  einen Pflegeauftrag für die andere Hälfte (auch oben in „Gemeinsam“).
  Die Deko wechselt auf Tee und Herzen. Gilt pro Tag und Gerät.
- **Mobil:** Ticker als wischbares Karussell, vier Tabs passen aufs
  Telefon, und das Orbit-Duett ist auf schmalen Bildschirmen wieder sichtbar
  (die Bühne war dort bisher 0 px breit).
- **Technik:** Neue Sektionen `sternbild`, `spiel`, `pflege` mit eigenen
  Rng-Seeds — die bestehende Zeitlinie bleibt bitgenau gleich
  (Regressionsanker 88,1 % hält). Bereits eingefrorene Tage bekommen die
  neuen Sektionen beim nächsten Abruf nachgerüstet, ohne dass sich
  Eingefrorenes ändert. Neue Dateien `assets/js/motion.js` und
  `assets/js/games.js`, weiterhin ohne Bibliotheken. Alles respektiert
  `prefers-reduced-motion`.

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
