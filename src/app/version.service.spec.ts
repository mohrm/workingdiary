import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getVersion, getCommitTimestamp, getCommitHash, getUrlOfLastCommit } from './services/version';
import { commitHash, commitTimestamp, urlOfLastCommit } from '../environments/version';

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
