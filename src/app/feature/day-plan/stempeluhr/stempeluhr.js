import { Section } from '../../../model/Section.js';
import { Time } from '../../../model/Time.js';
import { persistence } from '../../../services/persistence.js';
import { icon } from '../../icons.js';

export function createStempeluhr(day, onStempelEreignis) {
  const el = document.createElement('div');
  el.className = 'stempeluhr-host';

  let startTime = persistence.loadStartTime(day);
  let isEdit = false;
  let hour = startTime?.hour ?? 0;
  let minute = startTime?.minute ?? 0;

  function render() {
    el.innerHTML = `
      <div class="stempeluhr">
        <div class="stempeluhr__row">
          <span class="stempeluhr__label">Eingestempelt um:</span>
          <div class="stempeluhr__value">
            ${
              !startTime
                ? '<i>noch nicht eingestempelt</i>'
                : isEdit
                  ? `<span class="stempeluhr__time-inputs">
                     <input type="number" min="0" max="23" value="${hour}" data-hour />
                     :
                     <input type="number" min="0" max="59" value="${minute}" data-minute />
                     <span data-action="finish">${icon('check')}</span>
                     <span data-action="abort">${icon('close')}</span>
                   </span>`
                  : `<span class="stempeluhr__time-display" data-testid="login-time">
                     ${startTime.formattedString()}
                     <span data-action="edit">${icon('edit')}</span>
                   </span>`
            }
          </div>
        </div>
        <div class="stempeluhr__actions">
          <span class="stempeluhr__label-placeholder" aria-hidden="true"></span>
          <button class="mat-button" data-testid="log-button">
            <span data-action>${!startTime ? icon('login') : icon('logout')}</span>
            ${!startTime ? 'Einstempeln' : 'Ausstempeln'}
          </button>
        </div>
      </div>`;
    bindEvents();
  }

  function bindEvents() {
    if (isEdit) {
      const hourInput = el.querySelector('[data-hour]');
      const minuteInput = el.querySelector('[data-minute]');
      if (hourInput) {
        hourInput.addEventListener('input', (e) => {
          hour = parseInt(e.target.value, 10) || 0;
        });
      }
      if (minuteInput) {
        minuteInput.addEventListener('input', (e) => {
          minute = parseInt(e.target.value, 10) || 0;
        });
      }
      el.querySelector('[data-action="finish"]')?.addEventListener(
        'click',
        () => {
          startTime = new Time(hour, minute);
          isEdit = false;
          persistence.saveStartTime(day, startTime);
          render();
        },
      );
      el.querySelector('[data-action="abort"]')?.addEventListener(
        'click',
        () => {
          isEdit = false;
          hour = startTime?.hour ?? 0;
          minute = startTime?.minute ?? 0;
          render();
        },
      );
    } else {
      el.querySelector('[data-action="edit"]')?.addEventListener(
        'click',
        () => {
          hour = startTime?.hour ?? 0;
          minute = startTime?.minute ?? 0;
          isEdit = true;
          render();
        },
      );
    }

    el.querySelector('[data-testid="log-button"]')?.addEventListener(
      'click',
      () => {
        if (!startTime) {
          startTime = Time.now();
          persistence.saveStartTime(day, startTime);
          render();
        } else {
          const section = new Section(startTime, Time.now());
          startTime = undefined;
          persistence.saveStartTime(day, startTime);
          if (onStempelEreignis) onStempelEreignis(section);
          render();
        }
      },
    );
  }

  function update(newDay) {
    day = newDay;
    startTime = persistence.loadStartTime(day);
    isEdit = false;
    hour = startTime?.hour ?? 0;
    minute = startTime?.minute ?? 0;
    render();
  }

  render();
  return { element: el, update };
}
