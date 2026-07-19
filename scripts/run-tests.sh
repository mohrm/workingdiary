#!/bin/sh
node --import tsx --import ./test-setup.ts --experimental-test-coverage --test "$@" 2>&1 | tee .coverage.tmp
exit_code=$?
node scripts/check-coverage.mjs .coverage.tmp
exit $exit_code
