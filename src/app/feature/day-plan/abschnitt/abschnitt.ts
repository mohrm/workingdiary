import type { Component } from '../../../component';
import { LOCATIONS, type Location } from '../../../model/locations';
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

  function render() {
    el.classList.toggle('abschnitt-edit', isEdit);
    if (isEdit) {
      el.innerHTML = `
        <div class="time-inputs">
          <input type="number" min="0" max="23" value="${startHour}" data-start-hour />
          <input type="number" min="0" max="59" value="${startMinute}" data-start-minute />
          -
          <input type="number" min="0" max="23" value="${endHour}" data-end-hour />
          <input type="number" min="0" max="59" value="${endMinute}" data-end-minute />
        </div>
        <div class="actions">
          <select data-location>
            <option value="${LOCATIONS.UNASSIGNED}" ${location === LOCATIONS.UNASSIGNED ? 'selected' : ''}>kein</option>
            <option value="${LOCATIONS.OFFICE}" ${location === LOCATIONS.OFFICE ? 'selected' : ''}>${LOCATIONS.OFFICE}</option>
            <option value="${LOCATIONS.MOBILE}" ${location === LOCATIONS.MOBILE ? 'selected' : ''}>${LOCATIONS.MOBILE}</option>
          </select>
          <div class="icon-actions">
            <span data-action="finish">${icon('check')}</span>
            <span data-action="abort">${icon('close')}</span>
            <span data-action="delete">${icon('delete')}</span>
          </div>
        </div>`;
    } else {
      el.innerHTML = `
        ${section ? section.formattedString() : ''}
        <span class="abschnitt-actions">
          <span data-action="edit">${icon('edit')}</span>
          <span data-action="delete">${icon('delete')}</span>
        </span>`;
    }
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
    render();
  }

  render();
  return { element: el, update };
}
