import { LOCATIONS } from '../../../model/locations.js';
import { Section } from '../../../model/Section.js';
import { Time } from '../../../model/Time.js';
import { bindActions } from '../../../util/bind-actions.js';
import { icon } from '../../icons.js';

export function createAbschnitt(
  section,
  onSectionChange,
  isEdit,
  onIsEditChange,
) {
  const el = document.createElement('div');
  el.className = 'abschnitt-host';

  let startHour = section?.startTime?.hour ?? 0;
  let startMinute = section?.startTime?.minute ?? 0;
  let endHour = section?.endTime?.hour ?? 0;
  let endMinute = section?.endTime?.minute ?? 0;
  let location = section?.location ?? LOCATIONS.UNASSIGNED;

  function render() {
    if (isEdit) {
      el.innerHTML = `
        <div class="abschnitt-edit">
          <div class="time-inputs">
            <input type="number" min="0" max="23" value="${startHour}" data-start-hour />
            <input type="number" min="0" max="59" value="${startMinute}" data-start-minute />
            -
            <input type="number" min="0" max="23" value="${endHour}" data-end-hour />
            <input type="number" min="0" max="59" value="${endMinute}" data-end-minute />
          </div>
          <div class="actions">
            <select data-location>
              <option value="${LOCATIONS.UNASSIGNED}" ${location === LOCATIONS.UNASSIGNED ? 'selected' : ''}>${LOCATIONS.UNASSIGNED}</option>
              <option value="${LOCATIONS.OFFICE}" ${location === LOCATIONS.OFFICE ? 'selected' : ''}>${LOCATIONS.OFFICE}</option>
              <option value="${LOCATIONS.MOBILE}" ${location === LOCATIONS.MOBILE ? 'selected' : ''}>${LOCATIONS.MOBILE}</option>
            </select>
            <div class="icon-actions">
              <span data-action="finish">${icon('check')}</span>
              <span data-action="abort">${icon('close')}</span>
            </div>
          </div>
        </div>`;
    } else {
      el.innerHTML = `
        ${section ? section.formattedString() : ''}
        <span data-action="edit">${icon('edit')}</span>`;
    }
    bindEvents();
  }

  function bindEvents() {
    if (isEdit) {
      el.querySelector('[data-start-hour]')?.addEventListener('input', (e) => {
        startHour = parseInt(e.target.value, 10) || 0;
      });
      el.querySelector('[data-start-minute]')?.addEventListener(
        'input',
        (e) => {
          startMinute = parseInt(e.target.value, 10) || 0;
        },
      );
      el.querySelector('[data-end-hour]')?.addEventListener('input', (e) => {
        endHour = parseInt(e.target.value, 10) || 0;
      });
      el.querySelector('[data-end-minute]')?.addEventListener('input', (e) => {
        endMinute = parseInt(e.target.value, 10) || 0;
      });
      el.querySelector('[data-location]')?.addEventListener('change', (e) => {
        location = e.target.value;
      });
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
      });
    }
  }

  function update(newSection, newIsEdit) {
    section = newSection;
    isEdit = newIsEdit;
    render();
  }

  render();
  return { element: el, update };
}
