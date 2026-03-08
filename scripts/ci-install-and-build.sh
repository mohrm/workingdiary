#!/usr/bin/env bash
set -euo pipefail

git config --global --add safe.directory "$(pwd)"

npm i
npm run prebuild
npm run build:ci
