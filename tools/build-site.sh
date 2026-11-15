#!/usr/bin/env bash
# Projektseite (https://bingerminger.github.io/sternenflunk/) bauen: site/ + Bildschirmfotos aus
# docs/screenshots + favicon.svg → <ziel> (Standard dist/site). Die Version kommt aus VERSION.
# Die Demo legt der Workflow pages.yml darunter nach demo/.
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
out=${1:-$root/dist/site}
for ref in $(grep -o 'assets/[A-Za-z0-9._-]*' "$root/site/index.html" | sort -u); do
  [[ -f $root/docs/screenshots/${ref#assets/} ]] || { echo "fehlt: docs/screenshots/${ref#assets/}" >&2; exit 1; }
done
version=$(tr -d '[:space:]' < "$root/VERSION")
rm -rf "$out"; mkdir -p "$out/assets"
cp "$root/favicon.svg" "$out/"
for ref in $(grep -o 'assets/[A-Za-z0-9._-]*' "$root/site/index.html" | sort -u); do cp "$root/docs/screenshots/${ref#assets/}" "$out/assets/"; done
sed "s/{{VERSION}}/$version/g" "$root/site/index.html" > "$out/index.html"
touch "$out/.nojekyll"
echo "Projektseite $version → $out ($(du -sh "$out" | cut -f1))"
