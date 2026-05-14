#!/usr/bin/env bash
set -e

# Read current version from manifest.json
CURRENT=$(node -p "require('./manifest.json').version")
echo "Huidige versie: $CURRENT"

# Parse semver
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

# Ask for bump type
echo ""
echo "Kies versie-bump:"
echo "  1) patch  ($MAJOR.$MINOR.$((PATCH + 1)))"
echo "  2) minor  ($MAJOR.$((MINOR + 1)).0)"
echo "  3) major  ($((MAJOR + 1)).0.0)"
echo ""
read -rp "Keuze [1/2/3]: " CHOICE

case "$CHOICE" in
  1) NEW="$MAJOR.$MINOR.$((PATCH + 1))" ;;
  2) NEW="$MAJOR.$((MINOR + 1)).0" ;;
  3) NEW="$((MAJOR + 1)).0.0" ;;
  *) echo "Ongeldige keuze." && exit 1 ;;
esac

echo ""
read -rp "Versie bumpen naar $NEW? [y/N] " CONFIRM
[[ "$CONFIRM" =~ ^[Yy]$ ]] || { echo "Afgebroken."; exit 0; }

# Update manifest.json
node -e "
  const fs = require('fs');
  const m = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  m.version = '$NEW';
  fs.writeFileSync('manifest.json', JSON.stringify(m, null, 2) + '\n');
"

# Update apps/server/package.json
node -e "
  const fs = require('fs');
  const p = JSON.parse(fs.readFileSync('apps/server/package.json', 'utf8'));
  p.version = '$NEW';
  fs.writeFileSync('apps/server/package.json', JSON.stringify(p, null, 2) + '\n');
"

git add manifest.json apps/server/package.json
git commit -m "chore: release v$NEW"
git tag "v$NEW"
git push origin main "v$NEW"

echo ""
echo "Klaar. Tag v$NEW gepusht — GitHub Actions bouwt de release."
