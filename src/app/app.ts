import type { Component } from './component';
import {
  type AbschnittSummeComponent,
  createAbschnittSumme,
} from './feature/day-plan/abschnitt-summe/abschnitt-summe';
import {
  createDayPlan,
  type DayPlanComponent,
} from './feature/day-plan/day-plan';
import { createDownloadPlans } from './feature/download-plans/download-plans';
import { createVersionInfo } from './feature/version-info/version-info';
import {
  createZeitVerteilung,
  type ZeitVerteilungComponent,
} from './feature/zeit-verteilung/zeit-verteilung';
import { type AppView, dayUrl, getViewFromURL, viewUrl } from './model/routing';
import { persistence } from './services/persistence';

function today(): string {
  return new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getDayFromURL(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('day') ?? today();
}

function navigate(day: string, view: AppView = 'day-plan'): void {
  history.pushState({ day }, '', viewUrl(day, view));
}

export interface AppComponent extends Component {
  update: () => void;
}

export function createApp(): AppComponent {
  const el = document.createElement('div');
  el.className = 'app-shell';

  let day = getDayFromURL();
  let view: AppView = getViewFromURL();
  let dayPlan: DayPlanComponent | undefined;
  let zeitVerteilung: ZeitVerteilungComponent | undefined;
  let abschnittSumme: AbschnittSummeComponent | undefined;
  let downloadPlans: Component | undefined;
  let versionInfo: Component | undefined;

  function render() {
    el.innerHTML = `
      <main class="app-main" data-view></main>
      <div class="app-bottom">
        <div class="app-summary" data-abschnitt-summe></div>
        <section class="app-navigation">
          <div class="app-navigation__row">
            <a class="app-navigation__link" data-prev-link href="#">Zurück</a>
            <div class="app-navigation__spacer"></div>
            <a class="app-navigation__link" data-next-link href="#">Vor</a>
          </div>
        </section>
      </div>`;

    downloadPlans = createDownloadPlans();
    versionInfo = createVersionInfo();

    const viewHost = el.querySelector('[data-view]')!;
    if (view === 'zeit-verteilung') {
      zeitVerteilung = createZeitVerteilung(day, oeffneTagesplan);
      viewHost.appendChild(zeitVerteilung.element);
    } else {
      dayPlan = createDayPlan(
        day,
        () => abschnittSumme?.update(day),
        oeffneZeitVerteilung,
      );
      viewHost.appendChild(dayPlan.element);
      // The info icon rides along the title line in the page header at the
      // top instead of adding a row to the viewport-fitted bottom stack
      // (see #595). The dialog must be mounted before its
      // data-download-plans slot is filled.
      dayPlan.element
        .querySelector('.day-plan__header')!
        .appendChild(versionInfo.element);
    }
    abschnittSumme = createAbschnittSumme(day);
    el.querySelector('[data-abschnitt-summe]')!.appendChild(
      abschnittSumme.element,
    );
    el.querySelector('[data-download-plans]')!.appendChild(
      downloadPlans.element,
    );

    bindNavigation();
  }

  function oeffneZeitVerteilung(): void {
    view = 'zeit-verteilung';
    navigate(day, view);
    render();
  }

  function oeffneTagesplan(): void {
    view = 'day-plan';
    navigate(day, view);
    render();
  }

  function bindNavigation() {
    const prevLink = el.querySelector<HTMLAnchorElement>('[data-prev-link]');
    const nextLink = el.querySelector<HTMLAnchorElement>('[data-next-link]');

    prevLink?.addEventListener('click', (e) => {
      e.preventDefault();
      day = persistence.previousDay(day);
      navigate(day, view);
      updateView();
    });

    nextLink?.addEventListener('click', (e) => {
      e.preventDefault();
      day = persistence.nextDay(day);
      navigate(day, view);
      updateView();
    });
  }

  function updateView() {
    if (view === 'zeit-verteilung') {
      zeitVerteilung?.update(day);
    } else {
      dayPlan?.update(day);
    }
    abschnittSumme?.update(day);
    updateNavigationLinks();
  }

  function updateNavigationLinks() {
    const prevLink = el.querySelector<HTMLAnchorElement>('[data-prev-link]');
    const nextLink = el.querySelector<HTMLAnchorElement>('[data-next-link]');
    if (prevLink) prevLink.href = dayUrl(persistence.previousDay(day));
    if (nextLink) nextLink.href = dayUrl(persistence.nextDay(day));
  }

  render();

  return {
    element: el,
    update() {
      day = getDayFromURL();
      const newView = getViewFromURL();
      if (newView !== view) {
        view = newView;
        render();
      }
      updateView();
    },
  };
}
