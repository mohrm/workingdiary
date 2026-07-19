#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node check-coverage.mjs <coverage-output-file>');
  process.exit(1);
}

const content = readFileSync(filePath, 'utf-8');
const match = content.match(/^\s*[^a-zA-Z]*all files\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/m);

if (!match) {
  console.error('Could not parse coverage report. Expected "all files" summary line.');
  process.exit(1);
}

const lines = parseFloat(match[1]);
const branches = parseFloat(match[2]);
const functions = parseFloat(match[3]);

const THRESHOLDS = { lines: 77.87, branches: 91.79, functions: 87.04 };
const errors = [];

if (lines < THRESHOLDS.lines) {
  errors.push(`lines: ${lines}% < ${THRESHOLDS.lines}%`);
}
if (branches < THRESHOLDS.branches) {
  errors.push(`branches: ${branches}% < ${THRESHOLDS.branches}%`);
}
if (functions < THRESHOLDS.functions) {
  errors.push(`functions: ${functions}% < ${THRESHOLDS.functions}%`);
}

if (errors.length > 0) {
  console.error(`Coverage thresholds failed:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

console.log(`Coverage OK — lines: ${lines}%, branches: ${branches}%, functions: ${functions}%`);
