import type { Component } from '../../component';
import {
  getCommitHash,
  getCommitTimestamp,
  getUrlOfLastCommit,
} from '../../services/version';
import { icon } from '../icons';

export function createVersionInfo(): Component {
  const el = document.createElement('div');
  el.className = 'version-info';

  el.innerHTML = `
    <button type="button" class="version-info__button" data-testid="version-info" aria-label="Versionsinformation anzeigen">
      ${icon('info')}
    </button>
    <dialog class="version-info__dialog" data-testid="version-info-dialog" aria-labelledby="version-info-title">
      <h2 class="version-info__title" id="version-info-title">Versionsinformation</h2>
      <p class="version-info__entry">Zuletzt geändert: ${getCommitTimestamp()}</p>
      <p class="version-info__entry">Commit: <a href="${getUrlOfLastCommit()}">${getCommitHash()}</a></p>
      <button type="button" class="version-info__close" data-testid="version-info-close">${icon('close')}Schließen</button>
    </dialog>`;

  const button = el.querySelector<HTMLButtonElement>(
    '[data-testid="version-info"]',
  )!;
  const dialog = el.querySelector<HTMLDialogElement>(
    '[data-testid="version-info-dialog"]',
  )!;
  const close = el.querySelector<HTMLButtonElement>(
    '[data-testid="version-info-close"]',
  )!;

  button.addEventListener('click', () => dialog.showModal());
  close.addEventListener('click', () => dialog.close());
  // A click whose target is the dialog element itself hit the backdrop,
  // because every visible content sits in child elements of the dialog.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  return { element: el };
}
