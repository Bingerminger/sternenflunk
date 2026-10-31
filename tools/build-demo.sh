#!/bin/bash
# =============================================================================
# build-demo.sh — die öffentliche Demo als statische Seite (GitHub Pages).
#
# GitHub Pages hat kein PHP. Dieses Skript startet deshalb den echten Server
# mit einem frischen Datenverzeichnis und dem Beispielpaar Kim (Löwe) & Alex
# (Fische), ruft `meta` und jeden Tag der letzten DEMO_DAYS Tage über die
# normale API ab und legt die Antworten unter demo-api/ ab. Dazu kommen die
# App-Hülle (index.html mit `data-demo`), assets/, Icons und die Lizenz.
# Im Browser liest app.js im Demo-Modus aus diesem Abzug; Speichern ist aus.
#
#   bash tools/build-demo.sh                    # nach dist/demo
#   bash tools/build-demo.sh /tmp/demo 8897     # Ziel, Port
#
# Ansehen: php -S 127.0.0.1:8090 -t dist/demo  → http://127.0.0.1:8090/
# Gebaut wird von .github/workflows/pages.yml (täglich, bei Releases, von Hand).
# Ein Fehler der API bricht den Bau ab — die Demo soll keinen Fehler zeigen,
# den es im Echtbetrieb nicht gibt.
# =============================================================================
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=${1:-$ROOT/dist/demo}
PORT=${2:-8897}
DEMO_DAYS=${DEMO_DAYS:-60}
WORK=$(mktemp -d)
PID=""
cleanup() { [ -n "$PID" ] && kill "$PID" 2>/dev/null; rm -rf "$WORK"; }
trap cleanup EXIT

# Arbeitskopie nur mit dem, was der Server braucht — und leerem data/
mkdir -p "$WORK/app/data/days"
cp "$ROOT"/{api.php,config.php,index.html,favicon.svg,manifest.webmanifest} "$WORK/app/"
cp -R "$ROOT/lib" "$ROOT/assets" "$WORK/app/"

# Stammdaten des Beispielpaars, Start DEMO_DAYS Tage zurück (Archiv zum Blättern).
# Kalender-Grenzen rechnet PHP in der App-Zeitzone, damit „heute“ überall gleich ist.
php -r '
  require $argv[1] . "/config.php";
  $since = date("Y-m-d", strtotime("-" . ((int) $argv[2] - 1) . " days"));
  file_put_contents($argv[1] . "/data/couple.json", json_encode([
    "a" => ["name" => "Kim", "sign" => "loewe"],
    "b" => ["name" => "Alex", "sign" => "fische"],
    "since" => $since,
    "pinHash" => password_hash("demo-" . bin2hex(random_bytes(8)), PASSWORD_DEFAULT),
    "updatedAt" => date("c"),
  ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
' "$WORK/app" "$DEMO_DAYS"

php -S "127.0.0.1:$PORT" -t "$WORK/app" >/dev/null 2>&1 &
PID=$!
disown "$PID" 2>/dev/null || true # kein „Terminated“ beim Aufräumen
for _ in $(seq 1 50); do
  curl -sf "http://127.0.0.1:$PORT/api.php?action=meta" >/dev/null 2>&1 && break
  sleep 0.1
done

rm -rf "$OUT"
mkdir -p "$OUT/demo-api/day"

fetch() { # $1 = Query, $2 = Zieldatei — bricht ab, wenn die API nicht „ok“ sagt
  local body
  body=$(curl -sf "http://127.0.0.1:$PORT/api.php?$1") || { echo "API-Fehler bei $1" >&2; exit 1; }
  case "$body" in *'"ok":true'*) ;; *) echo "API meldet Fehler bei $1: ${body:0:200}" >&2; exit 1 ;; esac
  printf '%s' "$body" > "$2"
}

fetch "action=meta" "$OUT/demo-api/meta.json"
dates=$(php -r '
  require $argv[1] . "/config.php";
  $c = json_decode(file_get_contents($argv[1] . "/data/couple.json"), true);
  for ($d = $c["since"]; $d <= date("Y-m-d"); $d = date("Y-m-d", strtotime($d . " +1 day"))) echo $d, "\n";
' "$WORK/app")
n=0
for d in $dates; do
  fetch "action=day&date=$d" "$OUT/demo-api/day/$d.json"
  n=$((n + 1))
done

# App-Hülle: index.html mit data-demo (schaltet app.js auf den Abzug), dazu
# alles Statische. Kein api.php, kein lib/, keine Stammdaten.
sed 's/<html lang="de">/<html lang="de" data-demo>/' "$ROOT/index.html" > "$OUT/index.html"
grep -q 'data-demo' "$OUT/index.html" || { echo "data-demo nicht gesetzt" >&2; exit 1; }
cp -R "$ROOT/assets" "$OUT/"
cp "$ROOT"/{favicon.svg,manifest.webmanifest,LICENSE} "$OUT/"
touch "$OUT/.nojekyll"

today=$(php -r 'require $argv[1] . "/config.php"; echo date("Y-m-d");' "$WORK/app")
echo "Demo gebaut: $OUT — $n Tage bis $today, $(du -sh "$OUT" | cut -f1)"
