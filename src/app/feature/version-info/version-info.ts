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

  // The dialog doubles as the footer's info menu: the export link is
  // mounted into its data-download-plans slot by app.ts. The viewport
  // checker link opens in a new browsing context (target="_blank"), so
  // on-device viewport measurements (see #595) happen without navigating
  // away from the app.
  el.innerHTML = `
    <button type="button" class="version-info__button" data-testid="version-info" aria-label="Informationen anzeigen">
      ${icon('info')}
    </button>
    <dialog class="version-info__dialog" data-testid="version-info-dialog" aria-labelledby="version-info-title">
      <h2 class="version-info__title" id="version-info-title">Informationen</h2>
      <p class="version-info__entry">Zuletzt geändert: ${getCommitTimestamp()}</p>
      <p class="version-info__entry">Commit: <a href="${getUrlOfLastCommit()}">${getCommitHash()}</a></p>
      <p class="version-info__entry">Viewport prüfen: <a href="https://mohrm.github.io/viewport-checker/" target="_blank" rel="noopener">mohrm.github.io/viewport-checker</a></p>
      <div class="version-info__actions">
        <div class="version-info__export" data-download-plans></div>
        <button type="button" class="version-info__close" data-testid="version-info-close">${icon('close')}Schließen</button>
      </div>
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
