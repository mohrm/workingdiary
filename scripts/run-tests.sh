#!/bin/sh
node --import tsx --import ./test-setup.ts --experimental-test-coverage --test "$@" 2>&1 | tee .coverage.tmp
exit_code=$?
node --import tsx scripts/check-coverage.ts .coverage.tmp
exit $exit_code
