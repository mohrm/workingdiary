import { getVersion, getCommitTimestamp, getCommitHash, getUrlOfLastCommit } from './services/version';
import { commitHash, commitTimestamp, urlOfLastCommit } from '../environments/version';

describe('VersionService', () => {
  it('returns full version text', () => {
    expect(getVersion()).toContain(commitTimestamp);
    expect(getVersion()).toContain(commitHash);
  });

  it('returns commit metadata fields', () => {
    expect(getCommitTimestamp()).toBe(commitTimestamp);
    expect(getCommitHash()).toBe(commitHash);
    expect(getUrlOfLastCommit()).toBe(urlOfLastCommit);
  });
});
