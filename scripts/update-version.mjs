import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const version = packageJson.version;

const getGitValue = (command, fallback) => {
  try {
    return execFileSync('git', command).toString().trim();
  } catch (e) {
    console.log(e);
    return fallback;
  }
};

const commitHash =
  process.env.GIT_COMMIT_HASH ||
  getGitValue(['rev-parse', '--short', 'HEAD'], 'unknown');
const commitTimestamp =
  process.env.GIT_COMMIT_TIMESTAMP ||
  getGitValue(
    [
      'show',
      '--no-patch',
      '--date=format-local:%Y-%m-%d %H:%M:%S %z',
      '--format=%cd',
    ],
    new Date().toISOString(),
  );

const content = `export const version = '${version}';
export const commitTimestamp = '${commitTimestamp}';
export const commitHash = '${commitHash}';
export const urlOfLastCommit = 'https://github.com/mohrm/workingdiary/commit/${commitHash}';
`;

console.log(`content: ${content}`);

mkdirSync('./src/environments', { recursive: true });
writeFileSync('./src/environments/version.ts', content);
