#!/usr/bin/env bash
set -euo pipefail

git config --global --add safe.directory "$(pwd)"

# npm v11 warns on deprecated env keys that some runners inject
unset npm_config_http_proxy npm_config_https_proxy

npm i
npm run prebuild
npm run build:ci
