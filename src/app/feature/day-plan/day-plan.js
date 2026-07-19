import { createAbschnittListe } from './abschnitt-liste/abschnitt-liste.js';
import { createStempeluhr } from './stempeluhr/stempeluhr.js';

export function createDayPlan(day, _onAbschnitteChange) {
  const el = document.createElement('section');
  el.className = 'day-plan';

  let stempelEreignisCallback;
  let stempeluhr;
  let abschnittListe;

  function render() {
    el.innerHTML = `
      <header class="day-plan__header">
        <h1 data-testid="dayplan-title"></h1>
      </header>
      <div class="day-plan__clock" data-stempeluhr></div>
      <div class="day-plan__list" data-abschnitt-liste></div>`;

    el.querySelector('[data-testid="dayplan-title"]').textContent =
      `Tagesplan für den ${day}`;

    stempeluhr = createStempeluhr(day, (section) => {
      if (stempelEreignisCallback) {
        stempelEreignisCallback(section);
      }
    });

    stempelEreignisCallback = null;
    abschnittListe = createAbschnittListe(day, (handleStempel) => {
      stempelEreignisCallback = handleStempel;
    });

    el.querySelector('[data-stempeluhr]').appendChild(stempeluhr.element);
    el.querySelector('[data-abschnitt-liste]').appendChild(
      abschnittListe.element,
    );
  }

  function update(newDay) {
    day = newDay;
    el.querySelector('[data-testid="dayplan-title"]').textContent =
      `Tagesplan für den ${day}`;
    stempeluhr?.update(newDay);
    abschnittListe?.update(newDay);
  }

  render();
  return { element: el, update };
}
