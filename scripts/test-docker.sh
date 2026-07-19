#!/bin/bash
set -eu

PORT=${PORT:-8080}
IMAGE_NAME="workingdiary-test"
CONTAINER_NAME="wd-test"
BASE="http://localhost:${PORT}"
PASS=0
FAIL=0
COUNTER=0

cleanup() {
  echo ""
  docker stop "${CONTAINER_NAME}" 2>/dev/null || true
  docker rm "${CONTAINER_NAME}" 2>/dev/null || true
  docker rmi "${IMAGE_NAME}" 2>/dev/null || true
}
trap cleanup EXIT

pass() {
  PASS=$((PASS + 1))
  echo "  ok ${COUNTER} $1"
}
fail() {
  FAIL=$((FAIL + 1))
  echo "  not ok ${COUNTER} $1"
  echo "    ---"
  echo "    $2" | sed 's/^/    /'
  echo "    ..."
}

assert_status() {
  COUNTER=$((COUNTER + 1))
  local url="$1" expected="$2" label="$3"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}${url}")
  if [ "$status" = "$expected" ]; then
    pass "${label}"
  else
    fail "${label}" "expected HTTP ${expected}, got ${status} for ${url}"
  fi
}

assert_header() {
  COUNTER=$((COUNTER + 1))
  local url="$1" header="$2" pattern="$3" label="$4"
  if curl -sI "${BASE}${url}" | grep -qiE "${header}:.*${pattern}"; then
    pass "${label}"
  else
    local actual
    actual=$(curl -sI "${BASE}${url}" | grep -i "${header}" || echo "(missing)")
    fail "${label}" "expected header '${header}: ${pattern}' for ${url}"$'\n'"got: ${actual}"
  fi
}

assert_body() {
  COUNTER=$((COUNTER + 1))
  local url="$1" pattern="$2" label="$3"
  if curl -s "${BASE}${url}" | grep -qE "${pattern}"; then
    pass "${label}"
  else
    fail "${label}" "pattern '${pattern}' not found in body of ${url}"
  fi
}

assert_not_body() {
  COUNTER=$((COUNTER + 1))
  local url="$1" pattern="$2" label="$3"
  if ! curl -s "${BASE}${url}" | grep -qE "${pattern}"; then
    pass "${label}"
  else
    fail "${label}" "pattern '${pattern}' unexpectedly found in body of ${url}"
  fi
}

echo "1.."

echo "# Build Docker image"
npm run build --silent 2>/dev/null
docker build -q -t "${IMAGE_NAME}" . 2>/dev/null
docker run -d -p "${PORT}:80" --name "${CONTAINER_NAME}" "${IMAGE_NAME}" >/dev/null
sleep 2

echo "# Verifying HTTP status codes"
assert_status "/" 200 "index.html returns 200"
assert_status "/sw.js" 200 "sw.js returns 200"
assert_status "/index.html" 200 "direct /index.html returns 200"
assert_status "/assets/index-$(ls dist/assets/index-*.css | sed 's/.*index-//; s/\.css//').css" 200 "CSS asset returns 200"
assert_status "/assets/$(ls dist/assets/main-*.js | sed 's/.*main-/main-/; s|.*dist/assets/||')" 200 "JS asset returns 200"

echo "# Verifying no-cache headers on critical paths"
assert_header "/" "cache-control" "no-cache" "index.html has Cache-Control: no-cache"
assert_header "/sw.js" "cache-control" "no-cache" "sw.js has Cache-Control: no-cache"
assert_header "/index.html" "cache-control" "no-cache" "/index.html has Cache-Control: no-cache"

echo "# Verifying immutable cache on content-hashed assets"
CSS_FILE=$(ls dist/assets/index-*.css | xargs -n1 basename)
assert_header "/assets/${CSS_FILE}" "cache-control" "immutable" "CSS asset has Cache-Control: immutable"
assert_header "/assets/${CSS_FILE}" "cache-control" "max-age=31536000" "CSS asset has max-age=1y"

JS_FILE=$(ls dist/assets/main-*.js | xargs -n1 basename)
assert_header "/assets/${JS_FILE}" "cache-control" "immutable" "JS asset has Cache-Control: immutable"
assert_header "/assets/${JS_FILE}" "cache-control" "max-age=31536000" "JS asset has max-age=1y"

echo "# Verifying index.html references hashed assets"
assert_not_body "/" 'href="/assets/index\.css"' "index.html does NOT reference unhashed CSS"
assert_not_body "/" 'src="/assets/main\.js"' "index.html does NOT reference unhashed JS"
assert_body "/" "index-${CSS_FILE##index-}" "index.html references hashed CSS ${CSS_FILE}"
assert_body "/" "${JS_FILE}" "index.html references hashed JS ${JS_FILE}"

echo "# Verifying sw.js content"
CACHE_KEY=$(grep -o "PRECACHE='[^']*'" dist/sw.js | grep -o "'[^']*'" | tr -d "'")
assert_body "/sw.js" "PRECACHE='[a-z0-9-]*v[a-f0-9]{8}'" "sw.js has dynamic cache key"
assert_not_body "/sw.js" "workingdiary-dev" "sw.js does NOT use static 'workingdiary-dev' key"
assert_body "/sw.js" "addEventListener.*install" "sw.js has install handler"
assert_body "/sw.js" "addEventListener.*activate" "sw.js has activate handler"
assert_body "/sw.js" "addEventListener.*fetch" "sw.js has fetch handler"
assert_body "/sw.js" "caches.match.*fetch" "sw.js has cache-first with network fallback"

echo "# Verifying cache key changes when assets change"
OLD_CACHE_KEY=$(docker exec "${CONTAINER_NAME}" grep -o "PRECACHE='[^']*'" /usr/share/nginx/html/sw.js)
echo "  old cache key: ${OLD_CACHE_KEY}"

# Simulate a rebuild by touching a source file
echo "console.log('pwa-test')" >> src/main.ts
npm run build --silent 2>/dev/null
docker cp dist/. "${CONTAINER_NAME}:/usr/share/nginx/html/"
NEW_CACHE_KEY=$(docker exec "${CONTAINER_NAME}" grep -o "PRECACHE='[^']*'" /usr/share/nginx/html/sw.js)
echo "  new cache key: ${NEW_CACHE_KEY}"
git checkout -- src/main.ts

COUNTER=$((COUNTER + 1))
if [ "${OLD_CACHE_KEY}" != "${NEW_CACHE_KEY}" ]; then
  pass "cache key changes when asset content changes"
else
  fail "cache key changes when asset content changes" "key '${OLD_CACHE_KEY}' did not change after rebuild"
fi

echo ""
echo "# Results: ${PASS} passed, ${FAIL} failed"
[ "${FAIL}" -eq 0 ] || exit 1
