import type { Component } from '../../component';
import type { Section } from '../../model/Section';
import {
  type AbschnittListeComponent,
  createAbschnittListe,
} from './abschnitt-liste/abschnitt-liste';
import {
  createStempeluhr,
  type StempeluhrComponent,
} from './stempeluhr/stempeluhr';

export interface DayPlanComponent extends Component {
  update: (day: string) => void;
}

export function createDayPlan(
  day: string,
  onAbschnitteChange?: (sections: Section[]) => void,
): DayPlanComponent {
  const el = document.createElement('section');
  el.className = 'day-plan';

  let stempeluhr: StempeluhrComponent | undefined;
  let abschnittListe: AbschnittListeComponent | undefined;

  function render() {
    el.innerHTML = `
      <header class="day-plan__header">
        <h1 data-testid="dayplan-title"></h1>
      </header>
      <div class="day-plan__clock" data-stempeluhr></div>
      <div class="day-plan__list" data-abschnitt-liste></div>`;

    el.querySelector('[data-testid="dayplan-title"]')!.textContent =
      `Tagesplan für den ${day}`;

    abschnittListe = createAbschnittListe(day, onAbschnitteChange);
    stempeluhr = createStempeluhr(day, (section) =>
      abschnittListe!.addAbschnitt(section),
    );

    el.querySelector('[data-stempeluhr]')!.appendChild(stempeluhr.element);
    el.querySelector('[data-abschnitt-liste]')!.appendChild(
      abschnittListe.element,
    );
  }

  function update(newDay: string): void {
    day = newDay;
    el.querySelector('[data-testid="dayplan-title"]')!.textContent =
      `Tagesplan für den ${day}`;
    stempeluhr?.update(newDay);
    abschnittListe?.update(newDay);
  }

  render();
  return { element: el, update };
}
