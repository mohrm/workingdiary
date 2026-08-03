import type { Component } from '../../../component';
import { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';
import { persistence } from '../../../services/persistence';
import { bindActions } from '../../../util/bind-actions';
import { icon } from '../../icons';

export interface StempeluhrComponent extends Component {
  update: (day: string) => void;
}

export function createStempeluhr(
  day: string,
  onStempelEreignis?: (section: Section) => void,
): StempeluhrComponent {
  const el = document.createElement('div');
  el.className = 'stempeluhr';

  let startTime = persistence.loadStartTime(day);
  let isEdit = false;
  let hour = startTime?.hour ?? 0;
  let minute = startTime?.minute ?? 0;

  function renderStempelValue(): string {
    if (!startTime) {
      return '<i class="stempeluhr__placeholder">noch nicht eingestempelt</i>';
    }
    if (isEdit) {
      return `<span class="stempeluhr__time-inputs">
                 <input type="number" min="0" max="23" value="${hour}" data-hour />
                 :
                 <input type="number" min="0" max="59" value="${minute}" data-minute />
                 <span data-action="finish">${icon('check')}</span>
                 <span data-action="abort">${icon('close')}</span>
               </span>`;
    }
    return `<span class="stempeluhr__time-display" data-testid="login-time">
               ${startTime.formattedString()}
               <span data-action="edit">${icon('edit')}</span>
             </span>`;
  }

  function render() {
    el.innerHTML = `
      <span class="stempeluhr__label">Eingestempelt um:</span>
      <div class="stempeluhr__value">${renderStempelValue()}</div>
      <button class="mat-button stempeluhr__button" data-testid="log-button">
        <span data-action>${!startTime ? icon('login') : icon('logout')}</span>
        <span class="stempeluhr__button-label">${!startTime ? 'Einstempeln' : 'Ausstempeln'}</span>
      </button>`;
    bindEvents();
  }

  function bindEvents() {
    if (isEdit) {
      const hourInput = el.querySelector<HTMLInputElement>('[data-hour]');
      const minuteInput = el.querySelector<HTMLInputElement>('[data-minute]');
      if (hourInput) {
        hourInput.addEventListener('input', (e) => {
          hour = parseInt((e.target as HTMLInputElement).value, 10) || 0;
        });
      }
      if (minuteInput) {
        minuteInput.addEventListener('input', (e) => {
          minute = parseInt((e.target as HTMLInputElement).value, 10) || 0;
        });
      }
      bindActions(el, {
        finish: () => {
          startTime = new Time(hour, minute);
          isEdit = false;
          persistence.saveStartTime(day, startTime);
          render();
        },
        abort: () => {
          isEdit = false;
          hour = startTime?.hour ?? 0;
          minute = startTime?.minute ?? 0;
          render();
        },
      });
    } else {
      bindActions(el, {
        edit: () => {
          hour = startTime?.hour ?? 0;
          minute = startTime?.minute ?? 0;
          isEdit = true;
          render();
        },
      });
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

  function update(newDay: string): void {
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
