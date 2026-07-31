import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import { LOCATIONS } from '../../../model/locations';
import { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';
import { installFakeDocument } from '../../../test-utils';
import { createAbschnitt } from './abschnitt';

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

function fireChange(el: Element, selector: string, value: string): void {
  const select = el.querySelector(selector) as unknown as FakeInputLike;
  select.value = value;
  select.dispatchEvent({ type: 'change' });
}

describe('Abschnitt', () => {
  beforeEach(() => {
    installFakeDocument();
  });

  it('renders the formatted section and an edit action when not editing', () => {
    const section = new Section(
      new Time(8, 0),
      new Time(12, 0),
      LOCATIONS.OFFICE,
    );
    const abschnitt = createAbschnitt(section, undefined, false, undefined);

    assert.ok(abschnitt.element.innerHTML.includes('08:00 - 12:00'));
    assert.ok(abschnitt.element.querySelector('[data-action="edit"]'));
  });

  it('renders an empty string when there is no section and not editing', () => {
    const abschnitt = createAbschnitt(undefined, undefined, false, undefined);

    assert.ok(abschnitt.element.querySelector('[data-action="edit"]'));
  });

  it('switches to edit mode and resets fields from the section on edit', () => {
    const section = new Section(
      new Time(8, 30),
      new Time(12, 15),
      LOCATIONS.MOBILE,
    );
    let editState: boolean | undefined;
    const abschnitt = createAbschnitt(section, undefined, false, (isEdit) => {
      editState = isEdit;
    });

    fireClick(abschnitt.element, '[data-action="edit"]');

    assert.equal(editState, true);
  });

  it('renders time inputs and the location select when editing', () => {
    const section = new Section(
      new Time(8, 0),
      new Time(12, 0),
      LOCATIONS.OFFICE,
    );
    const abschnitt = createAbschnitt(section, undefined, true, undefined);

    assert.ok(abschnitt.element.querySelector('[data-start-hour]'));
    assert.ok(abschnitt.element.querySelector('[data-start-minute]'));
    assert.ok(abschnitt.element.querySelector('[data-end-hour]'));
    assert.ok(abschnitt.element.querySelector('[data-end-minute]'));
    assert.ok(abschnitt.element.querySelector('[data-location]'));
    assert.ok(abschnitt.element.querySelector('[data-action="finish"]'));
    assert.ok(abschnitt.element.querySelector('[data-action="abort"]'));
  });

  it('defaults time fields to 0 when there is no section while editing', () => {
    const abschnitt = createAbschnitt(undefined, undefined, true, undefined);

    assert.ok(abschnitt.element.innerHTML.includes('value="0"'));
  });

  it('tracks input changes and commits a new section on finish', () => {
    const section = new Section(
      new Time(8, 0),
      new Time(12, 0),
      LOCATIONS.OFFICE,
    );
    const onSectionChange = mock.fn();
    const onIsEditChange = mock.fn();
    const abschnitt = createAbschnitt(
      section,
      onSectionChange,
      true,
      onIsEditChange,
    );

    fireInput(abschnitt.element, '[data-start-hour]', '9');
    fireInput(abschnitt.element, '[data-start-minute]', '15');
    fireInput(abschnitt.element, '[data-end-hour]', '17');
    fireInput(abschnitt.element, '[data-end-minute]', '45');
    fireChange(abschnitt.element, '[data-location]', LOCATIONS.MOBILE);

    fireClick(abschnitt.element, '[data-action="finish"]');

    assert.equal(onSectionChange.mock.callCount(), 1);
    const newSection = onSectionChange.mock.calls[0].arguments[0] as Section;
    assert.equal(newSection.startTime.hour, 9);
    assert.equal(newSection.startTime.minute, 15);
    assert.equal(newSection.endTime.hour, 17);
    assert.equal(newSection.endTime.minute, 45);
    assert.equal(newSection.location, LOCATIONS.MOBILE);
    assert.equal(onIsEditChange.mock.callCount(), 1);
    assert.equal(onIsEditChange.mock.calls[0].arguments[0], false);
  });

  it('falls back to 0 when an input is not a number', () => {
    const section = new Section(
      new Time(8, 0),
      new Time(12, 0),
      LOCATIONS.OFFICE,
    );
    const onSectionChange = mock.fn();
    const abschnitt = createAbschnitt(
      section,
      onSectionChange,
      true,
      undefined,
    );

    fireInput(abschnitt.element, '[data-start-hour]', 'not-a-number');
    fireClick(abschnitt.element, '[data-action="finish"]');

    const newSection = onSectionChange.mock.calls[0].arguments[0] as Section;
    assert.equal(newSection.startTime.hour, 0);
  });

  it('discards changes and leaves edit mode on abort', () => {
    const section = new Section(
      new Time(8, 0),
      new Time(12, 0),
      LOCATIONS.OFFICE,
    );
    const onIsEditChange = mock.fn();
    const abschnitt = createAbschnitt(section, undefined, true, onIsEditChange);

    fireClick(abschnitt.element, '[data-action="abort"]');

    assert.equal(onIsEditChange.mock.callCount(), 1);
    assert.equal(onIsEditChange.mock.calls[0].arguments[0], false);
  });

  it('does nothing when finish/abort/edit callbacks are not provided', () => {
    const section = new Section(
      new Time(8, 0),
      new Time(12, 0),
      LOCATIONS.OFFICE,
    );
    const abschnitt = createAbschnitt(section, undefined, true, undefined);

    assert.doesNotThrow(() => {
      fireClick(abschnitt.element, '[data-action="finish"]');
      fireClick(abschnitt.element, '[data-action="abort"]');
    });

    const nonEditAbschnitt = createAbschnitt(
      section,
      undefined,
      false,
      undefined,
    );
    assert.doesNotThrow(() => {
      fireClick(nonEditAbschnitt.element, '[data-action="edit"]');
    });
  });

  it('marks the mobil option as selected when the section is mobil', () => {
    const section = new Section(
      new Time(8, 0),
      new Time(12, 0),
      LOCATIONS.MOBILE,
    );
    const abschnitt = createAbschnitt(section, undefined, true, undefined);

    const mobilOption = abschnitt.element.innerHTML
      .split('\n')
      .find((line) => line.includes(`value="${LOCATIONS.MOBILE}"`));

    assert.ok(mobilOption?.includes('selected'));
  });

  it('update() re-renders reflecting the new edit state', () => {
    const abschnitt = createAbschnitt(undefined, undefined, false, undefined);
    const section = new Section(
      new Time(1, 2),
      new Time(3, 4),
      LOCATIONS.UNASSIGNED,
    );

    assert.equal(abschnitt.element.querySelector('[data-start-hour]'), null);

    abschnitt.update(section, true);

    assert.ok(abschnitt.element.querySelector('[data-start-hour]'));

    abschnitt.update(section, false);

    assert.ok(abschnitt.element.innerHTML.includes('01:02 - 03:04'));
  });
});
