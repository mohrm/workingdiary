import type { Component } from '../../../component';
import {
  LOCATION_LABELS,
  LOCATIONS,
  type Location,
} from '../../../model/locations';
import { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';
import { bindActions } from '../../../util/bind-actions';
import { icon } from '../../icons';

export interface AbschnittComponent extends Component {
  update: (section: Section | undefined, isEdit: boolean) => void;
}

export function createAbschnitt(
  section: Section | undefined,
  onSectionChange: ((section: Section) => void) | undefined,
  isEdit: boolean,
  onIsEditChange: ((isEdit: boolean) => void) | undefined,
  onDelete: (() => void) | undefined,
): AbschnittComponent {
  const el = document.createElement('div');
  el.className = 'abschnitt-host';

  let startHour = section?.startTime?.hour ?? 0;
  let startMinute = section?.startTime?.minute ?? 0;
  let endHour = section?.endTime?.hour ?? 0;
  let endMinute = section?.endTime?.minute ?? 0;
  let location: Location = section?.location ?? LOCATIONS.UNASSIGNED;

  function renderTimeCell(
    value: number,
    dataAttr: string,
    max: number,
  ): string {
    if (isEdit) {
      return `<input class="abschnitt-time-cell" type="number" min="0" max="${max}" value="${value}" ${dataAttr} />`;
    }
    return `<span class="abschnitt-time-cell" ${dataAttr}>${value.toString().padStart(2, '0')}</span>`;
  }

  function renderLocationCell(): string {
    if (isEdit) {
      return `
        <select class="abschnitt-location-cell" data-location>
          <option value="${LOCATIONS.UNASSIGNED}" ${location === LOCATIONS.UNASSIGNED ? 'selected' : ''}>${LOCATION_LABELS[LOCATIONS.UNASSIGNED]}</option>
          <option value="${LOCATIONS.OFFICE}" ${location === LOCATIONS.OFFICE ? 'selected' : ''}>${LOCATION_LABELS[LOCATIONS.OFFICE]}</option>
          <option value="${LOCATIONS.MOBILE}" ${location === LOCATIONS.MOBILE ? 'selected' : ''}>${LOCATION_LABELS[LOCATIONS.MOBILE]}</option>
        </select>`;
    }
    return `<span class="abschnitt-location-cell" data-location>${LOCATION_LABELS[location]}</span>`;
  }

  function renderIconZone(): string {
    if (isEdit) {
      return `
        <div class="abschnitt-icon-zone">
          <span data-action="abort">${icon('close')}</span>
          <span data-action="finish">${icon('check')}</span>
          <span data-action="delete">${icon('delete')}</span>
        </div>`;
    }
    return `
      <div class="abschnitt-icon-zone">
        <span data-action="edit">${icon('edit')}</span>
        <span data-action="delete">${icon('delete')}</span>
      </div>`;
  }

  function render() {
    el.classList.toggle('abschnitt-edit', isEdit);
    // The time-range cells are concatenated with no whitespace between them
    // so the rendered text reads as "08:00 - 09:00" with no stray gaps
    // around the colons/dash (a real browser turns template-literal
    // whitespace between inline elements into visible text/layout gaps).
    const timeRange =
      renderTimeCell(startHour, 'data-start-hour', 23) +
      '<span class="abschnitt-time-sep">:</span>' +
      renderTimeCell(startMinute, 'data-start-minute', 59) +
      '<span class="abschnitt-time-sep abschnitt-time-sep--range"> - </span>' +
      renderTimeCell(endHour, 'data-end-hour', 23) +
      '<span class="abschnitt-time-sep">:</span>' +
      renderTimeCell(endMinute, 'data-end-minute', 59);
    el.innerHTML = `
      <div class="abschnitt-row">
        <div class="abschnitt-time-range">${timeRange}</div>
        ${renderLocationCell()}
        ${renderIconZone()}
      </div>`;
    bindEvents();
  }

  function bindEvents() {
    if (isEdit) {
      el.querySelector<HTMLInputElement>('[data-start-hour]')?.addEventListener(
        'input',
        (e) => {
          startHour = parseInt((e.target as HTMLInputElement).value, 10) || 0;
        },
      );
      el.querySelector<HTMLInputElement>(
        '[data-start-minute]',
      )?.addEventListener('input', (e) => {
        startMinute = parseInt((e.target as HTMLInputElement).value, 10) || 0;
      });
      el.querySelector<HTMLInputElement>('[data-end-hour]')?.addEventListener(
        'input',
        (e) => {
          endHour = parseInt((e.target as HTMLInputElement).value, 10) || 0;
        },
      );
      el.querySelector<HTMLInputElement>('[data-end-minute]')?.addEventListener(
        'input',
        (e) => {
          endMinute = parseInt((e.target as HTMLInputElement).value, 10) || 0;
        },
      );
      el.querySelector<HTMLSelectElement>('[data-location]')?.addEventListener(
        'change',
        (e) => {
          location = (e.target as HTMLSelectElement).value as Location;
        },
      );
      bindActions(el, {
        finish: () => {
          const newStart = new Time(startHour, startMinute);
          const newEnd = new Time(endHour, endMinute);
          const newSection = new Section(newStart, newEnd, location);
          if (onSectionChange) onSectionChange(newSection);
          if (onIsEditChange) onIsEditChange(false);
        },
        abort: () => {
          if (onIsEditChange) onIsEditChange(false);
        },
        delete: () => {
          if (onDelete) onDelete();
        },
      });
    } else {
      bindActions(el, {
        edit: () => {
          startHour = section?.startTime?.hour ?? 0;
          startMinute = section?.startTime?.minute ?? 0;
          endHour = section?.endTime?.hour ?? 0;
          endMinute = section?.endTime?.minute ?? 0;
          location = section?.location ?? LOCATIONS.UNASSIGNED;
          if (onIsEditChange) onIsEditChange(true);
        },
        delete: () => {
          if (onDelete) onDelete();
        },
      });
    }
  }

  function update(newSection: Section | undefined, newIsEdit: boolean): void {
    section = newSection;
    isEdit = newIsEdit;
    startHour = section?.startTime?.hour ?? 0;
    startMinute = section?.startTime?.minute ?? 0;
    endHour = section?.endTime?.hour ?? 0;
    endMinute = section?.endTime?.minute ?? 0;
    location = section?.location ?? LOCATIONS.UNASSIGNED;
    render();
  }

  render();
  return { element: el, update };
}
