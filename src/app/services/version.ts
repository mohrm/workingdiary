import {
  commitHash,
  commitTimestamp,
  urlOfLastCommit,
} from '../../environments/version';

export function getVersion(): string {
  return `Zuletzt geändert: ${commitTimestamp}, commit: ${commitHash}`;
}

export function getCommitTimestamp(): string {
  return commitTimestamp;
}

export function getCommitHash(): string {
  return commitHash;
}

export function getUrlOfLastCommit(): string {
  return urlOfLastCommit;
}
