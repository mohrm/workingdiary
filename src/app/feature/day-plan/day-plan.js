import { createStempeluhr } from './stempeluhr/stempeluhr.js';
import { createAbschnittListe } from './abschnitt-liste/abschnitt-liste.js';

export function createDayPlan(day, onAbschnitteChange) {
  const el = document.createElement('section');
  el.className = 'day-plan';

  let stempelEreignisCallback;
  let stempeluhr;
  let abschnittListe;

  function render() {
    el.innerHTML = `
      <header class="day-plan__header">
        <h1 data-testid="dayplan-title">Tagesplan für den ${day}</h1>
      </header>
      <div class="day-plan__clock" data-stempeluhr></div>
      <div class="day-plan__list" data-abschnitt-liste></div>`;

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
    el.querySelector('[data-abschnitt-liste]').appendChild(abschnittListe.element);
  }

  function update(newDay) {
    day = newDay;
    stempeluhr?.update(newDay);
    abschnittListe?.update(newDay);
  }

  render();
  return { element: el, update };
}
