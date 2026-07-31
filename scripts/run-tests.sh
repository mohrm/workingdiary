#!/bin/sh
# dash (this script's shell) has no `pipefail`/PIPESTATUS, so `$?` after a
# pipe would report tee's exit code, not node's — masking test failures.
# Route node's real exit code through a temp file instead.
status_file=$(mktemp)
{
  node --import tsx --import ./test-setup.ts --experimental-test-coverage --test "$@"
  echo $? > "$status_file"
} | tee .coverage.tmp
test_exit_code=$(cat "$status_file")
rm -f "$status_file"

node --import tsx scripts/check-coverage.ts .coverage.tmp
coverage_exit_code=$?

if [ "$test_exit_code" -ne 0 ]; then
  exit "$test_exit_code"
fi
exit "$coverage_exit_code"
