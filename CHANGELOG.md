# Changelog

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
