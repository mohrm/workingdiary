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

function fireInput(el: Element, selector: string, value: string): void {
  const target = el.querySelector(selector) as unknown as {
    dispatchEvent: (event: { type: string; target: unknown }) => void;
    value: string;
  };
  target.value = value;
  target.dispatchEvent({ type: 'input', target });
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

  it('shows Start/Ende/Arbeitsort column headers above the list', () => {
    const liste = createAbschnittListe('01.01.2024');

    assert.ok(liste.element.querySelector('.abschnitt-liste__header'));
    assert.ok(liste.element.innerHTML.includes('abschnitt-time-cell">Start<'));
    assert.ok(liste.element.innerHTML.includes('abschnitt-time-cell">Ende<'));
    assert.ok(
      liste.element.innerHTML.includes(
        'abschnitt-liste__header-location">Arbeitsort<',
      ),
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

  it('shows an undo affordance after deleting a section', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));

    assert.equal(
      liste.element.querySelector('[data-testid="undo-toast"]'),
      null,
    );

    fireClick(liste.element, '[data-action="delete"]');

    assert.ok(liste.element.querySelector('[data-testid="undo-toast"]'));
    assert.ok(liste.element.querySelector('[data-action="dismiss-undo"]'));
  });

  it('restores a deleted section with its original values on undo', () => {
    const onAbschnitteChange = mock.fn();
    const liste = createAbschnittListe('01.01.2024', onAbschnitteChange);
    liste.addAbschnitt(
      new Section(new Time(8, 0), new Time(9, 0), LOCATIONS.OFFICE),
    );

    fireClick(liste.element, '[data-action="delete"]');
    fireClick(liste.element, '[data-action="undo"]');

    assert.ok(liste.element.querySelector('[data-testid="section-0"]'));
    assert.equal(
      liste.element.querySelector('[data-testid="undo-toast"]'),
      null,
    );
    const sections = persistence.loadSections('01.01.2024');
    assert.equal(sections?.length, 1);
    assert.equal(sections?.[0].location, LOCATIONS.OFFICE);
    assert.equal(onAbschnitteChange.mock.callCount(), 3);
  });

  it('restores a deleted section at its original position', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));
    liste.addAbschnitt(new Section(new Time(9, 0), new Time(10, 0)));
    liste.addAbschnitt(new Section(new Time(10, 0), new Time(11, 0)));

    const middle = liste.element.querySelector('[data-testid="section-1"]');
    assert.ok(middle);
    fireClick(middle, '[data-action="delete"]');
    fireClick(liste.element, '[data-action="undo"]');

    const sections = persistence.loadSections('01.01.2024');
    assert.equal(sections?.length, 3);
    assert.equal(sections?.[1].startTime.hour, 9);
    assert.equal(sections?.[1].endTime.hour, 10);
  });

  it('undo keeps the section currently being edited in edit mode', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));
    liste.addAbschnitt(new Section(new Time(9, 0), new Time(10, 0)));

    const second = liste.element.querySelector('[data-testid="section-1"]');
    assert.ok(second);
    fireClick(second, '[data-action="edit"]');

    const first = liste.element.querySelector('[data-testid="section-0"]');
    assert.ok(first);
    fireClick(first, '[data-action="delete"]');
    fireClick(liste.element, '[data-action="undo"]');

    assert.ok(
      liste.element
        .querySelector('[data-testid="section-1"]')
        ?.querySelector('input[data-start-hour]'),
    );
  });

  it('dismisses the undo toast without restoring the section', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));

    fireClick(liste.element, '[data-action="delete"]');
    fireClick(liste.element, '[data-action="dismiss-undo"]');

    assert.equal(
      liste.element.querySelector('[data-testid="undo-toast"]'),
      null,
    );
    assert.equal(persistence.loadSections('01.01.2024')?.length, 0);
  });

  it('hides the undo affordance when a new section is added', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));

    fireClick(liste.element, '[data-action="delete"]');
    liste.addAbschnitt(new Section(new Time(10, 0), new Time(11, 0)));

    assert.equal(
      liste.element.querySelector('[data-testid="undo-toast"]'),
      null,
    );
  });

  it('hides the undo affordance after an edit is saved', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));
    liste.addAbschnitt(new Section(new Time(9, 0), new Time(10, 0)));

    fireClick(liste.element, '[data-action="delete"]');
    fireClick(liste.element, '[data-action="edit"]');
    fireClick(liste.element, '[data-action="finish"]');

    assert.equal(
      liste.element.querySelector('[data-testid="undo-toast"]'),
      null,
    );
  });

  it('hides the undo affordance when switching days', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));

    fireClick(liste.element, '[data-action="delete"]');
    liste.update('02.01.2024');

    assert.equal(
      liste.element.querySelector('[data-testid="undo-toast"]'),
      null,
    );
  });

  it('blocks saving an edited section whose end is before its start', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));
    liste.addAbschnitt(new Section(new Time(9, 0), new Time(10, 0)));

    fireClick(liste.element, '[data-action="edit"]');
    fireInput(liste.element, '[data-end-hour]', '7');
    fireInput(liste.element, '[data-end-minute]', '30');
    fireClick(liste.element, '[data-action="finish"]');

    assert.ok(liste.element.querySelector('[data-testid="validation-toast"]'));
    assert.ok(
      liste.element.innerHTML.includes(
        'Die Enduhrzeit darf nicht vor der Startuhrzeit liegen',
      ),
    );
    assert.ok(
      liste.element
        .querySelector('[data-testid="section-0"]')
        ?.querySelector('input[data-start-hour]'),
    );
    const sections = persistence.loadSections('01.01.2024');
    assert.equal(sections?.[0].endTime.hour, 9);
  });

  it('blocks saving an edited section that overlaps another section', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));
    liste.addAbschnitt(new Section(new Time(9, 0), new Time(10, 0)));

    const second = liste.element.querySelector('[data-testid="section-1"]');
    assert.ok(second);
    fireClick(second, '[data-action="edit"]');
    const secondEditing = liste.element.querySelector(
      '[data-testid="section-1"]',
    );
    assert.ok(secondEditing);
    fireInput(secondEditing, '[data-start-hour]', '8');
    fireInput(secondEditing, '[data-start-minute]', '30');
    fireClick(secondEditing, '[data-action="finish"]');

    assert.ok(liste.element.querySelector('[data-testid="validation-toast"]'));
    const sections = persistence.loadSections('01.01.2024');
    assert.equal(sections?.[1].startTime.hour, 9);
  });

  it('allows saving an edited section that only touches another section', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));
    liste.addAbschnitt(new Section(new Time(9, 0), new Time(10, 0)));

    fireClick(liste.element, '[data-action="edit"]');
    fireInput(liste.element, '[data-start-hour]', '9');
    fireInput(liste.element, '[data-start-minute]', '0');
    fireClick(liste.element, '[data-action="finish"]');

    assert.equal(
      liste.element.querySelector('[data-testid="validation-toast"]'),
      null,
    );
    assert.equal(persistence.loadSections('01.01.2024')?.length, 2);
  });

  it('dismisses the validation toast without changing anything', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));

    fireClick(liste.element, '[data-action="edit"]');
    fireInput(liste.element, '[data-end-hour]', '7');
    fireClick(liste.element, '[data-action="finish"]');
    assert.ok(liste.element.querySelector('[data-testid="validation-toast"]'));

    fireClick(liste.element, '[data-action="dismiss-validation"]');

    assert.equal(
      liste.element.querySelector('[data-testid="validation-toast"]'),
      null,
    );
    assert.ok(liste.element.querySelector('input[data-start-hour]'));
  });

  it('clears the validation toast after a successful save', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(new Section(new Time(8, 0), new Time(9, 0)));

    fireClick(liste.element, '[data-action="edit"]');
    fireInput(liste.element, '[data-end-hour]', '7');
    fireClick(liste.element, '[data-action="finish"]');
    assert.ok(liste.element.querySelector('[data-testid="validation-toast"]'));

    fireInput(liste.element, '[data-end-hour]', '10');
    fireClick(liste.element, '[data-action="finish"]');

    assert.equal(
      liste.element.querySelector('[data-testid="validation-toast"]'),
      null,
    );
    const sections = persistence.loadSections('01.01.2024');
    assert.equal(sections?.[0].endTime.hour, 10);
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

    assert.ok(liste.element.querySelector('input[data-start-hour]'));

    fireClick(liste.element, '[data-action="finish"]');

    assert.equal(liste.element.querySelector('input[data-start-hour]'), null);
    assert.equal(onAbschnitteChange.mock.callCount(), 2);
  });

  it('deleting the section currently being edited leaves the next new section out of edit mode', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(
      new Section(new Time(8, 0), new Time(9, 0), LOCATIONS.OFFICE),
    );

    fireClick(liste.element, '[data-action="edit"]');
    assert.ok(liste.element.querySelector('input[data-start-hour]'));

    fireClick(liste.element, '[data-action="delete"]');
    liste.addAbschnitt(new Section(new Time(10, 0), new Time(11, 0)));

    assert.equal(liste.element.querySelector('input[data-start-hour]'), null);
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
        ?.querySelector('input[data-start-hour]'),
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
        ?.querySelector('input[data-start-hour]'),
    );
  });

  it('aborting an edit leaves the section unchanged and closes edit mode', () => {
    const liste = createAbschnittListe('01.01.2024');
    liste.addAbschnitt(
      new Section(new Time(8, 0), new Time(9, 0), LOCATIONS.OFFICE),
    );

    fireClick(liste.element, '[data-action="edit"]');
    fireClick(liste.element, '[data-action="abort"]');

    assert.equal(liste.element.querySelector('input[data-start-hour]'), null);
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
