import { TestBed } from '@angular/core/testing';

import { VersionService } from './version.service';
import { commitHash, commitTimestamp, urlOfLastCommit } from '../environments/version';

describe('VersionService', () => {
  let service: VersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns full version text', () => {
    expect(service.getVersion()).toContain(commitTimestamp);
    expect(service.getVersion()).toContain(commitHash);
  });

  it('returns commit metadata fields', () => {
    expect(service.commitTimestamp()).toBe(commitTimestamp);
    expect(service.commitHash()).toBe(commitHash);
    expect(service.urlOfLastCommit()).toBe(urlOfLastCommit);
  });
});
