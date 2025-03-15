import { Injectable } from '@angular/core';
import { commitTimestamp, commitHash, urlOfLastCommit } from "../environments/version";
@Injectable({
  providedIn: 'root'
})
export class VersionService {

  getVersion(): string {
    return `Zuletzt geändert: ${commitTimestamp}, commit: ${commitHash}`;
  }

  commitTimestamp(): string {
    return commitTimestamp;
  }

  commitHash(): string {
    return commitHash;
  }

  urlOfLastCommit(): string {
    return urlOfLastCommit;
  }
}
