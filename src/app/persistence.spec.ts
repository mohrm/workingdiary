import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { Section } from './model/Section';
import { Time } from './model/Time';
import { persistence, SECTIONS_CHANGED } from './services/persistence';

describe('PersistenceService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes plans storage when empty', () => {
    assert.strictEqual(localStorage.getItem('plans'), null);

    const plans = persistence.loadPlans();

    assert.deepEqual(plans, {});
    assert.strictEqual(localStorage.getItem('plans'), '{}');
  });

  it('saves and loads start time', () => {
    const day = '01.01.2024';
    const start = new Time(9, 30);

    persistence.saveStartTime(day, start);

    assert.deepEqual(persistence.loadStartTime(day), start);
  });

  it('clears start time when undefined is saved', () => {
    const day = '01.01.2024';

    persistence.saveStartTime(day, new Time(8, 0));
    persistence.saveStartTime(day, undefined);

    assert.strictEqual(persistence.loadStartTime(day), undefined);
  });

  it('saves and loads sections', () => {
    const day = '01.01.2024';
    const sections = [new Section(new Time(9, 0), new Time(10, 0), 'Büro')];

    persistence.saveSections(day, sections);

    assert.deepEqual(persistence.loadSections(day), sections);
  });

  it('returns undefined when no sections are available', () => {
    assert.strictEqual(persistence.loadSections('01.01.2024'), undefined);
  });

  it('emits section updates when saving sections', async () => {
    const day = '01.01.2024';
    const sections = [new Section(new Time(9, 0), new Time(10, 0), 'Büro')];

    await new Promise<void>((resolve) => {
      function handler(e: Event) {
        const { day: emittedDay, sections: emittedSections } = (
          e as CustomEvent
        ).detail;
        window.removeEventListener(SECTIONS_CHANGED, handler);
        assert.strictEqual(emittedDay, day);
        assert.deepEqual(emittedSections, sections);
        resolve();
      }

      window.addEventListener(SECTIONS_CHANGED, handler);
      persistence.saveSections(day, sections);
    });
  });

  it('returns previous day if available, otherwise current day', () => {
    persistence.saveSections('01.01.2024', []);
    persistence.saveSections('03.01.2024', []);

    assert.strictEqual(persistence.previousDay('03.01.2024'), '01.01.2024');
    assert.strictEqual(persistence.previousDay('01.01.2024'), '01.01.2024');
  });

  it('returns next day if available, otherwise current day', () => {
    persistence.saveSections('01.01.2024', []);
    persistence.saveSections('03.01.2024', []);

    assert.strictEqual(persistence.nextDay('01.01.2024'), '03.01.2024');
    assert.strictEqual(persistence.nextDay('03.01.2024'), '03.01.2024');
  });
});
