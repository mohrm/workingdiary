#!/usr/bin/env bash

set -euo pipefail

readonly PACKAGE_JSON_PATH="package.json"

if [[ ! -f "${PACKAGE_JSON_PATH}" ]]; then
  echo "Fehler: ${PACKAGE_JSON_PATH} wurde nicht gefunden."
  exit 1
fi

COMPILER_RESULT="$(
  node -e '
    const fs = require("node:fs");
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const dependencies = packageJson.dependencies ?? {};
    const devDependencies = packageJson.devDependencies ?? {};
    const coreVersion = dependencies["@angular/core"] ?? devDependencies["@angular/core"] ?? "";
    const hasCompiler = Boolean(dependencies["@angular/compiler"] ?? devDependencies["@angular/compiler"]);

    if (!coreVersion || hasCompiler) {
      process.stdout.write("noop");
      process.exit(0);
    }

    dependencies["@angular/compiler"] = coreVersion;
    packageJson.dependencies = dependencies;
    fs.writeFileSync("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
    process.stdout.write(`added:${coreVersion}`);
  '
)"

if [[ "${COMPILER_RESULT}" == added:* ]]; then
  echo "Ergänze fehlendes @angular/compiler in package.json (${COMPILER_RESULT#added:}), damit ng-update-Migrationen laufen."
fi

echo "Prüfe verfügbare Updates (informativ)..."
if ! npx ng update; then
  echo "Hinweis: 'ng update' (ohne Paketliste) lieferte keinen erfolgreichen Exit-Code. Fahre mit gezieltem Update fort."
fi

mapfile -t UPDATE_PACKAGES < <(
  node -e '
    const fs = require("node:fs");
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const deps = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ];
    const selected = deps
      .filter((name) => name.startsWith("@angular/"))
      .filter((name) => name !== "@angular/compiler");

    for (const name of [...new Set(selected)].sort()) {
      process.stdout.write(`${name}\n`);
    }
  '
)

if [[ "${#UPDATE_PACKAGES[@]}" -eq 0 ]]; then
  echo "Keine passenden Angular-Pakete für ein Update gefunden."
  exit 0
fi

echo "Wende Updates für folgende Pakete an: ${UPDATE_PACKAGES[*]}"
npx ng update "${UPDATE_PACKAGES[@]}" --force --allow-dirty --verbose
