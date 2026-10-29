import type { Component } from '../../component';
import { viewUrl } from '../../model/routing';
import type { Section } from '../../model/Section';
import { icon } from '../icons';
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
  onOpenZeitVerteilung?: () => void,
): DayPlanComponent {
  const el = document.createElement('section');
  el.className = 'day-plan';

  let stempeluhr: StempeluhrComponent | undefined;
  let abschnittListe: AbschnittListeComponent | undefined;

  function render() {
    el.innerHTML = `
      <header class="day-plan__header">
        <h1 data-testid="dayplan-title"></h1>
        <a class="day-plan__verteilung-link mat-button" data-testid="open-zeitverteilung" href="${viewUrl(day, 'zeit-verteilung')}" title="Zeit verteilen" aria-label="Zeitverteilung öffnen">${icon('chart')}</a>
      </header>`;

    el.querySelector('[data-testid="open-zeitverteilung"]')?.addEventListener(
      'click',
      (e) => {
        if (!onOpenZeitVerteilung) return;
        e.preventDefault();
        onOpenZeitVerteilung();
      },
    );

    el.querySelector('[data-testid="dayplan-title"]')!.textContent =
      `Tagesplan für den ${day}`;

    abschnittListe = createAbschnittListe(day, onAbschnitteChange);
    stempeluhr = createStempeluhr(day, (section) =>
      abschnittListe!.addAbschnitt(section),
    );

    stempeluhr.element.classList.add('day-plan__clock');
    abschnittListe.element.classList.add('day-plan__list');

    el.appendChild(stempeluhr.element);
    el.appendChild(abschnittListe.element);
  }

  function update(newDay: string): void {
    day = newDay;
    el.querySelector('[data-testid="dayplan-title"]')!.textContent =
      `Tagesplan für den ${day}`;
    const verteilungsLink = el.querySelector<HTMLAnchorElement>(
      '[data-testid="open-zeitverteilung"]',
    );
    if (verteilungsLink) {
      verteilungsLink.href = viewUrl(day, 'zeit-verteilung');
    }
    stempeluhr?.update(newDay);
    abschnittListe?.update(newDay);
  }

  render();
  return { element: el, update };
}
