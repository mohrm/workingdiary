import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import { LOCATIONS } from '../../../model/locations';
import { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';
import { persistence } from '../../../services/persistence';
import { installFakeDocument } from '../../../test-utils';
import { createAbschnittListe } from './abschnitt-liste';

function fireClick(el: Element, selector: string): void {
  const target = el.querySelector(selector) as unknown as {
    dispatchEvent: (event: { type: string }) => void;
  };
  target.dispatchEvent({ type: 'click' });
}

describe('AbschnittListe', () => {
  beforeEach(() => {
    localStorage.clear();
    installFakeDocument();
  });

  it('renders nothing when there are no stored sections', () => {
    const liste = createAbschnittListe('01.01.2024');

    assert.equal(
      liste.element.querySelector('[data-testid="section-0"]'),
      null,
    );
  });

  it('adds a section, persists it and notifies the change callback', () => {
    const onAbschnitteChange = mock.fn();
    const liste = createAbschnittListe('01.01.2024', onAbschnitteChange);
    const section = new Section(
      new Time(8, 0),
      new Time(12, 0),
      LOCATIONS.OFFICE,
    );

    liste.addAbschnitt(section);

    assert.ok(liste.element.querySelector('[data-testid="section-0"]'));
    assert.equal(onAbschnitteChange.mock.callCount(), 1);
    const sections = onAbschnitteChange.mock.calls[0].arguments[0] as Section[];
    assert.equal(sections.length, 1);
  });

  it('loads previously persisted sections for the day', () => {
    const first = createAbschnittListe('01.01.2024');
    first.addAbschnitt(new Section(new Time(8, 0), new Time(12, 0)));

    const reloaded = createAbschnittListe('01.01.2024');

    assert.ok(reloaded.element.querySelector('[data-testid="section-0"]'));
  });

  it('deletes a section and re-renders without it', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));
    liste.addAbschnitt(new Section(new Time(9, 0), new Time(10, 0)));

    fireClick(liste.element, '[data-action="delete"]');

    assert.equal(
      liste.element.querySelector('[data-testid="section-1"]'),
      null,
    );
    assert.ok(liste.element.querySelector('[data-testid="section-0"]'));
  });

  it('edits a section in place and clears edit mode afterwards', () => {
    const onAbschnitteChange = mock.fn();
    const liste = createAbschnittListe('01.01.2024', onAbschnitteChange);
    liste.addAbschnitt(
      new Section(new Time(8, 0), new Time(9, 0), LOCATIONS.OFFICE),
    );

    const editIcon = liste.element.querySelector('[data-action="edit"]');
    assert.ok(editIcon);
    fireClick(liste.element, '[data-action="edit"]');

    assert.ok(liste.element.querySelector('[data-start-hour]'));

    fireClick(liste.element, '[data-action="finish"]');

    assert.equal(liste.element.querySelector('[data-start-hour]'), null);
    assert.equal(onAbschnitteChange.mock.callCount(), 2);
  });

  it('deleting the section currently being edited leaves the next new section out of edit mode', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(
      new Section(new Time(8, 0), new Time(9, 0), LOCATIONS.OFFICE),
    );

    fireClick(liste.element, '[data-action="edit"]');
    assert.ok(liste.element.querySelector('[data-start-hour]'));

    fireClick(liste.element, '[data-action="delete"]');
    liste.addAbschnitt(new Section(new Time(10, 0), new Time(11, 0)));

    assert.equal(liste.element.querySelector('[data-start-hour]'), null);
  });

  it('deleting a section before the edited one keeps the edited section in edit mode', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));
    liste.addAbschnitt(new Section(new Time(9, 0), new Time(10, 0)));

    const secondSection = liste.element.querySelector(
      '[data-testid="section-1"]',
    );
    assert.ok(secondSection);
    fireClick(secondSection, '[data-action="edit"]');
    assert.ok(
      liste.element
        .querySelector('[data-testid="section-1"]')
        ?.querySelector('[data-start-hour]'),
    );

    const firstSection = liste.element.querySelector(
      '[data-testid="section-0"]',
    );
    assert.ok(firstSection);
    fireClick(firstSection, '[data-action="delete"]');

    assert.equal(
      liste.element.querySelector('[data-testid="section-1"]'),
      null,
    );
    assert.ok(
      liste.element
        .querySelector('[data-testid="section-0"]')
        ?.querySelector('[data-start-hour]'),
    );
  });

  it('aborting an edit leaves the section unchanged and closes edit mode', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(
      new Section(new Time(8, 0), new Time(9, 0), LOCATIONS.OFFICE),
    );

    fireClick(liste.element, '[data-action="edit"]');
    fireClick(liste.element, '[data-action="abort"]');

    assert.equal(liste.element.querySelector('[data-start-hour]'), null);
    assert.equal(persistence.loadSections('01.01.2024')?.[0].startTime.hour, 8);
  });

  it('update() switches to a different day, reloading its sections', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));

    liste.update('02.01.2024');

    assert.equal(
      liste.element.querySelector('[data-testid="section-0"]'),
      null,
    );

    liste.addAbschnitt(new Section(new Time(10, 0), new Time(11, 0)));
    assert.ok(liste.element.querySelector('[data-testid="section-0"]'));
  });

  it('works without an onAbschnitteChange callback', () => {
    const liste = createAbschnittListe('01.01.2024');

    assert.doesNotThrow(() => {
      liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));
    });
  });
});
