import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  getCommitHash,
  getCommitTimestamp,
  getUrlOfLastCommit,
} from '../../services/version';
import { installFakeDocument } from '../../test-utils';
import { createVersionInfo } from './version-info';

interface FakeDialog {
  open: boolean;
  dispatchEvent: (event: { type: string }) => void;
}

function getDialog(el: Element): FakeDialog {
  return el.querySelector(
    '[data-testid="version-info-dialog"]',
  ) as unknown as FakeDialog;
}

function fireClick(el: Element, selector: string): void {
  const target = el.querySelector(selector) as unknown as {
    dispatchEvent: (event: { type: string }) => void;
  };
  target.dispatchEvent({ type: 'click' });
}

describe('VersionInfo', () => {
  beforeEach(() => {
    installFakeDocument();
  });

  it('renders the version details inside the dialog', () => {
    const info = createVersionInfo();

    assert.ok(info.element.querySelector('[data-testid="version-info"]'));
    assert.ok(
      info.element.querySelector('[data-testid="version-info-dialog"]'),
    );
    assert.ok(info.element.innerHTML.includes('Informationen'));
    assert.ok(info.element.innerHTML.includes(getCommitTimestamp()));
    assert.ok(info.element.innerHTML.includes(getCommitHash()));
    assert.ok(info.element.querySelector('[data-download-plans]'));
    const link = info.element.querySelector('a');
    assert.equal(link?.getAttribute('href'), getUrlOfLastCommit());
  });

  it('links to the viewport checker for on-device debugging', () => {
    const info = createVersionInfo();

    // The fake DOM's querySelectorAll only knows attribute selectors, so
    // find the checker link via its target="_blank" attribute.
    const checker = info.element.querySelector('[target="_blank"]');
    assert.equal(
      checker?.getAttribute('href'),
      'https://mohrm.github.io/viewport-checker/',
    );
    assert.equal(checker?.getAttribute('rel'), 'noopener');
  });

  it('starts with the dialog closed', () => {
    const info = createVersionInfo();

    assert.equal(getDialog(info.element).open, false);
  });

  it('opens the dialog when the info icon is clicked', () => {
    const info = createVersionInfo();

    fireClick(info.element, '[data-testid="version-info"]');

    assert.equal(getDialog(info.element).open, true);
  });

  it('closes the dialog via its close button', () => {
    const info = createVersionInfo();
    fireClick(info.element, '[data-testid="version-info"]');

    fireClick(info.element, '[data-testid="version-info-close"]');

    assert.equal(getDialog(info.element).open, false);
  });

  it('closes the dialog when the backdrop is clicked', () => {
    const info = createVersionInfo();
    fireClick(info.element, '[data-testid="version-info"]');
    const dialog = getDialog(info.element);

    dialog.dispatchEvent({ type: 'click' });

    assert.equal(getDialog(info.element).open, false);
  });

  it('keeps the dialog open when its content is clicked', () => {
    const info = createVersionInfo();
    fireClick(info.element, '[data-testid="version-info"]');

    fireClick(info.element, '.version-info__title');

    assert.equal(getDialog(info.element).open, true);
  });
});
