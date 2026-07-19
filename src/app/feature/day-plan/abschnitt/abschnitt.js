import { Section } from '../../../model/Section.js';
import { Time } from '../../../model/Time.js';
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
  let location = section?.location ?? 'nicht zugeordnet';

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
              <option value="nicht zugeordnet" ${location === 'nicht zugeordnet' ? 'selected' : ''}>nicht zugeordnet</option>
              <option value="Büro" ${location === 'Büro' ? 'selected' : ''}>Büro</option>
              <option value="mobil" ${location === 'mobil' ? 'selected' : ''}>mobil</option>
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
      el.querySelector('[data-action="finish"]')?.addEventListener(
        'click',
        () => {
          const newStart = new Time(startHour, startMinute);
          const newEnd = new Time(endHour, endMinute);
          const newSection = new Section(newStart, newEnd, location);
          if (onSectionChange) onSectionChange(newSection);
          if (onIsEditChange) onIsEditChange(false);
        },
      );
      el.querySelector('[data-action="abort"]')?.addEventListener(
        'click',
        () => {
          if (onIsEditChange) onIsEditChange(false);
        },
      );
    } else {
      el.querySelector('[data-action="edit"]')?.addEventListener(
        'click',
        () => {
          startHour = section?.startTime?.hour ?? 0;
          startMinute = section?.startTime?.minute ?? 0;
          endHour = section?.endTime?.hour ?? 0;
          endMinute = section?.endTime?.minute ?? 0;
          location = section?.location ?? 'nicht zugeordnet';
          if (onIsEditChange) onIsEditChange(true);
        },
      );
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
