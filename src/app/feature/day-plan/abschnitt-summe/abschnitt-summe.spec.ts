import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { LOCATIONS } from '../../../model/locations';
import { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';
import { persistence } from '../../../services/persistence';
import { installFakeDocument } from '../../../test-utils';
import { createAbschnittSumme } from './abschnitt-summe';

describe('AbschnittSumme', () => {
  beforeEach(() => {
    localStorage.clear();
    installFakeDocument();
  });

  it('renders one row per work location (Büro, mobil) with the matching subtotal', () => {
    const day = '01.01.2024';
    persistence.saveSections(day, [
      new Section(new Time(8, 0), new Time(10, 0), LOCATIONS.OFFICE),
      new Section(new Time(10, 0), new Time(11, 0), LOCATIONS.MOBILE),
      new Section(new Time(11, 0), new Time(11, 30), LOCATIONS.UNASSIGNED),
    ]);

    const summe = createAbschnittSumme(day);
    const html = summe.element.innerHTML;

    assert.ok(html.includes(LOCATIONS.OFFICE));
    assert.ok(html.includes('02:00'));
    assert.ok(html.includes(LOCATIONS.MOBILE));
    assert.ok(html.includes('01:00'));
  });

  it('does not render a row for unassigned sections, matching the previous behaviour', () => {
    const day = '01.01.2024';
    persistence.saveSections(day, [
      new Section(new Time(11, 0), new Time(11, 30), LOCATIONS.UNASSIGNED),
    ]);

    const summe = createAbschnittSumme(day);

    assert.ok(!summe.element.innerHTML.includes(LOCATIONS.UNASSIGNED));
  });

  it('sums the Gesamt row across all sections, including unassigned ones', () => {
    const day = '01.01.2024';
    persistence.saveSections(day, [
      new Section(new Time(8, 0), new Time(10, 0), LOCATIONS.OFFICE),
      new Section(new Time(10, 0), new Time(11, 0), LOCATIONS.MOBILE),
      new Section(new Time(11, 0), new Time(11, 30), LOCATIONS.UNASSIGNED),
    ]);

    const summe = createAbschnittSumme(day);

    assert.ok(
      summe.element.innerHTML.includes(
        '<td data-testid="fullduration">03:30</td>',
      ),
    );
  });

  it('renders zero durations when there are no sections for the day', () => {
    const summe = createAbschnittSumme('01.01.2024');

    assert.ok(
      summe.element.innerHTML.includes(
        '<td data-testid="fullduration">00:00</td>',
      ),
    );
  });

  it('update() reloads sections for the new day and re-renders the totals', () => {
    persistence.saveSections('01.01.2024', [
      new Section(new Time(8, 0), new Time(9, 0), LOCATIONS.OFFICE),
    ]);
    persistence.saveSections('02.01.2024', [
      new Section(new Time(8, 0), new Time(11, 0), LOCATIONS.MOBILE),
    ]);

    const summe = createAbschnittSumme('01.01.2024');
    summe.update('02.01.2024');

    assert.ok(
      summe.element.innerHTML.includes(
        '<td data-testid="fullduration">03:00</td>',
      ),
    );
  });
});
