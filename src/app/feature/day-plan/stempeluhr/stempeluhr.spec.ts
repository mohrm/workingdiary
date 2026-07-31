import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';
import { persistence } from '../../../services/persistence';
import { installFakeDocument } from '../../../test-utils';
import { createStempeluhr } from './stempeluhr';

interface FakeInputLike {
  value: string;
  dispatchEvent: (event: { type: string }) => void;
}

function fireInput(el: Element, selector: string, value: string): void {
  const input = el.querySelector(selector) as unknown as FakeInputLike;
  input.value = value;
  input.dispatchEvent({ type: 'input' });
}

function fireClick(el: Element, selector: string): void {
  const target = el.querySelector(selector) as unknown as {
    dispatchEvent: (event: { type: string }) => void;
  };
  target.dispatchEvent({ type: 'click' });
}

describe('Stempeluhr', () => {
  beforeEach(() => {
    localStorage.clear();
    installFakeDocument();
  });

  it('shows the not-yet-clocked-in placeholder and an Einstempeln button', () => {
    const stempeluhr = createStempeluhr('01.01.2024');

    assert.ok(
      stempeluhr.element.innerHTML.includes('noch nicht eingestempelt'),
    );
    assert.ok(stempeluhr.element.innerHTML.includes('Einstempeln'));
  });

  it('clocks in, persisting and displaying the start time', () => {
    const stempeluhr = createStempeluhr('01.01.2024');

    fireClick(stempeluhr.element, '[data-testid="log-button"]');

    assert.ok(stempeluhr.element.innerHTML.includes('Ausstempeln'));
    assert.ok(persistence.loadStartTime('01.01.2024') !== undefined);
  });

  it('clocks out, emitting a section and clearing the stored start time', () => {
    persistence.saveStartTime('01.01.2024', new Time(8, 0));
    const onStempelEreignis = mock.fn();
    const stempeluhr = createStempeluhr('01.01.2024', onStempelEreignis);

    fireClick(stempeluhr.element, '[data-testid="log-button"]');

    assert.equal(onStempelEreignis.mock.callCount(), 1);
    const section = onStempelEreignis.mock.calls[0].arguments[0] as Section;
    assert.equal(section.startTime.hour, 8);
    assert.equal(persistence.loadStartTime('01.01.2024'), undefined);
  });

  it('clocks out without a callback', () => {
    persistence.saveStartTime('01.01.2024', new Time(8, 0));
    const stempeluhr = createStempeluhr('01.01.2024');

    assert.doesNotThrow(() => {
      fireClick(stempeluhr.element, '[data-testid="log-button"]');
    });
  });

  it('switches to edit mode and shows hour/minute inputs', () => {
    persistence.saveStartTime('01.01.2024', new Time(8, 30));
    const stempeluhr = createStempeluhr('01.01.2024');

    fireClick(stempeluhr.element, '[data-action="edit"]');

    assert.ok(stempeluhr.element.querySelector('[data-hour]'));
    assert.ok(stempeluhr.element.querySelector('[data-minute]'));
  });

  it('tracks hour/minute input changes and commits on finish', () => {
    persistence.saveStartTime('01.01.2024', new Time(8, 30));
    const stempeluhr = createStempeluhr('01.01.2024');
    fireClick(stempeluhr.element, '[data-action="edit"]');

    fireInput(stempeluhr.element, '[data-hour]', '9');
    fireInput(stempeluhr.element, '[data-minute]', '45');
    fireClick(stempeluhr.element, '[data-action="finish"]');

    const saved = persistence.loadStartTime('01.01.2024');
    assert.equal(saved?.hour, 9);
    assert.equal(saved?.minute, 45);
    assert.ok(stempeluhr.element.innerHTML.includes('09:45'));
  });

  it('falls back to 0 when hour/minute input is not a number', () => {
    persistence.saveStartTime('01.01.2024', new Time(8, 30));
    const stempeluhr = createStempeluhr('01.01.2024');
    fireClick(stempeluhr.element, '[data-action="edit"]');

    fireInput(stempeluhr.element, '[data-hour]', 'nope');
    fireInput(stempeluhr.element, '[data-minute]', 'nope');
    fireClick(stempeluhr.element, '[data-action="finish"]');

    const saved = persistence.loadStartTime('01.01.2024');
    assert.equal(saved?.hour, 0);
    assert.equal(saved?.minute, 0);
  });

  it('discards changes and restores the display on abort', () => {
    persistence.saveStartTime('01.01.2024', new Time(8, 30));
    const stempeluhr = createStempeluhr('01.01.2024');
    fireClick(stempeluhr.element, '[data-action="edit"]');
    fireInput(stempeluhr.element, '[data-hour]', '23');

    fireClick(stempeluhr.element, '[data-action="abort"]');

    assert.ok(stempeluhr.element.innerHTML.includes('08:30'));
    assert.equal(persistence.loadStartTime('01.01.2024')?.hour, 8);
  });

  it('update() reloads the start time for the new day', () => {
    persistence.saveStartTime('01.01.2024', new Time(8, 0));
    persistence.saveStartTime('02.01.2024', new Time(9, 0));
    const stempeluhr = createStempeluhr('01.01.2024');

    stempeluhr.update('02.01.2024');

    assert.ok(stempeluhr.element.innerHTML.includes('09:00'));
  });

  it('update() shows the placeholder when the new day has no start time', () => {
    persistence.saveStartTime('01.01.2024', new Time(8, 0));
    const stempeluhr = createStempeluhr('01.01.2024');

    stempeluhr.update('03.01.2024');

    assert.ok(
      stempeluhr.element.innerHTML.includes('noch nicht eingestempelt'),
    );
  });
});
