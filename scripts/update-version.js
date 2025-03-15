const fs = require("fs");
const execSync = require("child_process").execSync;

const version = require("../package.json").version;
const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const commitTimestamp = execSync("printf %s \"$(git show --no-patch --format=%ci)\"");

const content = `export const version = '${version}';
export const commitTimestamp = '${commitTimestamp}';
export const commitHash = '${commitHash}';
export const urlOfLastCommit = 'https://github.com/mohrm/workingdiary/commit/${commitHash}';
`

fs.writeFileSync("./src/environments/version.prod.ts", content);
