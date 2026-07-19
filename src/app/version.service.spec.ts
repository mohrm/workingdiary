import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  commitHash,
  commitTimestamp,
  urlOfLastCommit,
} from '../environments/version';
import {
  getCommitHash,
  getCommitTimestamp,
  getUrlOfLastCommit,
  getVersion,
} from './services/version';

describe('VersionService', () => {
  it('returns full version text', () => {
    assert.ok(getVersion().includes(commitTimestamp));
    assert.ok(getVersion().includes(commitHash));
  });

  it('returns commit metadata fields', () => {
    assert.strictEqual(getCommitTimestamp(), commitTimestamp);
    assert.strictEqual(getCommitHash(), commitHash);
    assert.strictEqual(getUrlOfLastCommit(), urlOfLastCommit);
  });
});
