# Sternenflunk installieren

Sternenflunk ist absichtlich anspruchslos: **PHP ≥ 8.1** (entwickelt auf 8.4/8.5),
keine Datenbank, kein Composer, kein Build-Step. Eine Handvoll Dateien, die man
irgendwo hinkopiert, wo PHP läuft — fertig.

## 1. Voraussetzungen

- PHP ≥ 8.1 (CLI für den Schnellstart oder als Webserver-Modul/FPM)
- Schreibrechte für den Webserver-User auf `data/` (für Stammdaten und
  eingefrorene Tage)
- Sonst nichts. Wirklich.

## 2. Schnellstart (lokal)

```bash
git clone https://github.com/Bingerminger/sternenflunk.git
cd sternenflunk
php -S localhost:8018
```

`http://localhost:8018` öffnen → Onboarding ausfüllen (zwei Namen, zwei
Sternzeichen) → der Flunk sendet.

## 3. Webserver (Apache / nginx + PHP-FPM)

Den Projektordner ins Docroot legen (oder als Unterordner, z. B.
`/var/www/html/sternenflunk`). Es gibt keine Rewrite-Regeln — `index.html`
und `api.php` genügen sich selbst.

Wichtig ist nur das Schreibrecht auf `data/`:

```bash
chown -R www-data:www-data sternenflunk/data   # Debian/Ubuntu-Beispiel
chmod -R u+rwX sternenflunk/data
```

## 4. Synology NAS (Web Station)

1. **Web Station** installieren und ein PHP-Profil ≥ 8.1 anlegen
   (Paketzentrum → PHP installieren, in Web Station als Profil aktivieren).
2. Projektordner in die Freigabe `web` kopieren, z. B. `web/sternenflunk`
   (per SMB: einfach den Ordner reinziehen, `tools/` und `.git/` dürfen
   mitkommen oder wegbleiben — die App braucht sie nicht).
3. In Web Station dem Ordner/vHost das PHP-Profil zuweisen.
4. Sicherstellen, dass der Web-Station-User auf `sternenflunk/data`
   schreiben darf (Rechte der Freigabe reichen normalerweise aus).
5. `http://<NAS>:<Port>/sternenflunk` öffnen → Onboarding → fertig.

> In diesem Haushalt übernehmen `tools/deploy-acc.sh` und
> `tools/deploy-prod.sh` das Kopieren inklusive Smoke-Check —
> siehe README, Abschnitt *Stack & Struktur*.

## 5. Onboarding & Verwaltung

- **Erster Start:** Die App zeigt automatisch das Onboarding. Zwei Namen
  (max. 24 Zeichen), zwei Sternzeichen, eine Admin-PIN (4–8 Ziffern),
  „✨ Funk aufnehmen" — ab jetzt ist der Einrichtungstag der erste Tag der
  Zeitrechnung (das Archiv beginnt dort).
- **Stammdaten ändern:** Zahnrad ⚙ oben rechts — zum Speichern wird die
  Admin-PIN verlangt. Dort lässt sich (optional) auch eine neue PIN setzen.
  Achtung: Namens- oder Zeichenänderung erzeugt eine neue Zeitlinie — alle
  Tage werden rückwirkend neu geflunkert (die Sterne erinnern sich eh an
  nichts). Ein reiner PIN-Wechsel lässt die Horoskope unangetastet.
- **Tagesbericht als PDF:** Der ⤓-Knopf neben dem Zahnrad lädt den gerade
  angezeigten Tag (auch Archiv-Tage) als mehrseitigen PDF-Bericht herunter.
  Der entsteht komplett im Browser — der Server merkt davon nichts, das NAS
  bleibt entspannt. Ein halbwegs aktueller Browser genügt.
- **PIN vergessen / Werksreset:** `data/couple.json` löschen → beim nächsten
  Aufruf kommt wieder das Onboarding (inklusive neuer PIN). Wer auch das
  Archiv leeren will, löscht zusätzlich `data/days/*.json` (passiert bei
  geänderten Stammdaten automatisch).

## 6. Update / neues Deployment

Alle Dateien **außer `data/`** überschreiben — `data/couple.json` und die
eingefrorenen Tage bleiben so erhalten. Die mitgelieferten Deploy-Skripte
machen genau das (Re-Deploys sparen `data/` aus, PROD legt vorher ein
Backup an).

## 7. Troubleshooting

| Symptom | Ursache & Abhilfe |
|---|---|
| Onboarding meldet „lässt sich nicht schreiben" | `data/` ist für den Webserver-User nicht beschreibbar → Rechte setzen (siehe oben). |
| Es kommt immer wieder das Onboarding | `data/couple.json` kann nicht gelesen werden oder ist kaputt → Rechte prüfen, Datei ggf. löschen und neu einrichten. |
| „Falsche PIN" trotz richtiger PIN | Feststelltaste/Autokorrektur prüfen — die PIN besteht nur aus Ziffern. Im Zweifel: Werksreset (siehe oben). |
| „Die Zukunft bleibt versiegelt" für heute | Server-Zeitzone ≠ eure Zeitzone → `APP_TIMEZONE` in `config.php` prüfen (Standard: Europe/Berlin). |
| Sonnenzeiten passen nicht | `GEO_LAT`/`GEO_LON`/`GEO_NAME` in `config.php` auf euren Ort stellen (Standard: Leipzig). |
| Horoskope ändern sich nach Code-Update rückwirkend | Passiert nur bei Tagen, die nie ausgeliefert wurden. Ausgelieferte Tage sind in `data/days/` eingefroren und bleiben stabil. |

## 8. Sicherheitsmodell (ehrlich beschriftet)

- **Admin-PIN = Haustür-Niveau, kein Tresor.** Die PIN (gehasht gespeichert,
  `password_hash`) schützt die Stammdaten vor versehentlichen und
  scherzhaften Änderungen durch Mitbewohner. Es gibt bewusst kein
  Rate-Limiting, keine Sessions, kein HTTPS-Erzwingen — die App ist für den
  Betrieb im Heimnetz oder hinter einem Reverse-Proxy-Schutz gedacht.
- Die Horoskope selbst sind ohne PIN lesbar (es ist ein Horoskop, kein
  Bankkonto).
- Keine Cookies, kein Tracking, keine externen Requests. Der Browser merkt
  sich lediglich lokal die zuletzt gewählte Ansicht und den Orakel-Zähler.
