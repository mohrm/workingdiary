import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MCR from 'monocart-coverage-reports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const rawCoverageDir = path.resolve(repoRoot, 'build/e2e-coverage/raw');
const outputDir = path.resolve(repoRoot, 'build/e2e-coverage/report');

const files = [];
for await (const filePath of glob('*.json', { cwd: rawCoverageDir })) {
  files.push(path.join(rawCoverageDir, filePath));
}

if (files.length === 0) {
  console.error(`No raw e2e coverage files found in ${rawCoverageDir}.`);
  process.exit(1);
}

const entries = [];
for (const filePath of files) {
  const fileContent = await readFile(filePath, 'utf-8');
  const reportEntries = JSON.parse(fileContent);
  entries.push(...reportEntries);
}

const mcr = MCR({
  outputDir,
  clean: true,
  reports: ['html', 'lcovonly', ['markdown-summary', { file: 'summary.md' }]],
});

await mcr.add(entries);
await mcr.generate();

console.log(`Generated e2e coverage report at ${outputDir}`);
