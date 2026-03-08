const fs = require("fs");
const execFileSync = require("child_process").execFileSync;

const version = require("../package.json").version;
const getGitValue = (command, fallback) => {
  try {
    return execFileSync("git", command).toString().trim();
  } catch {
    return fallback;
  }
};

const commitHash = process.env.GIT_COMMIT_HASH || getGitValue(["rev-parse", "--short", "HEAD"], "unknown");
const commitTimestamp =
  process.env.GIT_COMMIT_TIMESTAMP ||
  getGitValue(
    ["show", "--no-patch", "--date=format-local:%Y-%m-%d %H:%M:%S %z", "--format=%cd"],
    new Date().toISOString()
  );

const content = `export const version = '${version}';
export const commitTimestamp = '${commitTimestamp}';
export const commitHash = '${commitHash}';
export const urlOfLastCommit = 'https://github.com/mohrm/workingdiary/commit/${commitHash}';
`;

fs.writeFileSync("./src/environments/version.prod.ts", content);
